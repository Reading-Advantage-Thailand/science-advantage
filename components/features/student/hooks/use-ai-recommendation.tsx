/**
 * Custom hook for AI recommendation fetching and state management
 * Extracted from ai-recommendation.tsx for better testability and reusability
 */

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { track } from '@/lib/analytics';
import type { AiRecommendationResponse } from '@/lib/validations/ai';

type RecommendationStatus = 'loading' | 'success' | 'error' | 'complete';

const INITIAL_TIMEOUT_MS = 10_000;
const POLL_INTERVAL_MS = 5_000;
const MAX_POLLS = 6;

interface UseAiRecommendationOptions {
  attemptId: string;
  featureEnabled: boolean;
  onError?: (message: string) => void;
  onSuccess?: (response: AiRecommendationResponse) => void;
  errorMessage?: string;
  slowMessage?: string;
}

export function useAiRecommendation({
  attemptId,
  featureEnabled,
  onError,
  onSuccess,
  errorMessage = 'We couldn\'t load a recommendation right now. Please try again soon.',
  slowMessage = 'Still preparing your personalized recommendation. Hang tight!',
}: UseAiRecommendationOptions) {
  const [response, setResponse] = useState<AiRecommendationResponse | null>(
    null
  );
  const [status, setStatus] = useState<RecommendationStatus>('loading');
  const [error, setError] = useState<string | null>(null);

  const statusRef = useRef<RecommendationStatus>('loading');
  const pollAttemptsRef = useRef(0);
  const slowToastShownRef = useRef(false);
  const errorToastShownRef = useRef(false);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    if (!featureEnabled) {
      return;
    }

    let isActive = true;
    let pollIntervalId: NodeJS.Timeout | undefined;
    const abortController = new AbortController();

    pollAttemptsRef.current = 0;
    slowToastShownRef.current = false;
    errorToastShownRef.current = false;
    setStatus('loading');
    setResponse(null);
    setError(null);

    const fetchRecommendation = async (isPoll = false) => {
      try {
        const requestStarted =
          typeof performance !== 'undefined' ? performance.now() : undefined;

        const res = await fetch('/api/ai/recommendations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ attemptId }),
          signal: abortController.signal,
        });

        if (!res.ok) {
          let message = errorMessage;

          if (res.status === 401) {
            message = 'Please sign in to get recommendations';
          } else if (res.status === 403) {
            message = 'Not authorized to view recommendations';
          } else if (res.status === 429) {
            message = 'Too many requests. Please try again later.';
          }

          throw Object.assign(new Error(message), { status: res.status });
        }

        const data = (await res.json()) as AiRecommendationResponse;

        if (!isActive) {
          return;
        }

        if (process.env.NODE_ENV !== 'production') {
          console.log(`AI Recommendation Trace ID: ${data.traceId}`);
        }

        setResponse(data);
        setStatus(data.recommendation ? 'success' : 'complete');
        setError(null);

        if (pollIntervalId) {
          clearInterval(pollIntervalId);
          pollIntervalId = undefined;
        }

        const measuredLatency =
          data.latencyMs ??
          (typeof performance !== 'undefined' && requestStarted !== undefined
            ? Math.round(performance.now() - requestStarted)
            : undefined);

        track('ai_recommendation_impression', {
          attemptId,
          studentIdHash: data.studentIdHash ?? 'unknown',
          lessonId: data.recommendation?.lessonId ?? 'completed',
          fallbackUsed: data.fallbackUsed,
          model: data.model,
          latencyMs: measuredLatency,
        });

        if (data.fallbackUsed) {
          track('ai_recommendation_fallback', {
            attemptId,
            studentIdHash: data.studentIdHash ?? 'unknown',
            lessonId: data.recommendation?.lessonId ?? 'completed',
            model: data.model,
          });
        }

        onSuccess?.(data);
        pollAttemptsRef.current = 0;
      } catch (err) {
        if (!isActive) {
          return;
        }

        if (err instanceof DOMException && err.name === 'AbortError') {
          return;
        }

        if (isPoll && pollAttemptsRef.current < MAX_POLLS) {
          pollAttemptsRef.current += 1;
          return;
        }

        const statusCode =
          typeof err === 'object' && err !== null && 'status' in err
            ? (err as { status?: number }).status
            : undefined;

        const message = err instanceof Error ? err.message : errorMessage;

        setError(message);
        setStatus('error');

        track('ai_recommendation_error', {
          attemptId,
          error: message,
          status: statusCode,
        });

        onError?.(message);

        if (!errorToastShownRef.current) {
          toast.error(errorMessage);
          errorToastShownRef.current = true;
        }

        if (pollIntervalId) {
          clearInterval(pollIntervalId);
          pollIntervalId = undefined;
        }
      }
    };

    fetchRecommendation();

    const timeoutId = setTimeout(() => {
      if (!isActive || statusRef.current !== 'loading') {
        return;
      }

      if (!slowToastShownRef.current) {
        toast.info(slowMessage);
        slowToastShownRef.current = true;
      }

      pollIntervalId = setInterval(() => {
        fetchRecommendation(true);
      }, POLL_INTERVAL_MS);
    }, INITIAL_TIMEOUT_MS);

    return () => {
      isActive = false;
      abortController.abort();
      clearTimeout(timeoutId);
      if (pollIntervalId) {
        clearInterval(pollIntervalId);
      }
    };
  }, [attemptId, featureEnabled, errorMessage, slowMessage, onError, onSuccess]);

  const retry = () => {
    setStatus('loading');
    setError(null);
    setResponse(null);
    pollAttemptsRef.current = 0;
    slowToastShownRef.current = false;
    errorToastShownRef.current = false;
  };

  return {
    response,
    status,
    error,
    retry,
  };
}
