/**
 * Haiku Classifier Service — AI-powered section type classification.
 *
 * Uses Claude Haiku 4.5 to re-classify sections AFTER the regex parser
 * has produced an initial result. The regex result is shown immediately;
 * Haiku refines it asynchronously in the background.
 *
 * Flow:
 *   1. Regex parser produces PhaseData instantly (<5ms)
 *   2. This service sends the raw markdown + regex results to Haiku via server-side proxy
 *   3. Haiku returns corrected section types + confidence scores (via tool_use for guaranteed JSON)
 *   4. enhanceWithClassification() merges the results
 *
 * Security:
 *   - API key is NEVER exposed to the browser
 *   - Requests go through Vite dev server proxy (/api/anthropic → api.anthropic.com)
 *   - Proxy injects x-api-key and anthropic-version headers server-side
 *
 * Reliability:
 *   - Retry logic for transient errors (429, 503, 504, network)
 *   - Rate limiting (min 500ms between requests)
 *   - Structured output via tool_use (guaranteed valid JSON schema)
 *   - 8s timeout per attempt
 *
 * Error handling:
 *   - Timeout → regex result stands
 *   - Bad response → regex result stands
 *   - Low confidence → regex result stands for that section
 *   - Phase switch during classification → requestId guard in caller
 */

import type { SectionType, ParsedSection, PhaseData } from './parsers/types';
import {
  parseCompetitor, parseMetricsTable, parseROIScenarios,
  parseTaskList, parseCheckboxTaskList, parseCards,
  parseBlueprints, parseRoadmapPhase, parseStrategyGrid,
  parseMarkdownTable, parseAllListItems, extractParagraphs,
} from './parsers/common';

// ── Configuration ───────────────────────────────────────────────────

const CLASSIFIER_TIMEOUT_MS = 8_000;
const CONFIDENCE_THRESHOLD = 0.7;
const HAIKU_MODEL = 'claude-haiku-4-5-20251001';
const CLASSIFIER_PROXY_URL = '/api/anthropic';

// Retry configuration
const MAX_CLASSIFIER_RETRIES = 1;          // Total 2 attempts (initial + 1 retry)
const BASE_CLASSIFIER_RETRY_DELAY = 1000;  // 1s base, 2s second attempt

// Rate limiting
const MIN_REQUEST_GAP_MS = 500;
let lastClassifierRequestTime = 0;

// ── Types ───────────────────────────────────────────────────────────

export interface ClassifiedSection {
  /** 0-based index matching the section position in PhaseData.sections */
  sectionIndex: number;
  /** The original heading/title from the section */
  title: string;
  /** Haiku's suggested section type */
  suggestedType: SectionType;
  /** Confidence score 0.0-1.0 */
  confidence: number;
  /** Brief reasoning for the classification */
  reasoning: string;
}

export interface ClassificationResult {
  sections: ClassifiedSection[];
  modelUsed: string;
  totalTokens: number;
}

// ── Valid section types (for Haiku prompt + tool schema) ────────────

const VALID_SECTION_TYPES: SectionType[] = [
  'text', 'list', 'table', 'metrics', 'cards', 'competitor',
  'roi_analysis', 'task_list', 'task_list_checkbox',
  'risk_dossier_header', 'blueprints', 'roadmap_phase',
  'phase_card', 'strategy_grid', 'resource_split',
  'error_path_grid', 'viability_score', 'pain_points', 'next_step',
];

// ── Tool schema for structured output ──────────────────────────────

const CLASSIFY_TOOL = {
  name: 'classify_sections',
  description: 'Classify document sections by their content type for rendering.',
  input_schema: {
    type: 'object' as const,
    properties: {
      sections: {
        type: 'array' as const,
        items: {
          type: 'object' as const,
          properties: {
            sectionIndex: { type: 'number' as const, description: '0-based section index' },
            title: { type: 'string' as const, description: 'Section heading' },
            suggestedType: {
              type: 'string' as const,
              enum: VALID_SECTION_TYPES,
              description: 'The classified section type',
            },
            confidence: { type: 'number' as const, description: 'Confidence 0.0-1.0' },
            reasoning: { type: 'string' as const, description: 'Brief classification reasoning' },
          },
          required: ['sectionIndex', 'title', 'suggestedType', 'confidence', 'reasoning'] as const,
        },
      },
    },
    required: ['sections'] as const,
  },
};

