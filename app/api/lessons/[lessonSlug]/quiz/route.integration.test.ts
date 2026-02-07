import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import type { user as UserModel, Class, Lesson, QuizQuestion } from '@prisma/client';
import { GET, POST } from './route';
import { createSession } from '@/lib/auth/session';

// Mock next/headers for cookies
const mockCookies = {
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
};

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => mockCookies),
}));

describe('GET /api/lessons/[lessonId]/quiz - Integration Tests', () => {
  let testTeacher: UserModel;
  let testStudent: UserModel;
  let otherStudent: UserModel;
  let testClass: Class;
  let testLesson: Lesson;
  let quizQuestions: QuizQuestion[];

  beforeEach(async () => {
    mockCookies.get.mockReset();
    mockCookies.set.mockReset();
    mockCookies.delete.mockReset();
    mockCookies.get.mockReturnValue(undefined);

    // Clean up in correct order
    await prisma.$executeRaw`DELETE FROM "_QuizQuestionToStandard"`;
    await prisma.questionResponse.deleteMany();
    await prisma.attempt.deleteMany();
    await prisma.quizQuestion.deleteMany();
    await prisma.$executeRaw`DELETE FROM "_CurriculumUnitToLesson"`;
    await prisma.$executeRaw`DELETE FROM "_LessonToStandard"`;
    await prisma.curriculumUnit.deleteMany();
    await prisma.lesson.deleteMany();
    await prisma.class.deleteMany();
    await prisma.session.deleteMany();
    await prisma.account.deleteMany();
    await prisma.user.deleteMany();

    // Create test users
    testTeacher = await prisma.user.create({
      data: {
        id: 'test-teacher-quiz',
        name: 'Test Teacher',
        username: 'testteacher-quiz',
        displayUsername: 'TestTeacher',
        email: 'teacher-quiz@example.com',
        role: 'TEACHER',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    testStudent = await prisma.user.create({
      data: {
        id: 'test-student-quiz',
        name: 'Test Student',
        username: 'teststudent-quiz',
        displayUsername: 'TestStudent',
        email: 'student-quiz@example.com',
        role: 'STUDENT',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    otherStudent = await prisma.user.create({
      data: {
        id: 'other-student-quiz',
        name: 'Other Student',
        username: 'otherstudent-quiz',
        displayUsername: 'OtherStudent',
        email: 'other-quiz@example.com',
        role: 'STUDENT',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Create test class
    testClass = await prisma.class.create({
      data: {
        id: 'test-class-quiz',
        name: 'Grade 3 Science',
        gradeLevel: 3,
        standardsAlignment: 'THAI',
        joinCode: 'QUIZ123',
        teacherId: testTeacher.id,
        students: {
          connect: { id: testStudent.id },
        },
      },
    });

    // Create test lesson
    testLesson = await prisma.lesson.create({
      data: {
        id: 'lesson-quiz-1',
        title: 'Introduction to Science',
        description: 'Learn what science is',
        content: 'Science is the study of the natural world',
        gradeLevel: 3,
        order: 1,
      },
    });

    // Link lesson to class via curriculum unit
    await prisma.curriculumUnit.create({
      data: {
        id: 'unit-quiz-1',
        title: 'Unit 1: Science Basics',
        framework: 'THAI',
        gradeLevel: 3,
        order: 1,
        classId: testClass.id,
        lessons: {
          connect: { id: testLesson.id },
        },
      },
    });

    // Create 12 questions (4N = 36 for N=9, but using 12 for 3-question quiz for testing)
    quizQuestions = [];
    for (let i = 1; i <= 12; i++) {
      const question = await prisma.quizQuestion.create({
        data: {
          lessonId: testLesson.id,
          type: 'MULTIPLE_CHOICE',
          text: `Question ${i}: What is the scientific method step ${i}?`,
          options: ['Observe', 'Predict', 'Test', 'Conclude'],
          correctAnswer: 'Observe',
          points: 1,
          order: i,
        },
      });
      quizQuestions.push(question);
    }
  });

  afterEach(async () => {
    await prisma.$executeRaw`DELETE FROM "_QuizQuestionToStandard"`;
    await prisma.questionResponse.deleteMany();
    await prisma.attempt.deleteMany();
    await prisma.quizQuestion.deleteMany();
    await prisma.$executeRaw`DELETE FROM "_CurriculumUnitToLesson"`;
    await prisma.$executeRaw`DELETE FROM "_LessonToStandard"`;
    await prisma.curriculumUnit.deleteMany();
    await prisma.lesson.deleteMany();
    await prisma.class.deleteMany();
    await prisma.session.deleteMany();
    await prisma.account.deleteMany();
    await prisma.user.deleteMany();
  });

  describe('Authentication', () => {
    it('should return 401 when not authenticated', async () => {
      mockCookies.get.mockReturnValue(undefined);

      const request = new NextRequest(`http://localhost:3000/api/lessons/${testLesson.id}/quiz`);
      const response = await GET(request, { params: Promise.resolve({ lessonSlug: testLesson.id }) });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Authentication required');
    });
  });

  describe('Authorization', () => {
    it('should allow enrolled student to access quiz', async () => {
      const session = await createSession(testStudent.id);
      mockCookies.get.mockReturnValue({ value: session.token });

      const request = new NextRequest(`http://localhost:3000/api/lessons/${testLesson.id}/quiz`);
      const response = await GET(request, { params: Promise.resolve({ lessonSlug: testLesson.id }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.quizId).toBeDefined();
      expect(data.questions).toBeDefined();
    });

    it('should deny non-enrolled student access', async () => {
      const session = await createSession(otherStudent.id);
      mockCookies.get.mockReturnValue({ value: session.token });

      const request = new NextRequest(`http://localhost:3000/api/lessons/${testLesson.id}/quiz`);
      const response = await GET(request, { params: Promise.resolve({ lessonSlug: testLesson.id }) });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('Not enrolled in class with this lesson');
    });

    it('should allow class teacher to access quiz', async () => {
      const session = await createSession(testTeacher.id);
      mockCookies.get.mockReturnValue({ value: session.token });

      const request = new NextRequest(`http://localhost:3000/api/lessons/${testLesson.id}/quiz`);
      const response = await GET(request, { params: Promise.resolve({ lessonSlug: testLesson.id }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.quizId).toBeDefined();
      expect(data.questions).toBeDefined();
    });
  });

  describe('Lesson Not Found', () => {
    it('should return 404 for non-existent lesson', async () => {
      const session = await createSession(testStudent.id);
      mockCookies.get.mockReturnValue({ value: session.token });

      const request = new NextRequest('http://localhost:3000/api/lessons/non-existent-lesson/quiz');
      const response = await GET(request, { params: Promise.resolve({ lessonSlug: 'non-existent-lesson' }) });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Lesson not found');
    });
  });

  describe('Question Selection', () => {
    it('should return N questions from the question bank', async () => {
      const session = await createSession(testStudent.id);
      mockCookies.get.mockReturnValue({ value: session.token });

      const request = new NextRequest(`http://localhost:3000/api/lessons/${testLesson.id}/quiz`);
      const response = await GET(request, { params: Promise.resolve({ lessonSlug: testLesson.id }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      // For 12 questions, N = 3 (12/4)
      expect(data.questions).toHaveLength(3);
    });

    it('should not include correct answers in response', async () => {
      const session = await createSession(testStudent.id);
      mockCookies.get.mockReturnValue({ value: session.token });

      const request = new NextRequest(`http://localhost:3000/api/lessons/${testLesson.id}/quiz`);
      const response = await GET(request, { params: Promise.resolve({ lessonSlug: testLesson.id }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      data.questions.forEach((q: any) => {
        expect(q.correctAnswer).toBeUndefined();
      });
    });

    it('should include required question fields', async () => {
      const session = await createSession(testStudent.id);
      mockCookies.get.mockReturnValue({ value: session.token });

      const request = new NextRequest(`http://localhost:3000/api/lessons/${testLesson.id}/quiz`);
      const response = await GET(request, { params: Promise.resolve({ lessonSlug: testLesson.id }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      const question = data.questions[0];
      expect(question).toHaveProperty('id');
      expect(question).toHaveProperty('type');
      expect(question).toHaveProperty('text');
      expect(question).toHaveProperty('options');
      expect(question).toHaveProperty('points');
      expect(question).toHaveProperty('order');
    });

    it('should create an attempt record with startedAt timestamp', async () => {
      const session = await createSession(testStudent.id);
      mockCookies.get.mockReturnValue({ value: session.token });

      const request = new NextRequest(`http://localhost:3000/api/lessons/${testLesson.id}/quiz`);
      const response = await GET(request, { params: Promise.resolve({ lessonSlug: testLesson.id }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.quizId).toBeDefined();
      expect(data.startedAt).toBeDefined();

      // Verify attempt record exists in database
      const attempt = await prisma.attempt.findUnique({
        where: { id: data.quizId },
      });
      expect(attempt).toBeDefined();
      expect(attempt?.studentId).toBe(testStudent.id);
      expect(attempt?.lessonId).toBe(testLesson.id);
      expect(attempt?.completedAt).toBeNull();
    });

    it('should calculate correct total points', async () => {
      const session = await createSession(testStudent.id);
      mockCookies.get.mockReturnValue({ value: session.token });

      const request = new NextRequest(`http://localhost:3000/api/lessons/${testLesson.id}/quiz`);
      const response = await GET(request, { params: Promise.resolve({ lessonSlug: testLesson.id }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.totalPoints).toBe(3); // 3 questions * 1 point each
    });
  });

  describe('Error Handling', () => {
    it('should return 500 if question pool is too small', async () => {
      // Create lesson with only 2 questions (less than 4N for any N > 0)
      const smallLesson = await prisma.lesson.create({
        data: {
          id: 'lesson-small',
          title: 'Small Lesson',
          gradeLevel: 3,
          order: 99,
        },
      });

      await prisma.curriculumUnit.create({
        data: {
          id: 'unit-small',
          title: 'Small Unit',
          framework: 'THAI',
          gradeLevel: 3,
          order: 99,
          classId: testClass.id,
          lessons: {
            connect: { id: smallLesson.id },
          },
        },
      });

      await prisma.quizQuestion.create({
        data: {
          lessonId: smallLesson.id,
          type: 'TRUE_FALSE',
          text: 'Is this a test?',
          options: ['True', 'False'],
          correctAnswer: 'True',
          points: 1,
          order: 1,
        },
      });

      await prisma.quizQuestion.create({
        data: {
          lessonId: smallLesson.id,
          type: 'TRUE_FALSE',
          text: 'Is this another test?',
          options: ['True', 'False'],
          correctAnswer: 'False',
          points: 1,
          order: 2,
        },
      });

      const session = await createSession(testStudent.id);
      mockCookies.get.mockReturnValue({ value: session.token });

      const request = new NextRequest(`http://localhost:3000/api/lessons/${smallLesson.id}/quiz`);
      const response = await GET(request, { params: Promise.resolve({ lessonSlug: smallLesson.id }) });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain('Insufficient questions');
    });
  });
});

describe('POST /api/lessons/[lessonId]/quiz/submit - Integration Tests', () => {
  let testTeacher: UserModel;
  let testStudent: UserModel;
  let otherStudent: UserModel;
  let testClass: Class;
  let testLesson: Lesson;
  let quizQuestions: QuizQuestion[];
  let attemptId: string;

  beforeEach(async () => {
    mockCookies.get.mockReset();
    mockCookies.set.mockReset();
    mockCookies.delete.mockReset();
    mockCookies.get.mockReturnValue(undefined);

    // Clean up in correct order
    await prisma.$executeRaw`DELETE FROM "_QuizQuestionToStandard"`;
    await prisma.questionResponse.deleteMany();
    await prisma.attempt.deleteMany();
    await prisma.quizQuestion.deleteMany();
    await prisma.$executeRaw`DELETE FROM "_CurriculumUnitToLesson"`;
    await prisma.$executeRaw`DELETE FROM "_LessonToStandard"`;
    await prisma.lessonCompletion.deleteMany();
    await prisma.curriculumUnit.deleteMany();
    await prisma.lesson.deleteMany();
    await prisma.class.deleteMany();
    await prisma.session.deleteMany();
    await prisma.account.deleteMany();
    await prisma.user.deleteMany();

    // Create test users
    testTeacher = await prisma.user.create({
      data: {
        id: 'test-teacher-submit',
        name: 'Test Teacher',
        username: 'testteacher-submit',
        displayUsername: 'TestTeacher',
        email: 'teacher-submit@example.com',
        role: 'TEACHER',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    testStudent = await prisma.user.create({
      data: {
        id: 'test-student-submit',
        name: 'Test Student',
        username: 'teststudent-submit',
        displayUsername: 'TestStudent',
        email: 'student-submit@example.com',
        role: 'STUDENT',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    otherStudent = await prisma.user.create({
      data: {
        id: 'other-student-submit',
        name: 'Other Student',
        username: 'otherstudent-submit',
        displayUsername: 'OtherStudent',
        email: 'other-submit@example.com',
        role: 'STUDENT',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Create test class
    testClass = await prisma.class.create({
      data: {
        id: 'test-class-submit',
        name: 'Grade 3 Science',
        gradeLevel: 3,
        standardsAlignment: 'THAI',
        joinCode: 'SUBM123',
        teacherId: testTeacher.id,
        students: {
          connect: { id: testStudent.id },
        },
      },
    });

    // Create test lesson
    testLesson = await prisma.lesson.create({
      data: {
        id: 'lesson-submit-1',
        title: 'Introduction to Science',
        description: 'Learn what science is',
        content: 'Science is the study of the natural world',
        gradeLevel: 3,
        order: 1,
      },
    });

    // Link lesson to class via curriculum unit
    await prisma.curriculumUnit.create({
      data: {
        id: 'unit-submit-1',
        title: 'Unit 1: Science Basics',
        framework: 'THAI',
        gradeLevel: 3,
        order: 1,
        classId: testClass.id,
        lessons: {
          connect: { id: testLesson.id },
        },
      },
    });

    // Create 3 quiz questions
    quizQuestions = [];
    const questionsData = [
      {
        text: 'What is the first step of the scientific method?',
        correctAnswer: 'Observe',
      },
      {
        text: 'What comes after observation?',
        correctAnswer: 'Predict',
      },
      {
        text: 'How do you test a hypothesis?',
        correctAnswer: 'Test',
      },
    ];

    for (let i = 0; i < questionsData.length; i++) {
      const question = await prisma.quizQuestion.create({
        data: {
          lessonId: testLesson.id,
          type: 'MULTIPLE_CHOICE',
          text: questionsData[i].text,
          options: ['Observe', 'Predict', 'Test', 'Conclude'],
          correctAnswer: questionsData[i].correctAnswer,
          points: 1,
          order: i + 1,
        },
      });
      quizQuestions.push(question);
    }

    // Create an attempt for testing
    const attempt = await prisma.attempt.create({
      data: {
        studentId: testStudent.id,
        lessonId: testLesson.id,
        maxScore: 3,
        attemptNumber: 1,
        startedAt: new Date(),
      },
    });
    attemptId = attempt.id;
  });

  afterEach(async () => {
    await prisma.$executeRaw`DELETE FROM "_QuizQuestionToStandard"`;
    await prisma.questionResponse.deleteMany();
    await prisma.attempt.deleteMany();
    await prisma.quizQuestion.deleteMany();
    await prisma.$executeRaw`DELETE FROM "_CurriculumUnitToLesson"`;
    await prisma.$executeRaw`DELETE FROM "_LessonToStandard"`;
    await prisma.lessonCompletion.deleteMany();
    await prisma.curriculumUnit.deleteMany();
    await prisma.lesson.deleteMany();
    await prisma.class.deleteMany();
    await prisma.session.deleteMany();
    await prisma.account.deleteMany();
    await prisma.user.deleteMany();
  });

  describe('Authentication', () => {
    it('should return 401 when not authenticated', async () => {
      mockCookies.get.mockReturnValue(undefined);

      const request = new NextRequest(`http://localhost:3000/api/lessons/${testLesson.id}/quiz/submit`, {
        method: 'POST',
        body: JSON.stringify({
          attemptId,
          responses: [],
        }),
      });
      const response = await POST(request, { params: Promise.resolve({ lessonSlug: testLesson.id }) });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Authentication required');
    });
  });

  describe('Authorization', () => {
    it('should prevent student from submitting another student\'s attempt', async () => {
      const session = await createSession(otherStudent.id);
      mockCookies.get.mockReturnValue({ value: session.token });

      const request = new NextRequest(`http://localhost:3000/api/lessons/${testLesson.id}/quiz/submit`, {
        method: 'POST',
        body: JSON.stringify({
          attemptId,
          responses: [],
        }),
      });
      const response = await POST(request, { params: Promise.resolve({ lessonSlug: testLesson.id }) });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('Not authorized to submit this attempt');
    });
  });

  describe('Validation', () => {
    it('should return 400 if responses are missing', async () => {
      const session = await createSession(testStudent.id);
      mockCookies.get.mockReturnValue({ value: session.token });

      const request = new NextRequest(`http://localhost:3000/api/lessons/${testLesson.id}/quiz/submit`, {
        method: 'POST',
        body: JSON.stringify({
          attemptId,
          responses: [],
        }),
      });
      const response = await POST(request, { params: Promise.resolve({ lessonSlug: testLesson.id }) });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('All questions must be answered');
    });

    it('should return 404 for non-existent attempt', async () => {
      const session = await createSession(testStudent.id);
      mockCookies.get.mockReturnValue({ value: session.token });

      const request = new NextRequest(`http://localhost:3000/api/lessons/${testLesson.id}/quiz/submit`, {
        method: 'POST',
        body: JSON.stringify({
          attemptId: 'non-existent-attempt',
          responses: [
            {
              questionId: quizQuestions[0].id,
              studentAnswer: 'Observe',
              timeSpentSeconds: 30,
              answeredAt: new Date().toISOString(),
              order: 1,
            },
          ],
        }),
      });
      const response = await POST(request, { params: Promise.resolve({ lessonSlug: testLesson.id }) });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Attempt not found');
    });

    it('should return 409 if attempt already submitted', async () => {
      // Mark attempt as completed
      await prisma.attempt.update({
        where: { id: attemptId },
        data: { completedAt: new Date(), score: 3 },
      });

      const session = await createSession(testStudent.id);
      mockCookies.get.mockReturnValue({ value: session.token });

      const request = new NextRequest(`http://localhost:3000/api/lessons/${testLesson.id}/quiz/submit`, {
        method: 'POST',
        body: JSON.stringify({
          attemptId,
          responses: quizQuestions.map((q, i) => ({
            questionId: q.id,
            studentAnswer: 'Observe',
            timeSpentSeconds: 30,
            answeredAt: new Date().toISOString(),
            order: i + 1,
          })),
        }),
      });
      const response = await POST(request, { params: Promise.resolve({ lessonSlug: testLesson.id }) });
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.error).toBe('Attempt already submitted');
    });
  });

  describe('Auto-Grading', () => {
    it('should correctly grade all correct answers', async () => {
      const session = await createSession(testStudent.id);
      mockCookies.get.mockReturnValue({ value: session.token });

      const request = new NextRequest(`http://localhost:3000/api/lessons/${testLesson.id}/quiz/submit`, {
        method: 'POST',
        body: JSON.stringify({
          attemptId,
          responses: [
            {
              questionId: quizQuestions[0].id,
              studentAnswer: 'Observe',
              timeSpentSeconds: 30,
              answeredAt: new Date().toISOString(),
              order: 1,
            },
            {
              questionId: quizQuestions[1].id,
              studentAnswer: 'Predict',
              timeSpentSeconds: 25,
              answeredAt: new Date().toISOString(),
              order: 2,
            },
            {
              questionId: quizQuestions[2].id,
              studentAnswer: 'Test',
              timeSpentSeconds: 20,
              answeredAt: new Date().toISOString(),
              order: 3,
            },
          ],
        }),
      });
      const response = await POST(request, { params: Promise.resolve({ lessonSlug: testLesson.id }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.score).toBe(3);
      expect(data.maxScore).toBe(3);
      expect(data.percentage).toBeCloseTo(100, 2);
      expect(data.breakdown).toHaveLength(3);
      expect(data.breakdown.every((b: any) => b.isCorrect)).toBe(true);
    });

    it('should correctly grade mixed correct and incorrect answers', async () => {
      const session = await createSession(testStudent.id);
      mockCookies.get.mockReturnValue({ value: session.token });

      const request = new NextRequest(`http://localhost:3000/api/lessons/${testLesson.id}/quiz/submit`, {
        method: 'POST',
        body: JSON.stringify({
          attemptId,
          responses: [
            {
              questionId: quizQuestions[0].id,
              studentAnswer: 'Observe', // Correct
              timeSpentSeconds: 30,
              answeredAt: new Date().toISOString(),
              order: 1,
            },
            {
              questionId: quizQuestions[1].id,
              studentAnswer: 'Wrong', // Incorrect
              timeSpentSeconds: 25,
              answeredAt: new Date().toISOString(),
              order: 2,
            },
            {
              questionId: quizQuestions[2].id,
              studentAnswer: 'Test', // Correct
              timeSpentSeconds: 20,
              answeredAt: new Date().toISOString(),
              order: 3,
            },
          ],
        }),
      });
      const response = await POST(request, { params: Promise.resolve({ lessonSlug: testLesson.id }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.score).toBe(2);
      expect(data.maxScore).toBe(3);
      expect(data.percentage).toBeCloseTo(66.67, 1);
      expect(data.breakdown.filter((b: any) => b.isCorrect)).toHaveLength(2);
      expect(data.breakdown.filter((b: any) => !b.isCorrect)).toHaveLength(1);
    });
  });

  describe('Database Records', () => {
    it('should create QuestionResponse records', async () => {
      const session = await createSession(testStudent.id);
      mockCookies.get.mockReturnValue({ value: session.token });

      const request = new NextRequest(`http://localhost:3000/api/lessons/${testLesson.id}/quiz/submit`, {
        method: 'POST',
        body: JSON.stringify({
          attemptId,
          responses: quizQuestions.map((q, i) => ({
            questionId: q.id,
            studentAnswer: 'Observe',
            timeSpentSeconds: 30 + i,
            answeredAt: new Date().toISOString(),
            order: i + 1,
          })),
        }),
      });
      const response = await POST(request, { params: Promise.resolve({ lessonSlug: testLesson.id }) });

      expect(response.status).toBe(200);

      const responses = await prisma.questionResponse.findMany({
        where: { attemptId },
      });
      expect(responses).toHaveLength(3);
      responses.forEach(r => {
        expect(r.timeSpentSeconds).toBeGreaterThan(0);
        expect(r.order).toBeDefined();
      });
    });

    it('should update attempt with score and completedAt', async () => {
      const session = await createSession(testStudent.id);
      mockCookies.get.mockReturnValue({ value: session.token });

      const request = new NextRequest(`http://localhost:3000/api/lessons/${testLesson.id}/quiz/submit`, {
        method: 'POST',
        body: JSON.stringify({
          attemptId,
          responses: quizQuestions.map((q, i) => ({
            questionId: q.id,
            studentAnswer: 'Observe',
            timeSpentSeconds: 30,
            answeredAt: new Date().toISOString(),
            order: i + 1,
          })),
        }),
      });
      await POST(request, { params: Promise.resolve({ lessonSlug: testLesson.id }) });

      const attempt = await prisma.attempt.findUnique({
        where: { id: attemptId },
      });
      expect(attempt?.completedAt).toBeDefined();
      expect(attempt?.score).toBeDefined();
    });

    it('should create or update LessonCompletion record', async () => {
      const session = await createSession(testStudent.id);
      mockCookies.get.mockReturnValue({ value: session.token });

      const request = new NextRequest(`http://localhost:3000/api/lessons/${testLesson.id}/quiz/submit`, {
        method: 'POST',
        body: JSON.stringify({
          attemptId,
          responses: quizQuestions.map((q, i) => ({
            questionId: q.id,
            studentAnswer: i === 0 ? 'Observe' : 'Wrong', // 1 correct out of 3
            timeSpentSeconds: 30,
            answeredAt: new Date().toISOString(),
            order: i + 1,
          })),
        }),
      });
      const response = await POST(request, { params: Promise.resolve({ lessonSlug: testLesson.id }) });
      const data = await response.json();

      expect(response.status).toBe(200);

      const completion = await prisma.lessonCompletion.findUnique({
        where: {
          studentId_lessonId: {
            studentId: testStudent.id,
            lessonId: testLesson.id,
          },
        },
      });
      expect(completion).toBeDefined();
      expect(completion?.attemptsCount).toBe(1);
      expect(completion?.mostRecentScore).toBe(data.score);
      expect(completion?.mostRecentScorePercentage).toBeCloseTo(data.percentage, 2);
    });

    it('should update best score on multiple attempts', async () => {
      // First attempt with low score
      const session = await createSession(testStudent.id);
      mockCookies.get.mockReturnValue({ value: session.token });

      let request = new NextRequest(`http://localhost:3000/api/lessons/${testLesson.id}/quiz/submit`, {
        method: 'POST',
        body: JSON.stringify({
          attemptId,
          responses: quizQuestions.map((q, i) => ({
            questionId: q.id,
            studentAnswer: 'Wrong',
            timeSpentSeconds: 30,
            answeredAt: new Date().toISOString(),
            order: i + 1,
          })),
        }),
      });
      await POST(request, { params: Promise.resolve({ lessonSlug: testLesson.id }) });

      // Second attempt with high score
      const attempt2 = await prisma.attempt.create({
        data: {
          studentId: testStudent.id,
          lessonId: testLesson.id,
          maxScore: 3,
          attemptNumber: 2,
          startedAt: new Date(),
        },
      });

      request = new NextRequest(`http://localhost:3000/api/lessons/${testLesson.id}/quiz/submit`, {
        method: 'POST',
        body: JSON.stringify({
          attemptId: attempt2.id,
          responses: quizQuestions.map((q, i) => ({
            questionId: q.id,
            studentAnswer: ['Observe', 'Predict', 'Test'][i],
            timeSpentSeconds: 30,
            answeredAt: new Date().toISOString(),
            order: i + 1,
          })),
        }),
      });
      await POST(request, { params: Promise.resolve({ lessonSlug: testLesson.id }) });

      const completion = await prisma.lessonCompletion.findUnique({
        where: {
          studentId_lessonId: {
            studentId: testStudent.id,
            lessonId: testLesson.id,
          },
        },
      });
      expect(completion?.bestScore).toBe(3);
      expect(completion?.bestScorePercentage).toBeCloseTo(100, 2);
      expect(completion?.attemptsCount).toBe(2);
    });
  });

  describe('Response Format', () => {
    it('should return all required fields in response', async () => {
      const session = await createSession(testStudent.id);
      mockCookies.get.mockReturnValue({ value: session.token });

      const request = new NextRequest(`http://localhost:3000/api/lessons/${testLesson.id}/quiz/submit`, {
        method: 'POST',
        body: JSON.stringify({
          attemptId,
          responses: quizQuestions.map((q, i) => ({
            questionId: q.id,
            studentAnswer: 'Observe',
            timeSpentSeconds: 30,
            answeredAt: new Date().toISOString(),
            order: i + 1,
          })),
        }),
      });
      const response = await POST(request, { params: Promise.resolve({ lessonSlug: testLesson.id }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('attemptId');
      expect(data).toHaveProperty('score');
      expect(data).toHaveProperty('maxScore');
      expect(data).toHaveProperty('percentage');
      expect(data).toHaveProperty('attemptNumber');
      expect(data).toHaveProperty('completedAt');
      expect(data).toHaveProperty('breakdown');

      const breakdownItem = data.breakdown[0];
      expect(breakdownItem).toHaveProperty('questionId');
      expect(breakdownItem).toHaveProperty('questionText');
      expect(breakdownItem).toHaveProperty('studentAnswer');
      expect(breakdownItem).toHaveProperty('correctAnswer');
      expect(breakdownItem).toHaveProperty('isCorrect');
      expect(breakdownItem).toHaveProperty('points');
      expect(breakdownItem).toHaveProperty('timeSpentSeconds');
    });
  });
});
