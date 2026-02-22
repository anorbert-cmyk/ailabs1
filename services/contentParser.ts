/**
 * Content Parser (v2 — perfected)
 *
 * Parses raw Perplexity API markdown responses into structured PhaseData
 * that maps to the existing DesignLibrary component types.
 *
 * Detection pipeline:
 *   1. Split markdown by ## headings → raw sections (code-block aware)
 *   2. Classify each section's content type (table, list, text, etc.)
 *   3. Parse into typed data structures matching DesignLibrary interfaces
 *   4. Assemble into PhaseData
 */

import type { SourceItem } from '../components/RightPanel';

// ── Type imports matching DesignLibrary ──────────────────────────────

interface MetricRow {
  name: string;
  baseline: string;
  stress: string;
  variance: string;
}

interface TableColumn {
  header: string;
  key: string;
}

interface CardItem {
  title: string;
  text: string;
  icon: string;
  subLabel?: string;
}

interface CompetitorData {
  name: string;
  website: string;
  info: string;
  strengths: string[];
  weaknesses: string[];
  opportunity: string;
}

interface ROIScenario {
  title: string;
  investment: string;
  mrr: string;
  roi: string;
  payback: string;
}

interface TaskItem {
  id: string;
  content: string;
  priority: 'High' | 'Medium' | 'Low';
}

// Matching DesignLibrary's RoadmapPhaseData
interface RoadmapObjective {
  type: string;
  content: string;
}

interface RoadmapDeliverable {
  title: string;
  items: string[];
}

interface RoadmapDecision {
  title: string;
  stakeholders: string;
  deadline: string;
  criteria: string;
}

interface RoadmapPhaseData {
  phase: string;
  timeline: string;
  objectives: RoadmapObjective[];
  deliverables: RoadmapDeliverable[];
  decisions: RoadmapDecision[];
}

// Matching DesignLibrary's PhaseDetail
interface PhaseDetail {
  id: string;
  title: string;
  summary: string;
  deepDive: { title: string; content: string };
  deliverables: string[];
  decision: string;
  dependencies: string;
  team: string;
}

// Matching DesignLibrary's TimelineQuarter and VisualTimelineData
interface TimelineQuarter {
  id: string;
  title: string;
  months: string[];
  status: 'active' | 'completed' | 'upcoming';
}

interface VisualTimelineData {
  title: string;
  subtitle: string;
  quarters: TimelineQuarter[];
  context?: {
    title: string;
    rejected: string;
    adopted: string;
  };
}

interface BlueprintItem {
  id: string;
  title: string;
  description: string;
  prompt: string;
}

// ── Section types that the Article component understands ─────────────

type SectionType =
  | 'text'
  | 'list'
  | 'table'
  | 'metrics'
  | 'cards'
  | 'competitor'
  | 'roi_analysis'
  | 'task_list'
  | 'risk_dossier_header'
  | 'blueprints'
  | 'roadmap_phase'
  | 'phase_card'
  | 'strategy_grid'
  | 'resource_split'
  | 'error_path_grid';

export interface ParsedSection {
  id: string;
  title: string;
  content: string;
  type: SectionType;
  data?: MetricRow[] | CardItem[] | CompetitorData | ROIScenario[] | TaskItem[]
    | RoadmapPhaseData | PhaseDetail[] | BlueprintItem[] | string[]
    | Record<string, string>[]
    | { title: string; description: string; score: string };
  columns?: TableColumn[];
}

export interface PhaseData {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  metadata: string[];
  sources?: SourceItem[];
  sections: ParsedSection[];
  visualTimeline?: VisualTimelineData;
}

// ── Phase metadata defaults ─────────────────────────────────────────

const PHASE_META: Record<number, { badge: string; title: string; subtitle: string; metadata: string[] }> = {
  0: {
    badge: 'Discovery Phase',
    title: 'Discovery & User Needs',
    subtitle: 'Validation of core assumptions',
    metadata: ['Input: Perplexity API', 'Status: Exploratory', 'Horizon: 3-6 Months'],
  },
  1: {
    badge: 'Market Intelligence',
    title: 'Competitor Deep-Dive',
    subtitle: 'Landscape analysis and strategic gaps',
    metadata: ['Input: Perplexity API', 'Status: Analysis', 'Market: Web3/AI'],
  },
  2: {
    badge: 'Roadmap',
    title: 'Phase-by-Phase Roadmap',
    subtitle: 'Visualizing the 9-month execution path',
    metadata: ['Input: Perplexity API', 'Status: Planning', 'Horizon: 9 Months'],
  },
  3: {
    badge: 'Core Design',
    title: 'Core Design',
    subtitle: 'Architectural directives for core application flows',
    metadata: ['Input: Perplexity API', 'Status: Design', 'Type: UX/UI'],
  },
  4: {
    badge: 'Advanced Screens',
    title: 'Advanced Screens & Edge Cases',
    subtitle: 'Comprehensive system states including error handling, empty states, and loading patterns',
    metadata: ['Input: Perplexity API', 'Status: Design', 'Type: Edge Cases'],
  },
  5: {
    badge: 'Risk & ROI',
    title: 'Risk, Metrics & ROI',
    subtitle: 'Critical exposure analysis, success metrics, and financial justification',
    metadata: ['Input: Perplexity API', 'Status: Analysis', 'Type: Financial'],
  },
};

// ── Icon mapping for auto-generated cards ───────────────────────────

const ICON_MAP: Record<string, string> = {
  summary: 'summarize',
  executive: 'description',
  overview: 'visibility',
  problem: 'error_outline',
  analysis: 'analytics',
  constraint: 'block',
  timeline: 'schedule',
  budget: 'savings',
  resource: 'savings',
  technical: 'integration_instructions',
  platform: 'integration_instructions',
  regulatory: 'policy',
  compliance: 'policy',
  risk: 'warning',
  opportunity: 'lightbulb',
  strategy: 'psychology',
  user: 'group',
  market: 'trending_up',
  growth: 'trending_up',
  competitor: 'groups',
  strength: 'thumb_up',
  weakness: 'thumb_down',
  pricing: 'payments',
  design: 'palette',
  architecture: 'architecture',
  feature: 'star',
  metric: 'speed',
  roi: 'calculate',
  task: 'task_alt',
  default: 'info',
};

