import { render, screen } from "@testing-library/react";
import { Role } from "@prisma/client";

import LessonCompletionListPage from "./page";
import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
  notFound: vi.fn(),
}));

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
    lessonCompletion: {
      findMany: vi.fn(),
    },
  },
}));

describe("LessonCompletionListPage", () => {
  const mockGetServerAuthSession = vi.mocked(getServerAuthSession);
  const mockRedirect = vi.mocked(redirect);
  const mockNotFound = vi.mocked(notFound);

  beforeEach(() => {
    mockRedirect.mockReset();
    mockRedirect.mockImplementation((path: string) => {
      const error = new Error(`REDIRECT:${path}`);
      // mimic Next.js redirect error shape for consistency
      (error as Error & { digest?: string }).digest = "NEXT_REDIRECT";
      throw error;
    });

    mockNotFound.mockReset();
    mockNotFound.mockImplementation(() => {
      const error = new Error("NOT_FOUND");
      (error as Error & { digest?: string }).digest = "NEXT_NOT_FOUND";
      throw error;
    });

    mockGetServerAuthSession.mockResolvedValue({
      user: {
        id: "teacher-1",
        role: Role.TEACHER,
        email: "teacher@example.com",
        name: "Taylor Teacher",
      },
    });

    (prisma.class.findUnique as vi.Mock).mockResolvedValue({
      id: "class-1",
      name: "NGSS Cohort",
      teacherId: "teacher-1",
      enrollments: [
        {
          student: {
            id: "student-1",
            name: "Avery Student",
            email: "avery@example.com",
          },
        },
        {
          student: {
            id: "student-2",
            name: "Jordan Student",
            email: "jordan@example.com",
          },
        },
      ],
    });

    (prisma.lesson.findUnique as vi.Mock).mockResolvedValue({
      id: "lesson-1",
      title: "Earth Systems",
    });

    (prisma.lessonCompletion.findMany as vi.Mock).mockResolvedValue([
      {
        studentId: "student-2",
        completedAt: new Date("2024-01-02T00:00:00.000Z"),
      },
    ]);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("redirects non-teacher users to the dashboard", async () => {
    mockGetServerAuthSession.mockResolvedValue({
      user: {
        id: "student-1",
        role: Role.STUDENT,
        email: "student@example.com",
        name: "Sam Student",
      },
    });

    await expect(
      LessonCompletionListPage({
        params: { classId: "class-1", slug: "lesson-1" },
      })
    ).rejects.toThrow("REDIRECT:/dashboard");

    expect(mockRedirect).toHaveBeenCalledWith("/dashboard");
  });

  it("renders completion status for teachers", async () => {
    const Page = await LessonCompletionListPage({
      params: { classId: "class-1", slug: "lesson-1" },
    });

    render(Page);

    expect(
      screen.getByRole("heading", { name: /earth systems/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/class:\s+ngss cohort/i)).toBeInTheDocument();
    expect(screen.getByText("Avery Student")).toBeInTheDocument();
    expect(screen.getByText("Jordan Student")).toBeInTheDocument();
    expect(screen.getByText("Completed")).toBeInTheDocument();
    expect(screen.getByText("Pending")).toBeInTheDocument();
    expect(mockRedirect).not.toHaveBeenCalled();
  });
});
