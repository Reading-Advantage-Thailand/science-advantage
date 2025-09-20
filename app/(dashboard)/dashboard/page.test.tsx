import { render, screen } from "@testing-library/react";
import { Role } from "@prisma/client";

import DashboardPage from "./page";
import { getServerAuthSession } from "@/lib/auth";

vi.mock("@/lib/auth", () => ({
  getServerAuthSession: vi.fn(),
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

    expect(screen.getByRole("button", { name: /start a class demo/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /view sprint backlog/i })).toHaveClass("border");
    expect(screen.getByRole("button", { name: /sign out/i })).toBeInTheDocument();
  });
});
