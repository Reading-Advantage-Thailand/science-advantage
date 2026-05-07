import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import type { user as UserModel, Class, Lesson, Standard, CurriculumUnit } from '@prisma/client';
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

describe('GET /api/classes/[classId]/curriculum - Navigation Tests', () => {
  let testTeacher: UserModel;
  let testStudent: UserModel;
  let testClass: Class;
  let testLesson1: Lesson;
  let testLesson2: Lesson;
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

    testTeacher = await prisma.user.create({
      data: {
        id: 'nav-teacher-001',
        name: 'Navigation Teacher',
        username: 'navteacher001',
        displayUsername: 'NavTeacher',
        email: 'nav-teacher@test.com',
        role: 'TEACHER',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    testStudent = await prisma.user.create({
      data: {
        id: 'nav-student-001',
        name: 'Navigation Student',
        username: 'navstudent001',
        displayUsername: 'NavStudent',
        email: 'nav-student@test.com',
        role: 'STUDENT',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    testClass = await prisma.class.create({
      data: {
        id: 'nav-class-001',
        name: 'Grade 3 Navigation',
        gradeLevel: 3,
        standardsAlignment: 'THAI',
        joinCode: 'NAV3A',
        teacherId: testTeacher.id,
        students: {
          connect: { id: testStudent.id },
        },
      },
    });

    testLesson1 = await prisma.lesson.create({
      data: {
        id: 'nav-lesson-001',
        slug: 'plants-and-animals-nav',
        title: 'Plants and Animals',
        content: 'Learn about living things.',
        gradeLevel: 3,
        order: 1,
        lessonType: 'LESSON',
      },
    });

    testLesson2 = await prisma.lesson.create({
      data: {
        id: 'nav-lesson-002',
        slug: 'earth-and-sky-nav',
        title: 'Earth and Sky',
        content: 'Learn about earth and sky.',
        gradeLevel: 3,
        order: 2,
        lessonType: 'LAB',
      },
    });

    testUnit = await prisma.curriculumUnit.create({
      data: {
        id: 'nav-unit-001',
        slug: 'living-world-nav',
        title: 'Living World',
        description: 'All about living things',
        framework: 'THAI',
        gradeLevel: 3,
        order: 1,
        classId: testClass.id,
        lessons: {
          connect: [{ id: testLesson1.id }, { id: testLesson2.id }],
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

  it('returns canonical slugs for navigation links', async () => {
    const session = await createSession(testStudent.id);
    mockCookies.get.mockReturnValue({ value: session.token });

    const request = new NextRequest('http://localhost:3000/api/classes/nav-class-001/curriculum');
    const response = await GET(request, {
      params: Promise.resolve({ classId: 'nav-class-001' }),
    });

    expect(response.status).toBe(200);
    const data = await response.json();

    expect(data.units).toHaveLength(1);
    expect(data.units[0].lessons).toHaveLength(2);

    const lesson1 = data.units[0].lessons.find((l: { id: string }) => l.id === 'nav-lesson-001');
    const lesson2 = data.units[0].lessons.find((l: { id: string }) => l.id === 'nav-lesson-002');

    expect(lesson1.slug).toBe('plants-and-animals-nav');
    expect(lesson2.slug).toBe('earth-and-sky-nav');
  });

  it('provides stable lesson URLs for direct navigation', async () => {
    const session = await createSession(testStudent.id);
    mockCookies.get.mockReturnValue({ value: session.token });

    const request = new NextRequest('http://localhost:3000/api/classes/nav-class-001/curriculum');
    const response = await GET(request, {
      params: Promise.resolve({ classId: 'nav-class-001' }),
    });

    expect(response.status).toBe(200);
    const data = await response.json();

    const lesson = data.units[0].lessons[0];

    const lessonResponse = await fetch(`http://localhost:3000/api/lessons/${lesson.slug}`);
    expect(lessonResponse.status).toBe(200);

    const lessonData = await lessonResponse.json();
    expect(lessonData.lesson.slug).toBe(lesson.slug);
    expect(lessonData.lesson.title).toBe('Plants and Animals');
  });

  it('includes progress status for navigation state', async () => {
    const session = await createSession(testStudent.id);
    mockCookies.get.mockReturnValue({ value: session.token });

    const request = new NextRequest('http://localhost:3000/api/classes/nav-class-001/curriculum');
    const response = await GET(request, {
      params: Promise.resolve({ classId: 'nav-class-001' }),
    });

    expect(response.status).toBe(200);
    const data = await response.json();

    const lesson = data.units[0].lessons[0];

    expect(lesson.progress).toBeDefined();
    expect(lesson.progress.status).toBe('NOT_STARTED');
    expect(lesson.progress.attemptsCount).toBe(0);
    expect(lesson.completed).toBe(false);
    expect(lesson.started).toBe(false);
  });

  it('returns 401 when not authenticated', async () => {
    mockCookies.get.mockReturnValue(undefined);

    const request = new NextRequest('http://localhost:3000/api/classes/nav-class-001/curriculum');
    const response = await GET(request, {
      params: Promise.resolve({ classId: 'nav-class-001' }),
    });

    expect(response.status).toBe(401);
  });

  it('returns 403 when not enrolled in class', async () => {
    const unenrolledUser = await prisma.user.create({
      data: {
        id: 'nav-student-unenrolled',
        name: 'Unenrolled Student',
        username: 'navstudentunenrolled',
        displayUsername: 'UnenrolledStudent',
        email: 'nav-unenrolled@test.com',
        role: 'STUDENT',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    const session = await createSession(unenrolledUser.id);
    mockCookies.get.mockReturnValue({ value: session.token });

    const request = new NextRequest('http://localhost:3000/api/classes/nav-class-001/curriculum');
    const response = await GET(request, {
      params: Promise.resolve({ classId: 'nav-class-001' }),
    });

    expect(response.status).toBe(403);
  });

  it('allows teacher to access curriculum', async () => {
    const session = await createSession(testTeacher.id);
    mockCookies.get.mockReturnValue({ value: session.token });

    const request = new NextRequest('http://localhost:3000/api/classes/nav-class-001/curriculum');
    const response = await GET(request, {
      params: Promise.resolve({ classId: 'nav-class-001' }),
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.units).toHaveLength(1);
  });
});