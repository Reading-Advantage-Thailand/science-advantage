import "@testing-library/jest-dom/vitest";
import { config } from "dotenv";

// Load test environment variables
config({ path: ".env.local" });

// Fallback test values if not in .env.local
process.env.NEXTAUTH_SECRET ??= "test-nextauth-secret";
process.env.GOOGLE_CLIENT_ID ??= "test-google-client-id";
process.env.GOOGLE_CLIENT_SECRET ??= "test-google-client-secret";
process.env.DATABASE_URL ??= "postgresql://user:pass@localhost:5432/test";
