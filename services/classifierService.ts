/**
 * Haiku Classifier Service — AI-powered section type classification.
 *
 * Uses Claude Haiku 4.5 to re-classify sections AFTER the regex parser
 * has produced an initial result. The regex result is shown immediately;
 * Haiku refines it asynchronously in the background.
 *
 * Flow:
 *   1. Regex parser produces PhaseData instantly (<5ms)
 *   2. This service sends the raw markdown + regex results to Haiku
 *   3. Haiku returns corrected section types + confidence scores
 *   4. enhanceWithClassification() merges the results
 *
 * Error handling:
 *   - Timeout (5s) → regex result stands
 *   - Bad JSON → regex result stands
 *   - Low confidence → regex result stands for that section
 *   - Phase switch during classification → requestId guard in caller
 */

import type { SectionType, ParsedSection, PhaseData, TableColumn } from './parsers/types';
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
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

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

// ── Valid section types (for Haiku prompt) ───────────────────────────

const VALID_SECTION_TYPES: SectionType[] = [
  'text', 'list', 'table', 'metrics', 'cards', 'competitor',
  'roi_analysis', 'task_list', 'task_list_checkbox',
  'risk_dossier_header', 'blueprints', 'roadmap_phase',
  'phase_card', 'strategy_grid', 'resource_split',
  'error_path_grid', 'viability_score', 'pain_points', 'next_step',
];

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

Respond with ONLY valid JSON. No markdown, no explanation outside the JSON.`;

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

    return `[Section ${i}]
Title: "${safeTitle}"
Current type (regex): "${s.type}"
Content preview: "${safeContent}"
${rawSnippet ? `Raw markdown:\n${rawSnippet}` : ''}`;
  }).join('\n\n---\n\n');

  return `Classify each section. Here are ${sections.length} sections to classify:

${sectionDescriptions}

Respond with this exact JSON structure:
{
  "sections": [
    {
      "sectionIndex": 0,
      "title": "section title",
      "suggestedType": "one of the valid types",
      "confidence": 0.95,
      "reasoning": "brief reason"
    }
  ]
}`;
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
  if (snippet.length > 500) {
    snippet = snippet.slice(0, 500) + '...';
  }
  return snippet;
}

// ── Main classification function ────────────────────────────────────

/**
 * Send sections to Claude Haiku for intelligent classification.
 *
 * @param sections - The regex-parsed sections
 * @param rawMarkdown - The original markdown text (for context)
 * @param apiKey - Anthropic API key
 * @param signal - Optional AbortSignal for cancellation
 * @returns Classification result, or null if classification fails
 */
export async function classifySections(
  sections: ParsedSection[],
  rawMarkdown: string,
  apiKey: string,
  signal?: AbortSignal
): Promise<ClassificationResult | null> {
  if (!apiKey || sections.length === 0) return null;

  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort(), CLASSIFIER_TIMEOUT_MS);

  // Combine external signal with our timeout
  const combinedSignal = signal
    ? combineAbortSignals(signal, timeoutController.signal)
    : timeoutController.signal;

  try {
    const userPrompt = buildUserPrompt(sections, rawMarkdown);

    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: HAIKU_MODEL,
        max_tokens: 4096,
        temperature: 0,
        system: CLASSIFIER_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userPrompt }],
      }),
      signal: combinedSignal,
    });

    if (!response.ok) {
      console.warn(`[Classifier] Haiku API returned ${response.status}`);
      return null;
    }

    const data = await response.json();
    const content = data?.content?.[0]?.text;
    if (!content) {
      console.warn('[Classifier] Empty response from Haiku');
      return null;
    }

    // Parse the JSON response
    const parsed = parseClassificationJSON(content);
    if (!parsed) return null;

    return {
      sections: parsed,
      modelUsed: HAIKU_MODEL,
      totalTokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
    };
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      console.debug('[Classifier] Classification aborted (timeout or phase switch)');
    } else {
      console.warn('[Classifier] Classification failed:', err);
    }
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

// ── JSON parsing with validation ────────────────────────────────────

function parseClassificationJSON(text: string): ClassifiedSection[] | null {
  try {
    // Handle potential markdown wrapping
    let jsonStr = text.trim();
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }

    const parsed = JSON.parse(jsonStr);
    const rawSections = parsed?.sections;

    if (!Array.isArray(rawSections)) {
      console.warn('[Classifier] Response missing sections array');
      return null;
    }

    // Validate and filter each section
    const validated: ClassifiedSection[] = [];
    for (const raw of rawSections) {
      if (
        typeof raw.sectionIndex !== 'number' ||
        typeof raw.suggestedType !== 'string' ||
        typeof raw.confidence !== 'number'
      ) {
        continue; // Skip malformed entries
      }

      // Validate section type
      if (!VALID_SECTION_TYPES.includes(raw.suggestedType as SectionType)) {
        console.warn(`[Classifier] Invalid type "${raw.suggestedType}", skipping`);
        continue;
      }

      validated.push({
        sectionIndex: raw.sectionIndex,
        title: raw.title || '',
        suggestedType: raw.suggestedType as SectionType,
        confidence: Math.max(0, Math.min(1, raw.confidence)),
        reasoning: raw.reasoning || '',
      });
    }

    return validated.length > 0 ? validated : null;
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
      // risk_dossier_header), only change type if data is already compatible
      default:
        return base;
    }
  } catch (err) {
    console.warn(`[Classifier] Re-parse failed for ${section.title} (${section.type}→${newType}):`, err);
    return null;
  }
}

// ── Utility ─────────────────────────────────────────────────────────

/**
 * Combine two AbortSignals — aborts when EITHER signal fires.
 */
function combineAbortSignals(a: AbortSignal, b: AbortSignal): AbortSignal {
  const controller = new AbortController();
  const onAbort = () => controller.abort();

  if (a.aborted || b.aborted) {
    controller.abort();
    return controller.signal;
  }

  a.addEventListener('abort', onAbort, { once: true });
  b.addEventListener('abort', onAbort, { once: true });

  // Clean up cross-listeners when the combined controller aborts
  controller.signal.addEventListener('abort', () => {
    a.removeEventListener('abort', onAbort);
    b.removeEventListener('abort', onAbort);
  }, { once: true });

  return controller.signal;
}