function pickIcon(text: string): string {
  const lower = text.toLowerCase();
  for (const [keyword, icon] of Object.entries(ICON_MAP)) {
    if (lower.includes(keyword)) return icon;
  }
  return ICON_MAP.default;
}

// ── Text cleaning utilities ─────────────────────────────────────────

function stripCitationMarkers(text: string): string {
  return text.replace(/\[\d+\]/g, '');
}

function stripMarkdownLinks(text: string): string {
  return text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
}

function stripHtml(text: string): string {
  return text.replace(/<[^>]*>/g, '');
}

function cleanText(text: string): string {
  return stripHtml(
    stripMarkdownLinks(
      stripCitationMarkers(
        text.replace(/\*\*/g, '').replace(/(?<!\*)\*(?!\*)/g, '')
      )
    )
  ).trim();
}

// ── Markdown splitting ──────────────────────────────────────────────

interface RawBlock {
  heading: string;
  body: string;
}

/**
 * Split markdown into blocks by headings (# , ##).
 * Content before the first heading is treated as an intro block.
 * ### sub-headings are merged into their parent ## block.
 * Fenced code blocks are respected — headings inside them are ignored.
 */
function splitByHeadings(markdown: string): RawBlock[] {
  const lines = markdown.split('\n');
  const blocks: RawBlock[] = [];
  let currentHeading = '';
  let currentBody: string[] = [];
  let insideCodeBlock = false;
  let codeBlockLineCount = 0;

  for (const line of lines) {
    // Track fenced code blocks (``` or ~~~)
    if (/^(`{3,}|~{3,})/.test(line.trim())) {
      insideCodeBlock = !insideCodeBlock;
      if (insideCodeBlock) codeBlockLineCount = 0;
      currentBody.push(line);
      continue;
    }

    if (insideCodeBlock) {
      codeBlockLineCount++;
      if (codeBlockLineCount > 100) {
        insideCodeBlock = false;
        codeBlockLineCount = 0;
      } else {
        currentBody.push(line);
        continue;
      }
    }

    // Match # or ## level headings as section boundaries
    const headingMatch = line.match(/^#{1,2}\s+(.+)/);
    // Skip ### or deeper - those stay as body content
    const isSubHeading = /^#{3,}\s+/.test(line);

    if (headingMatch && !isSubHeading) {
      // Push previous block
      if (currentHeading || currentBody.length > 0) {
        blocks.push({ heading: currentHeading, body: currentBody.join('\n').trim() });
      }
      // Strip bold markers and ATX closing hashes from heading
      currentHeading = headingMatch[1].replace(/\*\*/g, '').replace(/\s+#+\s*$/, '').trim();
      currentBody = [];
    } else {
      currentBody.push(line);
    }
  }

  // Push last block
  if (currentHeading || currentBody.length > 0) {
    blocks.push({ heading: currentHeading, body: currentBody.join('\n').trim() });
  }

  return blocks;
}

// ── Content type detection ──────────────────────────────────────────

function hasTable(body: string): boolean {
  const lines = body.split('\n').filter(l => l.trim().startsWith('|'));
  if (lines.length < 3) return false;
  // Separator must start with | , contain at least one dash, and optionally end with |
  const separatorLine = lines[1].trim();
  return /^\|[\s:|-]+\|?$/.test(separatorLine) && separatorLine.includes('-');
}

function hasBulletList(body: string): boolean {
  const bulletLines = body.split('\n').filter(l => /^\s*[-*]\s/.test(l));
  return bulletLines.length >= 2;
}

function hasNumberedList(body: string): boolean {
  const numberedLines = body.split('\n').filter(l => /^\s*\d+[.)]\s/.test(l));
  return numberedLines.length >= 2;
}

function isCompetitorBlock(heading: string, body: string): boolean {
  const headingLower = heading.toLowerCase();
  const bodyLower = body.toLowerCase();
  // Require "competitor" or "vs" in HEADING specifically — not just body
  const hasCompetitorSignal =
    headingLower.includes('competitor') ||
    /\bvs\.?\s/i.test(heading) ||
    headingLower.includes('competitive');
  // Body must mention strengths/weaknesses structure
  const hasStructure =
    bodyLower.includes('strength') || bodyLower.includes('weakness') ||
    bodyLower.includes('pros') || /\bcons\b/.test(bodyLower);
  return hasCompetitorSignal && hasStructure;
}

function isROIBlock(heading: string, body: string): boolean {
  const lower = (heading + ' ' + body).toLowerCase();
  return lower.includes('roi') && (lower.includes('scenario') || lower.includes('investment') || lower.includes('payback'));
}

function isMetricsBlock(heading: string, body: string): boolean {
  const lower = (heading + ' ' + body).toLowerCase();
  return (
    hasTable(body) &&
    (lower.includes('metric') || lower.includes('kpi') || lower.includes('baseline') || lower.includes('target'))
  );
}

function isTaskBlock(heading: string, body: string): boolean {
  const headingLower = heading.toLowerCase();
  // Require task-related keyword in HEADING — body keywords alone are too greedy
  const hasTaskHeading =
    headingLower.includes('task') || headingLower.includes('todo') ||
    headingLower.includes('action item') || headingLower.includes('action list') ||
    headingLower.includes('priority list') || headingLower.includes('checklist');
  if (!hasTaskHeading) return false;
  const bodyLower = body.toLowerCase();
  return /\bhigh\b/.test(bodyLower) || /\bmedium\b/.test(bodyLower) || /\blow\b/.test(bodyLower);
}

function isRiskBlock(heading: string, body: string): boolean {
  // Require "risk" in HEADING
  const headingLower = heading.toLowerCase();
  if (!headingLower.includes('risk')) return false;
  const bodyLower = body.toLowerCase();
  return bodyLower.includes('dossier') || bodyLower.includes('assessment') ||
    bodyLower.includes('severity') || bodyLower.includes('mitigation');
}

// ── Content parsers ─────────────────────────────────────────────────

/**
 * Split a table row by pipes, handling escaped pipes (\|).
 */
function splitTableRow(line: string): string[] {
  // Replace escaped pipes with placeholder, split, then restore
  const escaped = line.replace(/\\\|/g, '\x00');
  // Use slice(1, -1) to remove boundary empty strings from leading/trailing pipes
  const parts = escaped.split('|');
  // Handle rows that start with | and optionally end with |
  const start = parts[0].trim() === '' ? 1 : 0;
  const end = parts[parts.length - 1].trim() === '' ? parts.length - 1 : parts.length;
  return parts.slice(start, end).map(c => c.replace(/\x00/g, '|').trim());
}

/**
 * Parse a markdown table into columns and data rows.
 * Handles empty cells and escaped pipes correctly.
 */
function parseMarkdownTable(body: string): { columns: TableColumn[]; data: Record<string, string>[] } {
  const lines = body.split('\n').filter(l => l.trim().startsWith('|'));
  if (lines.length < 2) return { columns: [], data: [] };

  // Parse header row using proper split (preserves empty cells)
  const headerCells = splitTableRow(lines[0]);

  const columns: TableColumn[] = headerCells.map((header, i) => ({
    header: cleanText(header),
    key: `col_${i}`,
  }));

  // Skip separator row (index 1), parse data rows
  const data: Record<string, string>[] = [];
  for (let i = 2; i < lines.length; i++) {
    const cells = splitTableRow(lines[i]);
    const row: Record<string, string> = {};
    // Pad to full column count — missing cells become empty strings
    columns.forEach((col, ci) => {
      row[col.key] = ci < cells.length ? cleanText(cells[ci]) : '';
    });
    data.push(row);
  }

  return { columns, data };
}

/**
 * Parse bullet list items from markdown. Strips citation markers.
 */
function parseBulletList(body: string): string[] {
  return body
    .split('\n')
    .filter(l => /^\s*[-*]\s/.test(l))
    .map(l => cleanText(l.replace(/^\s*[-*]\s+/, '')))
    .filter(l => l.length > 0);
}

/**
 * Parse numbered list items. Strips citation markers.
 */
function parseNumberedList(body: string): string[] {
  return body
    .split('\n')
    .filter(l => /^\s*\d+[.)]\s/.test(l))
    .map(l => cleanText(l.replace(/^\s*\d+[.)]\s+/, '')))
    .filter(l => l.length > 0);
}

/**
 * Combine bullet and numbered list items.
 */
function parseAllListItems(body: string): string[] {
  const bullets = parseBulletList(body);
  const numbered = parseNumberedList(body);
  return bullets.length >= numbered.length ? bullets : numbered;
}

/**
 * Extract plain paragraph text (non-table, non-list lines).
 * Sub-headings (###) are included as text; blockquotes (>) are included too.
 * Strips citation markers, markdown links, HTML tags, and bold/italic markers.
 */
function extractParagraphs(body: string): string {
  let insideCodeBlock = false;
  let codeBlockLineCount = 0;
  const cleaned = body
    .split('\n')
    .filter(l => {
      const trimmed = l.trim();
      // Track fenced code blocks
      if (/^(`{3,}|~{3,})/.test(trimmed)) {
        insideCodeBlock = !insideCodeBlock;
        if (insideCodeBlock) codeBlockLineCount = 0;
        return false;
      }
      if (insideCodeBlock) {
        codeBlockLineCount++;
        if (codeBlockLineCount > 100) {
          insideCodeBlock = false;
          codeBlockLineCount = 0;
          // Fall through to normal processing for this line
        } else {
          return false;
        }
      }
      return (
        trimmed.length > 0 &&
        !trimmed.startsWith('|') &&
        !/^(-{3,}|\*{3,}|_{3,}|- - -|\* \* \*)$/.test(trimmed) &&
        !/^\s*[-*]\s/.test(l) &&
        !/^\s*\d+[.)]\s/.test(l) &&
        !/^!\[/.test(trimmed) // skip image references
      );
    })
    .map(l => l.replace(/^#{1,6}\s+/, '').replace(/^>\s*/, '').trim())
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();

  return cleanText(cleaned);
}

/**
 * Try to parse a competitor analysis block.
 * State machine uses heading-like lines (not bullet content) for section transitions.
 */
function parseCompetitor(heading: string, body: string): CompetitorData | null {
  const lines = body.split('\n');

  // Extract name from heading, stripping "Competitor N:" or "N." prefix
  const name = heading
    .replace(/^(?:competitor\s*\d*[:\s]*|\d+[.)]\s*)/i, '')
    .replace(/\*\*/g, '')
    .trim() || heading;

  // Find URL
  const urlMatch = body.match(/https?:\/\/[^\s)]+/);
  const website = urlMatch ? urlMatch[0] : '';

  // Collect strengths, weaknesses, and opportunity
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const opportunityLines: string[] = [];
  let currentList: 'none' | 'strengths' | 'weaknesses' | 'opportunity' = 'none';

  for (const line of lines) {
    const lower = line.toLowerCase();
    const isBullet = /^\s*[-*]\s/.test(line) || /^\s*\d+[.)]\s/.test(line);
    const isHeadingLike = /^#{3,}\s+/.test(line) || /^\*\*[^*]+\*\*\s*:?\s*$/.test(line.trim()) || (!isBullet && !line.trim().startsWith('|'));

    // Only switch sections on heading-like lines (not bullets)
    if (!isBullet && isHeadingLike) {
      if (/\bstrengths?\b/i.test(lower) || /\bpros\b/i.test(lower)) {
        currentList = 'strengths';
        continue;
      }
      if (/\bweakness(?:es)?\b/i.test(lower) || /\bcons\b/i.test(lower)) {
        currentList = 'weaknesses';
        continue;
      }
      if (/\bopportunit(?:y|ies)\b/i.test(lower) || /\btakeaway/i.test(lower)) {
        currentList = 'opportunity';
        continue;
      }
    }

    // Capture bullet/numbered items
    const bulletMatch = line.match(/^\s*(?:[-*]|\d+[.)]) \s*(.+)/);
    if (bulletMatch) {
      const text = cleanText(bulletMatch[1]);
      if (currentList === 'strengths') strengths.push(text);
      else if (currentList === 'weaknesses') weaknesses.push(text);
      else if (currentList === 'opportunity') opportunityLines.push(text);
    }
  }

  const opportunity = opportunityLines.join(' ').trim() ||
    (() => {
      const oppMatch = body.match(/(?:opportunit(?:y|ies)|takeaway)[:\s]*\n+([\s\S]*?)(?:\n\n|$)/i);
      return oppMatch ? cleanText(oppMatch[1].replace(/^\s*[-*]\s+/, '')) : '';
    })();

  // Extract info from paragraphs before first section keyword
  const infoEnd = body.search(/\b(?:strengths?|weaknesses?|pros|cons)\b/i);
  const infoPart = infoEnd > 0 ? body.slice(0, infoEnd) : body;
  const info = extractParagraphs(infoPart).slice(0, 200);

  if (strengths.length === 0 && weaknesses.length === 0) return null;

  return { name, website, info, strengths, weaknesses, opportunity };
}

