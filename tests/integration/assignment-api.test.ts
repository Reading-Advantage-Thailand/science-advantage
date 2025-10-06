import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { prisma } from "@/lib/prisma";
import { generateJoinCode } from "@/lib/join-code";

describe("Assignment API", () => {
  let teacherUser: { id: string; email: string; name: string | null; role: string };
  let studentUser: { id: string; email: string; name: string | null; role: string };
  let adminUser: { id: string; email: string; name: string | null; role: string };
  let testClass: { id: string; name: string };
  let testLesson: { id: string; title: string; isPublished: boolean };
  let unpublishedLesson: { id: string; title: string; isPublished: boolean };

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

    // Create test class
    testClass = await prisma.class.create({
      data: {
        name: "Test Class",
        description: "A test class",
        joinCode: generateJoinCode(),
        teacherId: teacherUser.id,
      },
    });

    // Create test lessons
    testLesson = await prisma.lesson.create({
      data: {
        title: "Test Lesson",
        description: "A published test lesson",
        order: 1,
        content: "Test content",
        isPublished: true,
      },
    });

    unpublishedLesson = await prisma.lesson.create({
      data: {
        title: "Unpublished Lesson",
        description: "An unpublished test lesson",
        order: 2,
        content: "Test content",
        isPublished: false,
      },
    });
  });

  afterEach(async () => {
    // Clean up test data
    await prisma.assignment.deleteMany({
      where: {
        classId: testClass.id,
      },
    });

    await prisma.class.deleteMany({
      where: {
        id: testClass.id,
      },
    });

    await prisma.lesson.deleteMany({
      where: {
        id: {
          in: [testLesson.id, unpublishedLesson.id],
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

  describe("POST /api/assignments", () => {
    it("should create an assignment successfully for a teacher", async () => {
      const assignmentData = {
        title: "Test Assignment",
        description: "A test assignment",
        classId: testClass.id,
        lessonId: testLesson.id,
        contentType: "LESSON",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        timezone: "UTC",
        status: "DRAFT",
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

      const response = await fetch("http://localhost:3000/api/assignments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(assignmentData),
      });

      expect(response.status).toBe(201);

      const result = await response.json();
      expect(result.success).toBe(true);
      expect(result.data.title).toBe(assignmentData.title);
      expect(result.data.status).toBe("DRAFT");
      expect(result.data.publishedAt).toBeNull();

      // Verify assignment was created in database
      const createdAssignment = await prisma.assignment.findUnique({
        where: { id: result.data.id },
      });

      expect(createdAssignment).toBeTruthy();
      expect(createdAssignment?.teacherId).toBe(teacherUser.id);
    });

    it("should reject assignment creation for unpublished lessons when status is PUBLISHED", async () => {
      const assignmentData = {
        title: "Test Assignment",
        description: "Should fail",
        classId: testClass.id,
        lessonId: unpublishedLesson.id,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: "PUBLISHED",
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

      const response = await fetch("http://localhost:3000/api/assignments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(assignmentData),
      });

      expect(response.status).toBe(400);

      const result = await response.json();
      expect(result.success).toBe(false);
      expect(result.error.code).toBe("VALIDATION_ERROR");
    });

    it("should reject assignment creation for past due dates", async () => {
      const assignmentData = {
        title: "Test Assignment",
        classId: testClass.id,
        lessonId: testLesson.id,
        dueDate: new Date(Date.now() - 1000).toISOString(), // 1 second ago
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

      const response = await fetch("http://localhost:3000/api/assignments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(assignmentData),
      });

      expect(response.status).toBe(400);

      const result = await response.json();
      expect(result.success).toBe(false);
      expect(result.error.code).toBe("VALIDATION_ERROR");
    });

    it("should reject assignment creation for classes not owned by teacher", async () => {
      const otherClass = await prisma.class.create({
        data: {
          name: "Other Teacher's Class",
          joinCode: generateJoinCode(),
          teacherId: adminUser.id,
        },
      });

      const assignmentData = {
        title: "Test Assignment",
        classId: otherClass.id,
        lessonId: testLesson.id,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
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

      const response = await fetch("http://localhost:3000/api/assignments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(assignmentData),
      });

      expect(response.status).toBe(403);

      const result = await response.json();
      expect(result.success).toBe(false);
      expect(result.error.code).toBe("FORBIDDEN");

      // Clean up
      await prisma.class.delete({
        where: { id: otherClass.id },
      });
    });

    it("should reject duplicate assignments for same class and lesson", async () => {
      // Create first assignment
      await prisma.assignment.create({
        data: {
          title: "First Assignment",
          classId: testClass.id,
          lessonId: testLesson.id,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          teacherId: teacherUser.id,
        },
      });

      const assignmentData = {
        title: "Second Assignment",
        classId: testClass.id,
        lessonId: testLesson.id,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
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

      const response = await fetch("http://localhost:3000/api/assignments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(assignmentData),
      });

      expect(response.status).toBe(400);

      const result = await response.json();
      expect(result.success).toBe(false);
      expect(result.error.code).toBe("VALIDATION_ERROR");
    });

    it("should reject assignment creation for students", async () => {
      const assignmentData = {
        title: "Test Assignment",
        classId: testClass.id,
        lessonId: testLesson.id,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
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

      const response = await fetch("http://localhost:3000/api/assignments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(assignmentData),
      });

      expect(response.status).toBe(403);

      const result = await response.json();
      expect(result.success).toBe(false);
      expect(result.error.code).toBe("FORBIDDEN");
    });
  });

  describe("GET /api/assignments", () => {
    beforeEach(async () => {
      // Create test assignments
      await prisma.assignment.createMany({
        data: [
          {
            title: "Assignment 1",
            classId: testClass.id,
            lessonId: testLesson.id,
            status: "PUBLISHED",
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            teacherId: teacherUser.id,
            publishedAt: new Date(),
          },
          {
            title: "Assignment 2",
            classId: testClass.id,
            lessonId: unpublishedLesson.id,
            status: "DRAFT",
            dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            teacherId: teacherUser.id,
          },
        ],
      });
    });

    it("should list assignments for teacher", async () => {
      const mockSession = {
        user: {
          email: teacherUser.email,
          name: teacherUser.name,
        },
      };

      vi.mock("next-auth", () => ({
        getServerSession: vi.fn().mockResolvedValue(mockSession),
      }));

      const response = await fetch("http://localhost:3000/api/assignments");

      expect(response.status).toBe(200);

      const result = await response.json();
      expect(result.success).toBe(true);
      expect(result.data.assignments).toHaveLength(2);
      expect(result.data.pagination.total).toBe(2);
    });

    it("should filter assignments by status", async () => {
      const mockSession = {
        user: {
          email: teacherUser.email,
          name: teacherUser.name,
        },
      };

      vi.mock("next-auth", () => ({
        getServerSession: vi.fn().mockResolvedValue(mockSession),
      }));

      const response = await fetch("http://localhost:3000/api/assignments?status=PUBLISHED");

      expect(response.status).toBe(200);

      const result = await response.json();
      expect(result.success).toBe(true);
      expect(result.data.assignments).toHaveLength(1);
      expect(result.data.assignments[0].status).toBe("PUBLISHED");
    });

    it("should filter assignments by class", async () => {
      const mockSession = {
        user: {
          email: teacherUser.email,
          name: teacherUser.name,
        },
      };

      vi.mock("next-auth", () => ({
        getServerSession: vi.fn().mockResolvedValue(mockSession),
      }));

      const response = await fetch(`http://localhost:3000/api/assignments?classId=${testClass.id}`);

      expect(response.status).toBe(200);

      const result = await response.json();
      expect(result.success).toBe(true);
      expect(
        result.data.assignments.every((a: { className: string }) => a.className === testClass.name)
      ).toBe(true);
    });
  });

  describe("GET /api/assignments/[id]", () => {
    let testAssignment: { id: string };

    beforeEach(async () => {
      testAssignment = await prisma.assignment.create({
        data: {
          title: "Test Assignment",
          classId: testClass.id,
          lessonId: testLesson.id,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          teacherId: teacherUser.id,
        },
      });
    });

    it("should get assignment by id for owner", async () => {
      const mockSession = {
        user: {
          email: teacherUser.email,
          name: teacherUser.name,
        },
      };

      vi.mock("next-auth", () => ({
        getServerSession: vi.fn().mockResolvedValue(mockSession),
      }));

      const response = await fetch(`http://localhost:3000/api/assignments/${testAssignment.id}`);

      expect(response.status).toBe(200);

      const result = await response.json();
      expect(result.success).toBe(true);
      expect(result.data.id).toBe(testAssignment.id);
    });

    it("should reject access to other teacher's assignments", async () => {
      const mockSession = {
        user: {
          email: adminUser.email,
          name: adminUser.name,
        },
      };

      vi.mock("next-auth", () => ({
        getServerSession: vi.fn().mockResolvedValue(mockSession),
      }));

      const response = await fetch(`http://localhost:3000/api/assignments/${testAssignment.id}`);

      expect(response.status).toBe(403);

      const result = await response.json();
      expect(result.success).toBe(false);
      expect(result.error.code).toBe("FORBIDDEN");
    });
  });

  describe("PUT /api/assignments/[id]", () => {
    let testAssignment: { id: string };

    beforeEach(async () => {
      testAssignment = await prisma.assignment.create({
        data: {
          title: "Test Assignment",
          classId: testClass.id,
          lessonId: testLesson.id,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          teacherId: teacherUser.id,
          status: "DRAFT",
        },
      });
    });

    it("should update assignment successfully", async () => {
      const updateData = {
        title: "Updated Assignment",
        description: "Updated description",
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

      const response = await fetch(`http://localhost:3000/api/assignments/${testAssignment.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      expect(response.status).toBe(200);

      const result = await response.json();
      expect(result.success).toBe(true);
      expect(result.data.title).toBe(updateData.title);
      expect(result.data.description).toBe(updateData.description);
    });

    it("should publish draft assignment", async () => {
      const updateData = {
        status: "PUBLISHED",
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

      const response = await fetch(`http://localhost:3000/api/assignments/${testAssignment.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      expect(response.status).toBe(200);

      const result = await response.json();
      expect(result.success).toBe(true);
      expect(result.data.status).toBe("PUBLISHED");
      expect(result.data.publishedAt).toBeTruthy();
    });

    it("should reject changing published assignment back to draft", async () => {
      // First publish the assignment
      await prisma.assignment.update({
        where: { id: testAssignment.id },
        data: {
          status: "PUBLISHED",
          publishedAt: new Date(),
        },
      });

      const updateData = {
        status: "DRAFT",
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

      const response = await fetch(`http://localhost:3000/api/assignments/${testAssignment.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      expect(response.status).toBe(400);

      const result = await response.json();
      expect(result.success).toBe(false);
      expect(result.error.code).toBe("VALIDATION_ERROR");
    });

    it("should reject updates to cancelled assignments", async () => {
      // First cancel the assignment
      await prisma.assignment.update({
        where: { id: testAssignment.id },
        data: {
          status: "CANCELLED",
          cancelledAt: new Date(),
        },
      });

      const updateData = {
        title: "Updated Title",
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

      const response = await fetch(`http://localhost:3000/api/assignments/${testAssignment.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      expect(response.status).toBe(400);

      const result = await response.json();
      expect(result.success).toBe(false);
      expect(result.error.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("DELETE /api/assignments/[id]", () => {
    let testAssignment: { id: string };

    beforeEach(async () => {
      testAssignment = await prisma.assignment.create({
        data: {
          title: "Test Assignment",
          classId: testClass.id,
          lessonId: testLesson.id,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          teacherId: teacherUser.id,
          status: "DRAFT",
        },
      });
    });

    it("should delete draft assignment successfully", async () => {
      const mockSession = {
        user: {
          email: teacherUser.email,
          name: teacherUser.name,
        },
      };

      vi.mock("next-auth", () => ({
        getServerSession: vi.fn().mockResolvedValue(mockSession),
      }));

      const response = await fetch(`http://localhost:3000/api/assignments/${testAssignment.id}`, {
        method: "DELETE",
      });

      expect(response.status).toBe(200);

      const result = await response.json();
      expect(result.success).toBe(true);

      // Verify assignment was deleted
      const deletedAssignment = await prisma.assignment.findUnique({
        where: { id: testAssignment.id },
      });

      expect(deletedAssignment).toBeNull();
    });

    it("should reject deletion of published assignments", async () => {
      // Publish the assignment
      await prisma.assignment.update({
        where: { id: testAssignment.id },
        data: {
          status: "PUBLISHED",
          publishedAt: new Date(),
        },
      });

      const mockSession = {
        user: {
          email: teacherUser.email,
          name: teacherUser.name,
        },
      };

      vi.mock("next-auth", () => ({
        getServerSession: vi.fn().mockResolvedValue(mockSession),
      }));

      const response = await fetch(`http://localhost:3000/api/assignments/${testAssignment.id}`, {
        method: "DELETE",
      });

      expect(response.status).toBe(400);

      const result = await response.json();
      expect(result.success).toBe(false);
      expect(result.error.code).toBe("VALIDATION_ERROR");
    });

    it("should reject deletion of other teacher's assignments", async () => {
      const mockSession = {
        user: {
          email: adminUser.email,
          name: adminUser.name,
        },
      };

      vi.mock("next-auth", () => ({
        getServerSession: vi.fn().mockResolvedValue(mockSession),
      }));

      const response = await fetch(`http://localhost:3000/api/assignments/${testAssignment.id}`, {
        method: "DELETE",
      });

      expect(response.status).toBe(403);

      const result = await response.json();
      expect(result.success).toBe(false);
      expect(result.error.code).toBe("FORBIDDEN");
    });
  });
});