// ── System prompt ───────────────────────────────────────────────────

const CLASSIFIER_SYSTEM_PROMPT = `You are a content classifier for a strategic analysis platform called ailabs1.

Your task: Given markdown sections with their headings and content, determine the correct section type for each one.

Available section types and when to use them:

- "text": Plain paragraphs, executive summaries, introductions. Use when nothing more specific applies.
- "list": Bullet or numbered lists (2+ items). NOT for task lists with priorities.
- "table": Data tables with pipe-delimited columns and a separator row. NOT for metrics or ROI tables.
- "metrics": KPI/metrics tables containing baseline, target, stress, or variance columns. MUST have a table structure.
- "cards": Bold-title items in "**Title**: Description" format. Strategic choices, OKRs, highlights.
- "competitor": Competitor analysis blocks with strengths/weaknesses/opportunity sections.
- "roi_analysis": Financial analysis with ROI scenarios, investment amounts, MRR, payback periods.
- "task_list": Task/action items with explicit High/Medium/Low priority markers.
- "task_list_checkbox": Checkbox-style task lists ([ ] or [x] items).
- "risk_dossier_header": Risk assessments with severity, likelihood, and mitigation sections.
- "blueprints": Design specs or wireframe descriptions with sub-sections (###) and prompts.
- "roadmap_phase": Timeline/roadmap content with phases, objectives, deliverables, and time markers.
- "phase_card": Detailed phase cards with deep-dive sections and team assignments.
- "strategy_grid": Strategic framework with pillars/streams. NOT roadmaps.
- "resource_split": Resource allocation breakdowns.
- "error_path_grid": Error handling and edge case specifications.
- "viability_score": Viability assessment with numeric scores.
- "pain_points": User pain points with severity levels.
- "next_step": Recommended next actions with "what to do" and "why first" structure.

DISAMBIGUATION RULES:
- A table comparing companies/products WITH strengths/weaknesses is "competitor", not "table".
- A table with columns like baseline/target/variance/KPI is "metrics", not "table".
- A table with investment/MRR/ROI/payback is "roi_analysis", not "table".
- Bold-title items (**Title**: Description) about strategy are "cards"; about competitors with S/W are "competitor".
- A list with High/Medium/Low priority markers is "task_list", not "list".
- A list with [ ] or [x] checkboxes is "task_list_checkbox", not "list".

OBSERVER-SPECIFIC TYPES:
- "viability_score": Must have a numeric score (0-10, percentage, or labels like "Viable"/"Risky") + interpretation.
- "pain_points": Must be a list of user problems with explicit severity (High/Critical/Medium/Low/Minor).
  A generic problem list without severity levels is just a "list".
- "next_step": Must have two parts: (1) what to do (action) and (2) why first (reasoning).
  A single action paragraph without reasoning is "text".

CLASSIFICATION RULES:
1. Choose the MOST SPECIFIC type that fits. "text" is the fallback only when nothing else applies.
2. Look at BOTH the heading AND the content body to determine the type.
3. When uncertain, classify based on content structure and set a lower confidence score.
   The system will automatically filter low-confidence changes.
4. Do NOT default to the regex parser's original classification — your job is to improve it.

Use the classify_sections tool to submit your classifications.`;

// ── User prompt builder ─────────────────────────────────────────────

/** Escape user content to prevent prompt injection via embedded quotes/instructions. */
function escapeContent(str: string): string {
  return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
}