/**
 * Parse a metrics table with header-name-based column mapping.
 */
function parseMetricsTable(body: string): MetricRow[] {
  const { columns, data } = parseMarkdownTable(body);
  if (columns.length < 3) return [];

  // Try to match by header name first, fall back to positional
  const findCol = (keywords: string[]): string | undefined => {
    const col = columns.find(c => keywords.some(k => c.header.toLowerCase().includes(k)));
    return col?.key;
  };

  const nameKey = findCol(['metric', 'name', 'kpi', 'indicator']) ?? columns[0]?.key;
  const baselineKey = findCol(['baseline', 'current', 'actual']) ?? columns[1]?.key;
  const stressKey = findCol(['stress', 'target', 'goal']) ?? columns[2]?.key;
  const varianceKey = findCol(['variance', 'change', 'delta', 'diff']) ?? columns[3]?.key;

  return data.map(row => ({
    name: (nameKey ? row[nameKey] : '') || '',
    baseline: (baselineKey ? row[baselineKey] : '') || '',
    stress: (stressKey ? row[stressKey] : '') || '',
    variance: (varianceKey ? row[varianceKey] : '') || '',
  }));
}

/**
 * Parse ROI scenarios from a table with header-name-based column mapping,
 * or from structured bullet items as fallback.
 */
