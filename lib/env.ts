import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  NEXT_PUBLIC_ENABLE_MASTERY_PIPELINE: z.string().optional(),
  NEXT_PUBLIC_DEV_AUTH: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  AI_RECOMMENDER_MODEL: z.string().default('gpt-4o-mini'),
  AI_RECOMMENDATION_TIMEOUT_MS: z.string().default('8000'),
});

const rawEnv = envSchema.parse(process.env);

export const env = {
  ...rawEnv,
  NEXT_PUBLIC_ENABLE_MASTERY_PIPELINE:
    rawEnv.NEXT_PUBLIC_ENABLE_MASTERY_PIPELINE !== undefined
      ? rawEnv.NEXT_PUBLIC_ENABLE_MASTERY_PIPELINE === 'true'
      : rawEnv.NODE_ENV !== 'production',
  NEXT_PUBLIC_DEV_AUTH:
    rawEnv.NEXT_PUBLIC_DEV_AUTH !== undefined
      ? rawEnv.NEXT_PUBLIC_DEV_AUTH === 'true'
      : rawEnv.NODE_ENV === 'development',
  AI_RECOMMENDATION_TIMEOUT_MS: parseInt(rawEnv.AI_RECOMMENDATION_TIMEOUT_MS, 10),
};
