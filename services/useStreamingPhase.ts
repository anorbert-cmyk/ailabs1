/**
 * useStreamingPhase — Custom React hook for streaming Perplexity API responses.
 *
 * Manages the full streaming lifecycle:
 *   - Starts an SSE stream via `streamPerplexityData()`
 *   - Accumulates text and debounce-parses it with `parseAnalysis()`
 *   - Caches completed phases to avoid re-fetching
 *   - Handles abort on phase switch, errors, and fallback
 *
 * Race condition safety:
 *   Uses a monotonically increasing `requestId` to guard all callbacks.
 *   This prevents stale updates both when switching between phases AND
 *   when retrying the same phase (where phaseIndex alone would be ambiguous).
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { streamPerplexityData } from './perplexityApi';
import { parseAnalysis, type PhaseData, type AnalysisTier } from './parsers';
import { classifySections, enhanceWithClassification } from './classifierService';

const DEBOUNCE_MS = 250;
const MIN_CHARS_FOR_PARSE = 80;
const MIN_NEW_CHARS_FOR_REPARSE = 40;

interface UseStreamingPhaseOptions {
  apiKey: string;
  enabled: boolean;
  tier?: AnalysisTier;
  /** Enable Haiku classifier for AI-powered section type refinement. */
  classifierEnabled?: boolean;
}

