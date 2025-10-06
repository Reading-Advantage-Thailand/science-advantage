/**
 * Centralized shared type definitions for Science Advantage platform
 *
 * This file contains all shared types used across frontend and backend.
 * Import types from here to prevent type drift and ensure consistency.
 */

// Core domain types extracted from Prisma schema
export type Role = "STUDENT" | "TEACHER" | "ADMIN";
export type LessonType = "LESSON" | "EXPERIMENT";
export type AssignmentStatus = "DRAFT" | "PUBLISHED" | "CANCELLED";
export type ContentType = "LESSON" | "QUIZ" | "EXPERIMENT";

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
  isPublished: boolean;
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

// Assignment-related types
export interface Assignment {
  id: string;
  title: string;
  description?: string | null;
  classId: string;
  class: Class;
  lessonId: string;
  lesson: Lesson;
  contentType: ContentType;
  status: AssignmentStatus;
  dueDate: Date;
  timezone: string;
  publishedAt?: Date | null;
  cancelledAt?: Date | null;
  teacherId: string;
  teacher: User;
  createdAt: Date;
  updatedAt: Date;
}

export interface AssignmentWithRelations extends Assignment {
  class: Class;
  lesson: Lesson;
  teacher: User;
}

export interface AssignmentListItem {
  id: string;
  title: string;
  description?: string | null;
  contentType: ContentType;
  status: AssignmentStatus;
  dueDate: Date;
  timezone: string;
  publishedAt?: Date | null;
  cancelledAt?: Date | null;
  className: string;
  lessonTitle: string;
  lessonType: LessonType;
  studentCount?: number;
  completedCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudentAssignmentItem {
  id: string;
  title: string;
  description?: string | null;
  contentType: ContentType;
  dueDate: Date;
  timezone: string;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "OVERDUE";
  lessonTitle: string;
  lessonType: LessonType;
  className: string;
  completedAt?: Date | null;
  score?: number | null;
  maxScore?: number | null;
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

// Assignment management types
export interface CreateAssignmentRequest {
  title: string;
  description?: string;
  classId: string;
  lessonId: string;
  contentType?: ContentType;
  dueDate: string; // ISO string
  timezone?: string;
  status?: AssignmentStatus;
}

export interface UpdateAssignmentRequest {
  title?: string;
  description?: string;
  dueDate?: string; // ISO string
  timezone?: string;
  status?: AssignmentStatus;
}

export interface ListAssignmentsRequest {
  classId?: string;
  teacherId?: string;
  status?: AssignmentStatus;
  contentType?: ContentType;
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "dueDate" | "title";
  sortOrder?: "asc" | "desc";
}

export interface ListStudentAssignmentsRequest {
  classId?: string;
  status?: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "OVERDUE";
  page?: number;
  limit?: number;
  sortBy?: "dueDate" | "title" | "createdAt";
  sortOrder?: "asc" | "desc";
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

export const createAssignmentSchema = z.object({
  title: z
    .string()
    .min(1, "Assignment title is required")
    .max(200, "Title must be 200 characters or less"),
  description: z.string().max(1000, "Description must be 1000 characters or less").optional(),
  classId: z.string().min(1, "Class ID is required"),
  lessonId: z.string().min(1, "Lesson ID is required"),
  contentType: z.enum(["LESSON", "QUIZ", "EXPERIMENT"]).optional().default("LESSON"),
  dueDate: z.string().min(1, "Due date is required").datetime("Invalid datetime format"),
  timezone: z.string().min(1, "Timezone is required").max(50, "Invalid timezone").default("UTC"),
  status: z.enum(["DRAFT", "PUBLISHED", "CANCELLED"]).optional().default("DRAFT"),
});

export const updateAssignmentSchema = z.object({
  title: z
    .string()
    .min(1, "Assignment title is required")
    .max(200, "Title must be 200 characters or less")
    .optional(),
  description: z.string().max(1000, "Description must be 1000 characters or less").optional(),
  dueDate: z.string().datetime("Invalid datetime format").optional(),
  timezone: z.string().min(1, "Timezone is required").max(50, "Invalid timezone").optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "CANCELLED"]).optional(),
});

export const listAssignmentsSchema = z.object({
  classId: z.string().optional(),
  teacherId: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "CANCELLED"]).optional(),
  contentType: z.enum(["LESSON", "QUIZ", "EXPERIMENT"]).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sortBy: z.enum(["createdAt", "dueDate", "title"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const listStudentAssignmentsSchema = z.object({
  classId: z.string().optional(),
  status: z.enum(["NOT_STARTED", "IN_PROGRESS", "COMPLETED", "OVERDUE"]).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sortBy: z.enum(["dueDate", "title", "createdAt"]).default("dueDate"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

// Type inference from schemas
export type CreateUserInput = z.infer<typeof userSchema>;
export type CreateClassInput = z.infer<typeof createClassSchema>;
export type JoinClassInput = z.infer<typeof joinClassSchema>;
export type UpdateClassInput = z.infer<typeof updateClassSchema>;
export type QuizSubmissionInput = z.infer<typeof quizSubmissionSchema>;
export type ExperimentSubmissionInput = z.infer<typeof experimentSubmissionSchema>;
export type CreateAssignmentInput = z.infer<typeof createAssignmentSchema>;
export type UpdateAssignmentInput = z.infer<typeof updateAssignmentSchema>;
export type ListAssignmentsInput = z.infer<typeof listAssignmentsSchema>;
export type ListStudentAssignmentsInput = z.infer<typeof listStudentAssignmentsSchema>;
