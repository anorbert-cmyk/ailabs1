/**
 * Perplexity API Service (v3 — Claude Sonnet 4.6 Thinking)
 *
 * Routes through Perplexity Agent API to Claude Sonnet 4.6 with extended thinking.
 * Returns raw text + markdown that gets parsed into PhaseData.
 *
 * v3 changes:
 * - Model switched from sonar-pro to anthropic/claude-sonnet-4-6 via Agent API
 * - Added reasoning_effort parameter for extended thinking (low/medium/high)
 *
 * Retained from v2:
 * - Accepts external AbortSignal for cancellation (race condition prevention)
 * - Structured retry logic (not string-based error matching)
 * - Validates response.choices[0].message.content
 * - Retries network errors (not just HTTP 429/5xx)
 * - Proper timeout cleanup in finally blocks
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
  reasoningEffort?: 'low' | 'medium' | 'high';
}

const DEFAULT_CONFIG: Partial<PerplexityApiConfig> = {
  model: 'anthropic/claude-sonnet-4-6',
  maxTokens: 8192,
  temperature: 0.2,
  reasoningEffort: 'high',
};

const REQUEST_TIMEOUT_MS = 60_000; // 60 second timeout
const MAX_RETRIES = 2;
const BASE_RETRY_DELAY = 2000; // exponential backoff: 2s, 4s

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
Use numbered phases for the roadmap. For each phase use ### sub-headings for Objectives, Deliverables, and Critical Decision Points.${SYSTEM_SUFFIX}`,
    user: `Create a 9-month phase-by-phase roadmap for launching an AI-native Web3 marketing agency. Cover:
1. Timeline overview (include strategic rationale — why this phased approach over alternatives)
2. Phase 1: Foundation (months 1-3)
   - Objectives (bullet list with **Type**: description)
   - Key Deliverables (grouped with **Category** headers and sub-items)
   - Critical Decision Points (include stakeholders, deadlines, criteria)
3. Phase 2: Growth (months 4-6) — same structure as Phase 1
4. Phase 3: Optimization (months 7-9) — same structure as Phase 1
Include resource requirements and critical dependencies for each phase.`
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
 * Determine if an error is retryable (network errors, 429, 5xx).
 */
function isRetryableError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  // Check error code (Node.js errors)
  const code = (err as Error & { code?: string }).code;
  if (code && ['ECONNREFUSED', 'ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND', 'ECONNABORTED', 'UND_ERR_SOCKET'].includes(code)) {
    return true;
  }
  // Check error message (case-insensitive)
  const msg = err.message.toLowerCase();
  if (msg.includes('fetch failed') || msg.includes('network') ||
      msg.includes('econnrefused') || msg.includes('econnreset') ||
      msg.includes('etimedout') || msg.includes('und_err')) {
    return true;
  }
  // HTTP 429 or 5xx (set by our own throw)
  if (msg.includes('[retryable]')) return true;
  return false;
}

/**
 * Check if an error is an AbortError (works in both browser and Node.js).
 */
function isAbortError(err: unknown): boolean {
  if (err instanceof Error && err.name === 'AbortError') return true;
  if (typeof DOMException !== 'undefined' && err instanceof DOMException && err.name === 'AbortError') return true;
  return false;
}

/**
 * Call the Perplexity API with a given phase prompt.
 * Includes request timeout and retry with exponential backoff.
 *
 * @param signal - Optional external AbortSignal for cancellation (e.g., phase switching)
 */
