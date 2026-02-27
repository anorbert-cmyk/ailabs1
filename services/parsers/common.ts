/**
 * Shared parsing utilities used by all tier parsers.
 *
 * Extracted from contentParser.ts (v2) — retains all the original
 * text cleaning, heading splitting, table parsing, list parsing,
 * classification, and icon mapping logic.
 */

import type {
  RawBlock, ParsedSection, SectionType, TableColumn,
  MetricRow, CardItem, CompetitorData, ROIScenario, TaskItem,
  RoadmapPhaseData, RoadmapObjective, RoadmapDeliverable, RoadmapDecision,
  PhaseDetail, BlueprintItem, TimelineQuarter, VisualTimelineData,
} from './types';

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

export function pickIcon(text: string): string {
  const lower = text.toLowerCase();
  for (const [keyword, icon] of Object.entries(ICON_MAP)) {
    if (lower.includes(keyword)) return icon;
  }
  return ICON_MAP.default;
}

// ── Text cleaning utilities ─────────────────────────────────────────

export function stripCitationMarkers(text: string): string {
  return text.replace(/\[\d+\]/g, '');
}

export function stripMarkdownLinks(text: string): string {
  return text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
}

export function stripHtml(text: string): string {
  return text.replace(/<[^>]*>/g, '');
}

export function cleanText(text: string): string {
  return stripHtml(
    stripMarkdownLinks(
      stripCitationMarkers(
        text.replace(/\*\*/g, '').replace(/(?<!\*)\*(?!\*)/g, '')
      )
    )
  ).trim();
}

// ── Markdown splitting ──────────────────────────────────────────────

/**
 * Split markdown into blocks by headings (# , ##).
 * Content before the first heading is treated as an intro block.
 * ### sub-headings are merged into their parent ## block.
 * Fenced code blocks are respected — headings inside them are ignored.
 */
