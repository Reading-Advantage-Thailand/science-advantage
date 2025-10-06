import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApiErrorClass, handleApiError } from "@/lib/errors";
import { updateAssignmentSchema } from "@/lib/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/assignments/[id] - Get a specific assignment
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
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

    const { id } = await params;

    const assignment = await prisma.assignment.findUnique({
      where: { id },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            teacherId: true,
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
    });

    if (!assignment) {
      throw ApiErrorClass.notFound("Assignment not found");
    }

    // Check permissions: teachers can only view their own assignments, admins can view all
    if (user.role !== "ADMIN" && assignment.teacherId !== user.id) {
      throw ApiErrorClass.forbidden("You can only view your own assignments");
    }

    return NextResponse.json({
      success: true,
      data: {
        id: assignment.id,
        title: assignment.title,
        description: assignment.description,
        contentType: assignment.contentType,
        status: assignment.status,
        dueDate: assignment.dueDate,
        timezone: assignment.timezone,
        publishedAt: assignment.publishedAt,
        cancelledAt: assignment.cancelledAt,
        class: {
          id: assignment.class.id,
          name: assignment.class.name,
        },
        lesson: {
          id: assignment.lesson.id,
          title: assignment.lesson.title,
          type: assignment.lesson.type,
          isPublished: assignment.lesson.isPublished,
        },
        teacher: {
          id: assignment.teacher.id,
          name: assignment.teacher.name,
          email: assignment.teacher.email,
        },
        createdAt: assignment.createdAt,
        updatedAt: assignment.updatedAt,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PUT /api/assignments/[id] - Update a specific assignment
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
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
      throw ApiErrorClass.forbidden("Only teachers can update assignments");
    }

    const { id } = await params;

    // Get existing assignment
    const existingAssignment = await prisma.assignment.findUnique({
      where: { id },
      select: {
        id: true,
        teacherId: true,
        status: true,
        lessonId: true,
        classId: true,
      },
    });

    if (!existingAssignment) {
      throw ApiErrorClass.notFound("Assignment not found");
    }

    // Check permissions: teachers can only update their own assignments, admins can update all
    if (user.role !== "ADMIN" && existingAssignment.teacherId !== user.id) {
      throw ApiErrorClass.forbidden("You can only update your own assignments");
    }

    // Don't allow updates to cancelled assignments
    if (existingAssignment.status === "CANCELLED") {
      throw ApiErrorClass.validation("Cannot update cancelled assignments");
    }

    const body = await request.json();
    const validatedData = updateAssignmentSchema.parse(body);
    const { title, description, dueDate, timezone, status } = validatedData;

    // Validate status transitions
    if (status && existingAssignment.status !== status) {
      // Can't go back to DRAFT from PUBLISHED
      if (existingAssignment.status === "PUBLISHED" && status === "DRAFT") {
        throw ApiErrorClass.validation("Cannot change published assignment back to draft");
      }

      // If publishing, verify lesson is published
      if (status === "PUBLISHED") {
        const lesson = await prisma.lesson.findUnique({
          where: { id: existingAssignment.lessonId },
          select: { isPublished: true },
        });

        if (!lesson?.isPublished) {
          throw ApiErrorClass.validation("Cannot publish assignment for unpublished lesson");
        }
      }
    }

    // Validate due date if provided
    let dueDateObj: Date | undefined;
    if (dueDate) {
      dueDateObj = new Date(dueDate);
      if (isNaN(dueDateObj.getTime())) {
        throw ApiErrorClass.validation("Invalid due date format");
      }

      if (dueDateObj <= new Date()) {
        throw ApiErrorClass.validation("Due date must be in the future");
      }
    }

    // Prepare update data
    const updateData: {
      title?: string;
      description?: string | null;
      dueDate?: Date;
      timezone?: string;
      status?: "DRAFT" | "PUBLISHED" | "CANCELLED";
      publishedAt?: Date;
      cancelledAt?: Date;
    } = {};

    if (title !== undefined) {
      updateData.title = title.trim();
    }

    if (description !== undefined) {
      updateData.description = description?.trim() || null;
    }

    if (dueDateObj !== undefined) {
      updateData.dueDate = dueDateObj;
    }

    if (timezone !== undefined) {
      updateData.timezone = timezone;
    }

    if (status !== undefined) {
      updateData.status = status;

      // Set timestamps based on status
      if (status === "PUBLISHED" && existingAssignment.status !== "PUBLISHED") {
        updateData.publishedAt = new Date();
      }
      if (status === "CANCELLED") {
        // existingAssignment.status can't be "CANCELLED" here due to earlier check
        updateData.cancelledAt = new Date();
      }
    }

    // Update the assignment
    const updatedAssignment = await prisma.assignment.update({
      where: { id },
      data: updateData,
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
    });

    // Emit audit log
    console.log(`Assignment updated: ${updatedAssignment.id} by user ${user.id}`);

    return NextResponse.json({
      success: true,
      data: {
        id: updatedAssignment.id,
        title: updatedAssignment.title,
        description: updatedAssignment.description,
        contentType: updatedAssignment.contentType,
        status: updatedAssignment.status,
        dueDate: updatedAssignment.dueDate,
        timezone: updatedAssignment.timezone,
        publishedAt: updatedAssignment.publishedAt,
        cancelledAt: updatedAssignment.cancelledAt,
        class: {
          id: updatedAssignment.class.id,
          name: updatedAssignment.class.name,
        },
        lesson: {
          id: updatedAssignment.lesson.id,
          title: updatedAssignment.lesson.title,
          type: updatedAssignment.lesson.type,
          isPublished: updatedAssignment.lesson.isPublished,
        },
        teacher: {
          id: updatedAssignment.teacher.id,
          name: updatedAssignment.teacher.name,
          email: updatedAssignment.teacher.email,
        },
        createdAt: updatedAssignment.createdAt,
        updatedAt: updatedAssignment.updatedAt,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/assignments/[id] - Delete a specific assignment
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
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
      throw ApiErrorClass.forbidden("Only teachers can delete assignments");
    }

    const { id } = await params;

    // Get existing assignment
    const existingAssignment = await prisma.assignment.findUnique({
      where: { id },
      select: {
        id: true,
        teacherId: true,
        status: true,
      },
    });

    if (!existingAssignment) {
      throw ApiErrorClass.notFound("Assignment not found");
    }

    // Check permissions: teachers can only delete their own assignments, admins can delete all
    if (user.role !== "ADMIN" && existingAssignment.teacherId !== user.id) {
      throw ApiErrorClass.forbidden("You can only delete your own assignments");
    }

    // Don't allow deletion of published assignments (cancel instead)
    if (existingAssignment.status === "PUBLISHED") {
      throw ApiErrorClass.validation("Cannot delete published assignments. Cancel them instead.");
    }

    // Delete the assignment
    await prisma.assignment.delete({
      where: { id },
    });

    // Emit audit log
    console.log(`Assignment deleted: ${id} by user ${user.id}`);

    return NextResponse.json({
      success: true,
      message: "Assignment deleted successfully",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
