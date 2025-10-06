import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApiErrorClass, handleApiError } from "@/lib/errors";
import { createAssignmentSchema, listAssignmentsSchema } from "@/lib/types";

/**
 * GET /api/assignments - List assignments for the authenticated teacher
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      throw ApiErrorClass.unauthorized("Authentication required");
    }

    // Get user from database to verify role
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true },
    });

    if (!user) {
      throw ApiErrorClass.notFound("User not found");
    }

    if (user.role !== "TEACHER" && user.role !== "ADMIN") {
      throw ApiErrorClass.forbidden("Only teachers can list assignments");
    }

    const { searchParams } = new URL(request.url);
    const { classId, teacherId, status, contentType, page, limit, sortBy, sortOrder } =
      listAssignmentsSchema.parse({
        classId: searchParams.get("classId"),
        teacherId: searchParams.get("teacherId") || user.id,
        status: searchParams.get("status"),
        contentType: searchParams.get("contentType"),
        page: searchParams.get("page"),
        limit: searchParams.get("limit"),
        sortBy: searchParams.get("sortBy"),
        sortOrder: searchParams.get("sortOrder"),
      });

    // Build where clause
    const where: {
      teacherId?: string;
      classId?: string;
      status?: "DRAFT" | "PUBLISHED" | "CANCELLED";
      contentType?: "LESSON" | "QUIZ" | "EXPERIMENT";
    } = {};

    if (teacherId) {
      where.teacherId = teacherId;
    }

    if (classId) {
      where.classId = classId;
    }

    if (status) {
      where.status = status;
    }

    if (contentType) {
      where.contentType = contentType;
    }

    // Build order clause
    const orderBy: Record<string, string> = {};
    orderBy[sortBy] = sortOrder;

    const [assignments, total] = await Promise.all([
      prisma.assignment.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          class: {
            select: {
              id: true,
              name: true,
            },
          },
          lesson: {
            select: {
              id: true,
              title: true,
              type: true,
              isPublished: true,
            },
          },
          teacher: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.assignment.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        assignments: assignments.map((assignment) => ({
          id: assignment.id,
          title: assignment.title,
          description: assignment.description,
          contentType: assignment.contentType,
          status: assignment.status,
          dueDate: assignment.dueDate,
          timezone: assignment.timezone,
          publishedAt: assignment.publishedAt,
          cancelledAt: assignment.cancelledAt,
          className: assignment.class.name,
          lessonTitle: assignment.lesson.title,
          lessonType: assignment.lesson.type,
          lessonPublished: assignment.lesson.isPublished,
          teacherName: assignment.teacher.name,
          teacherEmail: assignment.teacher.email,
          createdAt: assignment.createdAt,
          updatedAt: assignment.updatedAt,
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/assignments - Create a new assignment
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      throw ApiErrorClass.unauthorized("Authentication required");
    }

    // Get user from database to verify role
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true },
    });

    if (!user) {
      throw ApiErrorClass.notFound("User not found");
    }

    if (user.role !== "TEACHER" && user.role !== "ADMIN") {
      throw ApiErrorClass.forbidden("Only teachers can create assignments");
    }

    const body = await request.json();
    const { title, description, classId, lessonId, contentType, dueDate, timezone, status } =
      createAssignmentSchema.parse(body);

    // Verify that the user owns the class
    const classRecord = await prisma.class.findUnique({
      where: { id: classId },
      select: { id: true, teacherId: true },
    });

    if (!classRecord) {
      throw ApiErrorClass.notFound("Class not found");
    }

    if (classRecord.teacherId !== user.id) {
      throw ApiErrorClass.forbidden("You can only create assignments for your own classes");
    }

    // Verify that the lesson exists and is published (if assignment is being published)
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { id: true, title: true, isPublished: true },
    });

    if (!lesson) {
      throw ApiErrorClass.notFound("Lesson not found");
    }

    if (status === "PUBLISHED" && !lesson.isPublished) {
      throw ApiErrorClass.validation("Cannot publish assignment for unpublished lesson");
    }

    // Check for duplicate assignment
    const existingAssignment = await prisma.assignment.findUnique({
      where: {
        classId_lessonId: {
          classId,
          lessonId,
        },
      },
      select: { id: true, status: true },
    });

    if (existingAssignment && existingAssignment.status !== "CANCELLED") {
      throw ApiErrorClass.validation("An assignment for this lesson and class already exists");
    }

    // Parse and validate due date
    const dueDateObj = new Date(dueDate);
    if (isNaN(dueDateObj.getTime())) {
      throw ApiErrorClass.validation("Invalid due date format");
    }

    if (dueDateObj <= new Date()) {
      throw ApiErrorClass.validation("Due date must be in the future");
    }

    // Create the assignment
    const newAssignment = await prisma.assignment.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        classId,
        lessonId,
        contentType,
        status,
        dueDate: dueDateObj,
        timezone,
        teacherId: user.id,
        publishedAt: status === "PUBLISHED" ? new Date() : null,
      },
      include: {
        class: {
          select: {
            id: true,
            name: true,
          },
        },
        lesson: {
          select: {
            id: true,
            title: true,
            type: true,
          },
        },
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Emit audit log
    console.log(`Assignment created: ${newAssignment.id} by user ${user.id}`);

    return NextResponse.json(
      {
        success: true,
        data: {
          id: newAssignment.id,
          title: newAssignment.title,
          description: newAssignment.description,
          contentType: newAssignment.contentType,
          status: newAssignment.status,
          dueDate: newAssignment.dueDate,
          timezone: newAssignment.timezone,
          publishedAt: newAssignment.publishedAt,
          cancelledAt: newAssignment.cancelledAt,
          className: newAssignment.class.name,
          lessonTitle: newAssignment.lesson.title,
          lessonType: newAssignment.lesson.type,
          teacherName: newAssignment.teacher.name,
          teacherEmail: newAssignment.teacher.email,
          createdAt: newAssignment.createdAt,
          updatedAt: newAssignment.updatedAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
