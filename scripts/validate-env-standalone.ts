#!/usr/bin/env tsx

/**
 * Standalone Environment Variable Validation Script
 *
 * This script validates that all required environment variables are present
 * and properly configured without importing the main env module.
 */

import { config } from "dotenv";
import { z } from "zod";

// Load environment variables from .env.local
config({ path: ".env.local" });

// Environment variable schema (copied from lib/env.ts)
const envSchema = z.object({
  // NextAuth.js
  NEXTAUTH_URL: z.string().url({ message: "NEXTAUTH_URL must be a valid URL" }).optional(),
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
  REDIS_URL: z.string().url({ message: "REDIS_URL must be a valid URL" }).optional(),
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
  NEXT_PUBLIC_API_URL: z
    .string()
    .url({ message: "NEXT_PUBLIC_API_URL must be a valid URL" })
    .optional(),

  // Email service (future)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().transform(Number).optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),

  // Analytics (future)
  GOOGLE_ANALYTICS_ID: z.string().optional(),
  SENTRY_DSN: z.string().url({ message: "SENTRY_DSN must be a valid URL" }).optional(),

  // File upload limits
  MAX_FILE_SIZE: z.string().transform(Number).pipe(z.number()).default(10485760), // 10MB
  ALLOWED_FILE_TYPES: z.string().default("image/jpeg,image/png,image/gif,application/pdf"),
});

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  missing: string[];
  invalid: string[];
}

function validateEnvironment(): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    missing: [],
    invalid: [],
  };

  // Debug: Print current environment variables
  console.log("Current environment variables:");
  console.log("NEXTAUTH_SECRET:", process.env.NEXTAUTH_SECRET ? "SET" : "NOT SET");
  console.log("GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID ? "SET" : "NOT SET");
  console.log("GOOGLE_CLIENT_SECRET:", process.env.GOOGLE_CLIENT_SECRET ? "SET" : "NOT SET");
  console.log("DATABASE_URL:", process.env.DATABASE_URL ? "SET" : "NOT SET");

  try {
    // Try to parse environment variables
    envSchema.parse(process.env);

    console.log("✅ Environment variables are valid");
    return result;
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      const zodError = error as z.ZodError;

      result.isValid = false;

      // Categorize errors
      zodError.issues.forEach((issue: z.ZodIssue) => {
        const path = issue.path.join(".");
        const message = issue.message;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (issue.code === "invalid_type" && (issue as any).received === "undefined") {
          result.missing.push(path);
          result.errors.push(`❌ Missing required environment variable: ${path}`);
        } else {
          result.invalid.push(path);
          result.errors.push(`❌ Invalid ${path}: ${message}`);
        }
      });

      // Add warnings for optional but recommended variables
      const recommendedVars = [
        "OPENAI_API_KEY",
        "GOOGLE_CLOUD_PROJECT_ID",
        "GOOGLE_CLOUD_STORAGE_BUCKET",
        "REDIS_URL",
        "GOOGLE_ANALYTICS_ID",
        "SENTRY_DSN",
      ];

      recommendedVars.forEach((varName) => {
        if (!process.env[varName]) {
          result.warnings.push(`⚠️  Recommended environment variable not set: ${varName}`);
        }
      });
    } else {
      result.isValid = false;
      result.errors.push(
        `❌ Unexpected validation error: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  return result;
}

function printValidationResult(result: ValidationResult): void {
  console.log("\n" + "=".repeat(60));
  console.log("🔍 Environment Variable Validation");
  console.log("=".repeat(60));

  if (result.isValid) {
    console.log("✅ All environment variables are valid!");
  } else {
    console.log("❌ Environment variable validation failed!\n");

    if (result.errors.length > 0) {
      console.log("Errors:");
      result.errors.forEach((error) => console.log(`  ${error}`));
      console.log("");
    }

    if (result.warnings.length > 0) {
      console.log("Warnings:");
      result.warnings.forEach((warning) => console.log(`  ${warning}`));
      console.log("");
    }
  }

  // Show help for missing variables
  if (result.missing.length > 0) {
    console.log("📝 To fix missing variables, add these to your .env.local file:");
    console.log("");

    const examples: Record<string, string> = {
      NEXTAUTH_SECRET: "NEXTAUTH_SECRET=your-secret-key-here",
      GOOGLE_CLIENT_ID: "GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com",
      GOOGLE_CLIENT_SECRET: "GOOGLE_CLIENT_SECRET=your-google-client-secret",
      DATABASE_URL: "DATABASE_URL=postgresql://username:password@localhost:5432/science_advantage",
      OPENAI_API_KEY: "OPENAI_API_KEY=sk-your-openai-api-key",
      GOOGLE_CLOUD_PROJECT_ID: "GOOGLE_CLOUD_PROJECT_ID=your-gcp-project-id",
      GOOGLE_CLOUD_STORAGE_BUCKET: "GOOGLE_CLOUD_STORAGE_BUCKET=your-storage-bucket",
      REDIS_URL: "REDIS_URL=redis://localhost:6379",
      NEXT_PUBLIC_API_URL: "NEXT_PUBLIC_API_URL=http://localhost:3000/api",
      GOOGLE_ANALYTICS_ID: "GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX",
      SENTRY_DSN: "SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id",
    };

    result.missing.forEach((varName) => {
      const example = examples[varName] || `${varName}=your-value-here`;
      console.log(`  ${example}`);
    });

    console.log("");
    console.log("💡 Refer to .env.example for complete documentation");
  }

  console.log("=".repeat(60));
}

function main(): void {
  const result = validateEnvironment();
  printValidationResult(result);

  // Exit with error code if validation failed
  if (!result.isValid) {
    process.exit(1);
  }
}

// Run validation if this script is executed directly
if (require.main === module) {
  main();
}
