/**
 * Environment Variable Validation Tests
 */

import { describe, it, expect } from "vitest";
import { envSchema } from "./env";

describe("Environment Schema Validation", () => {
  it("should validate valid environment variables", () => {
    const validEnv = {
      NEXTAUTH_SECRET: "test-secret-key",
      GOOGLE_CLIENT_ID: "test-client-id.apps.googleusercontent.com",
      GOOGLE_CLIENT_SECRET: "test-client-secret",
      DATABASE_URL: "postgresql://user:pass@localhost:5432/test",
      NODE_ENV: "development" as const,
      PORT: "3000",
      NEXT_PUBLIC_DEV_AUTH: "false",
      MAX_FILE_SIZE: "10485760",
      ALLOWED_FILE_TYPES: "image/jpeg,image/png",
    };

    const result = envSchema.parse(validEnv);
    expect(result).toBeDefined();
    expect(result.NEXTAUTH_SECRET).toBe("test-secret-key");
    expect(result.NODE_ENV).toBe("development");
    expect(result.PORT).toBe(3000);
  });

  it("should reject missing required variables", () => {
    const incompleteEnv = {
      NODE_ENV: "development" as const,
    };

    expect(() => envSchema.parse(incompleteEnv)).toThrow();
  });

  it("should accept optional variables", () => {
    const minimalEnv = {
      NEXTAUTH_SECRET: "test-secret-key",
      GOOGLE_CLIENT_ID: "test-client-id.apps.googleusercontent.com",
      GOOGLE_CLIENT_SECRET: "test-client-secret",
      DATABASE_URL: "postgresql://user:pass@localhost:5432/test",
      NODE_ENV: "development" as const,
      PORT: "3000",
      NEXT_PUBLIC_DEV_AUTH: "false",
      MAX_FILE_SIZE: "10485760",
      ALLOWED_FILE_TYPES: "image/jpeg,image/png",
    };

    const result = envSchema.parse(minimalEnv);
    expect(result.OPENAI_API_KEY).toBeUndefined();
    expect(result.REDIS_URL).toBeUndefined();
  });

  it("should validate URL formats", () => {
    const envWithInvalidUrls = {
      NEXTAUTH_SECRET: "test-secret-key",
      GOOGLE_CLIENT_ID: "test-client-id.apps.googleusercontent.com",
      GOOGLE_CLIENT_SECRET: "test-client-secret",
      DATABASE_URL: "postgresql://user:pass@localhost:5432/test",
      NEXTAUTH_URL: "not-a-valid-url",
      NODE_ENV: "development" as const,
      PORT: "3000",
      NEXT_PUBLIC_DEV_AUTH: "false",
      MAX_FILE_SIZE: "10485760",
      ALLOWED_FILE_TYPES: "image/jpeg,image/png",
    };

    expect(() => envSchema.parse(envWithInvalidUrls)).toThrow();
  });

  it("should transform boolean flags correctly", () => {
    const envWithFlags = {
      NEXTAUTH_SECRET: "test-secret-key",
      GOOGLE_CLIENT_ID: "test-client-id.apps.googleusercontent.com",
      GOOGLE_CLIENT_SECRET: "test-client-secret",
      DATABASE_URL: "postgresql://user:pass@localhost:5432/test",
      NODE_ENV: "development" as const,
      PORT: "3000",
      NEXT_PUBLIC_DEV_AUTH: "true",
      MAX_FILE_SIZE: "10485760",
      ALLOWED_FILE_TYPES: "image/jpeg,image/png",
    };

    const result = envSchema.parse(envWithFlags);
    expect(result.NEXT_PUBLIC_DEV_AUTH).toBe(true);
  });

  it("should transform numeric values correctly", () => {
    const envWithNumbers = {
      NEXTAUTH_SECRET: "test-secret-key",
      GOOGLE_CLIENT_ID: "test-client-id.apps.googleusercontent.com",
      GOOGLE_CLIENT_SECRET: "test-client-secret",
      DATABASE_URL: "postgresql://user:pass@localhost:5432/test",
      NODE_ENV: "development" as const,
      PORT: "8080",
      NEXT_PUBLIC_DEV_AUTH: "false",
      MAX_FILE_SIZE: "20971520",
      ALLOWED_FILE_TYPES: "image/jpeg,image/png",
    };

    const result = envSchema.parse(envWithNumbers);
    expect(result.PORT).toBe(8080);
    expect(result.MAX_FILE_SIZE).toBe(20971520);
  });
});
