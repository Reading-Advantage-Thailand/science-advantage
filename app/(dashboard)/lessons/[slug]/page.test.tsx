import { render, screen } from "@testing-library/react";
import { LessonType, Role } from "@prisma/client";

import LessonPage from "./page";
import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
  notFound: vi.fn(),
}));

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
    attempt: {
      findFirst: vi.fn(),
    },
    class: {
      findFirst: vi.fn(),
    },
    classEnrollment: {
      findFirst: vi.fn(),
    },
    lessonCompletion: {
      findUnique: vi.fn(),
    },
    experimentSubmission: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("@/components/features/lessons/lesson-completion-toggle", () => ({
  LessonCompletionToggle: () => <div data-testid="completion-toggle" />,
}));

vi.mock("@/components/features/lessons/lesson-content", () => ({
  LessonContent: () => <div>Lesson content</div>,
}));

vi.mock("@/components/features/lessons/lesson-quiz", () => ({
  LessonQuiz: () => <div data-testid="lesson-quiz" />,
}));

vi.mock("@/components/features/demo/join-demo-class-button", () => ({
  JoinDemoClassButton: () => <button>Join demo class</button>,
}));

vi.mock("@/components/features/experiments/experiment-data-form", () => ({
  ExperimentDataForm: () => <div>Experiment form</div>,
}));

vi.mock("@/components/features/experiments/experiment-guide", () => ({
  ExperimentGuide: () => <div>Experiment guide</div>,
}));

vi.mock("@/lib/experiments", () => ({
  parseExperimentContent: vi.fn(() => null),
}));

describe("LessonPage", () => {
  const mockSession = {
    user: {
      id: "student-1",
      role: Role.STUDENT,
      email: "student@example.com",
    },
  };

  const mockRedirect = vi.mocked(redirect);
  const mockGetServerAuthSession = vi.mocked(getServerAuthSession);

  beforeEach(() => {
    vi.resetAllMocks();

    process.env.NEXT_PUBLIC_DEV_AUTH = "false";

    mockRedirect.mockImplementation((path: string) => {
      const error = new Error(`REDIRECT:${path}`);
      (error as Error & { digest?: string }).digest = "NEXT_REDIRECT";
      throw error;
    });

    mockGetServerAuthSession.mockResolvedValue(mockSession);

    vi.mocked(prisma.lesson.findUnique).mockResolvedValue({
      id: "lesson-1",
      title: "Lesson title",
      summary: null,
      content: "content",
      type: LessonType.READING,
    });

    vi.mocked(prisma.quizQuestion.findMany).mockResolvedValue([]);
    vi.mocked(prisma.attempt.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.class.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.classEnrollment.findFirst).mockResolvedValue({
      classId: "class-1",
      class: {
        id: "class-1",
        name: "NGSS Cohort",
      },
    });
    vi.mocked(prisma.lessonCompletion.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.experimentSubmission.findUnique).mockResolvedValue(null);
  });

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_DEV_AUTH;
    vi.clearAllMocks();
  });

  it("renders for an enrolled student", async () => {
    vi.mocked(prisma.quizQuestion.findMany).mockResolvedValueOnce([
      {
        id: "question-1",
        order: 1,
        prompt: "Prompt",
        options: ["A", "B"],
      },
    ]);

    const Page = await LessonPage({ params: { slug: "lesson-1" } });
    render(Page);

    expect(screen.getByTestId("completion-toggle")).toBeInTheDocument();
    expect(screen.getByText(/lesson content/i)).toBeInTheDocument();
    expect(screen.getByTestId("lesson-quiz")).toBeInTheDocument();
  });

  it("redirects a student without enrollment when demo mode is disabled", async () => {
    vi.mocked(prisma.classEnrollment.findFirst).mockResolvedValueOnce(null);

    await expect(
      LessonPage({ params: { slug: "lesson-1" } })
    ).rejects.toThrow("REDIRECT:/dashboard");
  });

  it("allows demo enrollment fallback when enabled", async () => {
    process.env.NEXT_PUBLIC_DEV_AUTH = "true";
    vi.mocked(prisma.classEnrollment.findFirst).mockResolvedValueOnce(null);

    const Page = await LessonPage({ params: { slug: "lesson-1" } });
    render(Page);

    expect(screen.getByText(/join the demo class/i)).toBeInTheDocument();
  });

  it("hides the quiz for teachers", async () => {
    mockGetServerAuthSession.mockResolvedValueOnce({
      user: {
        id: "teacher-1",
        role: Role.TEACHER,
        email: "teacher@example.com",
      },
    });

    const Page = await LessonPage({ params: { slug: "lesson-1" } });
    render(Page);

    expect(screen.queryByTestId("lesson-quiz")).not.toBeInTheDocument();
  });
});
