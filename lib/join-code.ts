import { randomBytes } from "crypto";

export interface JoinCodeOptions {
  length?: number;
  charset?: string;
  excludeSimilar?: boolean;
}

export interface JoinCodeResult {
  code: string;
  createdAt: Date;
  expiresAt?: Date;
}

const DEFAULT_CHARSET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const SIMILAR_CHARS = "0O1IL";

/**
 * Generate a collision-safe join code with configurable options
 */
export function generateJoinCode(options: JoinCodeOptions = {}): string {
  const { length = 6, charset = DEFAULT_CHARSET, excludeSimilar = true } = options;

  let effectiveCharset = charset;
  if (excludeSimilar) {
    effectiveCharset = charset
      .split("")
      .filter((char) => !SIMILAR_CHARS.includes(char))
      .join("");
  }

  if (effectiveCharset.length === 0) {
    throw new Error("No valid characters available for join code generation");
  }

  let code = "";
  const randomValues = randomBytes(length * 2); // Get enough random bytes

  for (let i = 0; i < length; i++) {
    const randomIndex = randomValues[i] % effectiveCharset.length;
    code += effectiveCharset[randomIndex];
  }

  return code;
}

/**
 * Validate join code format
 */
export function validateJoinCode(code: string, options: JoinCodeOptions = {}): boolean {
  const { length = 6, charset = DEFAULT_CHARSET, excludeSimilar = true } = options;

  if (code.length !== length) {
    return false;
  }

  let effectiveCharset = charset;
  if (excludeSimilar) {
    effectiveCharset = charset
      .split("")
      .filter((char) => !SIMILAR_CHARS.includes(char))
      .join("");
  }

  return code.split("").every((char) => effectiveCharset.includes(char));
}

/**
 * Generate a unique join code with collision checking
 */
export async function generateUniqueJoinCode(
  checkExists: (code: string) => Promise<boolean>,
  options: JoinCodeOptions = {},
  maxAttempts = 10
): Promise<string> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const code = generateJoinCode(options);
    const exists = await checkExists(code);

    if (!exists) {
      return code;
    }
  }

  throw new Error(`Failed to generate unique join code after ${maxAttempts} attempts`);
}

/**
 * Calculate expiry date for join code
 */
export function calculateJoinCodeExpiry(hoursFromNow: number): Date {
  const expiry = new Date();
  expiry.setTime(expiry.getTime() + hoursFromNow * 60 * 60 * 1000);
  return expiry;
}

/**
 * Check if join code has expired
 */
export function isJoinCodeExpired(expiresAt: Date | null | undefined): boolean {
  if (!expiresAt) {
    return false;
  }
  const now = new Date();
  return now.getTime() >= expiresAt.getTime();
}
