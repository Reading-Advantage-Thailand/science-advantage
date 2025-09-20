import { Role } from "@prisma/client";

import { GET, POST } from "@/app/api/lessons/[slug]/completion/route";
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
    classEnrollment: {
      findFirst: vi.fn(),
    },
    lessonCompletion: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}));

describe("Lesson completion route", () => {
  const session = {
    user: {
      id: "student-1",
      role: Role.STUDENT,
      email: "student@example.com",
      name: "Student One",
    },
  };

  beforeEach(() => {
    vi.resetAllMocks();
    (getServerAuthSession as vi.Mock).mockResolvedValue(session);

    (prisma.lesson.findUnique as vi.Mock).mockResolvedValue({
      id: "lesson-1",
      title: "Lesson title",
      summary: null,
      content: "content",
    });

    (prisma.classEnrollment.findFirst as vi.Mock).mockResolvedValue({
      classId: "class-1",
      class: {
        id: "class-1",
        name: "NGSS Cohort",
      },
    });

  });

  it("returns lesson data and completion state", async () => {
    const completedAt = new Date("2024-01-01T00:00:00.000Z");

    (prisma.lessonCompletion.findUnique as vi.Mock).mockResolvedValue({
      completedAt,
    });

    const response = await GET(new Request("http://localhost/api"), {
      params: { slug: "lesson-1" },
    });

    expect(response.status).toBe(200);

    const payload = await response.json();

    expect(payload.lesson.title).toBe("Lesson title");
    expect(payload.classContext).toEqual({ id: "class-1", name: "NGSS Cohort" });
    expect(payload.completion).toEqual({
      completed: true,
      completedAt: completedAt.toISOString(),
    });
  });

  it("creates a completion when toggled on", async () => {
    const completedAt = new Date("2024-05-01T12:00:00.000Z");

    (prisma.lesson.findUnique as vi.Mock).mockResolvedValueOnce({ id: "lesson-1" });
    (prisma.lessonCompletion.upsert as vi.Mock).mockResolvedValue({
      completedAt,
    });

    const response = await POST(
      new Request("http://localhost/api", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ completed: true, classId: "class-1" }),
      }),
      {
        params: { slug: "lesson-1" },
      }
    );

    expect(prisma.lessonCompletion.upsert).toHaveBeenCalledWith({
      where: {
        lessonId_studentId_classId: {
          lessonId: "lesson-1",
          studentId: "student-1",
          classId: "class-1",
        },
      },
      create: {
        lessonId: "lesson-1",
        studentId: "student-1",
        classId: "class-1",
      },
      update: {
        completedAt: expect.any(Date),
      },
      select: {
        completedAt: true,
      },
    });

    expect(response.status).toBe(200);

    const payload = await response.json();

    expect(payload.completion.completed).toBe(true);
    expect(payload.classContext).toEqual({ id: "class-1", name: "NGSS Cohort" });
  });

  it("removes a completion when toggled off", async () => {
    (prisma.lesson.findUnique as vi.Mock).mockResolvedValueOnce({ id: "lesson-1" });

    const response = await POST(
      new Request("http://localhost/api", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ completed: false, classId: "class-1" }),
      }),
      {
        params: { slug: "lesson-1" },
      }
    );

    expect(prisma.lessonCompletion.deleteMany).toHaveBeenCalledWith({
      where: {
        lessonId: "lesson-1",
        studentId: "student-1",
        classId: "class-1",
      },
    });

    expect(response.status).toBe(200);

    const payload = await response.json();

    expect(payload.completion.completed).toBe(false);
    expect(payload.classContext).toEqual({ id: "class-1", name: "NGSS Cohort" });
  });

  it("returns an error when no class context is found", async () => {
    (prisma.classEnrollment.findFirst as vi.Mock).mockResolvedValueOnce(null);

    const response = await POST(
      new Request("http://localhost/api", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ completed: true }),
      }),
      {
        params: { slug: "lesson-1" },
      }
    );

    expect(response.status).toBe(400);

    const payload = await response.json();

    expect(payload.error).toBe("No class context for completion");
  });
});