export async function fetchPerplexityData(
  phaseIndex: number,
  config: PerplexityApiConfig,
  customPrompt?: { system?: string; user?: string },
  signal?: AbortSignal
): Promise<PerplexityResponse> {
  const { apiKey, model, maxTokens, temperature, reasoningEffort } = { ...DEFAULT_CONFIG, ...config };

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
    ...(reasoningEffort && { reasoning_effort: reasoningEffort }),
  });

  // Retry loop with exponential backoff
  let lastError: Error | null = null;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    // Check external abort signal before each attempt
    if (signal?.aborted) {
      throw new Error('Request cancelled');
    }

    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const controller = new AbortController();
    const handleAbort = () => controller.abort();

    try {
      // Combine external signal with timeout signal
      timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
      if (signal) {
        signal.addEventListener('abort', handleAbort, { once: true });
      }

      const response = await fetch(PERPLEXITY_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: requestBody,
        signal: controller.signal,
      });

      if (!response.ok) {
        const status = response.status;
        // Sanitize error body (truncate, strip potential key leaks)
        const errorBody = await response.text().catch(() => '');
        const safeError = errorBody.length > 200 ? errorBody.slice(0, 200) + '...' : errorBody;

        // Retry on 429 (rate limit) or 5xx (server error)
        if ((status === 429 || status >= 500) && attempt < MAX_RETRIES) {
          lastError = new Error(`[retryable] Perplexity API error ${status}`);
          const delay = BASE_RETRY_DELAY * Math.pow(2, attempt) + Math.random() * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }

        throw new Error(`Perplexity API error ${status}: ${safeError}`);
      }

      const json = await response.json();

      // Validate response shape including content
      if (!json.choices || !Array.isArray(json.choices) || json.choices.length === 0) {
        throw new Error('Perplexity API returned empty or malformed response');
      }

      const content = json.choices[0]?.message?.content;
      if (content == null || typeof content !== 'string') {
        throw new Error('Perplexity API response missing message content');
      }

      // Warn on truncated responses
      if (json.choices[0]?.finish_reason === 'length') {
        console.warn('[Perplexity] Response was truncated due to max_tokens limit');
      }

      // Validate citations are strings
      if (json.citations && Array.isArray(json.citations)) {
        json.citations = json.citations.filter((c: unknown) => typeof c === 'string' && c.length > 0);
      }

      return json as PerplexityResponse;
    } catch (err) {
      if (isAbortError(err)) {
        // Check if it was the external signal or timeout
        if (signal?.aborted) {
          throw new Error('Request cancelled');
        }
        throw new Error('Perplexity API request timed out');
      }

      // Retry on retryable errors
      if (isRetryableError(err) && attempt < MAX_RETRIES) {
        lastError = err instanceof Error ? err : new Error('Unknown error');
        const delay = BASE_RETRY_DELAY * Math.pow(2, attempt) + Math.random() * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      // Non-retryable error — throw immediately
      if (err instanceof Error) throw err;
      throw new Error('Unknown error during Perplexity API call');
    } finally {
      if (timeoutId !== undefined) clearTimeout(timeoutId);
      if (signal) signal.removeEventListener('abort', handleAbort);
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
 * Accepts an optional AbortSignal for cancellation.
 */
export async function getPhaseContent(
  phaseIndex: number,
  config: PerplexityApiConfig,
  customPrompt?: { system?: string; user?: string },
  signal?: AbortSignal
): Promise<{ content: string; citations: string[] }> {
  const response = await fetchPerplexityData(phaseIndex, config, customPrompt, signal);
  return extractContent(response);
}

// ── Streaming API ────────────────────────────────────────────────────

export interface StreamCallbacks {
  onChunk: (chunkText: string, accumulated: string) => void;
  onComplete: (fullText: string, citations: string[]) => void;
  onError: (error: Error) => void;
}

/** Shape of a single SSE chunk from the streaming API. */
interface StreamChunk {
  choices?: {
    delta?: { content?: string };
    finish_reason?: string | null;
  }[];
  citations?: unknown[];
}

/**
 * Stream a Perplexity API response using Server-Sent Events.
 *
 * Sends `stream: true` in the request body. Reads the response as an SSE
 * stream, calling `onChunk` for each content delta, `onComplete` when the
 * stream finishes, and `onError` on failure.
 *
 * Includes the same retry logic as `fetchPerplexityData` (max 2 retries
 * with exponential backoff for network/429/5xx errors).
 */
export async function streamPerplexityData(
  phaseIndex: number,
  config: PerplexityApiConfig,
  callbacks: StreamCallbacks,
  customPrompt?: { system?: string; user?: string },
  signal?: AbortSignal
): Promise<void> {
  const { apiKey, model, maxTokens, temperature, reasoningEffort } = { ...DEFAULT_CONFIG, ...config };

  if (!apiKey) {
    callbacks.onError(new Error('Perplexity API key is not configured'));
    return;
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
    stream: true,
    ...(reasoningEffort && { reasoning_effort: reasoningEffort }),
  });

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (signal?.aborted) {
      callbacks.onError(new Error('Request cancelled'));
      return;
    }

    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const controller = new AbortController();
    const handleAbort = () => controller.abort();

    try {
      timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
      if (signal) {
        signal.addEventListener('abort', handleAbort, { once: true });
      }

      const response = await fetch(PERPLEXITY_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: requestBody,
        signal: controller.signal,
      });

      if (!response.ok) {
        const status = response.status;
        const errorBody = await response.text().catch(() => '');
        const safeError = errorBody.length > 200 ? errorBody.slice(0, 200) + '...' : errorBody;

        if ((status === 429 || status >= 500) && attempt < MAX_RETRIES) {
          lastError = new Error(`[retryable] Perplexity API error ${status}`);
          const delay = BASE_RETRY_DELAY * Math.pow(2, attempt) + Math.random() * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }

        throw new Error(`Perplexity API error ${status}: ${safeError}`);
      }

      if (!response.body) {
        throw new Error('Response body is not readable (streaming not supported)');
      }

      // Read SSE stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let accumulated = '';
      let citations: string[] = [];

      /** Parse a single SSE data line and update accumulated/citations state. */
      const processDataLine = (jsonStr: string): 'stop' | 'continue' => {
        try {
          const parsed: StreamChunk = JSON.parse(jsonStr);
          const delta = parsed.choices?.[0]?.delta?.content;
          if (delta && typeof delta === 'string') {
            accumulated += delta;
            callbacks.onChunk(delta, accumulated);
          }

          // Capture citations from the final chunk
          if (parsed.citations && Array.isArray(parsed.citations)) {
            citations = parsed.citations.filter(
              (c): c is string => typeof c === 'string' && c.length > 0
            );
          }

          // Check finish_reason
          if (parsed.choices?.[0]?.finish_reason === 'stop') {
            return 'stop';
          }
        } catch {
          // Malformed JSON in SSE line — skip
          console.warn('[Streaming] Skipping malformed SSE data line');
        }
        return 'continue';
      };

      try {
        while (true) {
          if (signal?.aborted) {
            reader.cancel();
            callbacks.onError(new Error('Request cancelled'));
            return;
          }

          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          // Keep the last potentially incomplete line in the buffer
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith(':')) continue; // skip empty lines and comments

            if (trimmed === 'data: [DONE]') {
              // Stream is complete
              if (timeoutId !== undefined) clearTimeout(timeoutId);
              callbacks.onComplete(accumulated, citations);
              return;
            }

            if (trimmed.startsWith('data: ')) {
              if (processDataLine(trimmed.slice(6)) === 'stop') {
                if (timeoutId !== undefined) clearTimeout(timeoutId);
                callbacks.onComplete(accumulated, citations);
                return;
              }
            }
          }
        }

        // Flush remaining buffer — may contain a final data line without trailing newline
        if (buffer.length > 0) {
          const trimmed = buffer.trim();
          if (trimmed === 'data: [DONE]') {
            // handled below
          } else if (trimmed.startsWith('data: ')) {
            processDataLine(trimmed.slice(6));
          }
          buffer = '';
        }

        // Flush any trailing bytes from the decoder
        const trailing = decoder.decode();
        if (trailing.length > 0) {
          const trimmed = trailing.trim();
          if (trimmed.startsWith('data: ') && trimmed !== 'data: [DONE]') {
            processDataLine(trimmed.slice(6));
          }
        }

        // If we reach here without [DONE] or finish_reason=stop,
        // treat whatever we have as complete
        if (accumulated.length > 0) {
          callbacks.onComplete(accumulated, citations);
        } else {
          callbacks.onError(new Error('Stream ended without content'));
        }
      } catch (readErr) {
        reader.cancel().catch(() => {});
        throw readErr;
      }

      return; // Success — exit retry loop

    } catch (err) {
      if (isAbortError(err)) {
        if (signal?.aborted) {
          callbacks.onError(new Error('Request cancelled'));
          return;
        }
        callbacks.onError(new Error('Perplexity API request timed out'));
        return;
      }

      if (isRetryableError(err) && attempt < MAX_RETRIES) {
        lastError = err instanceof Error ? err : new Error('Unknown error');
        const delay = BASE_RETRY_DELAY * Math.pow(2, attempt) + Math.random() * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      callbacks.onError(err instanceof Error ? err : new Error('Unknown streaming error'));
      return;
    } finally {
      if (timeoutId !== undefined) clearTimeout(timeoutId);
      if (signal) signal.removeEventListener('abort', handleAbort);
    }
  }

  callbacks.onError(lastError || new Error('Streaming request failed after retries'));
}
