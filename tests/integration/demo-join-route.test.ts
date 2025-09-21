import { POST } from "@/app/api/demo/join/route";
import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/auth", () => ({
  getServerAuthSession: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    class: {
      findFirst: vi.fn(),
    },
    classEnrollment: {
      upsert: vi.fn(),
    },
  },
}));

describe("demo join route", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("rejects when demo enrollment is disabled", async () => {
    process.env.NEXT_PUBLIC_DEV_AUTH = "false";

    (getServerAuthSession as vi.Mock).mockResolvedValue({
      user: { id: "student-1" },
    });

    const response = await POST();

    expect(response.status).toBe(403);
    const payload = await response.json();
    expect(payload.error).toBe("Demo enrollment is disabled");
  });

  it("enrolls the student when demo enrollment is enabled", async () => {
    process.env.NEXT_PUBLIC_DEV_AUTH = "true";

    (getServerAuthSession as vi.Mock).mockResolvedValue({
      user: { id: "student-1" },
    });

    (prisma.class.findFirst as vi.Mock).mockResolvedValue({
      id: "class-1",
      name: "Demo Class",
    });

    (prisma.classEnrollment.upsert as vi.Mock).mockResolvedValue({ id: "enrollment-1" });

    const response = await POST();

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.classId).toBe("class-1");
  });
});
