import { Role } from "@prisma/client";

import { GET as getLessonCompletion, POST } from "@/app/api/lessons/[slug]/completion/route";
import { GET as getClassCompletions } from "@/app/api/classes/[classId]/lessons/[slug]/completions/route";
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
      findMany: vi.fn(),
    },
    lessonCompletion: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
      deleteMany: vi.fn(),
      findMany: vi.fn(),
    },
    class: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

describe("Lesson completion end-to-end", () => {
  const db = {
    lessons: [
      {
        id: "lesson-1",
        slug: "lesson-1-earth-systems-overview",
        title: "Lesson 1",
        summary: "",
        content: "content",
      },
    ],
    classes: [
      {
        id: "class-1",
        name: "NGSS Cohort",
        teacherId: "teacher-1",
      },
    ],
    enrollments: [
      {
        classId: "class-1",
        studentId: "student-1",
        createdAt: new Date("2024-01-01T00:00:00.000Z"),
      },
    ],
    completions: [] as Array<{
      lessonId: string;
      studentId: string;
      classId: string;
      completedAt: Date;
    }>,
  };

  beforeEach(() => {
    db.completions.length = 0;

    (prisma.lesson.findUnique as vi.Mock).mockImplementation(async ({ where }: { where: { slug: string } }) =>
      db.lessons.find((lesson) => lesson.slug === where.slug) ?? null
    );

    (prisma.classEnrollment.findFirst as vi.Mock).mockImplementation(
      async ({ where }: { where: { studentId: string; classId?: string } }) => {
        const enrollment = db.enrollments.find((entry) => {
          if (where.classId) {
            return entry.studentId === where.studentId && entry.classId === where.classId;
          }

          return entry.studentId === where.studentId;
        });

        if (!enrollment) {
          return null;
        }

        const classroom = db.classes.find((klass) => klass.id === enrollment.classId);

        if (!classroom) {
          return null;
        }

        return {
          classId: enrollment.classId,
          class: {
            id: classroom.id,
            name: classroom.name,
          },
        };
      }
    );

    (prisma.lessonCompletion.findUnique as vi.Mock).mockImplementation(
      async ({ where }: { where: { lessonId_studentId_classId: { lessonId: string; studentId: string; classId: string } } }) =>
        db.completions.find(
          (completion) =>
            completion.lessonId === where.lessonId_studentId_classId.lessonId &&
            completion.studentId === where.lessonId_studentId_classId.studentId &&
            completion.classId === where.lessonId_studentId_classId.classId
        ) ?? null
    );

    (prisma.lessonCompletion.upsert as vi.Mock).mockImplementation(
      async ({ where, create }: { where: { lessonId_studentId_classId: { lessonId: string; studentId: string; classId: string } }; create: { lessonId: string; studentId: string; classId: string } }) => {
        let existing = db.completions.find(
          (completion) =>
            completion.lessonId === where.lessonId_studentId_classId.lessonId &&
            completion.studentId === where.lessonId_studentId_classId.studentId &&
            completion.classId === where.lessonId_studentId_classId.classId
        );

        if (!existing) {
          existing = {
            lessonId: create.lessonId,
            studentId: create.studentId,
            classId: create.classId,
            completedAt: new Date(),
          };
          db.completions.push(existing);
        } else {
          existing.completedAt = new Date();
        }

        return { completedAt: existing.completedAt };
      }
    );

    (prisma.lessonCompletion.deleteMany as vi.Mock).mockImplementation(
      async ({ where }: { where: { lessonId: string; studentId: string; classId: string } }) => {
        const before = db.completions.length;
        db.completions = db.completions.filter(
          (completion) =>
            !(
              completion.lessonId === where.lessonId &&
              completion.studentId === where.studentId &&
              completion.classId === where.classId
            )
        );

        return { count: before - db.completions.length };
      }
    );

    (prisma.class.findFirst as vi.Mock).mockImplementation(
      async ({ where }: { where: { id: string; teacherId: string } }) =>
        db.classes.find((klass) => klass.id === where.id && klass.teacherId === where.teacherId) ?? null
    );

    (prisma.class.findUnique as vi.Mock).mockImplementation(
      async ({ where }: { where: { id: string } }) =>
        db.classes.find((klass) => klass.id === where.id) ?? null
    );

    (prisma.classEnrollment.findMany as vi.Mock).mockImplementation(
      async ({ where }: { where: { classId: string } }) =>
        db.enrollments
          .filter((enrollment) => enrollment.classId === where.classId)
          .map((enrollment) => {
            const student = enrollment.studentId === "student-1"
              ? { id: "student-1", name: "Avery", email: "avery@example.com" }
              : { id: enrollment.studentId, name: `Student ${enrollment.studentId}`, email: `${enrollment.studentId}@example.com` };

            return { student };
          })
    );

    (prisma.lessonCompletion.findMany as vi.Mock).mockImplementation(
      async ({ where }: { where: { classId: string; lessonId: string } }) =>
        db.completions.filter(
          (completion) => completion.classId === where.classId && completion.lessonId === where.lessonId
        )
    );
  });

  it("persists student completion and surfaces it to the teacher", async () => {
    (getServerAuthSession as vi.Mock).mockResolvedValue({
      user: { id: "student-1", role: Role.STUDENT },
    });

    const initialStudentView = await getLessonCompletion(new Request("http://localhost/api"), {
      params: { slug: "lesson-1-earth-systems-overview" },
    });

    expect(db.completions).toHaveLength(0);

    const initialPayload = await initialStudentView.json();
    expect(initialPayload.completion.completed).toBe(false);

    await POST(
      new Request("http://localhost/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: true, classId: "class-1" }),
      }),
      {
        params: { slug: "lesson-1-earth-systems-overview" },
      }
    );

    expect(db.completions).toHaveLength(1);

    (getServerAuthSession as vi.Mock).mockResolvedValue({
      user: { id: "teacher-1", role: Role.TEACHER },
    });

    const teacherView = await getClassCompletions(new Request("http://localhost/api"), {
      params: { classId: "class-1", slug: "lesson-1-earth-systems-overview" },
    });

    const teacherPayload = await teacherView.json();

    expect(teacherPayload.students).toEqual([
      {
        studentId: "student-1",
        name: "Avery",
        email: "avery@example.com",
        completed: true,
        completedAt: expect.any(String),
      },
    ]);
  });
});
