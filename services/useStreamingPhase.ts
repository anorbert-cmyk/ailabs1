/**
 * useStreamingPhase — Custom React hook for streaming Perplexity API responses.
 *
 * Manages the full streaming lifecycle:
 *   - Starts an SSE stream via `streamPerplexityData()`
 *   - Accumulates text and debounce-parses it with `parsePerplexityResponse()`
 *   - Caches completed phases to avoid re-fetching
 *   - Handles abort on phase switch, errors, and fallback
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

  const clearDebounce = useCallback(() => {
    if (debounceTimerRef.current !== null) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
  }, []);

  const debouncedParse = useCallback((phaseIndex: number) => {
    clearDebounce();
    debounceTimerRef.current = setTimeout(() => {
      const text = accumulatedRef.current;
      if (text.length < MIN_CHARS_FOR_PARSE) return;
      if (text.length - lastParsedLengthRef.current < MIN_NEW_CHARS_FOR_REPARSE) return;

      try {
        const parsed = parsePerplexityResponse(text, phaseIndex, []);
        lastParsedLengthRef.current = text.length;
        if (currentPhaseRef.current === phaseIndex) {
          setPhaseData(parsed);
        }
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
          if (currentPhaseRef.current !== phaseIndex) return;

          accumulatedRef.current = accumulated;

          // Transition from loading to streaming on first chunk
          setIsLoading(false);
          setIsStreaming(true);

          debouncedParse(phaseIndex);
        },

        onComplete: (fullText: string, citations: string[]) => {
          if (currentPhaseRef.current !== phaseIndex) return;

          clearDebounce();

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
          if (currentPhaseRef.current !== phaseIndex) return;
          if (error.message === 'Request cancelled') return;

          clearDebounce();

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
      if (abortRef.current) abortRef.current.abort();
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
