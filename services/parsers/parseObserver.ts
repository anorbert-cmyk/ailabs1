/**
 * Observer tier parser — single-part quick validation analysis.
 *
 * Parses a Perplexity markdown response into exactly 1 PhaseData with
 * four fixed sections: Problem Statement, Pain Points, Viability Score,
 * and Next Step.
 */

import type { PhaseData, ParsedSection, PainPoint, ViabilityScore, NextStep } from './types';
import { OBSERVER_META } from './types';
import {
  splitByHeadings, classifyAndParse, extractParagraphs, cleanText,
  pickIcon, parseBulletList, buildSources,
} from './common';

// ── Constants ────────────────────────────────────────────────────────

const OBSERVER_MARKER = '[✅ OBSERVER SANITY CHECK COMPLETE]';

const SEVERITY_ICONS: Record<PainPoint['severity'], string> = {
  low: '🟢',
  medium: '🟡',
  high: '🔴',
};

// ── Section heading matchers ─────────────────────────────────────────

function isProblemHeading(heading: string): boolean {
  const lower = heading.toLowerCase();
  return /\b(problem|statement|overview|summary)\b/.test(lower);
}

function isPainPointsHeading(heading: string): boolean {
  const lower = heading.toLowerCase();
  return /\b(pain|challenge|issue|friction)\b/.test(lower);
}

function isViabilityHeading(heading: string): boolean {
  const lower = heading.toLowerCase();
  return /\b(viability|score|assessment|feasibility)\b/.test(lower);
}

function isNextStepHeading(heading: string): boolean {
  const lower = heading.toLowerCase();
  return /\b(next|action|recommendation|step)\b/.test(lower);
}

// ── Pain point severity detection ────────────────────────────────────

function detectSeverity(text: string): PainPoint['severity'] {
  const lower = text.toLowerCase();
  if (/\b(critical|severe|major|high|significant|blocking)\b/.test(lower)) return 'high';
  if (/\b(minor|low|slight|trivial|negligible)\b/.test(lower)) return 'low';
  return 'medium';
}

// ── Section parsers ──────────────────────────────────────────────────

function parseProblemSection(body: string): ParsedSection {
  const content = extractParagraphs(body) || cleanText(body);
  return {
    id: 'section-01',
    title: 'Problem Statement',
    content,
    type: 'text',
  };
}

function parsePainPointsSection(body: string): ParsedSection {
  const lines = body.split('\n');
  const painPoints: PainPoint[] = [];

  // Parse bullet items with bold titles: - **Title**: description
  const sepPattern = /[:\-–—]/;
  for (const line of lines) {
    const bulletMatch = line.match(
      new RegExp(`^\\s*[-*]\\s+\\*\\*(.+?)\\*\\*${sepPattern.source}\\s*(.+)`)
    );
    if (bulletMatch) {
      const title = cleanText(bulletMatch[1]);
      const text = cleanText(bulletMatch[2]);
      const severity = detectSeverity(title + ' ' + text);
      painPoints.push({
        title,
        text,
        severity,
        icon: SEVERITY_ICONS[severity],
      });
    }
  }

  // Fallback: try plain bullet list items
  if (painPoints.length === 0) {
    const bullets = parseBulletList(body);
    for (const bullet of bullets) {
      const severity = detectSeverity(bullet);
      painPoints.push({
        title: bullet.length > 60 ? bullet.slice(0, 57) + '...' : bullet,
        text: bullet,
        severity,
        icon: SEVERITY_ICONS[severity],
      });
    }
  }

  const content = extractParagraphs(body) || 'Key pain points identified in the target market.';
  return {
    id: 'section-02',
    title: 'Pain Points',
    content,
    type: 'pain_points',
    data: painPoints,
  };
}

function parseViabilitySection(body: string): ParsedSection {
  // Extract score number (0-100) — require a qualifier to avoid matching arbitrary numbers
  const scoreMatch = body.match(/\b(\d{1,3})\s*(?:\/\s*100|%|out of 100)\b/)
    || body.match(/(?:score|viability|rating|assessment)[:\s]*(\d{1,3})\b/i);
  const score = scoreMatch ? Math.min(100, Math.max(0, parseInt(scoreMatch[1], 10))) : 50;

  let emoji: string;
  let label: string;
  if (score <= 30) {
    emoji = '🔴';
    label = 'Low Viability';
  } else if (score <= 60) {
    emoji = '🟡';
    label = 'Moderate Viability';
  } else {
    emoji = '🟢';
    label = 'High Viability';
  }

  const summary = extractParagraphs(body) || `Viability score: ${score}/100.`;

  const viabilityData: ViabilityScore = { score, label, emoji, summary };

  return {
    id: 'section-03',
    title: 'Viability Score',
    content: `${emoji} ${score}/100 — ${label}`,
    type: 'viability_score',
    data: viabilityData,
  };
}

