import { Role } from "@prisma/client";

import { GET, POST } from "@/app/api/lessons/[slug]/quiz/route";
import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/auth", () => ({
  getServerAuthSession: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    lesson: {
      findUnique: vi.fn(),
    },
    quizQuestion: {
      findMany: vi.fn(),
    },
    classEnrollment: {
      findFirst: vi.fn(),
    },
    attempt: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
  },
}));

describe("Lesson quiz route", () => {
  const session = {
    user: {
      id: "student-1",
      role: Role.STUDENT,
      email: "student@example.com",
    },
  };

  beforeEach(() => {
    vi.resetAllMocks();

    (getServerAuthSession as vi.Mock).mockResolvedValue(session);

    (prisma.lesson.findUnique as vi.Mock).mockResolvedValue({
      id: "lesson-1",
      title: "Earth systems",
      summary: "",
    });

    (prisma.classEnrollment.findFirst as vi.Mock).mockResolvedValue({
      class: {
        id: "class-1",
        name: "NGSS Cohort",
      },
    });

    (prisma.quizQuestion.findMany as vi.Mock).mockResolvedValue([]);
    (prisma.attempt.findFirst as vi.Mock).mockResolvedValue(null);
  });

  it("returns quiz questions and latest attempt", async () => {
    const completedAt = new Date("2024-01-01T00:00:00.000Z");
    const createdAt = new Date("2023-12-31T23:55:00.000Z");

    (prisma.quizQuestion.findMany as vi.Mock).mockResolvedValue([
      {
        id: "q1",
        order: 1,
        prompt: "Prompt",
        options: ["A", "B"],
      },
    ]);

    (prisma.attempt.findFirst as vi.Mock).mockResolvedValue({
      id: "attempt-1",
      score: 1,
      maxScore: 1,
      responses: [
        {
          questionId: "q1",
          selectedOption: "A",
          correctAnswer: "A",
          isCorrect: true,
        },
      ],
      completedAt,
      createdAt,
    });

    const response = await GET(new Request("http://localhost/api"), {
      params: { slug: "lesson-1" },
    });

    expect(response.status).toBe(200);

    const payload = await response.json();

    expect(payload.lesson.title).toBe("Earth systems");
    expect(payload.questions).toHaveLength(1);
    expect(payload.latestAttempt).toMatchObject({
      id: "attempt-1",
      score: 1,
      maxScore: 1,
    });
  });

  it("scores a quiz submission and persists an attempt", async () => {
    (prisma.quizQuestion.findMany as vi.Mock).mockResolvedValue([
      {
        id: "q1",
        prompt: "Prompt 1",
        options: ["A", "B"],
        answer: "A",
      },
      {
        id: "q2",
        prompt: "Prompt 2",
        options: ["A", "B"],
        answer: "B",
      },
    ]);

    (prisma.attempt.create as vi.Mock).mockResolvedValue({
      id: "attempt-2",
      score: 1,
      maxScore: 2,
      responses: [
        {
          questionId: "q1",
          selectedOption: "A",
          correctAnswer: "A",
          isCorrect: true,
        },
        {
          questionId: "q2",
          selectedOption: "A",
          correctAnswer: "B",
          isCorrect: false,
        },
      ],
      completedAt: new Date("2024-01-01T00:05:00.000Z"),
      createdAt: new Date("2024-01-01T00:05:00.000Z"),
    });

    const response = await POST(
      new Request("http://localhost/api", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          responses: {
            q1: "A",
            q2: "A",
          },
        }),
      }),
      {
        params: { slug: "lesson-1" },
      }
    );

    expect(prisma.attempt.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          studentId: "student-1",
          lessonId: "lesson-1",
          score: 1,
          maxScore: 2,
        }),
      })
    );

    expect(response.status).toBe(200);

    const payload = await response.json();

    expect(payload.attempt).toMatchObject({
      id: "attempt-2",
      score: 1,
      maxScore: 2,
    });
  });

  it("validates the responses payload", async () => {
    (prisma.quizQuestion.findMany as vi.Mock).mockResolvedValue([
      {
        id: "q1",
        prompt: "Prompt 1",
        options: ["A", "B"],
        answer: "A",
      },
    ]);

    const response = await POST(
      new Request("http://localhost/api", {
        method: "POST",
        body: JSON.stringify({ responses: null }),
      }),
      {
        params: { slug: "lesson-1" },
      }
    );

    expect(response.status).toBe(400);
  });

  it("rejects quiz access for non-enrolled students", async () => {
    (prisma.classEnrollment.findFirst as vi.Mock).mockResolvedValueOnce(null);

    const response = await GET(new Request("http://localhost/api"), {
      params: { slug: "lesson-1" },
    });

    expect(response.status).toBe(403);
  });

  it("rejects quiz access for teachers", async () => {
    (getServerAuthSession as vi.Mock).mockResolvedValueOnce({
      user: { id: "teacher-1", role: Role.TEACHER },
    });

    const response = await GET(new Request("http://localhost/api"), {
      params: { slug: "lesson-1" },
    });

    expect(response.status).toBe(403);
  });
});
