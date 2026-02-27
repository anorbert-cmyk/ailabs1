/**
 * Tier-based parser dispatcher.
 *
 * Entry point for parsing Perplexity API responses based on analysis tier.
 * Routes to the correct tier-specific parser while re-exporting all shared types.
 */

import type { AnalysisTier, PhaseData } from './types';
import { TIER_PART_COUNT } from './types';
import { parseObserverAnalysis } from './parseObserver';
import { parseInsiderAnalysis } from './parseInsider';
import { parseSyndicateAnalysis } from './parseSyndicate';

// ── Re-exports ──────────────────────────────────────────────────────

export type {
  AnalysisTier,
  PhaseData,
  ParsedSection,
  SectionType,
  MetricRow,
  TableColumn,
  CardItem,
  CompetitorData,
  ROIScenario,
  TaskItem,
  RoadmapPhaseData,
  PhaseDetail,
  VisualTimelineData,
  BlueprintItem,
  ViabilityScore,
  PainPoint,
  NextStep,
} from './types';

export { TIER_PART_COUNT } from './types';
export { parseObserverAnalysis } from './parseObserver';
export { parseInsiderAnalysis } from './parseInsider';
export { parseSyndicateAnalysis } from './parseSyndicate';

// ── Main dispatcher ─────────────────────────────────────────────────

/**
 * Parse a raw Perplexity markdown response into PhaseData based on the
 * analysis tier.
 *
 * @param tier       - 'observer' | 'insider' | 'syndicate'
 * @param markdown   - Raw markdown from Perplexity API
 * @param partIndex  - Which part within the tier (0-based). Observer: always 0.
 *                     Insider: 0-1. Syndicate: 0-5.
 * @param citations  - Optional citation URLs from the Perplexity response
 */
export function parseAnalysis(
  tier: AnalysisTier,
  markdown: string,
  partIndex: number = 0,
  citations?: string[]
): PhaseData {
  const maxParts = TIER_PART_COUNT[tier];
  const safeIndex = Math.max(0, Math.min(partIndex, maxParts - 1));

  switch (tier) {
    case 'observer':
      return parseObserverAnalysis(markdown, citations);

    case 'insider':
      return parseInsiderAnalysis(markdown, safeIndex, citations);

    case 'syndicate':
      return parseSyndicateAnalysis(markdown, safeIndex, citations);

    default: {
      // Exhaustive check — TypeScript will error if a tier is unhandled
      const _exhaustive: never = tier;
      throw new Error(`Unknown analysis tier: ${_exhaustive}`);
    }
  }
}

/**
 * Get the number of parts expected for a given tier.
 */
export function getPartCount(tier: AnalysisTier): number {
  return TIER_PART_COUNT[tier];
}
