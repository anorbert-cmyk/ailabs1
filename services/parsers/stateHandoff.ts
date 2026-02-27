/**
 * STATE_HANDOFF type definitions — ported from validatestrategylive production.
 *
 * These types represent the structured JSON blocks that the LLM outputs at the
 * end of each analysis part. The handoff data is accumulated and injected into
 * the next part's prompt to enable cross-part context continuity.
 *
 * Syndicate tier: 5 parts produce STATE_HANDOFF_PART_1 through STATE_HANDOFF_PART_5
 * Insider tier: 1 part produces InsiderStateHandoffPart1
 */

// ── Syndicate tier handoff types ─────────────────────────────────────

export interface StateHandoffPart1 {
  detected_industry: 'Fintech' | 'Healthcare' | 'E-commerce' | 'SaaS' | 'Marketplace' | 'InternalTools' | 'Web3';
  detected_persona: 'SoloFounder' | 'DesignLead' | 'PM' | 'Enterprise' | 'Web3Native';
  core_jtbd: string;
  top_3_pain_points: [string, string, string];
  highest_risk_assumption: {
    id: string;
    statement: string;
    confidence: 'High' | 'Medium' | 'Low';
  };
  competitor_gap: string;
  pre_mortem_risks: string[];
}

export interface StateHandoffPart2 {
  competitor_count: number;
  competitor_summary: string;
  primary_differentiator: string;
  patterns_to_adopt: string[];
  patterns_to_avoid: string[];
  pricing_positioning: string;
}

export interface StateHandoffPart3 {
  timeline_type: 'QuickWin' | 'Medium' | 'Strategic';
  phase_count: number;
  critical_milestones: string[];
  top_error_scenarios: string[];
  resource_bottlenecks: string[];
}

export interface StateHandoffPart4 {
  screens_designed: string[];
  design_system_tokens: {
    primary_color: string;
    typography: string;
    spacing_base: string;
  };
  pain_points_addressed: string[];
}

export interface StateHandoffPart5 {
  edge_cases_covered: string[];
  industry_specific_screens: string[];
  accessibility_notes: string[];
}

// ── Insider tier handoff types ───────────────────────────────────────

export interface InsiderStateHandoffPart1 {
  detected_industry: string;
  detected_persona: string;
  core_jtbd: string;
  top_3_pain_points: string[];
  competitor_count: number;
  highest_risk_assumption: {
    id: string;
    statement: string;
    confidence: 'High' | 'Medium' | 'Low';
  };
}

// ── Union types ──────────────────────────────────────────────────────

export type SyndicateStateHandoff =
  | StateHandoffPart1
  | StateHandoffPart2
  | StateHandoffPart3
  | StateHandoffPart4
  | StateHandoffPart5;

export type InsiderStateHandoff = InsiderStateHandoffPart1;

// ── Extraction result ────────────────────────────────────────────────

export interface ExtractedStateHandoff {
  partNumber: number;
  rawJson: string;
  parsed: SyndicateStateHandoff | InsiderStateHandoff | null;
  extractionMethod: 'explicit' | 'fallback';
}
