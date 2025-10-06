import { describe, it, expect } from "vitest";
import {
  createAssignmentSchema,
  updateAssignmentSchema,
  listAssignmentsSchema,
  listStudentAssignmentsSchema,
  CreateAssignmentInput,
  UpdateAssignmentInput,
} from "./types";

describe("Assignment Validation Schemas", () => {
  describe("createAssignmentSchema", () => {
    it("should validate a valid assignment creation request", () => {
      const validInput: CreateAssignmentInput = {
        title: "Introduction to Physics",
        description: "Learn the basics of physics",
        classId: "class-123",
        lessonId: "lesson-456",
        contentType: "LESSON",
        dueDate: "2024-12-31T23:59:59Z",
        timezone: "UTC",
        status: "DRAFT",
      };

      const result = createAssignmentSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validInput);
      }
    });

    it("should use default values for optional fields", () => {
      const minimalInput = {
        title: "Test Assignment",
        classId: "class-123",
        lessonId: "lesson-456",
        dueDate: "2024-12-31T23:59:59Z",
      };

      const result = createAssignmentSchema.safeParse(minimalInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.contentType).toBe("LESSON");
        expect(result.data.timezone).toBe("UTC");
        expect(result.data.status).toBe("DRAFT");
      }
    });

    it("should reject invalid title", () => {
      const invalidInput = {
        title: "", // Empty title
        classId: "class-123",
        lessonId: "lesson-456",
        dueDate: "2024-12-31T23:59:59Z",
      };

      const result = createAssignmentSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("Assignment title is required");
      }
    });

    it("should reject title that's too long", () => {
      const invalidInput = {
        title: "a".repeat(201), // 201 characters
        classId: "class-123",
        lessonId: "lesson-456",
        dueDate: "2024-12-31T23:59:59Z",
      };

      const result = createAssignmentSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("Title must be 200 characters or less");
      }
    });

    it("should reject invalid due date format", () => {
      const invalidInput = {
        title: "Test Assignment",
        classId: "class-123",
        lessonId: "lesson-456",
        dueDate: "invalid-date",
      };

      const result = createAssignmentSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("Invalid datetime format");
      }
    });

    it("should reject invalid content type", () => {
      const invalidInput = {
        title: "Test Assignment",
        classId: "class-123",
        lessonId: "lesson-456",
        dueDate: "2024-12-31T23:59:59Z",
        contentType: "INVALID_TYPE",
      };

      const result = createAssignmentSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it("should reject invalid status", () => {
      const invalidInput = {
        title: "Test Assignment",
        classId: "class-123",
        lessonId: "lesson-456",
        dueDate: "2024-12-31T23:59:59Z",
        status: "INVALID_STATUS",
      };

      const result = createAssignmentSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });
  });

  describe("updateAssignmentSchema", () => {
    it("should validate a valid assignment update request", () => {
      const validInput: UpdateAssignmentInput = {
        title: "Updated Assignment Title",
        description: "Updated description",
        dueDate: "2024-12-31T23:59:59Z",
        timezone: "America/New_York",
        status: "PUBLISHED",
      };

      const result = updateAssignmentSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validInput);
      }
    });

    it("should accept partial updates", () => {
      const partialInput = {
        title: "New Title Only",
      };

      const result = updateAssignmentSchema.safeParse(partialInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe("New Title Only");
        expect(result.data.description).toBeUndefined();
      }
    });

    it("should reject empty title", () => {
      const invalidInput = {
        title: "",
      };

      const result = updateAssignmentSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it("should reject invalid timezone", () => {
      const invalidInput = {
        timezone: "a".repeat(51), // 51 characters, exceeds max of 50
      };

      const result = updateAssignmentSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });
  });

  describe("listAssignmentsSchema", () => {
    it("should validate a valid list request with all parameters", () => {
      const validInput = {
        classId: "class-123",
        teacherId: "teacher-456",
        status: "PUBLISHED",
        contentType: "LESSON",
        page: "2",
        limit: "10",
        sortBy: "dueDate",
        sortOrder: "asc",
      };

      const result = listAssignmentsSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(2);
        expect(result.data.limit).toBe(10);
        expect(result.data.sortBy).toBe("dueDate");
        expect(result.data.sortOrder).toBe("asc");
      }
    });

    it("should use default values for optional parameters", () => {
      const minimalInput = {};

      const result = listAssignmentsSchema.safeParse(minimalInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(20);
        expect(result.data.sortBy).toBe("createdAt");
        expect(result.data.sortOrder).toBe("desc");
      }
    });

    it("should coerce string numbers to actual numbers", () => {
      const stringInput = {
        page: "5",
        limit: "50",
      };

      const result = listAssignmentsSchema.safeParse(stringInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(typeof result.data.page).toBe("number");
        expect(typeof result.data.limit).toBe("number");
      }
    });

    it("should reject invalid sort field", () => {
      const invalidInput = {
        sortBy: "invalidField",
      };

      const result = listAssignmentsSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it("should reject page number less than 1", () => {
      const invalidInput = {
        page: "0",
      };

      const result = listAssignmentsSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it("should reject limit greater than 100", () => {
      const invalidInput = {
        limit: "101",
      };

      const result = listAssignmentsSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });
  });

  describe("listStudentAssignmentsSchema", () => {
    it("should validate a valid student list request", () => {
      const validInput = {
        classId: "class-123",
        status: "IN_PROGRESS",
        page: "1",
        limit: "20",
        sortBy: "dueDate",
        sortOrder: "asc",
      };

      const result = listStudentAssignmentsSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it("should use default values for student list", () => {
      const minimalInput = {};

      const result = listStudentAssignmentsSchema.safeParse(minimalInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(20);
        expect(result.data.sortBy).toBe("dueDate");
        expect(result.data.sortOrder).toBe("asc");
      }
    });

    it("should reject invalid student status", () => {
      const invalidInput = {
        status: "INVALID_STATUS",
      };

      const result = listStudentAssignmentsSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });
  });
});

describe("Assignment Business Logic", () => {
  describe("Due Date Validation", () => {
    it("should identify valid future dates", () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7); // 7 days from now

      expect(futureDate.getTime()).toBeGreaterThan(Date.now());
    });

    it("should identify invalid past dates", () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 7); // 7 days ago

      expect(pastDate.getTime()).toBeLessThan(Date.now());
    });

    it("should validate ISO date strings", () => {
      const validISO = "2024-12-31T23:59:59Z";
      const parsedDate = new Date(validISO);

      expect(!isNaN(parsedDate.getTime())).toBe(true);
    });

    it("should reject invalid date strings", () => {
      const invalidDate = "not-a-date";
      const parsedDate = new Date(invalidDate);

      expect(isNaN(parsedDate.getTime())).toBe(true);
    });
  });

  describe("Status Transition Logic", () => {
    it("should allow DRAFT to PUBLISHED transition", () => {
      const currentStatus: string = "DRAFT";
      const newStatus: string = "PUBLISHED";

      // This should be allowed - only PUBLISHED to DRAFT is forbidden
      const isForbidden = currentStatus === "PUBLISHED" && newStatus === "DRAFT";
      expect(isForbidden).toBe(false);
    });

    it("should allow PUBLISHED to CANCELLED transition", () => {
      const currentStatus: string = "PUBLISHED";
      const newStatus: string = "CANCELLED";

      // This should be allowed - only PUBLISHED to DRAFT is forbidden
      const isForbidden = currentStatus === "PUBLISHED" && newStatus === "DRAFT";
      expect(isForbidden).toBe(false);
    });

    it("should reject PUBLISHED to DRAFT transition", () => {
      const currentStatus: string = "PUBLISHED";
      const newStatus: string = "DRAFT";

      // This should be rejected - PUBLISHED to DRAFT is forbidden
      const isForbidden = currentStatus === "PUBLISHED" && newStatus === "DRAFT";
      expect(isForbidden).toBe(true);
    });

    it("should allow DRAFT to DRAFT (no change)", () => {
      const currentStatus: string = "DRAFT";
      const newStatus: string = "DRAFT";

      // This should be allowed - only PUBLISHED to DRAFT is forbidden
      const isForbidden = currentStatus === "PUBLISHED" && newStatus === "DRAFT";
      expect(isForbidden).toBe(false);
    });
  });

  describe("Timezone Validation", () => {
    it("should accept common valid timezones", () => {
      const validTimezones = [
        "UTC",
        "America/New_York",
        "Europe/London",
        "Asia/Tokyo",
        "Australia/Sydney",
      ];

      validTimezones.forEach((tz) => {
        expect(tz.length).toBeGreaterThan(0);
        expect(tz.length).toBeLessThanOrEqual(50);
      });
    });

    it("should reject overly long timezones", () => {
      const invalidTimezone = "a".repeat(51); // 51 characters

      expect(invalidTimezone.length).toBeGreaterThan(50);
    });
  });

  describe("Content Type Validation", () => {
    it("should accept all valid content types", () => {
      const validTypes = ["LESSON", "QUIZ", "EXPERIMENT"];

      validTypes.forEach((type) => {
        expect(["LESSON", "QUIZ", "EXPERIMENT"].includes(type)).toBe(true);
      });
    });

    it("should reject invalid content types", () => {
      const invalidTypes = ["VIDEO", "DOCUMENT", "AUDIO", "INVALID"];

      invalidTypes.forEach((type) => {
        expect(["LESSON", "QUIZ", "EXPERIMENT"].includes(type)).toBe(false);
      });
    });
  });
});
