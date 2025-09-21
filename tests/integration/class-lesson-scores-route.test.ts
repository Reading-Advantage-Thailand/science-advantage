import { Role } from "@prisma/client";

import { GET } from "@/app/api/classes/[classId]/lessons/[slug]/scores/route";
import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/auth", () => ({
  getServerAuthSession: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    class: {
      findUnique: vi.fn(),
    },
    lesson: {
      findUnique: vi.fn(),
    },
    classEnrollment: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
    },
    attempt: {
      findMany: vi.fn(),
    },
  },
}));

describe("Class lesson scores route", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("requires teacher ownership or membership", async () => {
    (getServerAuthSession as vi.Mock).mockResolvedValue({
      user: { id: "student-2", role: Role.STUDENT },
    });

    (prisma.class.findUnique as vi.Mock).mockResolvedValue({
      id: "class-1",
      name: "NGSS Cohort",
      teacherId: "teacher-1",
    });

    (prisma.classEnrollment.findFirst as vi.Mock).mockResolvedValue(null);

    const response = await GET(new Request("http://localhost/api"), {
      params: { classId: "class-1", slug: "lesson-1" },
    });

    expect(response.status).toBe(401);
  });

  it("returns latest attempt per student", async () => {
    (getServerAuthSession as vi.Mock).mockResolvedValue({
      user: { id: "teacher-1", role: Role.TEACHER },
    });

    (prisma.class.findUnique as vi.Mock).mockResolvedValue({
      id: "class-1",
      name: "NGSS Cohort",
      teacherId: "teacher-1",
    });

    (prisma.lesson.findUnique as vi.Mock).mockResolvedValue({
      id: "lesson-1",
      title: "Earth systems",
    });

    (prisma.classEnrollment.findMany as vi.Mock).mockResolvedValue([
      {
        student: {
          id: "student-1",
          name: "Avery",
          email: "avery@example.com",
        },
      },
      {
        student: {
          id: "student-2",
          name: "Jordan",
          email: "jordan@example.com",
        },
      },
    ]);

    (prisma.attempt.findMany as vi.Mock).mockResolvedValue([
      {
        id: "attempt-1",
        studentId: "student-1",
        score: 4,
        maxScore: 5,
        completedAt: new Date("2024-01-02T00:00:00.000Z"),
        createdAt: new Date("2024-01-02T00:00:00.000Z"),
      },
      {
        id: "attempt-older",
        studentId: "student-1",
        score: 3,
        maxScore: 5,
        completedAt: new Date("2024-01-01T00:00:00.000Z"),
        createdAt: new Date("2024-01-01T00:00:00.000Z"),
      },
      {
        id: "attempt-2",
        studentId: "student-2",
        score: 5,
        maxScore: 5,
        completedAt: new Date("2024-01-03T00:00:00.000Z"),
        createdAt: new Date("2024-01-03T00:00:00.000Z"),
      },
    ]);

    const response = await GET(new Request("http://localhost/api"), {
      params: { classId: "class-1", slug: "lesson-1" },
    });

    expect(response.status).toBe(200);

    const payload = await response.json();

    expect(payload.students).toEqual([
      {
        studentId: "student-1",
        name: "Avery",
        email: "avery@example.com",
        score: 4,
        maxScore: 5,
        completedAt: new Date("2024-01-02T00:00:00.000Z").toISOString(),
      },
      {
        studentId: "student-2",
        name: "Jordan",
        email: "jordan@example.com",
        score: 5,
        maxScore: 5,
        completedAt: new Date("2024-01-03T00:00:00.000Z").toISOString(),
      },
    ]);
  });
});
