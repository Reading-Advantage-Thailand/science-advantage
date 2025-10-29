'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, Brain, Lightbulb, RotateCcw } from 'lucide-react';
import { track } from '@/lib/analytics';
import { useAiRecommendation } from './hooks/use-ai-recommendation';
import en from '@/locales/ai-recommendation/en.json';
import th from '@/locales/ai-recommendation/th.json';

type LocaleKey = 'en' | 'th';

const translations: Record<LocaleKey, typeof en> = { en, th };

interface AiRecommendationProps {
  attemptId: string;
  classId: string;
}

export function AiRecommendation({ attemptId, classId }: AiRecommendationProps) {
  const router = useRouter();
  const [reasoningExpanded, setReasoningExpanded] = useState(false);

  const locale: LocaleKey = useMemo(() => {
    if (typeof document === 'undefined') {
      return 'en';
    }
    const lang = document.documentElement.lang?.toLowerCase() ?? 'en';
    return lang.startsWith('th') ? 'th' : 'en';
  }, []);

  const t = translations[locale];

  const featureEnabled = useMemo(() => {
    const raw = process.env.NEXT_PUBLIC_FEATURE_AI_RECOMMENDATION;

    if (raw === undefined) {
      return true;
    }

    const value = raw.toLowerCase();
    return !['false', '0', 'off', 'disabled'].includes(value);
  }, []);

  const { response, status, error: errorMessage, retry } = useAiRecommendation({
    attemptId,
    featureEnabled,
    errorMessage: t.toastError,
    slowMessage: t.toastSlow,
  });

  const handleStartLesson = () => {
    if (!response?.recommendation) {
      return;
    }

    track('ai_recommendation_clicked', {
      attemptId,
      studentIdHash: response.studentIdHash ?? 'unknown',
      lessonId: response.recommendation.lessonId,
      fallbackUsed: response.fallbackUsed,
    });

    router.push(
      `/student/classes/${classId}/lessons/${response.recommendation.lessonSlug}`
    );
  };

  const handleSeeAllLessons = () => {
    router.push(`/student/classes/${classId}`);
  };

  const renderContinueCard = (copy: string, testId: string, showRetry = false) => (
    <Card data-testid={testId}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-600" aria-hidden />
          <h2 className="text-lg font-semibold">{t.errorTitle}</h2>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">{copy}</p>
        <div className="flex gap-2">
          {showRetry && (
            <Button onClick={retry} variant="outline" className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Try Again
            </Button>
          )}
          <Button onClick={handleSeeAllLessons} className="gap-2">
            {t.errorCta}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (!featureEnabled) {
    return renderContinueCard(t.disabledBody, 'ai-recommendation-disabled');
  }

  if (status === 'loading') {
    return (
      <Card data-testid="ai-recommendation-loading">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Sparkles className="h-5 w-5 text-blue-600" aria-hidden />
              <div className="absolute -top-1 -right-1 h-2 w-2 animate-pulse rounded-full bg-blue-600" />
            </div>
            <h2 className="text-lg font-semibold">{t.heading}</h2>
          </div>
        </CardHeader>
        <CardContent>
          <div
            className="flex items-center gap-3 py-4"
            aria-busy="true"
            aria-live="polite"
          >
            <div className="relative">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" aria-hidden />
              <div className="absolute inset-0 h-6 w-6 animate-pulse rounded-full bg-gradient-to-r from-blue-400 to-purple-400 opacity-30" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-48 animate-pulse rounded bg-gray-200" />
              <div className="h-3 w-32 animate-pulse rounded bg-gray-200" />
              <span className="sr-only">{t.loadingPrimary}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (status === 'error') {
    return renderContinueCard(
      errorMessage ?? t.errorBody,
      'ai-recommendation-error',
      true
    );
  }

  if (status === 'success' && response?.recommendation) {
    const rec = response.recommendation;

    return (
      <Card data-testid="ai-recommendation-success">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="relative">
              {response.fallbackUsed ? (
                <Lightbulb className="h-5 w-5 text-yellow-600" aria-hidden />
              ) : (
                <Brain className="h-5 w-5 text-blue-600" aria-hidden />
              )}
              <div className="absolute -top-1 -right-1 h-2 w-2 animate-pulse rounded-full bg-blue-600" />
            </div>
            <h2 className="text-lg font-semibold">{t.heading}</h2>
            {response.fallbackUsed ? (
              <Badge variant="secondary" className="text-xs">
                {t.badgeFallback}
              </Badge>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {rec.lessonTitle}
            </h3>
            <div className="mt-2 flex flex-wrap gap-1">
              {rec.focusStandards.map((standard) => (
                <Badge key={standard} variant="outline" className="text-xs">
                  {standard}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-2 text-sm font-medium text-gray-700">
              {t.reasonHeading}
            </h4>
            <p
              className={`text-sm leading-relaxed text-gray-600 ${
                !reasoningExpanded && rec.reasoning.length > 120
                  ? 'line-clamp-3'
                  : ''
              }`}
              aria-live="polite"
            >
              {rec.reasoning}
            </p>
            {rec.reasoning.length > 120 ? (
              <Button
                variant="link"
                size="sm"
                onClick={() => setReasoningExpanded((prev) => !prev)}
                className="mt-1 h-auto p-0 text-xs text-blue-600"
              >
                {reasoningExpanded ? t.showLess : t.showMore}
              </Button>
            ) : null}
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={handleStartLesson} className="gap-2">
              {t.startLesson}
            </Button>
            <Button variant="outline" onClick={handleSeeAllLessons}>
              {t.seeAllLessons}
            </Button>
          </div>

          {process.env.NODE_ENV !== 'production' ? (
            <div className="mt-4 border-t pt-2 text-xs text-gray-500">
              <div>Model: {response.model}</div>
              <div>Confidence: {rec.confidence}</div>
              <div>Trace ID: {response.traceId}</div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    );
  }

  if (status === 'complete') {
    return (
      <Card data-testid="ai-recommendation-completion">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-green-600" aria-hidden />
            <h2 className="text-lg font-semibold">{t.completionTitle}</h2>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">{t.completionBody}</p>
          <div className="flex gap-2">
            <Button onClick={handleSeeAllLessons} className="gap-2">
              {t.completionCta}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;

}
