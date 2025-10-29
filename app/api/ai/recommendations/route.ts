import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';

import { getCurrentSession } from '@/lib/auth/session';
import {
  buildRecommendationContext,
  type RecommendationContext,
} from '@/lib/ai/recommendation-context';
import { buildRecommendationPrompt } from '@/lib/ai/prompts/recommendation';
import { selectLessonByRules } from '@/lib/ai/rules-engine';
import { env } from '@/lib/env';
import { logger } from '@/lib/observability/logger';
import { metrics } from '@/lib/observability/metrics';
import prisma from '@/lib/prisma';
import {
  aiRecommendationRequestSchema,
  aiRecommendationResponseSchema,
  aiModelOutputSchema,
  type AiRecommendationResponse,
  type Recommendation,
} from '@/lib/validations/ai';

/**
 * Rate limiting configuration.
 */
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 3;

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Cache configuration.
 */
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

type CacheEntry = {
  recommendation: Recommendation;
  model: string;
  fallbackUsed: boolean;
  traceId: string;
  generatedAt: string;
  expiresAt: number;
};

const cacheStore = new Map<string, CacheEntry>();

/**
 * Generate a unique trace ID for tracking.
 */
const generateTraceId = (): string => {
  return `rec_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
};

/**
 * Check rate limit for a student.
 */
const checkRateLimit = (studentId: string): boolean => {
  const now = Date.now();
  const entry = rateLimitStore.get(studentId);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(studentId, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  entry.count += 1;
  rateLimitStore.set(studentId, entry);
  return true;
};

/**
 * Get cached recommendation if available and not expired.
 */
const getCachedRecommendation = (
  studentId: string,
  attemptId: string
): CacheEntry | null => {
  const cacheKey = `${studentId}:${attemptId}`;
  const cached = cacheStore.get(cacheKey);

  if (!cached) {
    return null;
  }

  if (Date.now() > cached.expiresAt) {
    cacheStore.delete(cacheKey);
    return null;
  }

  return cached;
};

/**
 * Cache a recommendation.
 */
const cacheRecommendation = (
  studentId: string,
  attemptId: string,
  recommendation: Recommendation,
  model: string,
  fallbackUsed: boolean,
  traceId: string
): void => {
  const cacheKey = `${studentId}:${attemptId}`;
  cacheStore.set(cacheKey, {
    recommendation,
    model,
    fallbackUsed,
    traceId,
    generatedAt: new Date().toISOString(),
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
};

/**
 * Call AI model to generate recommendation.
 */
const generateAiRecommendation = async (
  context: RecommendationContext,
  traceId: string
): Promise<{ recommendation: Recommendation; model: string } | null> => {
  const startTime = Date.now();

  try {
    const { system, user } = buildRecommendationPrompt(context);
    const model = env.AI_RECOMMENDER_MODEL;

    // Use Vercel AI SDK with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, env.AI_RECOMMENDATION_TIMEOUT_MS);

    try {
      const result = await generateObject({
        model: openai(model),
        schema: aiModelOutputSchema,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        abortSignal: controller.signal,
      });

      clearTimeout(timeoutId);

      const latencyMs = Date.now() - startTime;

      // Validate that recommended lesson exists and is not completed
      const recommendedLesson = context.candidateLessons.find(
        (l) => l.lessonId === result.object.recommendedLessonId
      );

      if (!recommendedLesson || recommendedLesson.completed) {
        logger.warn('ai.recommendation.invalid', {
          traceId,
          model,
          recommendedLessonId: result.object.recommendedLessonId,
          reason: recommendedLesson ? 'already_completed' : 'lesson_not_found',
        });
        return null;
      }

      // Map AI output to our internal recommendation schema
      const recommendation: Recommendation = {
        lessonId: result.object.recommendedLessonId,
        lessonTitle: result.object.lessonTitle,
        lessonSlug: result.object.recommendedLessonSlug,
        focusStandards: result.object.focusStandards,
        reasoning: result.object.reasoning,
        confidence: result.object.confidence,
      };

      metrics.increment('ai_recommendation_success_total', 1, {
        model,
        studentId: context.student.studentAlias,
      });

      metrics.observe('ai_recommendation_latency_ms', latencyMs, {
        model,
        studentId: context.student.studentAlias,
      });

      logger.info('ai.recommendation.success', {
        traceId,
        model,
        latencyMs,
        confidence: recommendation.confidence,
      });

      return { recommendation, model };
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === 'AbortError') {
        logger.warn('ai.recommendation.timeout', {
          traceId,
          model,
          timeoutMs: env.AI_RECOMMENDATION_TIMEOUT_MS,
        });
      } else {
        logger.error('ai.recommendation.error', {
          traceId,
          model,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }

      return null;
    }
  } catch (error) {
    logger.error('ai.recommendation.setup_error', {
      traceId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return null;
  }
};

/**
 * POST /api/ai/recommendations
 * Generate personalized lesson recommendation for a student.
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const traceId = generateTraceId();

  try {
    // 1. Authentication
    const session = await getCurrentSession();

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. Parse request body
    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    const { attemptId, studentId: requestedStudentId } =
      aiRecommendationRequestSchema.parse(body);

    // 3. Fetch attempt and validate ownership
    const attempt = await prisma.attempt.findUnique({
      where: { id: attemptId },
      include: {
        student: {
          include: {
            enrolledClass: true,
          },
        },
        lesson: true,
      },
    });

    if (!attempt) {
      return NextResponse.json(
        { success: false, error: 'Attempt not found' },
        { status: 404 }
      );
    }

    // 4. Authorization
    let targetStudentId: string;

    if (session.user.role === 'STUDENT') {
      // Students can only request their own recommendations
      if (session.user.id !== attempt.studentId) {
        return NextResponse.json(
          { success: false, error: 'Forbidden' },
          { status: 403 }
        );
      }
      targetStudentId = session.user.id;
    } else if (session.user.role === 'TEACHER' || session.user.role === 'ADMIN') {
      // Teachers/admins can request for any student (dev mode allows impersonation)
      if (requestedStudentId && env.NEXT_PUBLIC_DEV_AUTH) {
        targetStudentId = requestedStudentId;
      } else {
        targetStudentId = attempt.studentId;
      }

      // Verify teacher has access to this student's class (in production)
      if (!env.NEXT_PUBLIC_DEV_AUTH && session.user.role === 'TEACHER') {
        const hasAccess = attempt.student.enrolledClass.some(
          (enrollment) => enrollment.teacherId === session.user.id
        );

        if (!hasAccess) {
          return NextResponse.json(
            { success: false, error: 'Forbidden' },
            { status: 403 }
          );
        }
      }
    } else {
      targetStudentId = attempt.studentId;
    }

    // 5. Check rate limit
    if (!checkRateLimit(targetStudentId)) {
      metrics.increment('ai_recommendation_rate_limited_total', 1, {
        studentId: targetStudentId,
      });

      return NextResponse.json(
        { success: false, error: 'Too many requests' },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil(RATE_LIMIT_WINDOW_MS / 1000).toString(),
          },
        }
      );
    }

    // 6. Check cache
    const cached = getCachedRecommendation(targetStudentId, attemptId);

    if (cached) {
      metrics.increment('ai_recommendation_cache_hit_total', 1, {
        studentId: targetStudentId,
      });

      const response: AiRecommendationResponse = {
        success: true,
        recommendation: cached.recommendation,
        fallbackUsed: cached.fallbackUsed,
        traceId: cached.traceId,
        model: cached.model,
        generatedAt: cached.generatedAt,
      };

      return NextResponse.json(response, { status: 200 });
    }

    // 7. Build context
    // Get the student's curriculum from their enrolled classes
    const studentCurriculum =
      attempt.student.enrolledClass[0]?.standardsAlignment || 'THAI';

    const context = await buildRecommendationContext(
      prisma,
      targetStudentId,
      attemptId,
      attempt.lesson.gradeLevel,
      studentCurriculum as 'THAI' | 'NGSS'
    );

    if (!context) {
      return NextResponse.json(
        { success: false, error: 'Unable to build recommendation context' },
        { status: 500 }
      );
    }

    // 8. Try AI recommendation first
    let recommendation: Recommendation;
    let model: string;
    let fallbackUsed = false;

    if (!env.OPENAI_API_KEY) {
      logger.warn('ai.recommendation.no_api_key', { traceId });
      fallbackUsed = true;
      recommendation = selectLessonByRules(context.mastery, context.candidateLessons)!;
      model = 'rules-engine';
    } else {
      const aiResult = await generateAiRecommendation(context, traceId);

      if (aiResult) {
        recommendation = aiResult.recommendation;
        model = aiResult.model;
      } else {
        // Fallback to rules engine
        fallbackUsed = true;
        recommendation = selectLessonByRules(
          context.mastery,
          context.candidateLessons
        )!;
        model = 'rules-engine';

        metrics.increment('ai_recommendation_fallback_total', 1, {
          studentId: targetStudentId,
        });

        logger.info('ai.recommendation.fallback', {
          traceId,
          reason: 'ai_failed',
        });
      }
    }

    if (!recommendation) {
      return NextResponse.json(
        { success: false, error: 'No recommendations available' },
        { status: 404 }
      );
    }

    // 9. Cache the recommendation
    cacheRecommendation(
      targetStudentId,
      attemptId,
      recommendation,
      model,
      fallbackUsed,
      traceId
    );

    // 10. Record metrics
    const latencyMs = Date.now() - startTime;

    metrics.observe('ai_recommendation_latency_ms', latencyMs, {
      model,
      fallbackUsed: fallbackUsed.toString(),
      studentId: targetStudentId,
    });

    // 11. Build response
    const response: AiRecommendationResponse = {
      success: true,
      recommendation,
      fallbackUsed,
      traceId,
      model,
      generatedAt: new Date().toISOString(),
    };

    // Validate response schema
    const validated = aiRecommendationResponseSchema.parse(response);

    return NextResponse.json(validated, { status: 200 });
  } catch (error) {
    const latencyMs = Date.now() - startTime;

    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: error.errors.map((issue) => ({
            path: issue.path.join('.'),
            message: issue.message,
          })),
        },
        { status: 400 }
      );
    }

    logger.error('ai.recommendation.error', {
      traceId,
      latencyMs,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    metrics.increment('ai_recommendation_failed_total', 1);

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