export function splitByHeadings(markdown: string): RawBlock[] {
  const lines = markdown.split('\n');
  const blocks: RawBlock[] = [];
  let currentHeading = '';
  let currentBody: string[] = [];
  let insideCodeBlock = false;
  let codeBlockLineCount = 0;

  for (const line of lines) {
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

    const headingMatch = line.match(/^#{1,2}\s+(.+)/);
    const isSubHeading = /^#{3,}\s+/.test(line);

    if (headingMatch && !isSubHeading) {
      if (currentHeading || currentBody.length > 0) {
        blocks.push({ heading: currentHeading, body: currentBody.join('\n').trim() });
      }
      currentHeading = headingMatch[1].replace(/\*\*/g, '').replace(/\s+#+\s*$/, '').trim();
      currentBody = [];
    } else {
      currentBody.push(line);
    }
  }

  if (currentHeading || currentBody.length > 0) {
    blocks.push({ heading: currentHeading, body: currentBody.join('\n').trim() });
  }

  return blocks;
}

// ── Content type detection ──────────────────────────────────────────

export function hasTable(body: string): boolean {
  const lines = body.split('\n').filter(l => l.trim().startsWith('|'));
  if (lines.length < 3) return false;
  // Find a separator line anywhere in the first few pipe-delimited lines
  const hasSeparator = lines.slice(1, 3).some(l => {
    const trimmed = l.trim();
    return /^\|[\s:|-]+\|?$/.test(trimmed) && trimmed.includes('-');
  });
  return hasSeparator;
}

export function hasBulletList(body: string): boolean {
  const bulletLines = body.split('\n').filter(l => /^\s*[-*]\s/.test(l));
  return bulletLines.length >= 2;
}

export function hasNumberedList(body: string): boolean {
  const numberedLines = body.split('\n').filter(l => /^\s*\d+[.)]\s/.test(l));
  return numberedLines.length >= 2;
}

export function isCompetitorBlock(heading: string, body: string): boolean {
  const headingLower = heading.toLowerCase();
  const bodyLower = body.toLowerCase();
  const hasCompetitorSignal =
    headingLower.includes('competitor') ||
    /\bvs\.?\s/i.test(heading) ||
    headingLower.includes('competitive');
  const hasStructure =
    bodyLower.includes('strength') || bodyLower.includes('weakness') ||
    bodyLower.includes('pros') || /\bcons\b/.test(bodyLower);
  return hasCompetitorSignal && hasStructure;
}

export function isROIBlock(heading: string, body: string): boolean {
  const lower = (heading + ' ' + body).toLowerCase();
  return lower.includes('roi') && (lower.includes('scenario') || lower.includes('investment') || lower.includes('payback'));
}

export function isMetricsBlock(heading: string, body: string): boolean {
  const lower = (heading + ' ' + body).toLowerCase();
  return (
    hasTable(body) &&
    (lower.includes('metric') || lower.includes('kpi') || lower.includes('baseline') || lower.includes('target'))
  );
}

export function isTaskBlock(heading: string, body: string): boolean {
  const headingLower = heading.toLowerCase();
  const hasTaskHeading =
    headingLower.includes('task') || headingLower.includes('todo') ||
    headingLower.includes('action item') || headingLower.includes('action list') ||
    headingLower.includes('priority list') || headingLower.includes('checklist');
  if (!hasTaskHeading) return false;
  const bodyLower = body.toLowerCase();
  return /\bhigh\b/.test(bodyLower) || /\bmedium\b/.test(bodyLower) || /\blow\b/.test(bodyLower);
}

export function isRiskBlock(heading: string, body: string): boolean {
  const headingLower = heading.toLowerCase();
  if (!headingLower.includes('risk')) return false;
  const bodyLower = body.toLowerCase();
  return bodyLower.includes('dossier') || bodyLower.includes('assessment') ||
    bodyLower.includes('severity') || bodyLower.includes('mitigation');
}

export function isBlueprintBlock(heading: string, body: string): boolean {
  const headingLower = heading.toLowerCase();
  const bodyLower = body.toLowerCase();
  const hasBlueprintSignal =
    headingLower.includes('blueprint') || headingLower.includes('wireframe') ||
    headingLower.includes('design spec') || headingLower.includes('component spec') ||
    headingLower.includes('design prompt');
  const hasBodySignal =
    bodyLower.includes('blueprint') || bodyLower.includes('wireframe') ||
    bodyLower.includes('prompt:') || bodyLower.includes('component type:');
  return (hasBlueprintSignal || hasBodySignal) && (hasBulletList(body) || /###\s+/.test(body));
}

export function isRoadmapBlock(heading: string, body: string): boolean {
  const headingLower = heading.toLowerCase();
  const bodyLower = body.toLowerCase();
  const hasPhaseSignal = headingLower.includes('phase') || headingLower.includes('roadmap');
  const hasTimeSignal =
    bodyLower.includes('month') || bodyLower.includes('week') ||
    bodyLower.includes('timeline') || /\bq[1-4]\b/i.test(bodyLower) ||
    bodyLower.includes('quarter') || bodyLower.includes('sprint');
  const hasStructure =
    bodyLower.includes('objective') || bodyLower.includes('milestone') ||
    bodyLower.includes('deliverable') || bodyLower.includes('goal') ||
    bodyLower.includes('key result');
  return hasPhaseSignal && (hasTimeSignal || hasStructure);
}

export function isStrategyBlock(heading: string, body: string): boolean {
  const headingLower = heading.toLowerCase();
  if (headingLower.includes('roadmap')) return false;
  const hasStrategySignal = headingLower.includes('strategy') || headingLower.includes('strategic');
  const bodyLower = body.toLowerCase();
  return hasStrategySignal && (bodyLower.includes('pillar') || bodyLower.includes('stream') || bodyLower.includes('phase'));
}

// ── Content parsers ─────────────────────────────────────────────────

export function splitTableRow(line: string): string[] {
  const escaped = line.replace(/\\\|/g, '\x00');
  const parts = escaped.split('|');
  const start = parts[0].trim() === '' ? 1 : 0;
  const end = parts[parts.length - 1].trim() === '' ? parts.length - 1 : parts.length;
  return parts.slice(start, end).map(c => c.replace(/\x00/g, '|').trim());
}

export function parseMarkdownTable(body: string): { columns: TableColumn[]; data: Record<string, string>[] } {
  const lines = body.split('\n').filter(l => l.trim().startsWith('|'));
  if (lines.length < 2) return { columns: [], data: [] };

  const headerCells = splitTableRow(lines[0]);
  const columns: TableColumn[] = headerCells.map((header, i) => ({
    header: cleanText(header),
    key: `col_${i}`,
  }));

  const data: Record<string, string>[] = [];
  for (let i = 2; i < lines.length; i++) {
    const cells = splitTableRow(lines[i]);
    const row: Record<string, string> = {};
    columns.forEach((col, ci) => {
      row[col.key] = ci < cells.length ? cleanText(cells[ci]) : '';
    });
    data.push(row);
  }

  return { columns, data };
}

export function parseBulletList(body: string): string[] {
  return body
    .split('\n')
    .filter(l => /^\s*[-*]\s/.test(l))
    .map(l => cleanText(l.replace(/^\s*[-*]\s+/, '')))
    .filter(l => l.length > 0);
}

export function parseNumberedList(body: string): string[] {
  return body
    .split('\n')
    .filter(l => /^\s*\d+[.)]\s/.test(l))
    .map(l => cleanText(l.replace(/^\s*\d+[.)]\s+/, '')))
    .filter(l => l.length > 0);
}

