import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import type { user as UserModel, Class, Lesson, CurriculumUnit } from '@prisma/client';
import { GET } from './route';
import { createSession } from '@/lib/auth/session';

const mockCookies = {
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
};

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => mockCookies),
}));

describe('GET /api/students/me/lessons/[lessonSlug]/progress - Access Control', () => {
  let teacher: UserModel;
  let enrolledStudent: UserModel;
  let unenrolledStudent: UserModel;
  let testClass: Class;
  let testLesson: Lesson;
  let testUnit: CurriculumUnit;

  beforeEach(async () => {
    mockCookies.get.mockReset();
    mockCookies.set.mockReset();
    mockCookies.delete.mockReset();
    mockCookies.get.mockReturnValue(undefined);

    await prisma.$executeRaw`DELETE FROM "_CurriculumUnitToLesson"`;
    await prisma.$executeRaw`DELETE FROM "_LessonToStandard"`;
    await prisma.curriculumUnit.deleteMany();
    await prisma.lesson.deleteMany();
    await prisma.standard.deleteMany();
    await prisma.class.deleteMany();
    await prisma.session.deleteMany();
    await prisma.account.deleteMany();
    await prisma.user.deleteMany();

    teacher = await prisma.user.create({
      data: {
        id: 'progress-teacher-001',
        name: 'Progress Teacher',
        username: 'progressteacher001',
        displayUsername: 'ProgressTeacher',
        email: 'progress-teacher@test.com',
        role: 'TEACHER',
      },
    });

    enrolledStudent = await prisma.user.create({
      data: {
        id: 'progress-student-enrolled',
        name: 'Enrolled Student',
        username: 'progressstudentenrolled',
        displayUsername: 'EnrolledStudent',
        email: 'progress-enrolled@test.com',
        role: 'STUDENT',
      },
    });

    unenrolledStudent = await prisma.user.create({
      data: {
        id: 'progress-student-unenrolled',
        name: 'Unenrolled Student',
        username: 'progressstudentunenrolled',
        displayUsername: 'UnenrolledStudent',
        email: 'progress-unenrolled@test.com',
        role: 'STUDENT',
      },
    });

    testClass = await prisma.class.create({
      data: {
        id: 'progress-class-001',
        name: 'Grade 3 Progress',
        gradeLevel: 3,
        standardsAlignment: 'THAI',
        joinCode: 'PRG3A',
        teacherId: teacher.id,
        students: {
          connect: { id: enrolledStudent.id },
        },
      },
    });

    testLesson = await prisma.lesson.create({
      data: {
        id: 'progress-lesson-001',
        slug: 'plants-and-animals-progress',
        title: 'Plants and Animals',
        content: 'Learn about living things.',
        gradeLevel: 3,
        order: 1,
        lessonType: 'LESSON',
      },
    });

    testUnit = await prisma.curriculumUnit.create({
      data: {
        id: 'progress-unit-001',
        slug: 'living-world-progress',
        title: 'Living World',
        framework: 'THAI',
        gradeLevel: 3,
        order: 1,
        classId: testClass.id,
        lessons: {
          connect: { id: testLesson.id },
        },
      },
    });
  });

  afterEach(async () => {
    await prisma.$executeRaw`DELETE FROM "_CurriculumUnitToLesson"`;
    await prisma.$executeRaw`DELETE FROM "_LessonToStandard"`;
    await prisma.curriculumUnit.deleteMany();
    await prisma.lesson.deleteMany();
    await prisma.standard.deleteMany();
    await prisma.class.deleteMany();
    await prisma.session.deleteMany();
    await prisma.account.deleteMany();
    await prisma.user.deleteMany();
  });

  it('returns 401 when not authenticated', async () => {
    mockCookies.get.mockReturnValue(undefined);

    const request = new NextRequest('http://localhost:3000/api/students/me/lessons/plants-and-animals-progress/progress');
    const response = await GET(request, {
      params: Promise.resolve({ lessonSlug: 'plants-and-animals-progress' }),
    });

    expect(response.status).toBe(401);
  });

  it('returns 404 when lesson does not exist', async () => {
    const session = await createSession(enrolledStudent.id);
    mockCookies.get.mockReturnValue({ value: session.token });

    const request = new NextRequest('http://localhost:3000/api/students/me/lessons/nonexistent-lesson/progress');
    const response = await GET(request, {
      params: Promise.resolve({ lessonSlug: 'nonexistent-lesson' }),
    });

    expect(response.status).toBe(404);
  });

  it('returns 403 when student is not enrolled in any class with the lesson', async () => {
    const session = await createSession(unenrolledStudent.id);
    mockCookies.get.mockReturnValue({ value: session.token });

    const request = new NextRequest('http://localhost:3000/api/students/me/lessons/plants-and-animals-progress/progress');
    const response = await GET(request, {
      params: Promise.resolve({ lessonSlug: 'plants-and-animals-progress' }),
    });

    expect(response.status).toBe(403);
    const data = await response.json();
    expect(data.error).toBe('Not enrolled in a class with this lesson');
  });

  it('allows enrolled student to fetch progress', async () => {
    const session = await createSession(enrolledStudent.id);
    mockCookies.get.mockReturnValue({ value: session.token });

    const request = new NextRequest('http://localhost:3000/api/students/me/lessons/plants-and-animals-progress/progress');
    const response = await GET(request, {
      params: Promise.resolve({ lessonSlug: 'plants-and-animals-progress' }),
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.studentId).toBe(enrolledStudent.id);
    expect(data.lessonId).toBe('progress-lesson-001');
    expect(data.status).toBe('NOT_STARTED');
  });

  it('returns correct progress status for completed lesson', async () => {
    await prisma.lessonCompletion.create({
      data: {
        studentId: enrolledStudent.id,
        lessonId: testLesson.id,
        status: 'COMPLETED',
        attemptsCount: 2,
        mostRecentScore: 8,
        mostRecentScorePercentage: 80,
        bestScore: 9,
        bestScorePercentage: 90,
        completedAt: new Date(),
        lastAttemptAt: new Date(),
      },
    });

    const session = await createSession(enrolledStudent.id);
    mockCookies.get.mockReturnValue({ value: session.token });

    const request = new NextRequest('http://localhost:3000/api/students/me/lessons/plants-and-animals-progress/progress');
    const response = await GET(request, {
      params: Promise.resolve({ lessonSlug: 'plants-and-animals-progress' }),
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.status).toBe('COMPLETED');
    expect(data.attemptsCount).toBe(2);
    expect(data.mostRecentScorePercentage).toBe(80);
    expect(data.bestScorePercentage).toBe(90);
  });
});