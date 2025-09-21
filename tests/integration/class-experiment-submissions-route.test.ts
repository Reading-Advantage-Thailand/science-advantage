import { LessonType, Role } from "@prisma/client";

import { GET } from "@/app/api/classes/[classId]/lessons/[slug]/experiment-submissions/route";
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
    experimentSubmission: {
      findMany: vi.fn(),
    },
  },
}));

describe("Class experiment submissions route", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("requires teacher ownership", async () => {
    (getServerAuthSession as vi.Mock).mockResolvedValue({
      user: { id: "student-1", role: Role.STUDENT },
    });

    const response = await GET(new Request("http://localhost/api"), {
      params: { classId: "class-1", slug: "investigation" },
    });

    expect(response.status).toBe(403);
  });

  it("returns submissions in JSON", async () => {
    (getServerAuthSession as vi.Mock).mockResolvedValue({
      user: { id: "teacher-1", role: Role.TEACHER },
    });

    (prisma.class.findUnique as vi.Mock).mockResolvedValue({
      id: "class-1",
      name: "NGSS Cohort",
      teacherId: "teacher-1",
    });

    (prisma.lesson.findUnique as vi.Mock).mockResolvedValue({
      id: "lesson-experiment",
      title: "Mini Greenhouse",
      type: LessonType.EXPERIMENT,
    });

    (prisma.experimentSubmission.findMany as vi.Mock).mockResolvedValue([
      {
        submittedAt: new Date("2024-01-01T12:00:00.000Z"),
        data: {
          teamName: "Team Sun",
          variableTested: "Cover material",
          initialTemperatureC: 21.5,
          finalTemperatureC: 29.2,
          observations: "Observation",
        },
        student: {
          id: "student-1",
          name: "Avery",
          email: "avery@example.com",
        },
      },
    ]);

    const response = await GET(new Request("http://localhost/api"), {
      params: { classId: "class-1", slug: "investigation" },
    });

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.submissions).toHaveLength(1);
    expect(payload.submissions[0]).toMatchObject({
      name: "Avery",
      data: expect.objectContaining({
        teamName: "Team Sun",
      }),
    });
  });

  it("streams CSV when requested", async () => {
    (getServerAuthSession as vi.Mock).mockResolvedValue({
      user: { id: "teacher-1", role: Role.TEACHER },
    });

    (prisma.class.findUnique as vi.Mock).mockResolvedValue({
      id: "class-1",
      name: "NGSS Cohort",
      teacherId: "teacher-1",
    });

    (prisma.lesson.findUnique as vi.Mock).mockResolvedValue({
      id: "lesson-experiment",
      title: "Mini Greenhouse",
      type: LessonType.EXPERIMENT,
    });

    (prisma.experimentSubmission.findMany as vi.Mock).mockResolvedValue([
      {
        submittedAt: new Date("2024-01-01T12:00:00.000Z"),
        data: {
          teamName: "Team Sun",
          variableTested: "Cover material",
          initialTemperatureC: 21.5,
          finalTemperatureC: 29.2,
          observations: "Observation",
        },
        student: {
          id: "student-1",
          name: "Avery",
          email: "avery@example.com",
        },
      },
    ]);

    const response = await GET(new Request("http://localhost/api?format=csv"), {
      params: { classId: "class-1", slug: "investigation" },
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/csv");
    const csv = await response.text();
    expect(csv).toContain("Team Sun");
    expect(csv).toContain("NGSS Cohort");
  });
});