function buildUserPrompt(
  sections: ParsedSection[],
  rawMarkdown: string
): string {
  const sectionDescriptions = sections.map((s, i) => {
    const rawSnippet = extractRawSnippet(s.title, rawMarkdown);

    const safeTitle = escapeContent(s.title.slice(0, 256));
    const safeContent = escapeContent(s.content.slice(0, 200));
    const safeSnippet = rawSnippet ? escapeContent(rawSnippet) : '';

    return `[Section ${i}]
Title: "${safeTitle}"
Current type (regex): "${s.type}"
Content preview: "${safeContent}"
${safeSnippet ? `Raw markdown:\n<raw_content>${safeSnippet}</raw_content>` : ''}`;
  }).join('\n\n---\n\n');

  return `Classify each of the following ${sections.length} sections:

${sectionDescriptions}`;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Extract the raw markdown body for a section by heading search. */
function extractRawSnippet(title: string, rawMarkdown: string): string {
  if (!title) return '';
  const headingPattern = new RegExp(`^#{1,2}\\s+${escapeRegex(title.slice(0, 256))}`, 'm');
  const headingIndex = rawMarkdown.search(headingPattern);
  if (headingIndex < 0) return '';

  const afterHeading = rawMarkdown.slice(headingIndex);
  const nextHeading = afterHeading.slice(1).search(/^#{1,2}\s+/m);
  let snippet = nextHeading > 0
    ? afterHeading.slice(0, nextHeading + 1).trim()
    : afterHeading.trim();
  if (snippet.length > 1000) {
    snippet = snippet.slice(0, 1000) + '...';
  }
  return snippet;
}

// ── Retry helpers ───────────────────────────────────────────────────

function isRetryableStatus(status: number): boolean {
  return status === 429 || status === 502 || status === 503 || status === 504;
}

function isRetryableError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  if (err.name === 'AbortError') return false;
  const msg = err.message.toLowerCase();
  return msg.includes('fetch failed') || msg.includes('network') ||
    msg.includes('econnrefused') || msg.includes('econnreset') ||
    msg.includes('etimedout');
}

function retryDelay(attempt: number): number {
  return BASE_CLASSIFIER_RETRY_DELAY * Math.pow(2, attempt) + Math.random() * 500;
}

// ── Main classification function ────────────────────────────────────

/**
 * Send sections to Claude Haiku for intelligent classification.
 * Uses server-side proxy (/api/anthropic) — no API key in browser.
 *
 * @param sections - The regex-parsed sections
 * @param rawMarkdown - The original markdown text (for context)
 * @param signal - Optional AbortSignal for cancellation
 * @returns Classification result, or null if classification fails
 */
export async function classifySections(
  sections: ParsedSection[],
  rawMarkdown: string,
  signal?: AbortSignal
): Promise<ClassificationResult | null> {
  if (sections.length === 0) return null;

  // Rate limiting — enforce minimum gap between requests
  const now = Date.now();
  const elapsed = now - lastClassifierRequestTime;
  if (elapsed < MIN_REQUEST_GAP_MS) {
    await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_GAP_MS - elapsed));
    if (signal?.aborted) return null;
  }
  lastClassifierRequestTime = Date.now();

  const userPrompt = buildUserPrompt(sections, rawMarkdown);

  // Retry loop
  for (let attempt = 0; attempt <= MAX_CLASSIFIER_RETRIES; attempt++) {
    const timeoutController = new AbortController();
    const timeoutId = setTimeout(() => timeoutController.abort(), CLASSIFIER_TIMEOUT_MS);

    // Combine external signal with our timeout
    const combinedSignal = signal
      ? AbortSignal.any([signal, timeoutController.signal])
      : timeoutController.signal;

    try {
      const response = await fetch(CLASSIFIER_PROXY_URL, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: HAIKU_MODEL,
          max_tokens: 4096,
          temperature: 0,
          system: CLASSIFIER_SYSTEM_PROMPT,
          messages: [{ role: 'user', content: userPrompt }],
          tools: [CLASSIFY_TOOL],
          tool_choice: { type: 'tool', name: 'classify_sections' },
        }),
        signal: combinedSignal,
      });

      if (!response.ok) {
        // Non-retryable HTTP errors: 400, 401, 403
        if (!isRetryableStatus(response.status)) {
          console.warn(`[Classifier] Haiku API returned ${response.status} (non-retryable)`);
          return null;
        }
        // Retryable status — consume body and try again if attempts remain
        await response.text().catch(() => {});
        if (attempt < MAX_CLASSIFIER_RETRIES) {
          const delay = retryDelay(attempt);
          console.debug(`[Classifier] Retryable ${response.status}, retrying in ${Math.round(delay)}ms`);
          await new Promise(resolve => setTimeout(resolve, delay));
          if (signal?.aborted) return null;
          continue;
        }
        console.warn(`[Classifier] Haiku API returned ${response.status} after ${attempt + 1} attempts`);
        return null;
      }

      const data = await response.json();

      // Parse tool_use response — structured output guarantees valid JSON
      const toolUseBlock = data?.content?.find(
        (block: { type: string }) => block.type === 'tool_use' && block.name === 'classify_sections'
      );

      if (!toolUseBlock?.input?.sections) {
        console.warn('[Classifier] No tool_use block in response, falling back to text parsing');
        // Fallback: try parsing text content (in case model returns text despite tool_choice)
        const textBlock = data?.content?.find((block: { type: string }) => block.type === 'text');
        if (textBlock?.text) {
          const parsed = parseClassificationJSON(textBlock.text);
          if (parsed) {
            return {
              sections: parsed,
              modelUsed: HAIKU_MODEL,
              totalTokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
            };
          }
        }
        return null;
      }

      // Validate and filter tool_use input
      const validated = validateClassifiedSections(toolUseBlock.input.sections);
      if (!validated) return null;

      return {
        sections: validated,
        modelUsed: HAIKU_MODEL,
        totalTokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
      };
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        console.debug('[Classifier] Classification aborted (timeout or phase switch)');
        return null;
      }

      // Retryable network error
      if (isRetryableError(err) && attempt < MAX_CLASSIFIER_RETRIES) {
        const delay = retryDelay(attempt);
        console.debug(`[Classifier] Network error, retrying in ${Math.round(delay)}ms:`, err);
        await new Promise(resolve => setTimeout(resolve, delay));
        if (signal?.aborted) return null;
        continue;
      }

      console.warn('[Classifier] Classification failed:', err);
      return null;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  return null;
}

