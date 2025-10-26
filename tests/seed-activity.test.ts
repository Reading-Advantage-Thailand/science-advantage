
import { PrismaClient } from '@prisma/client';
import { seedActivityData } from '../prisma/seed-functions/seed-activity-data';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';

const prisma = new PrismaClient();

describe('seedActivityData', () => {
  beforeAll(async () => {
    // Clean up database before tests
    await prisma.lessonCompletion.deleteMany({});
    await prisma.questionResponse.deleteMany({});
    await prisma.attempt.deleteMany({});
    await prisma.user.deleteMany({ where: { username: { startsWith: 'student_demo_' } } });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should seed activity data correctly', async () => {
    await seedActivityData(prisma);

    const demoClass = await prisma.class.findUnique({
      where: { joinCode: 'DEMO3T' },
      include: { students: true },
    });

    expect(demoClass?.students.length).toBe(15);

    const strugglingLearner = await prisma.user.findFirst({
      where: { name: { startsWith: 'Struggling-Learner' } },
    });

    const attempts = await prisma.attempt.findMany({
      where: { studentId: strugglingLearner?.id },
    });

    expect(attempts.length).toBeGreaterThan(1);
  });

  it('should be idempotent', async () => {
    await seedActivityData(prisma);
    await seedActivityData(prisma);

    const demoClass = await prisma.class.findUnique({
      where: { joinCode: 'DEMO3T' },
      include: { students: true },
    });

    expect(demoClass?.students.length).toBe(15);
  });
});
