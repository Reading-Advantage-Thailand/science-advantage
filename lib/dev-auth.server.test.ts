import { describe, expect, it, vi } from "vitest";

import {
  buildDevAuthCookiePayload,
  defaultEmailForRole,
  defaultNameForRole,
  getDevAuthCookie,
} from "@/lib/dev-auth.server";

const mockStore = {
  get: vi.fn(() => ({ value: JSON.stringify(buildDevAuthCookiePayload({ role: "TEACHER" })) })),
  set: vi.fn(),
  delete: vi.fn(),
};

vi.mock("next/headers", () => ({
  cookies: vi.fn(() => mockStore),
}));

describe("dev auth helpers", () => {
  const originalFlag = process.env.NEXT_PUBLIC_DEV_AUTH;

  beforeEach(() => {
    mockStore.get.mockClear();
    mockStore.set.mockClear();
    mockStore.delete.mockClear();
  });

  afterAll(() => {
    process.env.NEXT_PUBLIC_DEV_AUTH = originalFlag;
  });

  it("provides defaults per role", () => {
    expect(defaultNameForRole("TEACHER")).toBe("Dev Teacher");
    expect(defaultEmailForRole("STUDENT")).toBe("student.dev@example.com");
  });

  it("parses cookie payload when enabled", async () => {
    process.env.NEXT_PUBLIC_DEV_AUTH = "true";

    const payload = await getDevAuthCookie();

    expect(payload?.role).toBe("TEACHER");
    expect(payload?.email).toBe("teacher.dev@example.com");
  });

  it("returns null when feature disabled", async () => {
    process.env.NEXT_PUBLIC_DEV_AUTH = "false";

    const payload = await getDevAuthCookie();

    expect(payload).toBeNull();
  });
});