// ── Validation ──────────────────────────────────────────────────────

function validateClassifiedSections(rawSections: unknown): ClassifiedSection[] | null {
  if (!Array.isArray(rawSections)) {
    console.warn('[Classifier] Response sections is not an array');
    return null;
  }

  const validated: ClassifiedSection[] = [];
  for (const raw of rawSections) {
    if (
      typeof raw !== 'object' || raw === null ||
      typeof (raw as Record<string, unknown>).sectionIndex !== 'number' ||
      typeof (raw as Record<string, unknown>).suggestedType !== 'string' ||
      typeof (raw as Record<string, unknown>).confidence !== 'number'
    ) {
      continue; // Skip malformed entries
    }

    const r = raw as Record<string, unknown>;

    // Validate section type
    if (!VALID_SECTION_TYPES.includes(r.suggestedType as SectionType)) {
      console.warn(`[Classifier] Invalid type "${r.suggestedType}", skipping`);
      continue;
    }

    validated.push({
      sectionIndex: r.sectionIndex as number,
      title: (r.title as string) || '',
      suggestedType: r.suggestedType as SectionType,
      confidence: Math.max(0, Math.min(1, r.confidence as number)),
      reasoning: (r.reasoning as string) || '',
    });
  }

  return validated.length > 0 ? validated : null;
}

// ── JSON fallback parsing (for non-tool_use responses) ──────────────

function parseClassificationJSON(text: string): ClassifiedSection[] | null {
  try {
    let jsonStr = text.trim();
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }

    const parsed = JSON.parse(jsonStr);
    return validateClassifiedSections(parsed?.sections);
  } catch (err) {
    console.warn('[Classifier] JSON parse error:', err);
    return null;
  }
}

// ── Enhancement function ────────────────────────────────────────────

/**
 * Enhance regex-parsed PhaseData with Haiku classification results.
 *
 * When Haiku changes a section type, the data is RE-PARSED from raw markdown
 * to match the new type's expected data structure. This prevents:
 * - Silent rendering failures (garbled/empty sections)
 * - Runtime errors (calling .map() on wrong data shapes)
 * - Disappeared sections (renderer guards fail on mismatched data)
 *
 * Only upgrades section types when:
 * 1. Haiku confidence >= CONFIDENCE_THRESHOLD (0.7)
 * 2. The suggested type differs from the regex type
 * 3. The section index is valid
 *
 * @param rawMarkdown - Original markdown text needed for data re-parsing
 * @returns A new PhaseData with updated section types + re-parsed data, or the original if no changes.
 */
