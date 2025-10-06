import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { ApiErrorClass, handleApiError } from "@/lib/errors";

// Validation schema for class updates
const UpdateClassSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).nullable().optional(),
});

interface RouteParams {
  params: Promise<{ classId: string }>;
}

/**
 * GET /api/classes/[classId] - Get a specific class
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { classId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      throw ApiErrorClass.unauthorized("Authentication required");
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true },
    });

    if (!user) {
      throw ApiErrorClass.notFound("User not found");
    }

    // Get the class
    const classData = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        teacher: {
          select: { id: true, name: true, email: true },
        },
        enrollments: {
          include: {
            student: {
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: {
            enrollments: true,
            lessonCompletions: true,
            experimentSubmissions: true,
          },
        },
      },
    });

    if (!classData) {
      throw ApiErrorClass.notFound("Class not found");
    }

    // Check authorization: teacher can only access their own classes, admins can access all
    if (user.role !== "ADMIN" && classData.teacherId !== user.id) {
      throw ApiErrorClass.forbidden("Access denied to this class");
    }

    return NextResponse.json({
      success: true,
      data: {
        id: classData.id,
        name: classData.name,
        description: classData.description,
        joinCode: classData.joinCode,
        teacher: classData.teacher,
        enrollments: classData.enrollments,
        stats: {
          studentCount: classData._count.enrollments,
          lessonCompletions: classData._count.lessonCompletions,
          experimentSubmissions: classData._count.experimentSubmissions,
        },
        createdAt: classData.createdAt,
        updatedAt: classData.updatedAt,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PUT /api/classes/[classId] - Update a specific class
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { classId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      throw ApiErrorClass.unauthorized("Authentication required");
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true },
    });

    if (!user) {
      throw ApiErrorClass.notFound("User not found");
    }

    if (user.role !== "TEACHER" && user.role !== "ADMIN") {
      throw ApiErrorClass.forbidden("Only teachers can update classes");
    }

    // Get the existing class
    const existingClass = await prisma.class.findUnique({
      where: { id: classId },
      select: { id: true, teacherId: true, name: true },
    });

    if (!existingClass) {
      throw ApiErrorClass.notFound("Class not found");
    }

    // Check authorization
    if (user.role !== "ADMIN" && existingClass.teacherId !== user.id) {
      throw ApiErrorClass.forbidden("Access denied to this class");
    }

    const body = await request.json();
    const updateData = UpdateClassSchema.parse(body);

    // If updating name, check for duplicates
    if (updateData.name && updateData.name !== existingClass.name) {
      const duplicateClass = await prisma.class.findFirst({
        where: {
          teacherId: user.id,
          name: updateData.name.trim(),
          id: { not: classId },
        },
      });

      if (duplicateClass) {
        throw ApiErrorClass.validation("You already have a class with this name");
      }
    }

    // Update the class
    const updatedClass = await prisma.class.update({
      where: { id: classId },
      data: {
        ...(updateData.name && { name: updateData.name.trim() }),
        ...(updateData.description !== undefined && {
          description: updateData.description?.trim() || null,
        }),
      },
      include: {
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: updatedClass.id,
        name: updatedClass.name,
        description: updatedClass.description,
        joinCode: updatedClass.joinCode,
        studentCount: updatedClass._count.enrollments,
        createdAt: updatedClass.createdAt,
        updatedAt: updatedClass.updatedAt,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/classes/[classId] - Delete a specific class
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { classId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      throw ApiErrorClass.unauthorized("Authentication required");
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true },
    });

    if (!user) {
      throw ApiErrorClass.notFound("User not found");
    }

    if (user.role !== "TEACHER" && user.role !== "ADMIN") {
      throw ApiErrorClass.forbidden("Only teachers can delete classes");
    }

    // Get the existing class
    const existingClass = await prisma.class.findUnique({
      where: { id: classId },
      select: { id: true, teacherId: true },
    });

    if (!existingClass) {
      throw ApiErrorClass.notFound("Class not found");
    }

    // Check authorization
    if (user.role !== "ADMIN" && existingClass.teacherId !== user.id) {
      throw ApiErrorClass.forbidden("Access denied to this class");
    }

    // Delete the class (hard delete for now, can be changed to soft delete later)
    await prisma.class.delete({
      where: { id: classId },
    });

    // Emit audit log
    console.log(`Class deleted: ${classId} by user ${user.id}`);

    return NextResponse.json({
      success: true,
      message: "Class deleted successfully",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
