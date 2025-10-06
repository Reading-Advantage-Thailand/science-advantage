import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { prisma } from "@/lib/prisma";
import { generateJoinCode } from "@/lib/join-code";

describe("Class Creation API", () => {
  let teacherUser: { id: string; email: string; name: string | null; role: string };
  let studentUser: { id: string; email: string; name: string | null; role: string };
  let adminUser: { id: string; email: string; name: string | null; role: string };

  beforeEach(async () => {
    // Create test users
    teacherUser = await prisma.user.create({
      data: {
        email: "teacher@test.com",
        name: "Test Teacher",
        role: "TEACHER",
      },
    });

    studentUser = await prisma.user.create({
      data: {
        email: "student@test.com",
        name: "Test Student",
        role: "STUDENT",
      },
    });

    adminUser = await prisma.user.create({
      data: {
        email: "admin@test.com",
        name: "Test Admin",
        role: "ADMIN",
      },
    });
  });

  afterEach(async () => {
    // Clean up test data
    await prisma.class.deleteMany({
      where: {
        teacherId: {
          in: [teacherUser.id, adminUser.id],
        },
      },
    });

    await prisma.user.deleteMany({
      where: {
        id: {
          in: [teacherUser.id, studentUser.id, adminUser.id],
        },
      },
    });
  });

  describe("POST /api/classes", () => {
    it("should create a class successfully for a teacher", async () => {
      const classData = {
        name: "Test Class",
        description: "A test class for integration testing",
      };

      // Mock the session to simulate authenticated teacher
      const mockSession = {
        user: {
          email: teacherUser.email,
          name: teacherUser.name,
        },
      };

      // Mock NextAuth getServerSession
      vi.mock("next-auth", () => ({
        getServerSession: vi.fn().mockResolvedValue(mockSession),
      }));

      const response = await fetch("http://localhost:3000/api/classes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(classData),
      });

      expect(response.status).toBe(201);

      const result = await response.json();
      expect(result.success).toBe(true);
      expect(result.data.name).toBe(classData.name);
      expect(result.data.description).toBe(classData.description);
      expect(result.data.joinCode).toMatch(/^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$/);
      expect(result.data.studentCount).toBe(0);

      // Verify class was created in database
      const createdClass = await prisma.class.findUnique({
        where: { id: result.data.id },
      });

      expect(createdClass).toBeTruthy();
      expect(createdClass?.name).toBe(classData.name);
      expect(createdClass?.teacherId).toBe(teacherUser.id);
    });

    it("should create a class successfully for an admin", async () => {
      const classData = {
        name: "Admin Class",
        description: "A test class created by admin",
      };

      const mockSession = {
        user: {
          email: adminUser.email,
          name: adminUser.name,
        },
      };

      vi.mock("next-auth", () => ({
        getServerSession: vi.fn().mockResolvedValue(mockSession),
      }));

      const response = await fetch("http://localhost:3000/api/classes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(classData),
      });

      expect(response.status).toBe(201);

      const result = await response.json();
      expect(result.success).toBe(true);
      expect(result.data.name).toBe(classData.name);
    });

    it("should reject class creation for students", async () => {
      const classData = {
        name: "Student Class",
        description: "This should fail",
      };

      const mockSession = {
        user: {
          email: studentUser.email,
          name: studentUser.name,
        },
      };

      vi.mock("next-auth", () => ({
        getServerSession: vi.fn().mockResolvedValue(mockSession),
      }));

      const response = await fetch("http://localhost:3000/api/classes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(classData),
      });

      expect(response.status).toBe(403);

      const result = await response.json();
      expect(result.success).toBe(false);
      expect(result.error.code).toBe("FORBIDDEN");
    });

    it("should reject class creation without authentication", async () => {
      const classData = {
        name: "Unauthenticated Class",
        description: "This should fail",
      };

      vi.mock("next-auth", () => ({
        getServerSession: vi.fn().mockResolvedValue(null),
      }));

      const response = await fetch("http://localhost:3000/api/classes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(classData),
      });

      expect(response.status).toBe(401);

      const result = await response.json();
      expect(result.success).toBe(false);
      expect(result.error.code).toBe("UNAUTHORIZED");
    });

    it("should reject duplicate class names for the same teacher", async () => {
      // Create first class
      await prisma.class.create({
        data: {
          name: "Duplicate Class",
          description: "First class",
          joinCode: generateJoinCode(),
          teacherId: teacherUser.id,
        },
      });

      const classData = {
        name: "Duplicate Class",
        description: "Second class with same name",
      };

      const mockSession = {
        user: {
          email: teacherUser.email,
          name: teacherUser.name,
        },
      };

      vi.mock("next-auth", () => ({
        getServerSession: vi.fn().mockResolvedValue(mockSession),
      }));

      const response = await fetch("http://localhost:3000/api/classes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(classData),
      });

      expect(response.status).toBe(400);

      const result = await response.json();
      expect(result.success).toBe(false);
      expect(result.error.code).toBe("VALIDATION_ERROR");
    });

    it("should validate required fields", async () => {
      const invalidData = {
        description: "Class without name",
      };

      const mockSession = {
        user: {
          email: teacherUser.email,
          name: teacherUser.name,
        },
      };

      vi.mock("next-auth", () => ({
        getServerSession: vi.fn().mockResolvedValue(mockSession),
      }));

      const response = await fetch("http://localhost:3000/api/classes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invalidData),
      });

      expect(response.status).toBe(400);

      const result = await response.json();
      expect(result.success).toBe(false);
      expect(result.error.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("GET /api/classes", () => {
    beforeEach(async () => {
      // Create some test classes
      await prisma.class.createMany({
        data: [
          {
            name: "Class 1",
            description: "First test class",
            joinCode: generateJoinCode(),
            teacherId: teacherUser.id,
          },
          {
            name: "Class 2",
            description: "Second test class",
            joinCode: generateJoinCode(),
            teacherId: teacherUser.id,
          },
          {
            name: "Admin Class",
            description: "Admin's class",
            joinCode: generateJoinCode(),
            teacherId: adminUser.id,
          },
        ],
      });
    });

    it("should list classes for teacher", async () => {
      const mockSession = {
        user: {
          email: teacherUser.email,
          name: teacherUser.name,
        },
      };

      vi.mock("next-auth", () => ({
        getServerSession: vi.fn().mockResolvedValue(mockSession),
      }));

      const response = await fetch("http://localhost:3000/api/classes");

      expect(response.status).toBe(200);

      const result = await response.json();
      expect(result.success).toBe(true);
      expect(result.data.classes).toHaveLength(2);
      expect(result.data.classes.every((cls: { name: string }) => cls.name.includes("Class"))).toBe(
        true
      );
      expect(result.data.pagination.total).toBe(2);
    });

    it("should list classes for admin", async () => {
      const mockSession = {
        user: {
          email: adminUser.email,
          name: adminUser.name,
        },
      };

      vi.mock("next-auth", () => ({
        getServerSession: vi.fn().mockResolvedValue(mockSession),
      }));

      const response = await fetch("http://localhost:3000/api/classes");

      expect(response.status).toBe(200);

      const result = await response.json();
      expect(result.success).toBe(true);
      expect(result.data.classes).toHaveLength(1);
      expect(result.data.classes[0].name).toBe("Admin Class");
    });

    it("should reject class listing for students", async () => {
      const mockSession = {
        user: {
          email: studentUser.email,
          name: studentUser.name,
        },
      };

      vi.mock("next-auth", () => ({
        getServerSession: vi.fn().mockResolvedValue(mockSession),
      }));

      const response = await fetch("http://localhost:3000/api/classes");

      expect(response.status).toBe(403);

      const result = await response.json();
      expect(result.success).toBe(false);
      expect(result.error.code).toBe("FORBIDDEN");
    });
  });
});
