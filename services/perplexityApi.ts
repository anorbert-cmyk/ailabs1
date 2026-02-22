/**
 * Perplexity API Service
 *
 * Handles API calls to Perplexity's sonar model.
 * Returns raw text + markdown that gets parsed into PhaseData.
 */

export interface PerplexityMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface PerplexityResponse {
  id: string;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  citations?: string[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface PerplexityApiConfig {
  apiKey: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

const DEFAULT_CONFIG: Partial<PerplexityApiConfig> = {
  model: 'sonar-pro',
  maxTokens: 8192,
  temperature: 0.2,
};

const REQUEST_TIMEOUT_MS = 60_000; // 60 second timeout
const MAX_RETRIES = 2;
const RETRY_DELAYS = [2000, 4000]; // exponential backoff

const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

/**
 * Phase-specific system prompts that guide Perplexity to return
 * structured content matching our component types.
 */
const SYSTEM_SUFFIX = `
Do not include conversational text, preamble, or sign-offs. Return only the structured analysis.
Keep each section concise (150-300 words max). Use ## for section headings.
Use bullet lists with - for enumerations. Use markdown tables with | for structured data.
For key findings, use bold **Title**: Description pattern for categorized items.`;

const PHASE_PROMPTS: Record<number, { system: string; user: string }> = {
  0: {
    system: `You are a strategic business analyst. Return your analysis in well-structured markdown.
Keep sections clearly separated. Include an Executive Summary first.${SYSTEM_SUFFIX}`,
    user: `Analyze this Web2/Web3 AI-native marketing agency concept. Cover:
1. Executive Summary (2-3 paragraphs)
2. Adaptive Problem Analysis - categorize task type, user base, complexity
3. Key Constraints - timeline, budget, tech platform, regulatory
4. Core JTBD Statement
5. Jobs To Be Done Breakdown (bullet list)
6. Assumption Ledger (table with: Assumption, Confidence, Validation Plan, Risk columns)`
  },
  1: {
    system: `You are a competitive intelligence analyst. Return your analysis in well-structured markdown.
For each competitor, include a subsection with strengths (bullet list), weaknesses (bullet list), and opportunity paragraph.${SYSTEM_SUFFIX}`,
    user: `Provide a competitive deep-dive for the Web3 marketing agency landscape. Cover:
1. Landscape Overview (market trends, pricing ranges, key shifts)
2. Competitor analyses for: RZLT, Coinbound, Lunar Strategy, theKOLLAB, Ninja Promo
   For each: website, founding info, target market, pricing, 3 strengths, 3 weaknesses, 1 key opportunity
3. Competitive Positioning Matrix (table with comparison across key dimensions)`
  },
  2: {
    system: `You are a project planning specialist. Return your analysis in well-structured markdown.
Use numbered phases for the roadmap.${SYSTEM_SUFFIX}`,
    user: `Create a 9-month phase-by-phase roadmap for launching an AI-native Web3 marketing agency. Cover:
1. Timeline overview
2. Phase 1: Foundation (months 1-3) - key deliverables, milestones
3. Phase 2: Growth (months 4-6) - scaling activities
4. Phase 3: Optimization (months 7-9) - market optimization
Include resource requirements and critical dependencies.`
  },
  3: {
    system: `You are a UX/product architect. Return your analysis in well-structured markdown.
Include detailed specifications.${SYSTEM_SUFFIX}`,
    user: `Define the core design architecture for an AI-native marketing agency platform. Cover:
1. Design System Overview
2. Core Application Flows (onboarding, dashboard, campaign builder, analytics)
3. Component Architecture
4. Interaction Patterns
Include wireframe descriptions and design principles.`
  },
  4: {
    system: `You are a systems architect specializing in scaling applications. Return in well-structured markdown.${SYSTEM_SUFFIX}`,
    user: `Detail the advanced screens and edge cases for the agency platform. Cover:
1. Error Handling Patterns (empty states, error states, loading patterns)
2. Edge Cases (concurrent users, data conflicts, network failures)
3. Advanced Features (bulk operations, export, integrations)
4. Accessibility Considerations`
  },
  5: {
    system: `You are a financial analyst and risk management specialist. Return in well-structured markdown.
Include quantified risk assessments with severity levels.${SYSTEM_SUFFIX}`,
    user: `Provide a comprehensive risk, metrics, and ROI analysis for the AI-native Web3 marketing agency. Cover:
1. Risk Dossier (categorized risks with severity and mitigation)
2. Key Financial Metrics (baseline, targets, variance)
3. ROI Analysis (conservative, moderate, aggressive scenarios with investment, MRR, ROI%, payback period)
4. Success Metrics and KPIs
5. Task Priority List`
  }
};

/**
 * Call the Perplexity API with a given phase prompt.
 * Includes request timeout and retry with exponential backoff for 429/5xx.
 */
export async function fetchPerplexityData(
  phaseIndex: number,
  config: PerplexityApiConfig,
  customPrompt?: { system?: string; user?: string }
): Promise<PerplexityResponse> {
  const { apiKey, model, maxTokens, temperature } = { ...DEFAULT_CONFIG, ...config };

  if (!apiKey) {
    throw new Error('Perplexity API key is not configured');
  }

  if (!(phaseIndex in PHASE_PROMPTS)) {
    console.warn(`[Perplexity] No prompt defined for phase ${phaseIndex}, falling back to phase 0`);
  }

  const phasePrompt = PHASE_PROMPTS[phaseIndex] || PHASE_PROMPTS[0];
  const systemPrompt = customPrompt?.system || phasePrompt.system;
  const userPrompt = customPrompt?.user || phasePrompt.user;

  const messages: PerplexityMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ];

  const requestBody = JSON.stringify({
    model,
    messages,
    max_tokens: maxTokens,
    temperature,
  });

  // Retry loop with exponential backoff
  let lastError: Error | null = null;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      // AbortController for request timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

      const response = await fetch(PERPLEXITY_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: requestBody,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const status = response.status;
        // Sanitize error body (truncate, strip potential key leaks)
        const errorBody = await response.text().catch(() => '');
        const safeError = errorBody.length > 200 ? errorBody.slice(0, 200) + '...' : errorBody;

        // Retry on 429 (rate limit) or 5xx (server error)
        if ((status === 429 || status >= 500) && attempt < MAX_RETRIES) {
          lastError = new Error(`Perplexity API error ${status}`);
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAYS[attempt]));
          continue;
        }

        throw new Error(`Perplexity API error ${status}: ${safeError}`);
      }

      const json = await response.json();

      // Basic response shape validation
      if (!json.choices || !Array.isArray(json.choices) || json.choices.length === 0) {
        throw new Error('Perplexity API returned empty or malformed response');
      }

      return json as PerplexityResponse;
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        throw new Error('Perplexity API request timed out');
      }
      // If it's a non-retryable error, throw immediately
      if (err instanceof Error && !err.message.includes('API error 429') && !err.message.includes('API error 5')) {
        throw err;
      }
      lastError = err instanceof Error ? err : new Error('Unknown error');
    }
  }

  throw lastError || new Error('Perplexity API request failed after retries');
}

/**
 * Extract the content string and citations from a Perplexity response.
 */
export function extractContent(response: PerplexityResponse): {
  content: string;
  citations: string[];
} {
  const content = response.choices?.[0]?.message?.content || '';
  const citations = response.citations || [];
  return { content, citations };
}

/**
 * Convenience function: fetch + extract in one call.
 */
export async function getPhaseContent(
  phaseIndex: number,
  config: PerplexityApiConfig,
  customPrompt?: { system?: string; user?: string }
): Promise<{ content: string; citations: string[] }> {
  const response = await fetchPerplexityData(phaseIndex, config, customPrompt);
  return extractContent(response);
}
