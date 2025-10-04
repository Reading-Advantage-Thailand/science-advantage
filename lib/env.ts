/**
 * Type-safe environment variables for Science Advantage platform
 *
 * This file provides validated environment variables with proper TypeScript types.
 * All environment variable access should go through this file to ensure type safety.
 */

import { z } from "zod";

// Environment variable schema with validation
const envSchema = z.object({
  // NextAuth.js
  NEXTAUTH_URL: z.string().url().optional(),
  NEXTAUTH_SECRET: z.string().min(1, "NEXTAUTH_SECRET is required"),

  // Google OAuth
  GOOGLE_CLIENT_ID: z.string().min(1, "GOOGLE_CLIENT_ID is required"),
  GOOGLE_CLIENT_SECRET: z.string().min(1, "GOOGLE_CLIENT_SECRET is required"),

  // Database
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  // External APIs
  OPENAI_API_KEY: z.string().min(1, "OPENAI_API_KEY is required").optional(),
  GOOGLE_CLOUD_PROJECT_ID: z.string().min(1, "GOOGLE_CLOUD_PROJECT_ID is required").optional(),
  GOOGLE_CLOUD_STORAGE_BUCKET: z
    .string()
    .min(1, "GOOGLE_CLOUD_STORAGE_BUCKET is required")
    .optional(),

  // Redis (for caching/sessions)
  REDIS_URL: z.string().url().optional(),
  REDIS_TOKEN: z.string().optional(),

  // Application settings
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.string().transform(Number).pipe(z.number()).default(3000),

  // Feature flags
  NEXT_PUBLIC_DEV_AUTH: z
    .string()
    .transform((val) => val === "true")
    .pipe(z.boolean())
    .default(false),

  // External service URLs
  NEXT_PUBLIC_API_URL: z.string().url().optional(),

  // Email service (future)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().transform(Number).optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),

  // Analytics (future)
  GOOGLE_ANALYTICS_ID: z.string().optional(),
  SENTRY_DSN: z.string().url().optional(),

  // File upload limits
  MAX_FILE_SIZE: z.string().transform(Number).pipe(z.number()).default(10485760), // 10MB
  ALLOWED_FILE_TYPES: z.string().default("image/jpeg,image/png,image/gif,application/pdf"),
});

// Validate environment variables
function validateEnv(): z.infer<typeof envSchema> {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues
        .filter(
          (err) => err.code === "invalid_type" && "received" in err && err.received === "undefined"
        )
        .map((err) => err.path.join("."));

      const errorMessages = error.issues.map((err) => {
        const path = err.path.join(".");
        if (err.code === "invalid_type" && "received" in err && err.received === "undefined") {
          return `❌ Missing required environment variable: ${path}`;
        }
        return `❌ Invalid ${path}: ${err.message}`;
      });

      console.error("Environment Variable Validation Error:");
      console.error("");
      errorMessages.forEach((msg: string) => console.error(msg));
      console.error("");

      if (missingVars.length > 0) {
        console.error("Please add the following environment variables to your .env file:");
        missingVars.forEach((varName: string) => {
          const example = getExampleValue(varName);
          console.error(`  ${varName}=${example}`);
        });
        console.error("");
      }

      console.error("Refer to .env.example for all required environment variables.");

      // In development, show a helpful error but don't crash
      if (process.env.NODE_ENV === "development") {
        console.warn("⚠️  Continuing in development mode with missing environment variables...");
        // Return partial env for development
        return process.env as unknown as z.infer<typeof envSchema>;
      }

      // In production, crash the application
      throw new Error("Environment variable validation failed. See above for details.");
    }

    throw error;
  }
}

// Helper function to provide example values for missing environment variables
function getExampleValue(varName: string): string {
  const examples: Record<string, string> = {
    NEXTAUTH_SECRET: "your-secret-key-here",
    GOOGLE_CLIENT_ID: "your-google-client-id.apps.googleusercontent.com",
    GOOGLE_CLIENT_SECRET: "your-google-client-secret",
    DATABASE_URL: "postgresql://username:password@localhost:5432/science_advantage",
    OPENAI_API_KEY: "sk-your-openai-api-key",
    GOOGLE_CLOUD_PROJECT_ID: "your-gcp-project-id",
    GOOGLE_CLOUD_STORAGE_BUCKET: "your-storage-bucket",
    REDIS_URL: "redis://localhost:6379",
    NEXT_PUBLIC_API_URL: "http://localhost:3000/api",
    SMTP_HOST: "smtp.gmail.com",
    SMTP_PORT: "587",
    SMTP_USER: "your-email@gmail.com",
    SMTP_PASS: "your-app-password",
    GOOGLE_ANALYTICS_ID: "G-XXXXXXXXXX",
    SENTRY_DSN: "https://your-sentry-dsn@sentry.io/project-id",
  };

  return examples[varName] || "your-value-here";
}

// Export validated environment variables
export const env = validateEnv();

// Export individual environment variables with proper types
export const config = {
  // Auth
  nextAuth: {
    secret: env.NEXTAUTH_SECRET,
    url: env.NEXTAUTH_URL,
  },

  // OAuth
  google: {
    clientId: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
  },

  // Database
  database: {
    url: env.DATABASE_URL,
  },

  // External APIs
  openai: {
    apiKey: env.OPENAI_API_KEY,
  },

  googleCloud: {
    projectId: env.GOOGLE_CLOUD_PROJECT_ID,
    storageBucket: env.GOOGLE_CLOUD_STORAGE_BUCKET,
  },

  // Redis
  redis: {
    url: env.REDIS_URL,
    token: env.REDIS_TOKEN,
  },

  // Application
  app: {
    env: env.NODE_ENV,
    port: env.PORT,
    isDev: env.NODE_ENV === "development",
    isProd: env.NODE_ENV === "production",
    isTest: env.NODE_ENV === "test",
  },

  // Feature flags
  features: {
    devAuth: env.NEXT_PUBLIC_DEV_AUTH,
  },

  // API
  api: {
    url: env.NEXT_PUBLIC_API_URL || "/api",
  },

  // File upload
  upload: {
    maxFileSize: env.MAX_FILE_SIZE,
    allowedTypes: env.ALLOWED_FILE_TYPES.split(","),
  },

  // Email (future)
  email: {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },

  // Analytics (future)
  analytics: {
    googleAnalyticsId: env.GOOGLE_ANALYTICS_ID,
    sentryDsn: env.SENTRY_DSN,
  },
};

// Export environment variable schema for validation in tests
export { envSchema };

// Helper function to check if all required environment variables are present
export function checkRequiredEnv(): boolean {
  try {
    envSchema.parse(process.env);
    return true;
  } catch {
    return false;
  }
}

// Helper function to get environment variable with fallback
export function getEnvVar(key: keyof z.infer<typeof envSchema>, fallback?: string): string {
  const value = process.env[key];
  if (value === undefined) {
    if (fallback !== undefined) {
      return fallback;
    }
    throw new Error(`Environment variable ${key} is not set and no fallback provided`);
  }
  return value;
}
