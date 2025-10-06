import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  generateJoinCode,
  validateJoinCode,
  generateUniqueJoinCode,
  calculateJoinCodeExpiry,
  isJoinCodeExpired,
} from "./join-code";

describe("join-code", () => {
  describe("generateJoinCode", () => {
    it("should generate a code with default length of 6", () => {
      const code = generateJoinCode();
      expect(code).toHaveLength(6);
    });

    it("should generate a code with custom length", () => {
      const code = generateJoinCode({ length: 8 });
      expect(code).toHaveLength(8);
    });

    it("should use only characters from the charset", () => {
      const charset = "ABC123";
      const code = generateJoinCode({ charset, excludeSimilar: false });
      expect(code.split("").every((char) => charset.includes(char))).toBe(true);
    });

    it("should exclude similar characters by default", () => {
      const code = generateJoinCode();
      const similarChars = "0O1IL";
      expect(code.split("").every((char) => !similarChars.includes(char))).toBe(true);
    });

    it("should include similar characters when excludeSimilar is false", () => {
      const charset = "0O1ILABC";
      const code = generateJoinCode({ charset, excludeSimilar: false });
      expect(code).toMatch(/[0O1IL]/);
    });

    it("should throw error when charset becomes empty after exclusion", () => {
      expect(() => generateJoinCode({ charset: "0O1IL", excludeSimilar: true })).toThrow();
    });
  });

  describe("validateJoinCode", () => {
    it("should validate correct code format", () => {
      const code = generateJoinCode();
      expect(validateJoinCode(code)).toBe(true);
    });

    it("should reject code with wrong length", () => {
      const code = generateJoinCode({ length: 6 });
      expect(validateJoinCode(code + "A")).toBe(false);
      expect(validateJoinCode(code.slice(0, -1))).toBe(false);
    });

    it("should reject code with invalid characters", () => {
      expect(validateJoinCode("ABCDEF", { charset: "ABC" })).toBe(false);
    });

    it("should validate with custom options", () => {
      const code = generateJoinCode({ length: 4, charset: "1234", excludeSimilar: false });
      expect(validateJoinCode(code, { length: 4, charset: "1234", excludeSimilar: false })).toBe(
        true
      );
    });
  });

  describe("generateUniqueJoinCode", () => {
    it("should return unique code when checkExists returns false", async () => {
      const checkExists = vi.fn().mockResolvedValue(false);
      const code = await generateUniqueJoinCode(checkExists);
      expect(code).toHaveLength(6);
      expect(checkExists).toHaveBeenCalledWith(code);
    });

    it("should retry when collision detected", async () => {
      const checkExists = vi.fn().mockResolvedValueOnce(true).mockResolvedValueOnce(false);

      const code = await generateUniqueJoinCode(checkExists);
      expect(checkExists).toHaveBeenCalledTimes(2);
      expect(code).toHaveLength(6);
    });

    it("should throw error after max attempts", async () => {
      const checkExists = vi.fn().mockResolvedValue(true);

      await expect(generateUniqueJoinCode(checkExists, {}, 3)).rejects.toThrow(
        "Failed to generate unique join code after 3 attempts"
      );
      expect(checkExists).toHaveBeenCalledTimes(3);
    });
  });

  describe("calculateJoinCodeExpiry", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should calculate expiry date correctly", () => {
      const now = new Date("2025-01-06T12:00:00Z");
      vi.setSystemTime(now);

      const expiry = calculateJoinCodeExpiry(24);
      const expected = new Date("2025-01-07T12:00:00Z");

      expect(expiry).toEqual(expected);
    });

    it("should handle fractional hours", () => {
      const now = new Date("2025-01-06T12:00:00Z");
      vi.setSystemTime(now);

      const expiry = calculateJoinCodeExpiry(2.5);
      const expected = new Date("2025-01-06T14:30:00Z");

      expect(expiry).toEqual(expected);
    });
  });

  describe("isJoinCodeExpired", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should return false for null expiry", () => {
      expect(isJoinCodeExpired(null)).toBe(false);
      expect(isJoinCodeExpired(undefined)).toBe(false);
    });

    it("should return false for future expiry", () => {
      const now = new Date("2025-01-06T12:00:00Z");
      const future = new Date("2025-01-06T13:00:00Z");
      vi.setSystemTime(now);

      expect(isJoinCodeExpired(future)).toBe(false);
    });

    it("should return true for past expiry", () => {
      const now = new Date("2025-01-06T12:00:00Z");
      const past = new Date("2025-01-06T11:00:00Z");
      vi.setSystemTime(now);

      expect(isJoinCodeExpired(past)).toBe(true);
    });

    it("should return true for current time expiry", () => {
      const now = new Date("2025-01-06T12:00:00Z");
      vi.setSystemTime(now);

      expect(isJoinCodeExpired(now)).toBe(true);
    });
  });
});