function parseNextStepSection(body: string): ParsedSection {
  let whatToDo = '';
  let whyFirst = '';
  let title = 'Recommended Next Step';

  const lines = body.split('\n');
  let currentField: 'what' | 'why' | 'none' = 'none';

  for (const line of lines) {
    const lower = line.toLowerCase();

    // Detect sub-headings or bold labels for "What to do" / "Why first"
    if (/\bwhat\s+to\s+do\b/i.test(lower)) {
      currentField = 'what';
      // Extract inline content after the label
      const inline = line.replace(/^.*?\bwhat\s+to\s+do\b[:\s]*/i, '').trim();
      if (inline.length > 0) whatToDo += cleanText(inline) + ' ';
      continue;
    }
    if (/\bwhy\s+first\b/i.test(lower)) {
      currentField = 'why';
      const inline = line.replace(/^.*?\bwhy\s+first\b[:\s]*/i, '').trim();
      if (inline.length > 0) whyFirst += cleanText(inline) + ' ';
      continue;
    }

    // Capture content under current field
    const trimmed = line.trim();
    if (trimmed.length === 0) continue;

    if (currentField === 'what') {
      whatToDo += cleanText(trimmed) + ' ';
    } else if (currentField === 'why') {
      whyFirst += cleanText(trimmed) + ' ';
    }
  }

  whatToDo = whatToDo.trim();
  whyFirst = whyFirst.trim();

  // Fallback: if structured fields weren't found, use paragraphs/bullets
  if (!whatToDo && !whyFirst) {
    const bullets = parseBulletList(body);
    if (bullets.length >= 2) {
      whatToDo = bullets[0];
      whyFirst = bullets[1];
    } else if (bullets.length === 1) {
      whatToDo = bullets[0];
      whyFirst = extractParagraphs(body) || '';
    } else {
      whatToDo = extractParagraphs(body) || cleanText(body);
    }
  }

  // Try to extract a title from the first bold text or heading
  const boldMatch = body.match(/\*\*(.+?)\*\*/);
  if (boldMatch) {
    const candidate = cleanText(boldMatch[1]);
    if (candidate.length < 80 && !/what\s+to\s+do|why\s+first/i.test(candidate)) {
      title = candidate;
    }
  }

  const nextStepData: NextStep = { title, whatToDo, whyFirst };

  return {
    id: 'section-04',
    title: 'Next Step',
    content: whatToDo || 'Actionable recommendation based on the analysis.',
    type: 'next_step',
    data: nextStepData,
  };
}

// ── Main export ──────────────────────────────────────────────────────

export function parseObserverAnalysis(
  markdown: string,
  citations?: string[],
): PhaseData {
  // 1. Check for observer marker
  if (!markdown.includes(OBSERVER_MARKER)) {
    console.warn(
      '[parseObserver] Observer sanity-check marker not found — continuing with best-effort parsing.',
    );
  }

  // 2. Split by headings
  const blocks = splitByHeadings(markdown);

  // 3. Detect sections by heading keywords
  let problemBlock: { heading: string; body: string } | null = null;
  let painBlock: { heading: string; body: string } | null = null;
  let viabilityBlock: { heading: string; body: string } | null = null;
  let nextStepBlock: { heading: string; body: string } | null = null;

  for (const block of blocks) {
    if (!block.heading) continue;
    if (!problemBlock && isProblemHeading(block.heading)) {
      problemBlock = block;
    } else if (!painBlock && isPainPointsHeading(block.heading)) {
      painBlock = block;
    } else if (!viabilityBlock && isViabilityHeading(block.heading)) {
      viabilityBlock = block;
    } else if (!nextStepBlock && isNextStepHeading(block.heading)) {
      nextStepBlock = block;
    }
  }

  // 4. Parse each section (or fall back to classifyAndParse)
  const sections: ParsedSection[] = [];

  if (problemBlock) {
    sections.push(parseProblemSection(problemBlock.body));
  } else {
    // Use the first block with content as the problem statement
    const fallback = blocks.find(b => b.body.trim().length > 0);
    if (fallback) {
      sections.push(parseProblemSection(fallback.body));
    } else {
      sections.push({
        id: 'section-01',
        title: 'Problem Statement',
        content: cleanText(markdown).slice(0, 500) || 'No problem statement detected.',
        type: 'text',
      });
    }
  }

  if (painBlock) {
    sections.push(parsePainPointsSection(painBlock.body));
  } else {
    // Fall back to classifyAndParse for unmatched blocks
    const unmatched = blocks.find(
      b => b.heading && b !== problemBlock && b !== viabilityBlock && b !== nextStepBlock,
    );
    if (unmatched) {
      const parsed = classifyAndParse(unmatched.heading, unmatched.body, 1);
      parsed.id = 'section-02';
      sections.push(parsed);
    }
  }

  if (viabilityBlock) {
    sections.push(parseViabilitySection(viabilityBlock.body));
  } else {
    // Try to find a score anywhere in the markdown (require qualifier)
    const globalScoreMatch = markdown.match(/\b(\d{1,3})\s*(?:\/\s*100|out of 100)\b/)
      || markdown.match(/(?:score|viability|rating)[:\s]*(\d{1,3})\b/i);
    if (globalScoreMatch) {
      sections.push(parseViabilitySection(globalScoreMatch[0]));
    }
  }

  if (nextStepBlock) {
    sections.push(parseNextStepSection(nextStepBlock.body));
  } else {
    // Try the last block as a next step
    const lastBlock = blocks[blocks.length - 1];
    if (lastBlock && lastBlock !== problemBlock && lastBlock !== painBlock && lastBlock !== viabilityBlock) {
      const parsed = classifyAndParse(lastBlock.heading || 'Next Step', lastBlock.body, 3);
      parsed.id = 'section-04';
      sections.push(parsed);
    }
  }

  // 5. If we ended up with fewer than 2 sections, fall back entirely
  if (sections.length < 2) {
    sections.length = 0;
    blocks.forEach((block, i) => {
      sections.push(classifyAndParse(block.heading || `Section ${i + 1}`, block.body, i));
    });
  }

  // 6. Build sources
  const sources = buildSources(citations, 'Observer Analysis');

  // 7. Assemble PhaseData
  return {
    id: 'observer-1',
    badge: OBSERVER_META.badge,
    title: OBSERVER_META.title,
    subtitle: OBSERVER_META.subtitle,
    metadata: OBSERVER_META.metadata,
    sources,
    sections,
  };
}
