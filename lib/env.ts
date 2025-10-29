import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  NEXT_PUBLIC_ENABLE_MASTERY_PIPELINE: z.string().optional(),
});

const rawEnv = envSchema.parse(process.env);

export const env = {
  ...rawEnv,
  NEXT_PUBLIC_ENABLE_MASTERY_PIPELINE:
    rawEnv.NEXT_PUBLIC_ENABLE_MASTERY_PIPELINE !== undefined
      ? rawEnv.NEXT_PUBLIC_ENABLE_MASTERY_PIPELINE === 'true'
      : rawEnv.NODE_ENV !== 'production',
};