export function enhanceWithClassification(
  phaseData: PhaseData,
  classification: ClassificationResult,
  rawMarkdown: string
): PhaseData {
  const changes: Array<{ index: number; from: SectionType; to: SectionType; confidence: number }> = [];

  const enhancedSections = phaseData.sections.map((section, index) => {
    const match = classification.sections.find(c => c.sectionIndex === index);
    if (!match) return section;

    // Skip if below confidence threshold
    if (match.confidence < CONFIDENCE_THRESHOLD) return section;

    // Skip if same type (no change needed)
    if (match.suggestedType === section.type) return section;

    // Re-parse data from raw markdown to match new type
    const reparsed = reparseSectionData(section, match.suggestedType, rawMarkdown);
    if (!reparsed) return section; // Re-parse failed — keep regex result

    changes.push({
      index,
      from: section.type,
      to: match.suggestedType,
      confidence: match.confidence,
    });

    return reparsed;
  });

  if (changes.length === 0) return phaseData;

  console.info(
    `[Classifier] Enhanced ${changes.length} section(s):`,
    changes.map(c => `#${c.index} ${c.from}→${c.to} (${(c.confidence * 100).toFixed(0)}%)`).join(', ')
  );

  return {
    ...phaseData,
    sections: enhancedSections,
  };
}

// ── Data re-parsing for type changes ────────────────────────────────

/**
 * Re-parse a section's data from raw markdown to match a new section type.
 * Returns a new ParsedSection with the correct type + data shape,
 * or null if re-parsing fails (caller should keep the regex result).
 */
function reparseSectionData(
  section: ParsedSection,
  newType: SectionType,
  rawMarkdown: string
): ParsedSection | null {
  const body = extractRawSnippet(section.title, rawMarkdown);
  // If we can't find the raw markdown, only allow type changes where data is unchanged
  const hasBody = body.length > 0;

  try {
    const base = { ...section, type: newType };

    switch (newType) {
      case 'competitor': {
        if (!hasBody) return null;
        const data = parseCompetitor(section.title, body);
        return data ? { ...base, data } : null;
      }
      case 'metrics': {
        if (!hasBody) return null;
        const data = parseMetricsTable(body);
        return data.length > 0 ? { ...base, data } : null;
      }
      case 'roi_analysis': {
        if (!hasBody) return null;
        const data = parseROIScenarios(body);
        return data.length > 0 ? { ...base, data } : null;
      }
      case 'task_list': {
        if (!hasBody) return null;
        const data = parseTaskList(body);
        return data.length > 0 ? { ...base, data } : null;
      }
      case 'task_list_checkbox': {
        if (!hasBody) return null;
        const data = parseCheckboxTaskList(body);
        return data.length > 0 ? { ...base, data } : null;
      }
      case 'cards': {
        if (!hasBody) return null;
        const data = parseCards(body);
        return data ? { ...base, data } : null;
      }
      case 'blueprints': {
        if (!hasBody) return null;
        const data = parseBlueprints(section.title, body);
        return data.length > 0 ? { ...base, data } : null;
      }
      case 'roadmap_phase': {
        if (!hasBody) return null;
        const data = parseRoadmapPhase(section.title, body);
        return data ? { ...base, data } : null;
      }
      case 'strategy_grid': {
        if (!hasBody) return null;
        const data = parseStrategyGrid(body);
        return data.length > 0 ? { ...base, data } : null;
      }
      case 'table': {
        if (!hasBody) return null;
        const { columns, data } = parseMarkdownTable(body);
        return columns.length > 0 ? { ...base, data, columns } : null;
      }
      case 'list': {
        if (!hasBody) return null;
        const data = parseAllListItems(body);
        return data.length > 0 ? { ...base, data } : null;
      }
      case 'text': {
        // Text is always safe — just update content from raw markdown
        const content = hasBody ? extractParagraphs(body) : section.content;
        return { ...base, content, data: undefined, columns: undefined };
      }
      // For types without specific re-parsing (phase_card, resource_split,
      // error_path_grid, viability_score, pain_points, next_step,
      // risk_dossier_header), keep the regex result to avoid type/data mismatches
      default:
        return null;
    }
  } catch (err) {
    console.warn(`[Classifier] Re-parse failed for ${section.title} (${section.type}→${newType}):`, err);
    return null;
  }
}

