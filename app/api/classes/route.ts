import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateUniqueJoinCode } from "@/lib/join-code";
import { z } from "zod";
import { ApiErrorClass, handleApiError } from "@/lib/errors";

// Validation schema for class creation
const CreateClassSchema = z.object({
  name: z.string().min(1, "Class name is required").max(100, "Class name too long"),
  description: z.string().max(500, "Description too long").optional(),
});

// Validation schema for class listing
const ListClassesSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

/**
 * GET /api/classes - List classes for the authenticated teacher
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
      throw ApiErrorClass.forbidden("Only teachers can list classes");
    }

    const { searchParams } = new URL(request.url);
    const { page, limit } = ListClassesSchema.parse({
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
    });

    const where = { teacherId: user.id };

    const [classes, total] = await Promise.all([
      prisma.class.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          _count: {
            select: {
              enrollments: true,
            },
          },
        },
      }),
      prisma.class.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        classes: classes.map((cls) => ({
          id: cls.id,
          name: cls.name,
          description: cls.description,
          joinCode: cls.joinCode,
          studentCount: cls._count.enrollments,
          createdAt: cls.createdAt,
          updatedAt: cls.updatedAt,
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
 * POST /api/classes - Create a new class
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
      throw ApiErrorClass.forbidden("Only teachers can create classes");
    }

    const body = await request.json();
    const { name, description } = CreateClassSchema.parse(body);

    // Check if user already has a class with the same name
    const existingClass = await prisma.class.findFirst({
      where: {
        teacherId: user.id,
        name: name.trim(),
      },
    });

    if (existingClass) {
      throw ApiErrorClass.validation("You already have a class with this name");
    }

    // Generate unique join code
    const joinCode = await generateUniqueJoinCode(
      async (code) => {
        const existing = await prisma.class.findUnique({
          where: { joinCode: code },
          select: { id: true },
        });
        return !!existing;
      },
      { length: 6, excludeSimilar: true },
      10
    );

    // Create the class
    const newClass = await prisma.class.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        joinCode,
        teacherId: user.id,
      },
      include: {
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
    });

    // Emit audit log
    console.log(`Class created: ${newClass.id} by user ${user.id}`);

    return NextResponse.json(
      {
        success: true,
        data: {
          id: newClass.id,
          name: newClass.name,
          description: newClass.description,
          joinCode: newClass.joinCode,
          studentCount: newClass._count.enrollments,
          createdAt: newClass.createdAt,
          updatedAt: newClass.updatedAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