export function parseAllListItems(body: string): string[] {
  const bullets = parseBulletList(body);
  const numbered = parseNumberedList(body);
  return bullets.length >= numbered.length ? bullets : numbered;
}

export function extractParagraphs(body: string): string {
  let insideCodeBlock = false;
  let codeBlockLineCount = 0;
  const cleaned = body
    .split('\n')
    .filter(l => {
      const trimmed = l.trim();
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
        !/^!\[/.test(trimmed)
      );
    })
    .map(l => l.replace(/^#{1,6}\s+/, '').replace(/^>\s*/, '').trim())
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();

  return cleanText(cleaned);
}

export function parseCompetitor(heading: string, body: string): CompetitorData | null {
  const lines = body.split('\n');
  const name = heading
    .replace(/^(?:competitor\s*\d*[:\s]*|\d+[.)]\s*)/i, '')
    .replace(/\*\*/g, '')
    .trim() || heading;

  const urlMatch = body.match(/https?:\/\/[^\s)]+/);
  const website = urlMatch ? urlMatch[0] : '';

  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const opportunityLines: string[] = [];
  let currentList: 'none' | 'strengths' | 'weaknesses' | 'opportunity' = 'none';

  for (const line of lines) {
    const lower = line.toLowerCase();
    const isBullet = /^\s*[-*]\s/.test(line) || /^\s*\d+[.)]\s/.test(line);
    const isHeadingLike = /^#{3,}\s+/.test(line) || /^\*\*[^*]+\*\*\s*:?\s*$/.test(line.trim()) || (!isBullet && !line.trim().startsWith('|'));

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

    const bulletMatch = line.match(/^\s*(?:[-*]|\d+[.)])\s+(.+)/);
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

  const infoEnd = body.search(/\b(?:strengths?|weaknesses?|pros|cons)\b/i);
  const infoPart = infoEnd > 0 ? body.slice(0, infoEnd) : body;
  const info = extractParagraphs(infoPart).slice(0, 200);

  if (strengths.length === 0 && weaknesses.length === 0) return null;

  return { name, website, info, strengths, weaknesses, opportunity };
}

