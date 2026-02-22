/**
 * Content Parser (v3 — tier-based modular)
 *
 * Backward-compatible wrapper around the new tier-based parser system.
 * All parsing logic has been extracted into services/parsers/.
 *
 * This file re-exports the Syndicate parser as `parsePerplexityResponse()`
 * for backward compatibility with existing code (App.tsx, useStreamingPhase.ts).
 *
 * New code should import from './parsers' directly:
 *   import { parseAnalysis, AnalysisTier } from './parsers';
 */

// Re-export types for backward compatibility
export type {
  PhaseData,
  ParsedSection,
  SectionType,
  AnalysisTier,
} from './parsers';

// Re-export the full tier-based API
export {
  parseAnalysis,
  getPartCount,
  TIER_PART_COUNT,
  parseObserverAnalysis,
  parseInsiderAnalysis,
  parseSyndicateAnalysis,
} from './parsers';

// ── Backward-compatible API ─────────────────────────────────────────

import { parseSyndicateAnalysis } from './parsers';

/**
 * Parse a raw Perplexity markdown response into PhaseData.
 * This is the original API — delegates to the Syndicate parser.
 *
 * @deprecated Use `parseAnalysis(tier, markdown, phaseIndex, citations)` instead.
 */
export function parsePerplexityResponse(
  markdown: string,
  phaseIndex: number,
  citations?: string[]
): import('./parsers').PhaseData {
  return parseSyndicateAnalysis(markdown, phaseIndex, citations);
}

/**
 * Quick test: parse markdown string without API call.
 * @deprecated Use `parseAnalysis(tier, markdown, phaseIndex)` instead.
 */
export function testParser(markdown: string, phaseIndex = 0): import('./parsers').PhaseData {
  return parseSyndicateAnalysis(markdown, phaseIndex, []);
}