function parseROIScenarios(body: string): ROIScenario[] {
  if (hasTable(body)) {
    const { columns, data } = parseMarkdownTable(body);
    if (columns.length < 3) return [];

    const findCol = (keywords: string[]): string | undefined => {
      const col = columns.find(c => keywords.some(k => c.header.toLowerCase().includes(k)));
      return col?.key;
    };

    const titleKey = findCol(['scenario', 'title', 'case', 'type']) ?? columns[0]?.key;
    const investKey = findCol(['investment', 'invest', 'cost', 'spend']) ?? columns[1]?.key;
    const mrrKey = findCol(['mrr', 'revenue', 'monthly']) ?? columns[2]?.key;
    const roiKey = findCol(['roi', 'return']) ?? columns[3]?.key;
    const paybackKey = findCol(['payback', 'breakeven', 'break-even']) ?? columns[4]?.key;

    return data.map(row => ({
      title: (titleKey ? row[titleKey] : '') || '',
      investment: (investKey ? row[investKey] : '') || '',
      mrr: (mrrKey ? row[mrrKey] : '') || '',
      roi: (roiKey ? row[roiKey] : '') || '',
      payback: (paybackKey ? row[paybackKey] : '') || '',
    }));
  }

  // Fallback: try to parse from bullet items with bold titles
  const items = parseAllListItems(body);
  const scenarios: ROIScenario[] = [];
  for (const item of items) {
    const match = item.match(/^(.+?)[\s:–—-]+(?:.*?(?:invest(?:ment)?|cost)[:\s]*([^,;]+))?(?:.*?(?:mrr|revenue)[:\s]*([^,;]+))?(?:.*?roi[:\s]*([^,;]+))?(?:.*?payback[:\s]*([^,;]+))?/i);
    if (match) {
      scenarios.push({
        title: match[1]?.trim() || item.slice(0, 60),
        investment: match[2]?.trim() || '',
        mrr: match[3]?.trim() || '',
        roi: match[4]?.trim() || '',
        payback: match[5]?.trim() || '',
      });
    }
  }
  return scenarios;
}

/**
 * Parse task list items from text.
 * Combines bullet and numbered items. Uses word-boundary priority matching.
 */
function parseTaskList(body: string): TaskItem[] {
  // Combine both formats
  const items = [...parseBulletList(body), ...parseNumberedList(body)];
  // Deduplicate in case items appear in both formats
  const unique = [...new Set(items)];

  return unique.map((item, i) => {
    let priority: 'High' | 'Medium' | 'Low' = 'Medium';
    const lower = item.toLowerCase();
    // Use word boundaries to avoid false positives ("highlight" → "high")
    if (/\b(?:high|critical|urgent)\b/i.test(lower)) priority = 'High';
    else if (/\b(?:low|nice.to.have|optional)\b/i.test(lower)) priority = 'Low';

    return {
      id: `task-${i + 1}`,
      content: item
        .replace(/\((?:high|medium|low|critical|urgent|optional)\)/gi, '')
        .replace(/\[(?:high|medium|low|critical|urgent|optional)\]/gi, '')
        .replace(/\b(?:priority\s*:\s*)(?:high|medium|low)\b/gi, '')
        .trim(),
      priority,
    };
  });
}

