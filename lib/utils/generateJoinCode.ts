/**
 * Join Code Generation Utility
 * Generates unique 6-character alphanumeric codes for class join functionality
 */

import { PrismaClient } from '@prisma/client';

type PrismaClassDelegate = Pick<PrismaClient, 'class'>;

// Characters excluding ambiguous ones: I, O, 0, 1
const CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 6;
const MAX_RETRIES = 5;

/**
 * Generate a random 6-character alphanumeric join code
 * Excludes ambiguous characters: I, O, 0, 1
 */
export function generateJoinCode(): string {
  let code = '';
  for (let i = 0; i < CODE_LENGTH; i++) {
    const randomIndex = Math.floor(Math.random() * CHARSET.length);
    code += CHARSET[randomIndex];
  }
  return code;
}

/**
 * Generate a unique join code by checking database for collisions
 * Retries up to MAX_RETRIES times if collision occurs
 *
 * @param prisma - Prisma client instance (can be from transaction)
 * @returns Unique join code
 * @throws Error if unable to generate unique code after MAX_RETRIES attempts
 */
export async function generateUniqueJoinCode(
  prisma: PrismaClassDelegate
): Promise<string> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const code = generateJoinCode();

    // Check if code already exists
    const existing = await prisma.class.findUnique({
      where: { joinCode: code },
      select: { id: true },
    });

    if (!existing) {
      return code;
    }

    // If last attempt failed, throw error
    if (attempt === MAX_RETRIES) {
      throw new Error(
        `Failed to generate unique join code after ${MAX_RETRIES} attempts`
      );
    }
  }

  // This should never happen due to the loop logic, but TypeScript needs it
  throw new Error('Unexpected error in join code generation');
}

/**
 * Validate join code format
 * Returns true if code matches expected format
 */
export function isValidJoinCodeFormat(code: string): boolean {
  if (code.length !== CODE_LENGTH) {
    return false;
  }

  // Check all characters are in charset
  return code.split('').every(char => CHARSET.includes(char));
}
