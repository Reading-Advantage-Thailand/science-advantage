/**
 * Centralized shared type definitions for Science Advantage platform
 *
 * This file contains all shared types used across frontend and backend.
 * Import types from here to prevent type drift and ensure consistency.
 */

// Core domain types extracted from Prisma schema
export type Role = "STUDENT" | "TEACHER" | "ADMIN";
export type LessonType = "LESSON" | "EXPERIMENT";

// User-related types
export interface User {
  id: string;
  email: string;
  name?: string | null;
  role: Role;
  image?: string | null;
  emailVerified?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserWithClasses extends User {
  classes: Class[];
}

// Class-related types
export interface Class {
  id: string;
  name: string;
  description?: string | null;
  joinCode: string;
  teacherId: string;
  teacher: User;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClassWithEnrollments extends Class {
  enrollments: ClassEnrollment[];
  _count: {
    enrollments: number;
  };
}

export interface ClassEnrollment {
  id: string;
  classId: string;
  studentId: string;
  createdAt: Date;
}

// Lesson-related types
export interface Lesson {
  id: string;
  unitSlug: string;
  title: string;
  slug: string;
  summary?: string | null;
  order: number;
  content: string;
  type: LessonType;
  createdAt: Date;
  updatedAt: Date;
}

export interface LessonWithQuestions extends Lesson {
  quizQuestions: QuizQuestion[];
  _count: {
    attempts: number;
    completions: number;
  };
}

export interface QuizQuestion {
  id: string;
  lessonId: string;
  order: number;
  prompt: string;
  options: string[];
  answer: string;
  rationale?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Attempt and assessment types
export interface Attempt {
  id: string;
  studentId: string;
  lessonId: string;
  score: number;
  maxScore: number;
  responses: unknown; // JSON data
  startedAt: Date;
  completedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface LessonCompletion {
  id: string;
  lessonId: string;
  studentId: string;
  classId: string;
  completedAt: Date;
  updatedAt: Date;
}

export interface ExperimentSubmission {
  id: string;
  lessonId: string;
  studentId: string;
  classId: string;
  data: unknown; // JSON data
  submittedAt: Date;
  updatedAt: Date;
}

// API Request/Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Authentication types
export interface LoginRequest {
  email: string;
  password?: string; // For future email/password auth
}

export interface RegisterRequest {
  email: string;
  name: string;
  password?: string; // For future email/password auth
  role?: Role;
}

export interface AuthUser {
  id: string;
  email: string;
  name?: string | null;
  role: Role;
  image?: string | null;
}

// Class management types
export interface CreateClassRequest {
  name: string;
  description?: string;
}

export interface JoinClassRequest {
  joinCode: string;
}

export interface UpdateClassRequest {
  name?: string;
  description?: string;
}

// Lesson progress types
export interface LessonProgress {
  lessonId: string;
  completed: boolean;
  score?: number;
  completedAt?: Date;
  timeSpent?: number; // in seconds
}

export interface ExperimentData {
  lessonId: string;
  data: Record<string, unknown>;
  submittedAt: Date;
}

// Error types (will be expanded in lib/errors.ts)
export interface ApiError {
  code: string;
  message: string;
  statusCode: number;
  details?: unknown;
}

// Dashboard and analytics types
export interface ClassStats {
  totalStudents: number;
  completedLessons: number;
  averageScore: number;
  activeStudents: number;
}

export interface StudentProgress {
  studentId: string;
  studentName: string;
  completedLessons: number;
  totalLessons: number;
  averageScore: number;
  lastActivity: Date;
}

// Export utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredBy<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Validation schemas with Zod
import { z } from "zod";

export const userSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or less")
    .optional(),
  role: z.enum(["STUDENT", "TEACHER", "ADMIN"]).optional(),
});

export const createClassSchema = z.object({
  name: z
    .string()
    .min(1, "Class name is required")
    .max(100, "Class name must be 100 characters or less"),
  description: z.string().max(500, "Description must be 500 characters or less").optional(),
});

export const joinClassSchema = z.object({
  joinCode: z
    .string()
    .min(1, "Join code is required")
    .max(20, "Join code must be 20 characters or less"),
});

export const updateClassSchema = z.object({
  name: z
    .string()
    .min(1, "Class name is required")
    .max(100, "Class name must be 100 characters or less")
    .optional(),
  description: z.string().max(500, "Description must be 500 characters or less").optional(),
});

export const quizSubmissionSchema = z.object({
  lessonId: z.string().min(1),
  responses: z.array(z.any()),
});

export const experimentSubmissionSchema = z.object({
  lessonId: z.string().min(1),
  data: z.object({}).passthrough(),
});

// Type inference from schemas
export type CreateUserInput = z.infer<typeof userSchema>;
export type CreateClassInput = z.infer<typeof createClassSchema>;
export type JoinClassInput = z.infer<typeof joinClassSchema>;
export type UpdateClassInput = z.infer<typeof updateClassSchema>;
export type QuizSubmissionInput = z.infer<typeof quizSubmissionSchema>;
export type ExperimentSubmissionInput = z.infer<typeof experimentSubmissionSchema>;
