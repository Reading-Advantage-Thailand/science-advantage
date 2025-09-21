import { render, screen } from "@testing-library/react";
import { Role } from "@prisma/client";

import DashboardPage from "./page";
import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/auth", () => ({
  getServerAuthSession: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    lesson: {
      findFirst: vi.fn(),
    },
    class: {
      findFirst: vi.fn(),
    },
    classEnrollment: {
      findFirst: vi.fn(),
    },
  },
}));

vi.mock("next-auth/react", () => ({
  signOut: vi.fn(),
}));

describe("DashboardPage", () => {
  const mockGetServerAuthSession = vi.mocked(getServerAuthSession);

  beforeEach(() => {
    mockGetServerAuthSession.mockResolvedValue({
      user: {
        id: "user_123",
        role: Role.TEACHER,
        name: "Avery Teacher",
        email: "avery@example.com",
        image: null,
      },
    });

    vi.mocked(prisma.lesson.findFirst).mockResolvedValue({
      slug: "lesson-1-earth-systems-overview",
      title: "Lesson 1",
    });

    vi.mocked(prisma.class.findFirst).mockResolvedValue({
      id: "class-1",
      name: "NGSS Cohort",
    });

    vi.mocked(prisma.classEnrollment.findFirst).mockResolvedValue(null);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders highlight cards, action buttons, and the signed-in user", async () => {
    const Page = await DashboardPage();
    render(Page);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /welcome back, avery teacher/i,
      })
    ).toBeInTheDocument();

    const cards = screen.getAllByRole("article");
    expect(cards).toHaveLength(3);

    expect(screen.getByRole("link", { name: /open lesson 1/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /view completion list/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign out/i })).toBeInTheDocument();
  });

  it("hides teacher-only completion reports from students", async () => {
    mockGetServerAuthSession.mockResolvedValue({
      user: {
        id: "student_456",
        role: Role.STUDENT,
        name: "Sky Student",
        email: "sky@example.com",
        image: null,
      },
    });

    vi.mocked(prisma.class.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.classEnrollment.findFirst).mockResolvedValue(null);

    const Page = await DashboardPage();
    render(Page);

    expect(
      screen.queryByRole("link", { name: /view completion list/i })
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(/waiting for your teacher to add you to a class/i)
    ).toBeInTheDocument();
  });
});