/**
 * Try to parse structured bullet items into cards.
 * Cards are detected when list items have a bold title pattern: **Title**: Description
 * Handles em-dash (—) and combines both bullet and numbered formats.
 */
function parseCards(body: string): CardItem[] | null {
  const lines = body.split('\n');
  const bulletCards: CardItem[] = [];
  const numberedCards: CardItem[] = [];

  // Card separator pattern: colon, hyphen, en-dash, or em-dash
  const sepPattern = /[:\-–—]/;

  for (const line of lines) {
    // Bullet pattern: - **Title**: Description
    const bulletMatch = line.match(new RegExp(`^\\s*[-*]\\s+\\*\\*(.+?)\\*\\*${sepPattern.source}\\s*(.+)`));
    if (bulletMatch) {
      bulletCards.push({
        title: cleanText(bulletMatch[1]),
        text: cleanText(bulletMatch[2]),
        icon: pickIcon(bulletMatch[1]),
      });
    }

    // Numbered pattern: 1. **Title**: Description
    const numMatch = line.match(new RegExp(`^\\s*\\d+[.)]\\s+\\*\\*(.+?)\\*\\*${sepPattern.source}\\s*(.+)`));
    if (numMatch) {
      numberedCards.push({
        title: cleanText(numMatch[1]),
        text: cleanText(numMatch[2]),
        icon: pickIcon(numMatch[1]),
      });
    }
  }

  // Use whichever format has more cards, prefer bullets on tie
  const cards = bulletCards.length >= numberedCards.length ? bulletCards : numberedCards;
  return cards.length >= 2 ? cards : null;
}

// ── Detection for additional section types ──────────────────────────

function isBlueprintBlock(heading: string, body: string): boolean {
  const headingLower = heading.toLowerCase();
  const bodyLower = body.toLowerCase();
  const hasBlueprintSignal =
    headingLower.includes('blueprint') || headingLower.includes('wireframe') ||
    headingLower.includes('design spec') || headingLower.includes('component spec') ||
    headingLower.includes('design prompt');
  // Secondary: body can contribute if heading has partial signal
  const hasBodySignal =
    bodyLower.includes('blueprint') || bodyLower.includes('wireframe') ||
    bodyLower.includes('prompt:') || bodyLower.includes('component type:');
  return (hasBlueprintSignal || hasBodySignal) && (hasBulletList(body) || /###\s+/.test(body));
}

function isRoadmapBlock(heading: string, body: string): boolean {
  const headingLower = heading.toLowerCase();
  const bodyLower = body.toLowerCase();
  const hasPhaseSignal = headingLower.includes('phase') || headingLower.includes('roadmap');
  // Expanded time keywords: months, weeks, quarters, dates
  const hasTimeSignal =
    bodyLower.includes('month') || bodyLower.includes('week') ||
    bodyLower.includes('timeline') || /\bq[1-4]\b/i.test(bodyLower) ||
    bodyLower.includes('quarter') || bodyLower.includes('sprint');
  // Structure keywords (removed "deliverable" from time group — it belongs here)
  const hasStructure =
    bodyLower.includes('objective') || bodyLower.includes('milestone') ||
    bodyLower.includes('deliverable') || bodyLower.includes('goal') ||
    bodyLower.includes('key result');
  // Require phase signal + at least one of (time OR structure)
  return hasPhaseSignal && (hasTimeSignal || hasStructure);
}

function isStrategyBlock(heading: string, body: string): boolean {
  const headingLower = heading.toLowerCase();
  // Require strategy keyword in HEADING and do NOT match if it's a roadmap
  if (headingLower.includes('roadmap')) return false;
  const hasStrategySignal = headingLower.includes('strategy') || headingLower.includes('strategic');
  const bodyLower = body.toLowerCase();
  return hasStrategySignal && (bodyLower.includes('pillar') || bodyLower.includes('stream') || bodyLower.includes('phase'));
}

/**
 * Parse blueprint/design spec blocks into BlueprintItem array.
 */
function parseBlueprints(heading: string, body: string): BlueprintItem[] {
  const items: BlueprintItem[] = [];
  const sections = body.split(/#{3,}\s+/);

  for (let i = 1; i < sections.length; i++) {
    const sectionLines = sections[i].split('\n');
    const title = cleanText(sectionLines[0] || `Blueprint ${i}`);
    const rest = sectionLines.slice(1).join('\n');
    const descRaw = extractParagraphs(rest) || title;
    // Word-boundary-aware truncation
    const truncateAt = descRaw.lastIndexOf(' ', 200);
    const description = descRaw.length > 200
      ? descRaw.slice(0, truncateAt > 0 ? truncateAt : 200) + '...'
      : descRaw;
    // Limit prompt size
    const prompt = rest.trim().slice(0, 2000);

    items.push({ id: `bp-${i}`, title, description, prompt });
  }

  // If no ### sub-sections, try to parse from bullet items
  if (items.length === 0) {
    const bulletItems = parseBulletList(body);
    bulletItems.forEach((item, i) => {
      const boldMatch = item.match(/\*\*(.+?)\*\*[:\-–—]?\s*(.*)/);
      items.push({
        id: `bp-${i + 1}`,
        title: boldMatch ? cleanText(boldMatch[1]) : `Blueprint ${i + 1}`,
        description: boldMatch ? cleanText(boldMatch[2]) || item : item,
        prompt: item,
      });
    });
  }

  return items;
}

/**
 * Parse roadmap phase data from markdown.
 * Output matches DesignLibrary's RoadmapPhaseData interface.
 */
function parseRoadmapPhase(heading: string, body: string): RoadmapPhaseData | null {
  // Extract phase name, stripping "Phase N:" prefix
  const phase = heading.replace(/^phase\s*\d*[:\s]*/i, '').trim() || heading;

  // Expanded time pattern matching (months, weeks, quarters, dates, sprints)
  const timeMatch = body.match(
    /(?:timeline|duration|time(?:frame)?|months?|weeks?|quarter|Q[1-4]|sprint|period)[:\s]*([^\n,;()]+?)\s*(?:[,;()\n]|$)/i
  );
  const timeline = timeMatch ? cleanText(timeMatch[1]) : '';

  const objectives: RoadmapObjective[] = [];
  const deliverables: RoadmapDeliverable[] = [];
  const decisions: RoadmapDecision[] = [];

  // Parse body with heading-aware section detection
  const lines = body.split('\n');
  let currentSection: 'objectives' | 'deliverables' | 'decisions' | 'none' = 'none';

  for (const line of lines) {
    const lower = line.toLowerCase();
    const isBullet = /^\s*[-*]\s/.test(line) || /^\s*\d+[.)]\s/.test(line);

    // Only switch sections on heading-like lines (###, **bold**, or non-bullet text)
    if (!isBullet) {
      if (/\bobjective/i.test(lower) || /\bgoal/i.test(lower) || /\bkey result/i.test(lower)) {
        currentSection = 'objectives';
        continue;
      }
      if (/\bdeliverable/i.test(lower) || /\boutput/i.test(lower) || /\bmilestone/i.test(lower)) {
        currentSection = 'deliverables';
        continue;
      }
      if (/\bdecision/i.test(lower) || /\bgate\b/i.test(lower) || /\bapproval/i.test(lower)) {
        currentSection = 'decisions';
        continue;
      }
    }

    // Capture both bullet and numbered items
    const itemMatch = line.match(/^\s*(?:[-*]|\d+[.)]) \s*(.+)/);
    if (itemMatch) {
      const text = cleanText(itemMatch[1]);
      if (currentSection === 'objectives') {
        objectives.push({ type: 'Primary', content: text });
      } else if (currentSection === 'deliverables') {
        // Group deliverables: bold text starts a new group, plain text appends to last group
        const boldMatch = itemMatch[1].match(/\*\*(.+?)\*\*/);
        if (boldMatch) {
          deliverables.push({ title: cleanText(boldMatch[1]), items: [] });
        } else if (deliverables.length > 0) {
          deliverables[deliverables.length - 1].items.push(text);
        } else {
          deliverables.push({ title: text, items: [text] });
        }
      } else if (currentSection === 'decisions') {
        const stakeholderMatch = text.match(/stakeholders?[:\s]*([^,;]+)/i);
        const deadlineMatch = text.match(/(?:deadline|by|due)[:\s]*([^,;]+)/i);
        const criteriaMatch = text.match(/(?:criteria|if|when)[:\s]*([^,;]+)/i);
        decisions.push({
          title: text.replace(/stakeholders?[:\s]*[^,;]+/i, '').replace(/(?:deadline|by|due)[:\s]*[^,;]+/i, '').trim() || text,
          stakeholders: stakeholderMatch ? stakeholderMatch[1].trim() : '',
          deadline: deadlineMatch ? deadlineMatch[1].trim() : '',
          criteria: criteriaMatch ? criteriaMatch[1].trim() : '',
        });
      } else {
        // Default unclassified items to objectives (they tend to come first)
        objectives.push({ type: 'General', content: text });
      }
    }
  }

  if (objectives.length === 0 && deliverables.length === 0) return null;

  return { phase, timeline, objectives, deliverables, decisions };
}

