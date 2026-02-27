/**
 * Syndicate (APEX) tier parser — 6-part strategic analysis.
 *
 * Parses each of the 6 sequential Perplexity API responses into PhaseData:
 *   Part 1 (phaseIndex=0): Discovery & User Needs
 *   Part 2 (phaseIndex=1): Competitor Deep-Dive
 *   Part 3 (phaseIndex=2): Phase-by-Phase Roadmap (includes visual timeline)
 *   Part 4 (phaseIndex=3): Core Design
 *   Part 5 (phaseIndex=4): Advanced Screens & Edge Cases
 *   Part 6 (phaseIndex=5): Risk, Metrics & ROI
 */

import type { PhaseData, ParsedSection, SectionType } from './types';
import { SYNDICATE_META } from './types';
import {
  splitByHeadings, classifyAndParse, extractParagraphs, cleanText,
  buildSources, synthesizeVisualTimeline,
} from './common';

/**
 * Parse a raw Perplexity markdown response for the Syndicate tier.
 *
 * @param markdown   - The raw markdown from Perplexity API
 * @param phaseIndex - Which part (0-5) this content belongs to
 * @param citations  - Optional citation URLs from the Perplexity response
 */
export function parseSyndicateAnalysis(
  markdown: string,
  phaseIndex: number,
  citations?: string[]
): PhaseData {
  const meta = SYNDICATE_META[phaseIndex] || SYNDICATE_META[0];
  const blocks = splitByHeadings(markdown);

  // Filter out entirely empty blocks
  const filteredBlocks = blocks.filter(block => block.heading || block.body.trim().length > 0);

  // Classify and parse each block into a typed section
  const sections: ParsedSection[] = filteredBlocks.map((block, index) => {
    // Intro block (no heading, first position) becomes a text overview
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

  // Fallback: if no sections were generated, add a minimal text section
  if (sections.length === 0) {
    sections.push({
      id: 'section-01',
      title: 'Overview',
      content: cleanText(markdown) || 'No content available. Please try again.',
      type: 'text',
    });
  }

  // Build sources from citations
  const sources = buildSources(citations, `${meta.badge} Analysis`);

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
