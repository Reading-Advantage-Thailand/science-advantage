import type { PrismaClient, StandardsAlignment } from '@prisma/client';
import { createHash } from 'crypto';

/**
 * Mastery snapshot for a single standard.
 */
export type MasterySnapshot = {
  standardId: string;
  standardCode: string;
  description: string;
  masteryLevel: number;
  evidenceCount: number;
  lastAssessedAt: Date;
};

/**
 * Summary of the quiz attempt just completed.
 */
export type AttemptSummary = {
  attemptId: string;
  lessonId: string;
  lessonTitle: string;
  score: number;
  maxScore: number;
  scorePercentage: number;
  questionsCount: number;
  correctCount: number;
};

/**
 * Candidate lesson for recommendation.
 */
export type CandidateLesson = {
  lessonId: string;
  lessonTitle: string;
  lessonSlug: string;
  standardsCovered: string[];
  order: number;
  completed: boolean;
  prerequisiteLessonIds: string[];
};

/**
 * Student context (anonymized).
 */
export type StudentContext = {
  studentAlias: string; // Hashed student ID (no PII)
  gradeLevel: number;
  curriculum: string; // THAI or NGSS
};

/**
 * Complete recommendation context.
 */
export type RecommendationContext = {
  student: StudentContext;
  mastery: MasterySnapshot[];
  attempt: AttemptSummary;
  candidateLessons: CandidateLesson[];
};

/**
 * Create a hash alias for the student ID (for privacy).
 */
export const createStudentAlias = (studentId: string): string => {
  return createHash('sha256')
    .update(studentId)
    .digest('hex')
    .substring(0, 16);
};

/**
 * Fetch weak standards (mastery < threshold, sorted ascending).
 * Returns top N weakest standards.
 */
export const fetchWeakStandards = async (
  prisma: PrismaClient,
  studentId: string,
  maxCount = 5,
  threshold = 0.75
): Promise<MasterySnapshot[]> => {
  const records = await prisma.standardMastery.findMany({
    where: {
      studentId,
      masteryLevel: { lt: threshold },
    },
    include: {
      standard: true,
    },
    orderBy: {
      masteryLevel: 'asc',
    },
    take: maxCount,
  });

  return records.map((record) => ({
    standardId: record.standardId,
    standardCode: record.standard.code,
    description: record.standard.description,
    masteryLevel: record.masteryLevel.toNumber(),
    evidenceCount: record.evidenceCount,
    lastAssessedAt: record.lastAssessedAt,
  }));
};

/**
 * Fetch attempt summary for the given attemptId.
 */
export const fetchAttemptSummary = async (
  prisma: PrismaClient,
  attemptId: string
): Promise<AttemptSummary | null> => {
  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    include: {
      lesson: true,
      questionResponses: true,
    },
  });

  if (!attempt) return null;

  const questionsCount = attempt.questionResponses.length;
  const correctCount = attempt.questionResponses.filter((r) => r.isCorrect).length;
  const scorePercentage = attempt.maxScore > 0 ? (attempt.score / attempt.maxScore) * 100 : 0;

  return {
    attemptId: attempt.id,
    lessonId: attempt.lessonId,
    lessonTitle: attempt.lesson.title,
    score: attempt.score,
    maxScore: attempt.maxScore,
    scorePercentage,
    questionsCount,
    correctCount,
  };
};

/**
 * Fetch candidate lessons for recommendation.
 * Returns lessons that are not completed, including their standards and prerequisite info.
 */
export const fetchCandidateLessons = async (
  prisma: PrismaClient,
  studentId: string,
  gradeLevel: number,
  curriculum: StandardsAlignment
): Promise<CandidateLesson[]> => {
  // Fetch all lessons for the student's grade and curriculum
  const lessons = await prisma.lesson.findMany({
    where: {
      gradeLevel,
    },
    include: {
      standards: {
        where: {
          framework: curriculum,
        },
      },
    },
    orderBy: {
      order: 'asc',
    },
  });

  // Fetch completion status for all lessons
  const completions = await prisma.lessonCompletion.findMany({
    where: {
      studentId,
      lessonId: { in: lessons.map((l) => l.id) },
    },
  });

  const completionMap = new Map(
    completions.map((c) => [c.lessonId, c.status === 'COMPLETED'])
  );

  return lessons.map((lesson) => ({
    lessonId: lesson.id,
    lessonTitle: lesson.title,
    lessonSlug: lesson.id, // TODO: use actual slug when schema supports it
    standardsCovered: lesson.standards.map((s) => s.code),
    order: lesson.order,
    completed: completionMap.get(lesson.id) || false,
    prerequisiteLessonIds: [], // TODO: add when schema supports prerequisites
  }));
};

/**
 * Build complete recommendation context.
 */
export const buildRecommendationContext = async (
  prisma: PrismaClient,
  studentId: string,
  attemptId: string,
  gradeLevel: number,
  curriculum: StandardsAlignment
): Promise<RecommendationContext | null> => {
  // Fetch all data in parallel
  const [mastery, attempt, candidateLessons] = await Promise.all([
    fetchWeakStandards(prisma, studentId),
    fetchAttemptSummary(prisma, attemptId),
    fetchCandidateLessons(prisma, studentId, gradeLevel, curriculum),
  ]);

  if (!attempt) {
    return null;
  }

  return {
    student: {
      studentAlias: createStudentAlias(studentId),
      gradeLevel,
      curriculum,
    },
    mastery,
    attempt,
    candidateLessons,
  };
};
