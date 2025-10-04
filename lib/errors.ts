/**
 * Standardized error handling for Science Advantage platform
 *
 * This file provides consistent error handling across all API routes and client-side code.
 * Use these utilities to ensure proper error formatting and handling.
 */

import { NextResponse } from "next/server";
import type { ApiError } from "@/lib/types";

// Standard error codes
export enum ErrorCode {
  // Authentication & Authorization
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  INVALID_TOKEN = "INVALID_TOKEN",
  TOKEN_EXPIRED = "TOKEN_EXPIRED",

  // Validation
  VALIDATION_ERROR = "VALIDATION_ERROR",
  INVALID_INPUT = "INVALID_INPUT",
  MISSING_REQUIRED_FIELD = "MISSING_REQUIRED_FIELD",

  // Resource Not Found
  NOT_FOUND = "NOT_FOUND",
  USER_NOT_FOUND = "USER_NOT_FOUND",
  CLASS_NOT_FOUND = "CLASS_NOT_FOUND",
  LESSON_NOT_FOUND = "LESSON_NOT_FOUND",

  // Business Logic
  ALREADY_ENROLLED = "ALREADY_ENROLLED",
  INVALID_JOIN_CODE = "INVALID_JOIN_CODE",
  LESSON_ALREADY_COMPLETED = "LESSON_ALREADY_COMPLETED",
  QUIZ_ALREADY_SUBMITTED = "QUIZ_ALREADY_SUBMITTED",

  // Server Errors
  INTERNAL_ERROR = "INTERNAL_ERROR",
  DATABASE_ERROR = "DATABASE_ERROR",
  EXTERNAL_SERVICE_ERROR = "EXTERNAL_SERVICE_ERROR",
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",

  // Network & Request
  BAD_REQUEST = "BAD_REQUEST",
  METHOD_NOT_ALLOWED = "METHOD_NOT_ALLOWED",
  PAYLOAD_TOO_LARGE = "PAYLOAD_TOO_LARGE",
}

// Custom ApiError class
export class ApiErrorClass extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(code: ErrorCode, message: string, statusCode: number = 500, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiErrorClass);
    }
  }

  // Static factory methods for common errors
  static unauthorized(message = "Unauthorized"): ApiErrorClass {
    return new ApiErrorClass(ErrorCode.UNAUTHORIZED, message, 401);
  }

  static forbidden(message = "Forbidden"): ApiErrorClass {
    return new ApiErrorClass(ErrorCode.FORBIDDEN, message, 403);
  }

  static notFound(resource = "Resource", message?: string): ApiErrorClass {
    return new ApiErrorClass(ErrorCode.NOT_FOUND, message || `${resource} not found`, 404);
  }

  static validation(message: string, details?: unknown): ApiErrorClass {
    return new ApiErrorClass(ErrorCode.VALIDATION_ERROR, message, 400, details);
  }

  static badRequest(message: string, details?: unknown): ApiErrorClass {
    return new ApiErrorClass(ErrorCode.BAD_REQUEST, message, 400, details);
  }

  static internal(message = "Internal server error", details?: unknown): ApiErrorClass {
    return new ApiErrorClass(ErrorCode.INTERNAL_ERROR, message, 500, details);
  }

  static rateLimit(message = "Rate limit exceeded"): ApiErrorClass {
    return new ApiErrorClass(ErrorCode.RATE_LIMIT_EXCEEDED, message, 429);
  }

  // Convert to JSON response format
  toJSON(): ApiError {
    return {
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      details: this.details,
    };
  }
}

// Error handler utility for API routes
export function handleApiError(error: unknown): NextResponse {
  console.error("API Error:", error);

  // If it's our custom ApiError, use it directly
  if (error instanceof ApiErrorClass) {
    return NextResponse.json(
      {
        success: false,
        error: error.toJSON(),
      },
      { status: error.statusCode }
    );
  }

  // Handle Zod validation errors
  if (error && typeof error === "object" && "issues" in error) {
    const validationError = error as { issues: Array<{ path: string[]; message: string }> };
    return NextResponse.json(
      {
        success: false,
        error: {
          code: ErrorCode.VALIDATION_ERROR,
          message: "Validation failed",
          statusCode: 400,
          details: validationError.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          })),
        },
      },
      { status: 400 }
    );
  }

  // Handle Prisma errors
  if (error && typeof error === "object" && "code" in error) {
    const prismaError = error as { code: string; message: string };

    switch (prismaError.code) {
      case "P2002":
        return NextResponse.json(
          {
            success: false,
            error: {
              code: ErrorCode.VALIDATION_ERROR,
              message: "Resource already exists",
              statusCode: 409,
            },
          },
          { status: 409 }
        );
      case "P2025":
        return NextResponse.json(
          {
            success: false,
            error: {
              code: ErrorCode.NOT_FOUND,
              message: "Record not found",
              statusCode: 404,
            },
          },
          { status: 404 }
        );
      default:
        return NextResponse.json(
          {
            success: false,
            error: {
              code: ErrorCode.DATABASE_ERROR,
              message: "Database operation failed",
              statusCode: 500,
            },
          },
          { status: 500 }
        );
    }
  }

  // Generic error fallback
  return NextResponse.json(
    {
      success: false,
      error: {
        code: ErrorCode.INTERNAL_ERROR,
        message: "An unexpected error occurred",
        statusCode: 500,
      },
    },
    { status: 500 }
  );
}

// Client-side error handler
export function handleClientError(error: unknown): ApiError {
  if (error instanceof ApiErrorClass) {
    return error.toJSON();
  }

  if (error instanceof Error) {
    return {
      code: ErrorCode.INTERNAL_ERROR,
      message: error.message,
      statusCode: 500,
    };
  }

  return {
    code: ErrorCode.INTERNAL_ERROR,
    message: "An unexpected error occurred",
    statusCode: 500,
  };
}

// Async error wrapper for API routes
export function withErrorHandler<T extends unknown[], R>(handler: (...args: T) => Promise<R>) {
  return async (...args: T): Promise<R | NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleApiError(error);
    }
  };
}

// Type guard to check if an error is an ApiError
export function isApiError(error: unknown): error is ApiErrorClass {
  return error instanceof ApiErrorClass;
}

// Utility to create consistent error responses
export function createErrorResponse(
  code: ErrorCode,
  message: string,
  statusCode: number = 500,
  details?: unknown
): NextResponse {
  const error: ApiError = {
    code,
    message,
    statusCode,
    details,
  };

  return NextResponse.json(
    {
      success: false,
      error,
    },
    { status: statusCode }
  );
}

// Common error response helpers
export const errorResponses = {
  unauthorized: (message = "Unauthorized") =>
    createErrorResponse(ErrorCode.UNAUTHORIZED, message, 401),

  forbidden: (message = "Forbidden") => createErrorResponse(ErrorCode.FORBIDDEN, message, 403),

  notFound: (resource = "Resource", message?: string) =>
    createErrorResponse(ErrorCode.NOT_FOUND, message || `${resource} not found`, 404),

  validation: (message: string, details?: unknown) =>
    createErrorResponse(ErrorCode.VALIDATION_ERROR, message, 400, details),

  badRequest: (message: string, details?: unknown) =>
    createErrorResponse(ErrorCode.BAD_REQUEST, message, 400, details),

  internal: (message = "Internal server error", details?: unknown) =>
    createErrorResponse(ErrorCode.INTERNAL_ERROR, message, 500, details),

  rateLimit: (message = "Rate limit exceeded") =>
    createErrorResponse(ErrorCode.RATE_LIMIT_EXCEEDED, message, 429),
};
