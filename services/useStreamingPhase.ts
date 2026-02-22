/**
 * useStreamingPhase — Custom React hook for streaming Perplexity API responses.
 *
 * Manages the full streaming lifecycle:
 *   - Starts an SSE stream via `streamPerplexityData()`
 *   - Accumulates text and debounce-parses it with `parsePerplexityResponse()`
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
import { parsePerplexityResponse, PhaseData } from './contentParser';

const DEBOUNCE_MS = 250;
const MIN_CHARS_FOR_PARSE = 80;
const MIN_NEW_CHARS_FOR_REPARSE = 40;

interface UseStreamingPhaseOptions {
  apiKey: string;
  enabled: boolean;
}

export function useStreamingPhase(opts: UseStreamingPhaseOptions) {
  const { apiKey, enabled } = opts;

  const [phaseData, setPhaseData] = useState<PhaseData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const phaseCache = useRef<Map<number, PhaseData>>(new Map());
  const abortRef = useRef<AbortController | null>(null);
  const currentPhaseRef = useRef<number>(-1);
  const accumulatedRef = useRef('');
  const lastParsedLengthRef = useRef(0);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** Monotonically increasing ID — guards all callbacks against stale streams. */
  const requestIdRef = useRef(0);

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
        const parsed = parsePerplexityResponse(text, phaseIndex, []);
        // Re-check after potentially expensive parse
        if (requestIdRef.current !== reqId) return;
        lastParsedLengthRef.current = text.length;
        setPhaseData(parsed);
      } catch (err) {
        console.warn('[Streaming] Intermediate parse error:', err);
      }
    }, DEBOUNCE_MS);
  }, [clearDebounce]);

  const loadPhase = useCallback((phaseIndex: number) => {
    // Abort any in-flight stream
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    clearDebounce();

    // Increment request ID — invalidates all in-flight callbacks
    requestIdRef.current += 1;
    const reqId = requestIdRef.current;

    currentPhaseRef.current = phaseIndex;
    accumulatedRef.current = '';
    lastParsedLengthRef.current = 0;

    // Check cache
    if (phaseCache.current.has(phaseIndex)) {
      setPhaseData(phaseCache.current.get(phaseIndex)!);
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

          try {
            const finalData = parsePerplexityResponse(fullText, phaseIndex, citations);
            phaseCache.current.set(phaseIndex, finalData);
            setPhaseData(finalData);
          } catch (err) {
            console.error('[Streaming] Final parse error:', err);
            // Keep whatever intermediate parse we had
          }

          setIsStreaming(false);
          setIsLoading(false);
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
  }, [apiKey, enabled, clearDebounce, debouncedParse]);

  const retryPhase = useCallback((phaseIndex: number) => {
    phaseCache.current.delete(phaseIndex);
    loadPhase(phaseIndex);
  }, [loadPhase]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortRef.current) {
        abortRef.current.abort();
        abortRef.current = null;
      }
      clearDebounce();
    };
  }, [clearDebounce]);

  return {
    phaseData,
    isLoading,
    isStreaming,
    loadError,
    loadPhase,
    retryPhase,
  };
}