export function parseMetricsTable(body: string): MetricRow[] {
  const { columns, data } = parseMarkdownTable(body);
  if (columns.length < 3) return [];

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

export function parseROIScenarios(body: string): ROIScenario[] {
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

export function parseTaskList(body: string): TaskItem[] {
  const items = [...parseBulletList(body), ...parseNumberedList(body)];
  const unique = [...new Set(items)];

  return unique.map((item, i) => {
    let priority: 'High' | 'Medium' | 'Low' = 'Medium';
    const lower = item.toLowerCase();
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
 * Parse checkbox-style task list items.
 * Supports: - [ ], - [x], ☐, ☑, and emoji checkboxes.
 */
export function parseCheckboxTaskList(body: string): TaskItem[] {
  const checkboxPattern = /^\s*(?:[-*]\s+\[([xX ])\]|[☐☑✅⬜])\s*(.+)/;
  const items: TaskItem[] = [];
  const lines = body.split('\n');

  for (const line of lines) {
    const match = line.match(checkboxPattern);
    if (match) {
      const checked = match[1]?.toLowerCase() === 'x' || /[☑✅]/.test(line);
      const text = cleanText(match[2] || line.replace(checkboxPattern, '').trim());
      if (text.length > 0) {
        items.push({
          id: `task-${items.length + 1}`,
          content: text,
          priority: checked ? 'Low' : 'Medium',
        });
      }
    }
  }

  return items;
}

export function parseCards(body: string): CardItem[] | null {
  const lines = body.split('\n');
  const bulletCards: CardItem[] = [];
  const numberedCards: CardItem[] = [];

  const sepPattern = /[:\-–—]/;

  for (const line of lines) {
    const bulletMatch = line.match(new RegExp(`^\\s*[-*]\\s+\\*\\*(.+?)\\*\\*${sepPattern.source}\\s*(.+)`));
    if (bulletMatch) {
      bulletCards.push({
        title: cleanText(bulletMatch[1]),
        text: cleanText(bulletMatch[2]),
        icon: pickIcon(bulletMatch[1]),
      });
    }

    const numMatch = line.match(new RegExp(`^\\s*\\d+[.)]\\s+\\*\\*(.+?)\\*\\*${sepPattern.source}\\s*(.+)`));
    if (numMatch) {
      numberedCards.push({
        title: cleanText(numMatch[1]),
        text: cleanText(numMatch[2]),
        icon: pickIcon(numMatch[1]),
      });
    }
  }

  const cards = bulletCards.length >= numberedCards.length ? bulletCards : numberedCards;
  return cards.length >= 2 ? cards : null;
}

export function parseBlueprints(heading: string, body: string): BlueprintItem[] {
  const items: BlueprintItem[] = [];
  const sections = body.split(/#{3,}\s+/);

  for (let i = 1; i < sections.length; i++) {
    const sectionLines = sections[i].split('\n');
    const title = cleanText(sectionLines[0] || `Blueprint ${i}`);
    const rest = sectionLines.slice(1).join('\n');
    const descRaw = extractParagraphs(rest) || title;
    const truncateAt = descRaw.lastIndexOf(' ', 200);
    const description = descRaw.length > 200
      ? descRaw.slice(0, truncateAt > 0 ? truncateAt : 200) + '...'
      : descRaw;
    const prompt = rest.trim().slice(0, 2000);

    items.push({ id: `bp-${i}`, title, description, prompt });
  }

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

export function parseRoadmapPhase(heading: string, body: string): RoadmapPhaseData | null {
  const phase = heading.replace(/^phase\s*\d*[:\s]*/i, '').trim() || heading;

  const timeMatch = body.match(
    /(?:timeline|duration|time(?:frame)?|months?|weeks?|quarter|Q[1-4]|sprint|period)[:\s]*([^\n,;()]+?)\s*(?:[,;()\n]|$)/i
  );
  const timeline = timeMatch ? cleanText(timeMatch[1]) : '';

  const objectives: RoadmapObjective[] = [];
  const deliverables: RoadmapDeliverable[] = [];
  const decisions: RoadmapDecision[] = [];

  const lines = body.split('\n');
  let currentSection: 'objectives' | 'deliverables' | 'decisions' | 'none' = 'none';

  for (const line of lines) {
    const lower = line.toLowerCase();
    const isBullet = /^\s*[-*]\s/.test(line) || /^\s*\d+[.)]\s/.test(line);

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

    const itemMatch = line.match(/^\s*(?:[-*]|\d+[.)])\s+(.+)/);
    if (itemMatch) {
      const text = cleanText(itemMatch[1]);
      if (currentSection === 'objectives') {
        objectives.push({ type: 'Primary', content: text });
      } else if (currentSection === 'deliverables') {
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
        objectives.push({ type: 'General', content: text });
      }
    }
  }

  if (objectives.length === 0 && deliverables.length === 0) return null;

  return { phase, timeline, objectives, deliverables, decisions };
}

export function parseStrategyGrid(body: string): PhaseDetail[] {
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

export function classifyAndParse(heading: string, body: string, sectionIndex: number): ParsedSection {
  const id = `section-${String(sectionIndex + 1).padStart(2, '0')}`;
  const paragraphText = extractParagraphs(body);

  // 1. Metrics table
  if (isMetricsBlock(heading, body)) {
    const metrics = parseMetricsTable(body);
    if (metrics.length > 0) {
      return { id, title: heading, content: paragraphText || 'Key performance indicators and targets.', type: 'metrics', data: metrics };
    }
  }

  // 2. Competitor analysis
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

  // 4. Risk dossier
  if (isRiskBlock(heading, body) && !hasTable(body)) {
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

  // 5. Task list
  if (isTaskBlock(heading, body)) {
    const tasks = parseTaskList(body);
    if (tasks.length > 0) {
      return { id, title: heading, content: paragraphText || 'Prioritized action items.', type: 'task_list', data: tasks };
    }
  }

  // 5b. Checkbox task list
  const checkboxTasks = parseCheckboxTaskList(body);
  if (checkboxTasks.length >= 2) {
    return { id, title: heading, content: paragraphText || 'Task checklist.', type: 'task_list_checkbox', data: checkboxTasks };
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

  // 7. Cards
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

  // 9. List
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

// ── Source/citation helpers ──────────────────────────────────────────

export function extractDomainName(url: string): string {
  try {
    const hostname = new URL(url).hostname.replace(/^www\d*\./, '');
    const parts = hostname.split('.');
    const ccTLDs = ['co', 'com', 'org', 'net', 'ac', 'gov'];
    if (parts.length >= 3 && ccTLDs.includes(parts[parts.length - 2])) {
      return parts[parts.length - 3];
    }
    if (parts.length >= 2) {
      return parts[parts.length - 2];
    }
    return parts[0];
  } catch {
    return 'Web';
  }
}

export function capitalizeDomain(domain: string): string {
  const acronyms: Record<string, string> = { bbc: 'BBC', mit: 'MIT', ibm: 'IBM', aws: 'AWS', nyt: 'NYT' };
  if (acronyms[domain.toLowerCase()]) return acronyms[domain.toLowerCase()];
  return domain.charAt(0).toUpperCase() + domain.slice(1);
}

/** Check that a URL uses a safe protocol (http/https only). */
export function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

export function buildSources(citations: string[] | undefined, fallbackLabel: string): import('./types').SourceItem[] {
  const uniqueCitations = [...new Set(citations || [])];
  const sources: import('./types').SourceItem[] = uniqueCitations
    .filter(isSafeUrl)
    .map((url, i) => {
      const domain = extractDomainName(url);
      return {
        source: capitalizeDomain(domain),
        title: `Source ${i + 1}`,
        url,
        icon: 'link',
      };
    });

  if (sources.length === 0) {
    sources.push({
      source: 'Perplexity',
      title: fallbackLabel,
      icon: 'description',
    });
  }

  return sources;
}

// ── TL;DR extraction ────────────────────────────────────────────────

const TLDR_HEADING_RE = /^tl;?\s*dr\b/i;

const MAX_SUMMARY_LENGTH = 1000;

/**
 * Extract a TL;DR/summary section from the parsed blocks.
 * Returns the summary text and the remaining blocks (with TL;DR removed).
 * If no TL;DR heading is found, returns null summary and original blocks.
 *
 * The extracted TL;DR is used for inter-part research handoff (stored in
 * PhaseData.phaseTldr), NOT for user-facing display. The user-facing
 * Short Summary is generated separately by the Haiku classifier.
 *
 * Only checks the first 2 blocks (TL;DR should always be at the top).
 * Requires at least 2 blocks to avoid consuming incomplete streaming content.
 */
export function extractTLDR(
  blocks: import('./types').RawBlock[]
): { summary: string | null; remainingBlocks: import('./types').RawBlock[] } {
  // Guard: during streaming, a single block means content is still incomplete
  if (blocks.length < 2) return { summary: null, remainingBlocks: blocks };

  // Only check the first 2 blocks — TL;DR should always be at the top
  const searchLimit = Math.min(blocks.length, 2);
  const idx = blocks.slice(0, searchLimit).findIndex(b => TLDR_HEADING_RE.test(b.heading.trim()));
  if (idx < 0) return { summary: null, remainingBlocks: blocks };

  const tldrBlock = blocks[idx];
  // Use extractParagraphs for prose, fall back to bullet list join, then cleanText
  let summaryText = extractParagraphs(tldrBlock.body)
    || parseBulletList(tldrBlock.body).join('. ')
    || cleanText(tldrBlock.body);

  if (!summaryText || summaryText.length < 20) {
    return { summary: null, remainingBlocks: blocks };
  }

  // Cap length to prevent excessively long summaries
  if (summaryText.length > MAX_SUMMARY_LENGTH) {
    const truncateAt = summaryText.lastIndexOf(' ', MAX_SUMMARY_LENGTH);
    summaryText = summaryText.slice(0, truncateAt > 0 ? truncateAt : MAX_SUMMARY_LENGTH) + '...';
  }

  // Normalize excessive whitespace/newlines
  summaryText = summaryText.replace(/\n{3,}/g, '\n\n').trim();

  const remainingBlocks = [...blocks.slice(0, idx), ...blocks.slice(idx + 1)];
  return { summary: summaryText, remainingBlocks };
}

// ── Visual Timeline synthesis ────────────────────────────────────────

const MONTH_ABBREV = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const TIMELINE_STATUS: Array<'completed' | 'active' | 'upcoming'> = ['completed', 'active', 'upcoming'];

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

export function synthesizeVisualTimeline(sections: ParsedSection[]): VisualTimelineData | null {
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
