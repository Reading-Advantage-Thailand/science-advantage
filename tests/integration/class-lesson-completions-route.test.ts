import { Role } from "@prisma/client";

import { GET } from "@/app/api/classes/[classId]/lessons/[slug]/completions/route";
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
      findMany: vi.fn(),
      findFirst: vi.fn(),
    },
    lessonCompletion: {
      findMany: vi.fn(),
    },
  },
}));

describe("Class lesson completions route", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("requires a teacher session", async () => {
    (getServerAuthSession as vi.Mock).mockResolvedValue({
      user: { id: "student-1", role: Role.STUDENT },
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

  it("returns aggregated completion data", async () => {
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

    (prisma.classEnrollment.findFirst as vi.Mock).mockResolvedValue({ id: "enroll-1" });

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

    (prisma.lessonCompletion.findMany as vi.Mock).mockResolvedValue([
      {
        studentId: "student-2",
        completedAt: new Date("2024-01-02T00:00:00.000Z"),
      },
    ]);

    const response = await GET(new Request("http://localhost/api"), {
      params: { classId: "class-1", slug: "lesson-1" },
    });

    expect(response.status).toBe(200);

    const payload = await response.json();

    expect(payload.class.name).toBe("NGSS Cohort");
    expect(payload.lesson.title).toBe("Earth systems");
    expect(payload.students).toEqual([
      {
        studentId: "student-1",
        name: "Avery",
        email: "avery@example.com",
        completed: false,
        completedAt: null,
      },
      {
        studentId: "student-2",
        name: "Jordan",
        email: "jordan@example.com",
        completed: true,
        completedAt: new Date("2024-01-02T00:00:00.000Z").toISOString(),
      },
    ]);
  });
});