/**
 * Parse strategy grid from markdown.
 * Output matches DesignLibrary's PhaseDetail interface.
 */
function parseStrategyGrid(body: string): PhaseDetail[] {
  const phases: PhaseDetail[] = [];
  const sections = body.split(/#{3,}\s+/);

  for (let i = 1; i < sections.length; i++) {
    const sectionLines = sections[i].split('\n');
    const title = cleanText(sectionLines[0] || `Phase ${i}`);
    const rest = sectionLines.slice(1).join('\n');
    const bullets = parseBulletList(rest);
    const summary = extractParagraphs(rest) || '';

    phases.push({
      id: `strategy-${i}`,
      title,
      summary: summary.slice(0, 300),
      deepDive: { title, content: bullets.join('\n') || summary },
      deliverables: bullets.length > 0 ? bullets : [summary || title],
      decision: '',
      dependencies: '',
      team: '',
    });
  }

  // Fallback: try numbered or bullet items as a single phase
  if (phases.length === 0) {
    const items = parseAllListItems(body);
    if (items.length > 0) {
      const summary = extractParagraphs(body) || '';
      phases.push({
        id: 'strategy-1',
        title: 'Strategic Initiatives',
        summary,
        deepDive: { title: 'Details', content: items.join('\n') },
        deliverables: items,
        decision: '',
        dependencies: '',
        team: '',
      });
    }
  }

  return phases;
}

// ── Main classification & parsing ───────────────────────────────────

function classifyAndParse(heading: string, body: string, sectionIndex: number): ParsedSection {
  const id = `section-${String(sectionIndex + 1).padStart(2, '0')}`;
  const paragraphText = extractParagraphs(body);

  // 1. Metrics table — structural check first (hasTable + keywords), most specific
  if (isMetricsBlock(heading, body)) {
    const metrics = parseMetricsTable(body);
    if (metrics.length > 0) {
      return { id, title: heading, content: paragraphText || 'Key performance indicators and targets.', type: 'metrics', data: metrics };
    }
  }

  // 2. Competitor analysis — heading-based detection
  if (isCompetitorBlock(heading, body)) {
    const competitorData = parseCompetitor(heading, body);
    if (competitorData) {
      return { id, title: heading, content: `Deep dive analysis of ${competitorData.name}.`, type: 'competitor', data: competitorData };
    }
  }

  // 3. ROI analysis
  if (isROIBlock(heading, body)) {
    const scenarios = parseROIScenarios(body);
    if (scenarios.length > 0) {
      return { id, title: heading, content: paragraphText || 'ROI scenario analysis across different investment levels.', type: 'roi_analysis', data: scenarios };
    }
  }

  // 4. Risk dossier (non-table risk content)
  if (isRiskBlock(heading, body) && !hasTable(body)) {
    // Tighter score extraction — expect a severity value like HIGH, MEDIUM, LOW, CRITICAL, or a number
    const scoreMatch = body.match(/(?:score|severity|risk\s*level)\s*:\s*(HIGH|MEDIUM|LOW|CRITICAL|EXTREME|\d+(?:\.\d+)?)/i);
    return {
      id, title: heading, content: paragraphText,
      type: 'risk_dossier_header',
      data: {
        title: heading,
        description: paragraphText || 'Risk assessment overview.',
        score: scoreMatch ? scoreMatch[1].trim().toUpperCase() : 'MEDIUM',
      },
    };
  }

  // 5. Task list — heading-based detection
  if (isTaskBlock(heading, body)) {
    const tasks = parseTaskList(body);
    if (tasks.length > 0) {
      return { id, title: heading, content: paragraphText || 'Prioritized action items.', type: 'task_list', data: tasks };
    }
  }

  // 6a. Blueprints
  if (isBlueprintBlock(heading, body)) {
    const blueprints = parseBlueprints(heading, body);
    if (blueprints.length > 0) {
      return { id, title: heading, content: paragraphText || 'Design specifications and component blueprints.', type: 'blueprints', data: blueprints };
    }
  }

  // 6b. Roadmap phase
  if (isRoadmapBlock(heading, body)) {
    const roadmapData = parseRoadmapPhase(heading, body);
    if (roadmapData) {
      return { id, title: heading, content: paragraphText || heading, type: 'roadmap_phase', data: roadmapData };
    }
  }

  // 6c. Strategy grid
  if (isStrategyBlock(heading, body)) {
    const stratPhases = parseStrategyGrid(body);
    if (stratPhases.length > 0) {
      return { id, title: heading, content: paragraphText || heading, type: 'strategy_grid', data: stratPhases };
    }
  }

  // 7. Cards (structured bullet items with bold titles)
  const cards = parseCards(body);
  if (cards && cards.length >= 2) {
    return { id, title: heading, content: paragraphText || heading, type: 'cards', data: cards };
  }

  // 8. Generic table
  if (hasTable(body)) {
    const { columns, data } = parseMarkdownTable(body);
    if (columns.length > 0 && data.length > 0) {
      return { id, title: heading, content: paragraphText || heading, type: 'table', columns, data };
    }
  }

  // 9. Bullet or numbered list
  if (hasBulletList(body) || hasNumberedList(body)) {
    const items = parseAllListItems(body);
    if (items.length > 0) {
      return { id, title: heading, content: paragraphText || heading, type: 'list', data: items };
    }
  }

  // 10. Fallback: plain text
  return {
    id, title: heading,
    content: paragraphText || cleanText(body),
    type: 'text',
  };
}

// ── Public API ───────────────────────────────────────────────────────

/**
 * Extract the domain name from a URL, handling subdomains and ccTLDs.
 */
function extractDomainName(url: string): string {
  try {
    const hostname = new URL(url).hostname.replace(/^www\d*\./, '');
    const parts = hostname.split('.');
    // Handle ccTLDs like .co.uk, .com.au
    const ccTLDs = ['co', 'com', 'org', 'net', 'ac', 'gov'];
    if (parts.length >= 3 && ccTLDs.includes(parts[parts.length - 2])) {
      return parts[parts.length - 3];
    }
    // For standard domains, take second-to-last part (skipping TLD)
    if (parts.length >= 2) {
      return parts[parts.length - 2];
    }
    return parts[0];
  } catch {
    return 'Web';
  }
}

function capitalizeDomain(domain: string): string {
  // Known acronyms
  const acronyms: Record<string, string> = { bbc: 'BBC', mit: 'MIT', ibm: 'IBM', aws: 'AWS', nyt: 'NYT' };
  if (acronyms[domain.toLowerCase()]) return acronyms[domain.toLowerCase()];
  return domain.charAt(0).toUpperCase() + domain.slice(1);
}

// ── Visual Timeline synthesis ────────────────────────────────────────

const MONTH_ABBREV = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const TIMELINE_STATUS: Array<'completed' | 'active' | 'upcoming'> = ['completed', 'active', 'upcoming'];

/**
 * Extract a short (max 7 char) activity label from text.
 * Skips stop words and common verbs, returns the first meaningful keyword.
 */
function extractShortLabel(text: string): string {
  const stripped = text.replace(/[^a-zA-Z\s]/g, '');
  const words = stripped.split(/\s+/).filter(w => w.length > 2);
  const skip = new Set([
    'the', 'and', 'for', 'with', 'from', 'into', 'that', 'this',
    'will', 'shall', 'must', 'can', 'our', 'their', 'your', 'its',
    'each', 'all', 'are', 'has', 'have', 'been', 'more', 'any',
    'also', 'key', 'core', 'main', 'full', 'based', 'using',
    'create', 'ensure', 'develop', 'implement', 'define', 'identify',
    'complete', 'establish', 'build', 'make', 'initial', 'first',
  ]);
  const meaningful = words.filter(w => !skip.has(w.toLowerCase()));
  if (meaningful.length === 0) return words[0]?.toUpperCase().slice(0, 7) || 'BUILD';
  return meaningful[0].toUpperCase().slice(0, 7);
}

/**
 * Extract 3 short activity labels from a RoadmapPhaseData.
 * Prioritizes deliverable titles, then objectives, then decisions.
 */
function extractActivityLabels(data: RoadmapPhaseData): [string, string, string] {
  const labels: string[] = [];
  const seen = new Set<string>();

  const addLabel = (text: string) => {
    if (labels.length >= 3) return;
    const label = extractShortLabel(text);
    if (!seen.has(label)) {
      seen.add(label);
      labels.push(label);
    }
  };

  for (const d of data.deliverables) addLabel(d.title);
  for (const o of data.objectives) addLabel(o.content);
  for (const d of data.decisions) addLabel(d.title);

  const defaults = ['BUILD', 'SHIP', 'LAUNCH', 'SCALE', 'GROW', 'OPTIM'];
  while (labels.length < 3) {
    const fallback = defaults[labels.length] || 'TASK';
    if (!seen.has(fallback)) {
      seen.add(fallback);
      labels.push(fallback);
    } else {
      labels.push(`T${labels.length + 1}`);
    }
  }

  return [labels[0], labels[1], labels[2]];
}

/**
 * Synthesize a VisualTimelineData from parsed roadmap phase sections.
 * Dynamically generates timeline quarters from the actual API content.
 * Returns null if fewer than 2 roadmap phases are found.
 */
function synthesizeVisualTimeline(sections: ParsedSection[]): VisualTimelineData | null {
  const roadmapSections = sections.filter(
    s => s.type === 'roadmap_phase' && s.data
  );

  if (roadmapSections.length < 2) return null;

  const phases = roadmapSections.slice(0, 3);

  const quarters: TimelineQuarter[] = phases.map((section, i) => {
    const data = section.data as RoadmapPhaseData;
    const startMonth = i * 3;
    const monthAbbrevs = [
      MONTH_ABBREV[startMonth] || `M${startMonth + 1}`,
      MONTH_ABBREV[startMonth + 1] || `M${startMonth + 2}`,
      MONTH_ABBREV[startMonth + 2] || `M${startMonth + 3}`,
    ];

    const [l1, l2, l3] = extractActivityLabels(data);

    return {
      id: `Q${i + 1}`,
      title: data.phase,
      months: [
        `${monthAbbrevs[0]}: ${l1}`,
        `${monthAbbrevs[1]}: ${l2}`,
        `${monthAbbrevs[2]}: ${l3}`,
      ],
      status: TIMELINE_STATUS[i] || ('upcoming' as const),
    };
  });

  // Build context from the first text section (overview / timeline intro)
  const overviewSection = sections.find(
    s => s.type === 'text' && s.content.length > 30
  );

  const firstTitle = quarters[0]?.title.toLowerCase() || 'foundation';
  const lastTitle = quarters[quarters.length - 1]?.title.toLowerCase() || 'optimization';

  const context = overviewSection
    ? {
        title: 'Why This Roadmap?',
        rejected: `Linear scaling without a dedicated ${firstTitle} phase. Sequential market entry without validated product-market fit risks resource waste and competitive disadvantage.`,
        adopted: overviewSection.content.length > 300
          ? overviewSection.content.slice(0, 297) + '...'
          : overviewSection.content,
      }
    : undefined;

  const totalMonths = quarters.length * 3;

  return {
    title: 'The Strategic Trajectory',
    subtitle: `Visualizing the ${totalMonths}-month execution path from ${firstTitle} to ${lastTitle}.`,
    quarters,
    context,
  };
}

/**
 * Parse a raw Perplexity markdown response into PhaseData.
 *
 * @param markdown   - The raw markdown from Perplexity API
 * @param phaseIndex - Which phase (0-5) this content belongs to
 * @param citations  - Optional citation URLs from the Perplexity response
 */
export function parsePerplexityResponse(
  markdown: string,
  phaseIndex: number,
  citations?: string[]
): PhaseData {
  const meta = PHASE_META[phaseIndex] || PHASE_META[0];
  const blocks = splitByHeadings(markdown);

  const filteredBlocks = blocks.filter(block => block.heading || block.body.trim().length > 0);

  const sections: ParsedSection[] = filteredBlocks.map((block, index) => {
    // Intro block (before first heading) becomes lead text
    if (!block.heading && index === 0) {
      return {
        id: `section-${String(index + 1).padStart(2, '0')}`,
        title: 'Overview',
        content: extractParagraphs(block.body) || cleanText(block.body),
        type: 'text' as SectionType,
      };
    }
    return classifyAndParse(block.heading, block.body, index);
  });

  // If no sections were generated, add a fallback
  if (sections.length === 0) {
    sections.push({
      id: 'section-01',
      title: 'Overview',
      content: cleanText(markdown) || 'No content available. Please try again.',
      type: 'text',
    });
  }

  // Build sources from citations (deduplicated)
  const uniqueCitations = [...new Set(citations || [])];
  const sources: SourceItem[] = uniqueCitations
    .filter(url => {
      try { new URL(url); return true; } catch { return false; }
    })
    .map((url, i) => {
      const domain = extractDomainName(url);
      return {
        source: capitalizeDomain(domain),
        title: `Source ${i + 1}`,
        url,
        icon: 'link',
      };
    });

  // Default source when no citations provided
  if (sources.length === 0) {
    sources.push({
      source: 'Perplexity',
      title: `${meta.badge} Analysis`,
      icon: 'description',
    });
  }

  // Synthesize visual timeline for the Roadmap phase (phaseIndex 2)
  const visualTimeline = phaseIndex === 2
    ? synthesizeVisualTimeline(sections) ?? undefined
    : undefined;

  return {
    id: `phase-${String(phaseIndex + 1).padStart(2, '0')}`,
    badge: meta.badge,
    title: meta.title,
    subtitle: meta.subtitle,
    metadata: meta.metadata,
    sources,
    sections,
    visualTimeline,
  };
}

/**
 * Quick test: parse markdown string without API call.
 * Useful for testing the parser standalone.
 */
export function testParser(markdown: string, phaseIndex = 0): PhaseData {
  return parsePerplexityResponse(markdown, phaseIndex, []);
}
