import { z } from 'zod';

/**
 * Request schema for AI recommendation endpoint.
 * Students can only pass attemptId (their own inferred from session).
 * Teachers can optionally pass studentId when impersonation is enabled (dev only).
 */
export const aiRecommendationRequestSchema = z.object({
  attemptId: z.string({
    required_error: 'attemptId is required',
    invalid_type_error: 'attemptId must be a string',
  }),
  studentId: z.string().optional(),
});

export type AiRecommendationRequest = z.infer<typeof aiRecommendationRequestSchema>;

/**
 * Confidence level for AI recommendations.
 */
export const confidenceLevelSchema = z.enum(['high', 'medium', 'low']);

export type ConfidenceLevel = z.infer<typeof confidenceLevelSchema>;

/**
 * Alternative lesson recommendation.
 */
export const alternativeRecommendationSchema = z.object({
  lessonId: z.string(),
  lessonTitle: z.string(),
});

export type AlternativeRecommendation = z.infer<typeof alternativeRecommendationSchema>;

/**
 * Main recommendation object.
 */
export const recommendationSchema = z.object({
  lessonId: z.string(),
  lessonTitle: z.string(),
  lessonSlug: z.string(),
  focusStandards: z.array(z.string()),
  reasoning: z.string().max(320, 'Reasoning must be 320 characters or less'),
  confidence: confidenceLevelSchema,
});

export type Recommendation = z.infer<typeof recommendationSchema>;

/**
 * Response schema for AI recommendation endpoint.
 */
export const aiRecommendationResponseSchema = z.object({
  success: z.boolean(),
  recommendation: recommendationSchema.nullable().optional(),
  fallbackUsed: z.boolean(),
  traceId: z.string(),
  model: z.string().optional(),
  generatedAt: z.string().optional(),
  studentIdHash: z.string().optional(),
  latencyMs: z.number().nonnegative().optional(),
});

export type AiRecommendationResponse = z.infer<typeof aiRecommendationResponseSchema>;

/**
 * AI model output schema (what the AI returns).
 * Uses different field names than the internal recommendation schema.
 */
export const aiModelOutputSchema = z.object({
  recommendedLessonId: z.string(),
  recommendedLessonSlug: z.string(),
  lessonTitle: z.string(),
  focusStandards: z.array(z.string()),
  reasoning: z.string().max(320, 'Reasoning must be 320 characters or less'),
  confidence: confidenceLevelSchema,
  nextBestAlternatives: z.array(alternativeRecommendationSchema).optional(),
});

export type AiModelOutput = z.infer<typeof aiModelOutputSchema>;
