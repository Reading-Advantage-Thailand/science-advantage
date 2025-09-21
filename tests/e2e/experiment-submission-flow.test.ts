import { LessonType, Role } from "@prisma/client";

import { GET as getStudentSubmission, POST as saveStudentSubmission } from "@/app/api/lessons/[slug]/experiment-submissions/route";
import { GET as getClassSubmissions } from "@/app/api/classes/[classId]/lessons/[slug]/experiment-submissions/route";
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
    experimentSubmission: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
      findMany: vi.fn(),
    },
    class: {
      findUnique: vi.fn(),
    },
  },
}));

describe("Experiment submission flow", () => {
  const db = {
    lesson: {
      id: "lesson-experiment",
      slug: "investigation-designing-a-mini-greenhouse",
      type: LessonType.EXPERIMENT,
      title: "Investigation",
    },
    class: {
      id: "class-1",
      name: "NGSS Cohort",
      teacherId: "teacher-1",
    },
    enrollment: {
      classId: "class-1",
      studentId: "student-1",
    },
    submissions: [] as Array<{
      lessonId: string;
      studentId: string;
      classId: string;
      data: {
        teamName: string;
        variableTested: string;
        initialTemperatureC: number;
        finalTemperatureC: number;
        observations: string;
      };
      submittedAt: Date;
    }>,
  };

  beforeEach(() => {
    db.submissions.length = 0;

    (prisma.lesson.findUnique as vi.Mock).mockImplementation(async ({ where }: { where: { slug: string } }) =>
      where.slug === db.lesson.slug ? db.lesson : null
    );

    (prisma.classEnrollment.findFirst as vi.Mock).mockImplementation(async ({ where }: { where: { studentId: string; classId?: string } }) => {
      if (where.studentId !== db.enrollment.studentId) {
        return null;
      }

      if (where.classId && where.classId !== db.enrollment.classId) {
        return null;
      }

      return {
        class: {
          id: db.class.id,
          name: db.class.name,
        },
      };
    });

    (prisma.experimentSubmission.findUnique as vi.Mock).mockImplementation(async ({ where }: { where: { lessonId_studentId_classId: { lessonId: string; studentId: string; classId: string } } }) =>
      db.submissions.find(
        (submission) =>
          submission.lessonId === where.lessonId_studentId_classId.lessonId &&
          submission.studentId === where.lessonId_studentId_classId.studentId &&
          submission.classId === where.lessonId_studentId_classId.classId
      ) ?? null
    );

    (prisma.experimentSubmission.upsert as vi.Mock).mockImplementation(
      async ({ where, create, update }: { where: { lessonId_studentId_classId: { lessonId: string; studentId: string; classId: string } }; create: typeof db.submissions[number]; update: { data: typeof create.data; submittedAt: Date } }) => {
        let submission = db.submissions.find(
          (entry) =>
            entry.lessonId === where.lessonId_studentId_classId.lessonId &&
            entry.studentId === where.lessonId_studentId_classId.studentId &&
            entry.classId === where.lessonId_studentId_classId.classId
        );

        if (!submission) {
          submission = {
            lessonId: create.lessonId,
            classId: create.classId,
            studentId: create.studentId,
            data: create.data,
            submittedAt: new Date(),
          };
          db.submissions.push(submission);
        } else {
          submission.data = update.data;
          submission.submittedAt = update.submittedAt;
        }

        return {
          data: submission.data,
          submittedAt: submission.submittedAt,
        };
      }
    );

    (prisma.class.findUnique as vi.Mock).mockImplementation(async ({ where }: { where: { id: string } }) =>
      where.id === db.class.id ? db.class : null
    );

    (prisma.experimentSubmission.findMany as vi.Mock).mockImplementation(async ({ where }: { where: { classId: string; lessonId: string } }) =>
      db.submissions
        .filter(
          (submission) => submission.classId === where.classId && submission.lessonId === where.lessonId
        )
        .map((submission) => ({
          ...submission,
          student: {
            id: db.enrollment.studentId,
            name: "Avery",
            email: "avery@example.com",
          },
        }))
    );
  });

  it("updates submissions and exposes CSV export for teachers", async () => {
    (getServerAuthSession as vi.Mock).mockResolvedValue({
      user: { id: "student-1", role: Role.STUDENT },
    });

    const initialResponse = await getStudentSubmission(new Request("http://localhost/api"), {
      params: { slug: db.lesson.slug },
    });

    const initialPayload = await initialResponse.json();
    expect(initialPayload.submission).toBeNull();

    await saveStudentSubmission(
      new Request("http://localhost/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId: db.class.id,
          data: {
            teamName: "Team Sun",
            variableTested: "Cover material",
            initialTemperatureC: 21.5,
            finalTemperatureC: 29.2,
            observations: "Observation",
          },
        }),
      }),
      {
        params: { slug: db.lesson.slug },
      }
    );

    expect(db.submissions).toHaveLength(1);

    (getServerAuthSession as vi.Mock).mockResolvedValue({
      user: { id: "teacher-1", role: Role.TEACHER },
    });

    const teacherResponse = await getClassSubmissions(new Request("http://localhost/api"), {
      params: { classId: db.class.id, slug: db.lesson.slug },
    });

    expect(teacherResponse.status).toBe(200);
    const teacherPayload = await teacherResponse.json();
    expect(teacherPayload.submissions[0].data.teamName).toBe("Team Sun");

    const csvResponse = await getClassSubmissions(
      new Request("http://localhost/api?format=csv"),
      {
        params: { classId: db.class.id, slug: db.lesson.slug },
      }
    );

    expect(csvResponse.status).toBe(200);
    const csv = await csvResponse.text();
    expect(csv).toContain("Team Sun");
  });
});
