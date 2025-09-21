import { describe, expect, it, vi } from "vitest";

import { DELETE, GET, POST } from "@/app/api/dev/auth/impersonate/route";

const {
  isDevAuthEnabledMock,
  buildPayloadMock,
  setCookieMock,
  clearCookieMock,
  getCookieMock,
} = vi.hoisted(() => {
  return {
    isDevAuthEnabledMock: vi.fn(() => true),
    buildPayloadMock: vi.fn(({ role }: { role: string }) => ({
      id: `dev-${role.toLowerCase()}`,
      role,
      name: "Dev Tester",
      email: "dev@example.com",
    })),
    setCookieMock: vi.fn(),
    clearCookieMock: vi.fn(),
    getCookieMock: vi.fn(() => null),
  };
});

vi.mock("@/lib/dev-auth", () => ({
  isDevAuthEnabled: isDevAuthEnabledMock,
  isAllowedDevRole: (role: string) => role === "TEACHER" || role === "STUDENT",
  DEV_AUTH_COOKIE: "dev-auth",
}));

vi.mock("@/lib/dev-auth.server", () => ({
  buildDevAuthCookiePayload: buildPayloadMock,
  setDevAuthCookie: setCookieMock,
  clearDevAuthCookie: clearCookieMock,
  getDevAuthCookie: getCookieMock,
  toPrismaRole: vi.fn(),
  ensureDevUser: vi.fn(),
}));

describe("dev auth impersonate route", () => {
  beforeEach(() => {
    isDevAuthEnabledMock.mockReturnValue(true);
    buildPayloadMock.mockClear();
    setCookieMock.mockClear();
    clearCookieMock.mockClear();
    getCookieMock.mockClear();
    getCookieMock.mockReturnValue(null);
  });

  it("returns 404 when disabled", async () => {
    isDevAuthEnabledMock.mockReturnValueOnce(false);

    const response = await POST(new Request("http://localhost/api", { method: "POST" }));

    expect(response.status).toBe(404);
  });

  it("sets cookie and returns session", async () => {
    const response = await POST(
      new Request("http://localhost/api", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: "TEACHER" }),
      })
    );

    expect(response.status).toBe(200);
    expect(setCookieMock).toHaveBeenCalled();

    const payload = await response.json();
    expect(payload.session.role).toBe("TEACHER");
  });

  it("clears override", async () => {
    const response = await DELETE(new Request("http://localhost/api", { method: "DELETE" }));

    expect(response.status).toBe(200);
    expect(clearCookieMock).toHaveBeenCalled();
  });

  it("returns current session on GET", async () => {
    getCookieMock.mockReturnValueOnce({
      role: "STUDENT",
      name: "Dev Student",
      email: "student@example.com",
      id: "dev-student",
    });

    const response = await GET(new Request("http://localhost/api"));

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.session.role).toBe("STUDENT");
  });
});
