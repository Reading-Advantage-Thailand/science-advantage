import { LessonType, Role } from "@prisma/client";

import { GET, POST } from "@/app/api/lessons/[slug]/experiment-submissions/route";
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
    },
  },
}));

describe("Experiment submission route", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("requires authentication", async () => {
    (getServerAuthSession as vi.Mock).mockResolvedValue(null);

    const response = await GET(new Request("http://localhost/api"), {
      params: { slug: "investigation-designing-a-mini-greenhouse" },
    });

    expect(response.status).toBe(401);
  });

  it("returns submission for enrolled student", async () => {
    (getServerAuthSession as vi.Mock).mockResolvedValue({
      user: { id: "student-1", role: Role.STUDENT },
    });

    (prisma.lesson.findUnique as vi.Mock).mockResolvedValue({
      id: "lesson-experiment",
      type: LessonType.EXPERIMENT,
    });

    (prisma.classEnrollment.findFirst as vi.Mock).mockResolvedValue({
      class: {
        id: "class-1",
        name: "NGSS Cohort",
      },
    });

    (prisma.experimentSubmission.findUnique as vi.Mock).mockResolvedValue({
      data: {
        teamName: "Team Sun",
        variableTested: "Cover material",
        initialTemperatureC: 21.5,
        finalTemperatureC: 29.1,
        observations: "Observation",
      },
      submittedAt: new Date("2024-01-01T00:00:00.000Z"),
    });

    const response = await GET(new Request("http://localhost/api"), {
      params: { slug: "investigation-designing-a-mini-greenhouse" },
    });

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.classContext).toEqual({ id: "class-1", name: "NGSS Cohort" });
    expect(payload.submission.data.teamName).toBe("Team Sun");
  });

  it("saves student submission", async () => {
    (getServerAuthSession as vi.Mock).mockResolvedValue({
      user: { id: "student-1", role: Role.STUDENT },
    });

    (prisma.lesson.findUnique as vi.Mock).mockResolvedValue({
      id: "lesson-experiment",
      type: LessonType.EXPERIMENT,
    });

    (prisma.classEnrollment.findFirst as vi.Mock).mockResolvedValue({
      class: {
        id: "class-1",
        name: "NGSS Cohort",
      },
    });

    const savedAt = new Date("2024-01-02T00:00:00.000Z");

    (prisma.experimentSubmission.upsert as vi.Mock).mockResolvedValue({
      data: {
        teamName: "Team Sun",
        variableTested: "Cover material",
        initialTemperatureC: 21.5,
        finalTemperatureC: 29.1,
        observations: "Observation",
      },
      submittedAt: savedAt,
    });

    const response = await POST(
      new Request("http://localhost/api", {
        method: "POST",
        body: JSON.stringify({
          classId: "class-1",
          data: {
            teamName: "Team Sun",
            variableTested: "Cover material",
            initialTemperatureC: 21.5,
            finalTemperatureC: 29.1,
            observations: "Observation",
          },
        }),
        headers: {
          "Content-Type": "application/json",
        },
      }),
      {
        params: { slug: "investigation-designing-a-mini-greenhouse" },
      }
    );

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.submission.submittedAt).toBe(savedAt.toISOString());
    expect(prisma.experimentSubmission.upsert).toHaveBeenCalledWith({
      where: {
        lessonId_studentId_classId: {
          lessonId: "lesson-experiment",
          studentId: "student-1",
          classId: "class-1",
        },
      },
      create: {
        lessonId: "lesson-experiment",
        studentId: "student-1",
        classId: "class-1",
        data: {
          teamName: "Team Sun",
          variableTested: "Cover material",
          initialTemperatureC: 21.5,
          finalTemperatureC: 29.1,
          observations: "Observation",
        },
      },
      update: {
        data: {
          teamName: "Team Sun",
          variableTested: "Cover material",
          initialTemperatureC: 21.5,
          finalTemperatureC: 29.1,
          observations: "Observation",
        },
        submittedAt: expect.any(Date),
      },
      select: {
        data: true,
        submittedAt: true,
      },
    });
  });

  it("rejects access when the student is not enrolled", async () => {
    (getServerAuthSession as vi.Mock).mockResolvedValue({
      user: { id: "student-1", role: Role.STUDENT },
    });

    (prisma.lesson.findUnique as vi.Mock).mockResolvedValue({
      id: "lesson-experiment",
      type: LessonType.EXPERIMENT,
    });

    (prisma.classEnrollment.findFirst as vi.Mock).mockResolvedValue(null);

    const response = await GET(new Request("http://localhost/api"), {
      params: { slug: "investigation-designing-a-mini-greenhouse" },
    });

    expect(response.status).toBe(403);
  });

  it("rejects submissions for mismatched class ids", async () => {
    (getServerAuthSession as vi.Mock).mockResolvedValue({
      user: { id: "student-1", role: Role.STUDENT },
    });

    (prisma.lesson.findUnique as vi.Mock).mockResolvedValue({
      id: "lesson-experiment",
      type: LessonType.EXPERIMENT,
    });

    (prisma.classEnrollment.findFirst as vi.Mock).mockResolvedValue(null);

    const response = await POST(
      new Request("http://localhost/api", {
        method: "POST",
        body: JSON.stringify({
          classId: "class-unknown",
          data: {
            teamName: "Team",
          },
        }),
        headers: {
          "Content-Type": "application/json",
        },
      }),
      {
        params: { slug: "investigation-designing-a-mini-greenhouse" },
      }
    );

    expect(response.status).toBe(403);

    const payload = await response.json();

    expect(payload.error).toBe("Unauthorized class access");
  });
});
