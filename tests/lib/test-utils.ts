import prisma from '../../lib/prisma';
import type { UserRole, StandardsAlignment } from '@prisma/client';

export async function createTestUser(
  overrides: Partial<{ role: UserRole; gradeLevel: number }> = {}
) {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(7);
  return prisma.user.create({
    data: {
      id: `test-user-${timestamp}-${randomId}`,
      name: `Test User ${timestamp}`,
      username: `testuser${timestamp}`,
      displayUsername: `testuser${timestamp}`,
      email: `test${timestamp}@example.com`,
      role: overrides.role || 'STUDENT',
      gradeLevel: overrides.gradeLevel || 3,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
}

export async function createTestClass(
  teacherId: string,
  overrides: Partial<{
    name: string;
    gradeLevel: number;
    standardsAlignment: StandardsAlignment;
  }> = {}
) {
  const timestamp = Date.now();
  return prisma.class.create({
    data: {
      name: overrides.name || `Test Class ${timestamp}`,
      gradeLevel: overrides.gradeLevel || 3,
      standardsAlignment: overrides.standardsAlignment || 'THAI',
      joinCode: `JOIN${timestamp}`,
      teacherId,
    },
  });
}

export async function createTestLesson(
  classId: string,
  overrides: Partial<{ title: string; order: number }> = {}
) {
  const timestamp = Date.now();

  // First create a curriculum unit for the class
  const curriculumUnit = await prisma.curriculumUnit.create({
    data: {
      title: `Test Unit ${timestamp}`,
      framework: 'THAI',
      gradeLevel: 3,
      order: overrides.order || 1,
      classId,
    },
  });

  return prisma.lesson.create({
    data: {
      title: overrides.title || `Test Lesson ${timestamp}`,
      description: 'Test lesson description',
      content: 'Test lesson content',
      gradeLevel: 3,
      order: overrides.order || 1,
      curriculumUnits: {
        connect: { id: curriculumUnit.id },
      },
    },
  });
}

export async function createTestLessonCompletion(
  studentId: string,
  lessonId: string,
  overrides: Partial<{
    status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
    mostRecentScorePercentage: number;
    attemptsCount: number;
    totalTimeSpentSeconds: number;
  }> = {}
) {
  return prisma.lessonCompletion.create({
    data: {
      studentId,
      lessonId,
      status: overrides.status || 'COMPLETED',
      mostRecentScorePercentage: overrides.mostRecentScorePercentage || 80,
      attemptsCount: overrides.attemptsCount || 1,
      totalTimeSpentSeconds: overrides.totalTimeSpentSeconds || 300,
      completedAt: new Date(),
    },
  });
}
