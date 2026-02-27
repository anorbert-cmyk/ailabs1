/**
 * Insider tier parser — 2-part analysis.
 *
 * Part 1 (phaseIndex=0): Discovery & User Needs
 * Part 2 (phaseIndex=1): Competitor Deep-Dive
 *
 * Each part is parsed independently into its own PhaseData.
 */

import type { PhaseData, ParsedSection, SectionType } from './types';
import { INSIDER_META } from './types';
import {
  splitByHeadings, classifyAndParse, extractParagraphs, cleanText,
  buildSources, extractTLDR,
} from './common';

// ── Public API ──────────────────────────────────────────────────────

/**
 * Parse a single Insider-tier markdown response into PhaseData.
 *
 * @param markdown   Raw markdown from the Perplexity API
 * @param partIndex  0 = Discovery & User Needs, 1 = Competitor Deep-Dive
 * @param citations  Optional array of citation URLs returned alongside the response
 */
export function parseInsiderAnalysis(
  markdown: string,
  partIndex: number,
  citations?: string[],
): PhaseData {
  const meta = INSIDER_META[partIndex] ?? {
    badge: `Insider — Part ${partIndex + 1}`,
    title: `Analysis Part ${partIndex + 1}`,
    subtitle: '',
    metadata: [`Tier: Insider`, `Part: ${partIndex + 1}/2`],
  };

  // 1. Split raw markdown into heading-delimited blocks
  const rawBlocks = splitByHeadings(markdown);

  // 2. Filter out empty blocks (no heading AND no meaningful body)
  const blocks = rawBlocks.filter(
    (b) => b.heading.trim().length > 0 || b.body.trim().length > 0,
  );

  // 2b. Extract TL;DR for inter-part research handoff (NOT user-facing)
  const { summary: phaseTldr, remainingBlocks } = extractTLDR(blocks);

  // 3. Classify and parse each block into a ParsedSection
  const sections: ParsedSection[] = [];

  for (let i = 0; i < remainingBlocks.length; i++) {
    const block = remainingBlocks[i];

    // Handle intro block (no heading, first block) as a text overview section
    if (i === 0 && block.heading.trim().length === 0) {
      const content = extractParagraphs(block.body) || cleanText(block.body);
      if (content.length > 0) {
        sections.push({
          id: 'section-00',
          title: 'Overview',
          content,
          type: 'text' as SectionType,
        });
      }
      continue;
    }

    // Standard classification via shared utility
    const parsed = classifyAndParse(block.heading, block.body, sections.length);
    sections.push(parsed);
  }

  // 4. Fallback: if no sections were produced, add a text section from the raw markdown
  if (sections.length === 0 && markdown.trim().length > 0) {
    const content = extractParagraphs(markdown) || cleanText(markdown);
    sections.push({
      id: 'section-01',
      title: meta.title,
      content: content.slice(0, 2000) || 'Analysis content could not be parsed.',
      type: 'text' as SectionType,
    });
  }

  // 5. Build sources from citations
  const fallbackLabel = `${meta.title} — AI Analysis`;
  const sources = buildSources(citations, fallbackLabel);

  // 6. Assemble PhaseData
  return {
    id: `insider-part-${partIndex + 1}`,
    badge: meta.badge,
    title: meta.title,
    subtitle: meta.subtitle,
    metadata: meta.metadata,
    sources,
    sections,
    ...(phaseTldr ? { phaseTldr } : {}),
  };
}
