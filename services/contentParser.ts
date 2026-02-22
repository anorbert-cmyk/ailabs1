/**
 * Content Parser
 *
 * Parses raw Perplexity API markdown responses into structured PhaseData
 * that maps to the existing DesignLibrary component types.
 *
 * Detection pipeline:
 *   1. Split markdown by ## headings → raw sections
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
  width?: string;
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
  data?: any;
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

// ── Markdown splitting ──────────────────────────────────────────────

interface RawBlock {
  heading: string;
  body: string;
}

/**
 * Split markdown into blocks by headings (# , ## , ###).
 * Content before the first heading is treated as an intro block.
 * ### sub-headings are merged into their parent ## block.
 */
function splitByHeadings(markdown: string): RawBlock[] {
  const lines = markdown.split('\n');
  const blocks: RawBlock[] = [];
  let currentHeading = '';
  let currentBody: string[] = [];

  for (const line of lines) {
    // Match # or ## level headings as section boundaries
    const headingMatch = line.match(/^#{1,2}\s+(.+)/);
    // Skip ### or deeper - those stay as body content
    const isSubHeading = line.match(/^#{3,}\s+/);

    if (headingMatch && !isSubHeading) {
      // Push previous block
      if (currentHeading || currentBody.length > 0) {
        blocks.push({ heading: currentHeading, body: currentBody.join('\n').trim() });
      }
      currentHeading = headingMatch[1].replace(/\*\*/g, '').trim();
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
  // Verify second pipe-line is a separator row (e.g., | --- | --- |)
  const separatorLine = lines[1].trim();
  return /^\|[\s:|-]+\|$/.test(separatorLine);
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
  const lower = (heading + ' ' + body).toLowerCase();
  return (
    (lower.includes('competitor') || lower.includes('vs ') || lower.includes('analysis:')) &&
    (lower.includes('strength') || lower.includes('weakness') || lower.includes('pros') || lower.includes('cons'))
  );
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
  const lower = (heading + ' ' + body).toLowerCase();
  return (
    (lower.includes('task') || lower.includes('todo') || lower.includes('action item') || lower.includes('priority')) &&
    (lower.includes('high') || lower.includes('medium') || lower.includes('low'))
  );
}

function isRiskBlock(heading: string, body: string): boolean {
  const lower = (heading + ' ' + body).toLowerCase();
  return lower.includes('risk') && (lower.includes('dossier') || lower.includes('assessment') || lower.includes('severity'));
}

// ── Content parsers ─────────────────────────────────────────────────

/**
 * Parse a markdown table into columns and data rows.
 */
function parseMarkdownTable(body: string): { columns: TableColumn[]; data: Record<string, string>[] } {
  const lines = body.split('\n').filter(l => l.trim().startsWith('|'));
  if (lines.length < 2) return { columns: [], data: [] };

  // Parse header row
  const headerCells = lines[0]
    .split('|')
    .map(c => c.trim())
    .filter(c => c.length > 0);

  const columns: TableColumn[] = headerCells.map((header, i) => ({
    header,
    key: `col_${i}`,
    width: `w-1/${headerCells.length}`,
  }));

  // Skip separator row (index 1), parse data rows
  const data: Record<string, string>[] = [];
  for (let i = 2; i < lines.length; i++) {
    const cells = lines[i]
      .split('|')
      .map(c => c.trim())
      .filter(c => c.length > 0);

    const row: Record<string, string> = {};
    cells.forEach((cell, ci) => {
      if (ci < columns.length) {
        row[columns[ci].key] = cell;
      }
    });
    data.push(row);
  }

  return { columns, data };
}

/**
 * Parse bullet list items from markdown.
 */
function parseBulletList(body: string): string[] {
  return body
    .split('\n')
    .filter(l => /^\s*[-*]\s/.test(l))
    .map(l => l.replace(/^\s*[-*]\s+/, '').trim())
    .filter(l => l.length > 0);
}

/**
 * Parse numbered list items.
 */
function parseNumberedList(body: string): string[] {
  return body
    .split('\n')
    .filter(l => /^\s*\d+[.)]\s/.test(l))
    .map(l => l.replace(/^\s*\d+[.)]\s+/, '').trim())
    .filter(l => l.length > 0);
}

/**
 * Extract plain paragraph text (non-table, non-list lines).
 * Sub-headings (###) are included as text; blockquotes (>) are included too.
 */
function extractParagraphs(body: string): string {
  return body
    .split('\n')
    .filter(l => {
      const trimmed = l.trim();
      return (
        trimmed.length > 0 &&
        !trimmed.startsWith('|') &&
        !trimmed.startsWith('---') &&
        !/^\s*[-*]\s/.test(l) &&
        !/^\s*\d+[.)]\s/.test(l)
      );
    })
    .map(l => l.replace(/^#{1,6}\s+/, '').replace(/\*\*/g, '').replace(/^>\s*/, '').trim())
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Try to parse a competitor analysis block.
 */
function parseCompetitor(heading: string, body: string): CompetitorData | null {
  const lines = body.split('\n');

  // Extract name from heading
  const nameMatch = heading.match(/(?:Competitor\s*\d*:?\s*)?(.+)/i);
  const name = nameMatch ? nameMatch[1].trim() : heading;

  // Find URL
  const urlMatch = body.match(/https?:\/\/[^\s)]+/);
  const website = urlMatch ? urlMatch[0] : '';

  // Find strengths
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  let currentList: 'none' | 'strengths' | 'weaknesses' = 'none';

  for (const line of lines) {
    const lower = line.toLowerCase();
    if (lower.includes('strength') || lower.includes('pros')) {
      currentList = 'strengths';
      continue;
    }
    if (lower.includes('weakness') || lower.includes('cons')) {
      currentList = 'weaknesses';
      continue;
    }
    if (lower.includes('opportunity') || lower.includes('key takeaway')) {
      currentList = 'none';
      continue;
    }

    const bulletMatch = line.match(/^\s*[-*]\s+(.+)/);
    if (bulletMatch) {
      const text = bulletMatch[1].replace(/\*\*/g, '').trim();
      if (currentList === 'strengths') strengths.push(text);
      else if (currentList === 'weaknesses') weaknesses.push(text);
    }
  }

  // Find opportunity paragraph (after "Opportunity" heading or last paragraph)
  let opportunity = '';
  const oppMatch = body.match(/(?:opportunity|key takeaway)[:\s]*\n+([\s\S]*?)(?:\n\n|$)/i);
  if (oppMatch) {
    opportunity = oppMatch[1].replace(/^\s*[-*]\s+/, '').replace(/\*\*/g, '').trim();
  }

  // Extract info line (founded, target, pricing)
  const info = extractParagraphs(body).slice(0, 200);

  if (strengths.length === 0 && weaknesses.length === 0) return null;

  return { name, website, info, strengths, weaknesses, opportunity };
}

/**
 * Parse a metrics table (name, baseline, target/stress, variance).
 */
function parseMetricsTable(body: string): MetricRow[] {
  const { columns, data } = parseMarkdownTable(body);
  if (columns.length < 3) return [];

  return data.map(row => ({
    name: row[columns[0].key] || '',
    baseline: row[columns[1].key] || '',
    stress: row[columns[2]?.key] || '',
    variance: row[columns[3]?.key] || '',
  }));
}

/**
 * Parse ROI scenarios from a table or structured list.
 */
function parseROIScenarios(body: string): ROIScenario[] {
  if (hasTable(body)) {
    const { columns, data } = parseMarkdownTable(body);
    return data.map(row => ({
      title: row[columns[0]?.key] || '',
      investment: row[columns[1]?.key] || '',
      mrr: row[columns[2]?.key] || '',
      roi: row[columns[3]?.key] || '',
      payback: row[columns[4]?.key] || '',
    }));
  }
  return [];
}

/**
 * Parse task list items from text.
 */
function parseTaskList(body: string): TaskItem[] {
  const items = parseBulletList(body);
  if (items.length === 0) {
    const numbered = parseNumberedList(body);
    items.push(...numbered);
  }

  return items.map((item, i) => {
    let priority: 'High' | 'Medium' | 'Low' = 'Medium';
    const lower = item.toLowerCase();
    if (lower.includes('high') || lower.includes('critical') || lower.includes('urgent')) priority = 'High';
    else if (lower.includes('low') || lower.includes('nice to have') || lower.includes('optional')) priority = 'Low';

    return {
      id: `task-${i + 1}`,
      content: item.replace(/\*\*/g, '').replace(/\((?:high|medium|low)\)/gi, '').trim(),
      priority,
    };
  });
}

/**
 * Try to parse structured bullet items into cards.
 * Cards are detected when list items have a bold title pattern: **Title**: Description
 */
function parseCards(body: string): CardItem[] | null {
  const lines = body.split('\n');
  const cards: CardItem[] = [];

  for (const line of lines) {
    // Pattern: - **Title**: Description or - **Title** - Description
    const cardMatch = line.match(/^\s*[-*]\s+\*\*(.+?)\*\*[:\-–]\s*(.+)/);
    if (cardMatch) {
      cards.push({
        title: cardMatch[1].trim(),
        text: cardMatch[2].trim(),
        icon: pickIcon(cardMatch[1]),
      });
    }
  }

  // Also try numbered items: 1. **Title**: Description
  // Reset to avoid mixing bullet + numbered duplicates
  if (cards.length < 2) {
    cards.length = 0;
    for (const line of lines) {
      const numCardMatch = line.match(/^\s*\d+[.)]\s+\*\*(.+?)\*\*[:\-–]\s*(.+)/);
      if (numCardMatch) {
        cards.push({
          title: numCardMatch[1].trim(),
          text: numCardMatch[2].trim(),
          icon: pickIcon(numCardMatch[1]),
        });
      }
    }
  }

  return cards.length >= 2 ? cards : null;
}

// ── Detection for additional section types ──────────────────────────

function isBlueprintBlock(heading: string, body: string): boolean {
  const lower = (heading + ' ' + body).toLowerCase();
  return (
    (lower.includes('blueprint') || lower.includes('wireframe') || lower.includes('design spec') ||
     lower.includes('component spec') || lower.includes('prompt:') || lower.includes('design prompt')) &&
    (hasBulletList(body) || lower.includes('type'))
  );
}

function isRoadmapBlock(heading: string, body: string): boolean {
  const lower = (heading + ' ' + body).toLowerCase();
  return (
    (lower.includes('phase') || lower.includes('roadmap')) &&
    (lower.includes('month') || lower.includes('week') || lower.includes('timeline') || lower.includes('deliverable')) &&
    (lower.includes('objective') || lower.includes('milestone') || lower.includes('deliverable'))
  );
}

function isStrategyBlock(heading: string, body: string): boolean {
  const lower = (heading + ' ' + body).toLowerCase();
  return (
    (lower.includes('strategy') || lower.includes('strategic')) &&
    (lower.includes('phase') || lower.includes('pillar') || lower.includes('stream'))
  );
}

/**
 * Parse blueprint/design spec blocks into BlueprintItem array.
 */
function parseBlueprints(heading: string, body: string): any[] {
  const items: any[] = [];
  const sections = body.split(/###\s+/);

  for (let i = 1; i < sections.length; i++) {
    const lines = sections[i].split('\n');
    const title = lines[0]?.replace(/\*\*/g, '').trim() || `Blueprint ${i}`;
    const rest = lines.slice(1).join('\n');
    const description = extractParagraphs(rest) || title;
    const prompt = rest.trim();

    items.push({
      id: `bp-${i}`,
      title,
      description: description.slice(0, 200),
      prompt,
    });
  }

  // If no ### sub-sections, try to parse from bullet items
  if (items.length === 0) {
    const bulletItems = parseBulletList(body);
    bulletItems.forEach((item, i) => {
      const boldMatch = item.match(/\*\*(.+?)\*\*[:\-–]?\s*(.*)/);
      items.push({
        id: `bp-${i + 1}`,
        title: boldMatch ? boldMatch[1] : `Blueprint ${i + 1}`,
        description: boldMatch ? boldMatch[2] : item,
        prompt: item,
      });
    });
  }

  return items;
}

/**
 * Parse roadmap phase data from markdown.
 */
function parseRoadmapPhase(heading: string, body: string): any | null {
  // Extract phase name and timeline from heading
  const phaseMatch = heading.match(/(?:phase\s*\d*[:\s]*)?(.+)/i);
  const timeMatch = body.match(/(?:timeline|duration|months?|weeks?)[:\s]*([^\n]+)/i);

  const objectives: any[] = [];
  const deliverables: any[] = [];

  // Parse bullet items into objectives and deliverables
  const lines = body.split('\n');
  let currentSection: 'objectives' | 'deliverables' | 'none' = 'none';

  for (const line of lines) {
    const lower = line.toLowerCase();
    if (lower.includes('objective') || lower.includes('goal')) {
      currentSection = 'objectives';
      continue;
    }
    if (lower.includes('deliverable') || lower.includes('output') || lower.includes('milestone')) {
      currentSection = 'deliverables';
      continue;
    }

    const bulletMatch = line.match(/^\s*[-*]\s+(.+)/);
    if (bulletMatch) {
      const text = bulletMatch[1].replace(/\*\*/g, '').trim();
      if (currentSection === 'objectives') {
        objectives.push({ title: text, description: '' });
      } else if (currentSection === 'deliverables') {
        deliverables.push({ item: text, status: 'Planned' });
      } else {
        // Default to deliverables
        deliverables.push({ item: text, status: 'Planned' });
      }
    }
  }

  if (objectives.length === 0 && deliverables.length === 0) return null;

  return {
    phase: phaseMatch ? phaseMatch[1].trim() : heading,
    timeline: timeMatch ? timeMatch[1].trim() : '',
    objectives,
    deliverables,
    decisions: [],
  };
}

/**
 * Parse strategy grid from markdown.
 */
function parseStrategyGrid(body: string): any[] {
  const phases: any[] = [];
  const sections = body.split(/###\s+/);

  for (let i = 1; i < sections.length; i++) {
    const lines = sections[i].split('\n');
    const title = lines[0]?.replace(/\*\*/g, '').trim() || `Phase ${i}`;
    const rest = lines.slice(1).join('\n');
    const bullets = parseBulletList(rest);

    phases.push({
      id: `strategy-${i}`,
      title,
      items: bullets.map(b => ({
        label: b,
        description: '',
      })),
    });
  }

  // Fallback: try numbered items
  if (phases.length === 0) {
    const numbered = parseNumberedList(body);
    numbered.forEach((item, i) => {
      phases.push({
        id: `strategy-${i + 1}`,
        title: item.slice(0, 60),
        items: [{ label: item, description: '' }],
      });
    });
  }

  return phases;
}

// ── Main classification & parsing ───────────────────────────────────

function classifyAndParse(heading: string, body: string, sectionIndex: number): ParsedSection {
  const id = `section-${String(sectionIndex + 1).padStart(2, '0')}`;
  const paragraphText = extractParagraphs(body);

  // 1. Competitor analysis
  if (isCompetitorBlock(heading, body)) {
    const competitorData = parseCompetitor(heading, body);
    if (competitorData) {
      return {
        id,
        title: heading,
        content: `Deep dive analysis of ${competitorData.name}.`,
        type: 'competitor',
        data: competitorData,
      };
    }
  }

  // 2. ROI analysis
  if (isROIBlock(heading, body)) {
    const scenarios = parseROIScenarios(body);
    if (scenarios.length > 0) {
      return {
        id,
        title: heading,
        content: paragraphText || 'ROI scenario analysis across different investment levels.',
        type: 'roi_analysis',
        data: scenarios,
      };
    }
  }

  // 3. Task list
  if (isTaskBlock(heading, body)) {
    const tasks = parseTaskList(body);
    if (tasks.length > 0) {
      return {
        id,
        title: heading,
        content: paragraphText || 'Prioritized action items.',
        type: 'task_list',
        data: tasks,
      };
    }
  }

  // 4. Risk dossier
  if (isRiskBlock(heading, body) && !hasTable(body)) {
    // Extract score as string to match DesignLibrary's RiskData.score: string
    const scoreMatch = body.match(/(?:score|severity|level)[:\s]*([^\n,.]+)/i);
    return {
      id,
      title: heading,
      content: paragraphText,
      type: 'risk_dossier_header',
      data: {
        title: heading,
        description: paragraphText || 'Risk assessment overview.',
        score: scoreMatch ? scoreMatch[1].trim() : 'MEDIUM',
      },
    };
  }

  // 5. Metrics table (KPIs with baseline/target)
  if (isMetricsBlock(heading, body)) {
    const metrics = parseMetricsTable(body);
    if (metrics.length > 0) {
      return {
        id,
        title: heading,
        content: paragraphText || 'Key performance indicators and targets.',
        type: 'metrics',
        data: metrics,
      };
    }
  }

  // 6a. Blueprints (design specs, wireframe descriptions, component specs)
  if (isBlueprintBlock(heading, body)) {
    const blueprints = parseBlueprints(heading, body);
    if (blueprints.length > 0) {
      return {
        id,
        title: heading,
        content: paragraphText || 'Design specifications and component blueprints.',
        type: 'blueprints',
        data: blueprints,
      };
    }
  }

  // 6b. Roadmap phase (timeline phases with objectives/deliverables)
  if (isRoadmapBlock(heading, body)) {
    const roadmapData = parseRoadmapPhase(heading, body);
    if (roadmapData) {
      return {
        id,
        title: heading,
        content: paragraphText || heading,
        type: 'roadmap_phase',
        data: roadmapData,
      };
    }
  }

  // 6c. Strategy grid (phases with details)
  if (isStrategyBlock(heading, body)) {
    const phases = parseStrategyGrid(body);
    if (phases.length > 0) {
      return {
        id,
        title: heading,
        content: paragraphText || heading,
        type: 'strategy_grid',
        data: phases,
      };
    }
  }

  // 6d. Cards (structured bullet items with bold titles)
  const cards = parseCards(body);
  if (cards && cards.length >= 2) {
    return {
      id,
      title: heading,
      content: paragraphText || heading,
      type: 'cards',
      data: cards,
    };
  }

  // 7. Generic table
  if (hasTable(body)) {
    const { columns, data } = parseMarkdownTable(body);
    if (columns.length > 0 && data.length > 0) {
      return {
        id,
        title: heading,
        content: paragraphText || heading,
        type: 'table',
        columns,
        data,
      };
    }
  }

  // 8. Bullet or numbered list
  if (hasBulletList(body) || hasNumberedList(body)) {
    const items = hasBulletList(body) ? parseBulletList(body) : parseNumberedList(body);
    if (items.length > 0) {
      return {
        id,
        title: heading,
        content: paragraphText || heading,
        type: 'list',
        data: items,
      };
    }
  }

  // 9. Fallback: plain text
  return {
    id,
    title: heading,
    content: paragraphText || body.replace(/\*\*/g, '').trim(),
    type: 'text',
  };
}

// ── Public API ───────────────────────────────────────────────────────

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
  let sectionCounter = 0;

  const sections: ParsedSection[] = filteredBlocks.map((block) => {
    const currentIndex = sectionCounter++;
    // Intro block (before first heading) becomes lead text
    if (!block.heading && currentIndex === 0) {
      return {
        id: `section-${String(currentIndex + 1).padStart(2, '0')}`,
        title: 'Overview',
        content: extractParagraphs(block.body) || block.body.trim(),
        type: 'text' as SectionType,
      };
    }
    return classifyAndParse(block.heading, block.body, currentIndex);
  });

  // Build sources from citations
  const sources: SourceItem[] = (citations || []).map((url, i) => {
    let source = 'Web';
    try {
      const hostname = new URL(url).hostname.replace('www.', '');
      source = hostname.split('.')[0].charAt(0).toUpperCase() + hostname.split('.')[0].slice(1);
    } catch { /* noop */ }

    return {
      source,
      title: `Source ${i + 1}`,
      url,
      icon: 'link',
    };
  });

  // If Perplexity is one of the sources, add it
  if (sources.length === 0) {
    sources.push({
      source: 'Perplexity',
      title: `${meta.badge} Analysis`,
      icon: 'description',
    });
  }

  return {
    id: `phase-${String(phaseIndex + 1).padStart(2, '0')}`,
    badge: meta.badge,
    title: meta.title,
    subtitle: meta.subtitle,
    metadata: meta.metadata,
    sources,
    sections,
  };
}

/**
 * Quick test: parse markdown string without API call.
 * Useful for testing the parser standalone.
 */
export function testParser(markdown: string, phaseIndex = 0): PhaseData {
  return parsePerplexityResponse(markdown, phaseIndex, []);
}