export function useStreamingPhase(opts: UseStreamingPhaseOptions) {
  const { apiKey, enabled, tier = 'syndicate', classifierEnabled = false } = opts;

  const [phaseData, setPhaseData] = useState<PhaseData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isClassifying, setIsClassifying] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const phaseCache = useRef<Map<string, PhaseData>>(new Map());
  const cachedTierRef = useRef<AnalysisTier>(tier);
  const abortRef = useRef<AbortController | null>(null);
  /** Separate abort controller for Haiku classification (not cleared by stream completion). */
  const haikuAbortRef = useRef<AbortController | null>(null);
  const currentPhaseRef = useRef<number>(-1);
  const accumulatedRef = useRef('');
  const lastParsedLengthRef = useRef(0);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** Monotonically increasing ID — guards all callbacks against stale streams. */
  const requestIdRef = useRef(0);
  /** Prevents setState on unmounted component (Haiku promises may outlive the component). */
  const isMountedRef = useRef(true);

  const clearDebounce = useCallback(() => {
    if (debounceTimerRef.current !== null) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
  }, []);

  const debouncedParse = useCallback((reqId: number, phaseIndex: number) => {
    clearDebounce();
    debounceTimerRef.current = setTimeout(() => {
      // Stale request — phase switched or retried since this timer was set
      if (requestIdRef.current !== reqId) return;

      const text = accumulatedRef.current;
      if (text.length < MIN_CHARS_FOR_PARSE) return;
      if (text.length - lastParsedLengthRef.current < MIN_NEW_CHARS_FOR_REPARSE) return;

      try {
        const parsed = parseAnalysis(tier, text, phaseIndex, []);
        // Re-check after potentially expensive parse
        if (requestIdRef.current !== reqId) return;
        lastParsedLengthRef.current = text.length;
        setPhaseData(parsed);
      } catch (err) {
        console.warn('[Streaming] Intermediate parse error:', err);
      }
    }, DEBOUNCE_MS);
  }, [clearDebounce, tier]);

  const loadPhase = useCallback((phaseIndex: number) => {
    // Abort any in-flight stream and Haiku classification
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    if (haikuAbortRef.current) {
      haikuAbortRef.current.abort();
      haikuAbortRef.current = null;
    }
    // Reset classification state synchronously — prevents stale .finally() from
    // clearing isClassifying for a NEW classification on a different phase
    setIsClassifying(false);
    clearDebounce();

    // Increment request ID — invalidates all in-flight callbacks
    requestIdRef.current += 1;
    const reqId = requestIdRef.current;

    currentPhaseRef.current = phaseIndex;
    accumulatedRef.current = '';
    lastParsedLengthRef.current = 0;

    // Clear cache if tier changed
    if (cachedTierRef.current !== tier) {
      phaseCache.current.clear();
      cachedTierRef.current = tier;
    }

    // Check cache (composite key: tier + phaseIndex)
    const cacheKey = `${tier}:${phaseIndex}`;
    if (phaseCache.current.has(cacheKey)) {
      setPhaseData(phaseCache.current.get(cacheKey)!);
      setLoadError(null);
      setIsLoading(false);
      setIsStreaming(false);
      return;
    }

    if (!enabled) return;

    const controller = new AbortController();
    abortRef.current = controller;
    setIsLoading(true);
    setIsStreaming(false);
    setLoadError(null);
    setPhaseData(null);

    streamPerplexityData(
      phaseIndex,
      { apiKey },
      {
        onChunk: (_chunkText: string, accumulated: string) => {
          if (requestIdRef.current !== reqId) return;

          accumulatedRef.current = accumulated;

          // Transition from loading to streaming on first chunk
          setIsLoading(false);
          setIsStreaming(true);

          debouncedParse(reqId, phaseIndex);
        },

        onComplete: (fullText: string, citations: string[]) => {
          if (requestIdRef.current !== reqId) return;

          clearDebounce();
          abortRef.current = null;

          let finalData: PhaseData | null = null;
          try {
            finalData = parseAnalysis(tier, fullText, phaseIndex, citations);
            phaseCache.current.set(`${tier}:${phaseIndex}`, finalData);
            setPhaseData(finalData);
          } catch (err) {
            console.error('[Streaming] Final parse error:', err);
            // Keep whatever intermediate parse we had
          }

          setIsStreaming(false);
          setIsLoading(false);

          // ── Haiku classification (async, non-blocking) ────────
          if (classifierEnabled && finalData && finalData.sections.length > 0) {
            const haikuController = new AbortController();
            haikuAbortRef.current = haikuController;
            setIsClassifying(true);
            classifySections(
              finalData.sections,
              fullText,
              haikuController.signal
            )
              .then(result => {
                // Always cache enhanced data (even if user navigated away)
                // This ensures the summary is available if they come back.
                if (!isMountedRef.current) return;
                if (!result || !finalData) return;

                const enhanced = enhanceWithClassification(finalData, result, fullText);
                if (enhanced !== finalData) {
                  phaseCache.current.set(`${tier}:${phaseIndex}`, enhanced);
                }

                // Only update React state if this is still the active phase
                if (requestIdRef.current !== reqId) return;
                if (enhanced !== finalData) {
                  setPhaseData(enhanced);
                }
              })
              .catch(() => {
                // Classification failed — regex result stands, no action needed
              })
              .finally(() => {
                if (!isMountedRef.current) return;
                // Guard: only clear if this is still the active classification request
                // (prevents stale .finally() from clearing isClassifying for a newer phase)
                if (requestIdRef.current !== reqId) return;
                setIsClassifying(false);
                if (haikuAbortRef.current === haikuController) {
                  haikuAbortRef.current = null;
                }
              });
          }
        },

        onError: (error: Error) => {
          if (requestIdRef.current !== reqId) return;
          if (error.message === 'Request cancelled') return;

          clearDebounce();
          abortRef.current = null;

          const message = error.message.length > 200
            ? error.message.slice(0, 200) + '...'
            : error.message;
          console.error(`[Streaming] Phase ${phaseIndex} error`);
          setLoadError(message);
          setIsStreaming(false);
          setIsLoading(false);
        },
      },
      undefined,
      controller.signal
    );
  }, [apiKey, enabled, tier, classifierEnabled, clearDebounce, debouncedParse]);

  const retryPhase = useCallback((phaseIndex: number) => {
    phaseCache.current.delete(`${tier}:${phaseIndex}`);
    loadPhase(phaseIndex);
  }, [loadPhase, tier]);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (abortRef.current) {
        abortRef.current.abort();
        abortRef.current = null;
      }
      if (haikuAbortRef.current) {
        haikuAbortRef.current.abort();
        haikuAbortRef.current = null;
      }
      clearDebounce();
    };
  }, [clearDebounce]);

  return {
    phaseData,
    isLoading,
    isStreaming,
    isClassifying,
    loadError,
    loadPhase,
    retryPhase,
  };
}
