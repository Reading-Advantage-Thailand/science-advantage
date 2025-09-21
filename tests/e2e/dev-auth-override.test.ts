process.env.NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET ?? "test-secret";
process.env.GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID ?? "test-client";
process.env.GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET ?? "test-secret";
process.env.NEXT_PUBLIC_DEV_AUTH = "true";

import { describe, expect, it, vi } from "vitest";

const cookieStore = new Map<string, string>();

vi.mock("next/headers", () => ({
  cookies: vi.fn(() => ({
    get: (name: string) => {
      const value = cookieStore.get(name);
      return value ? { value } : undefined;
    },
    set: (name: string, value: string) => {
      cookieStore.set(name, value);
    },
    delete: (name: string) => {
      cookieStore.delete(name);
    },
  })),
}));

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(async () => null),
}));

vi.mock("@next-auth/prisma-adapter", () => ({
  PrismaAdapter: vi.fn(() => ({})),
}));

vi.mock("next-auth/providers/google", () => ({
  __esModule: true,
  default: vi.fn(() => ({})),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {},
}));

describe("dev auth override end-to-end", () => {
  it("sets cookie and allows session fallback", async () => {
    cookieStore.clear();

    const { POST } = await import("@/app/api/dev/auth/impersonate/route");
    const { getServerAuthSession } = await import("@/lib/auth");

    const response = await POST(
      new Request("http://localhost/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "TEACHER", name: "Dev QA" }),
      })
    );

    expect(response.status).toBe(200);

    const session = await getServerAuthSession();

    expect(session?.user?.role).toBe("TEACHER");
    expect(session?.user?.name).toBe("Dev QA");
  });
});
