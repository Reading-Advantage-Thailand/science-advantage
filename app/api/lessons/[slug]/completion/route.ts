import { Role } from "@prisma/client";
import { NextResponse } from "next/server";

import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params:
    | {
        slug: string;
      }
    | Promise<{
        slug: string;
      }>;
};

async function resolveClassContext(userId: string, role: Role, classId?: string) {
  if (classId) {
    const enrollment = await prisma.classEnrollment.findFirst({
      where: {
        classId,
        studentId: userId,
      },
      select: {
        classId: true,
        class: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!enrollment) {
      return null;
    }

    return enrollment.class;
  }

  const enrollment = await prisma.classEnrollment.findFirst({
    where: {
      studentId: userId,
    },
    orderBy: {
      createdAt: "asc",
    },
    select: {
      classId: true,
      class: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return enrollment?.class ?? null;
}

export async function GET(_: Request, { params }: RouteContext) {
  const { slug } = await Promise.resolve(params);

  const session = await getServerAuthSession();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const lesson = await prisma.lesson.findUnique({
    where: { slug },
    select: {
      id: true,
      title: true,
      summary: true,
      content: true,
    },
  });

  if (!lesson) {
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
  }

  const classContext = await resolveClassContext(session.user.id, session.user.role);

  let completion: { completed: boolean; completedAt?: string } = { completed: false };

  if (classContext) {
    const existing = await prisma.lessonCompletion.findUnique({
      where: {
        lessonId_studentId_classId: {
          lessonId: lesson.id,
          studentId: session.user.id,
          classId: classContext.id,
        },
      },
      select: {
        completedAt: true,
      },
    });

    if (existing) {
      completion = {
        completed: true,
        completedAt: existing.completedAt.toISOString(),
      };
    }
  }

  return NextResponse.json({
    lesson,
    classContext,
    completion,
  });
}

export async function POST(request: Request, { params }: RouteContext) {
  const { slug } = await Promise.resolve(params);

  const session = await getServerAuthSession();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const lesson = await prisma.lesson.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (!lesson) {
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);

  if (!body || typeof body.completed !== "boolean") {
    return NextResponse.json(
      { error: "Invalid payload" },
      { status: 400 }
    );
  }

  const classContext = await resolveClassContext(session.user.id, session.user.role, body.classId);

  if (!classContext) {
    return NextResponse.json(
      { error: "No class context for completion" },
      { status: 400 }
    );
  }

  if (body.completed) {
    const completion = await prisma.lessonCompletion.upsert({
      where: {
        lessonId_studentId_classId: {
          lessonId: lesson.id,
          studentId: session.user.id,
          classId: classContext.id,
        },
      },
      create: {
        lessonId: lesson.id,
        studentId: session.user.id,
        classId: classContext.id,
      },
      update: {
        completedAt: new Date(),
      },
      select: {
        completedAt: true,
      },
    });

    return NextResponse.json({
      classContext,
      completion: {
        completed: true,
        completedAt: completion.completedAt.toISOString(),
      },
    });
  }

  await prisma.lessonCompletion.deleteMany({
    where: {
      lessonId: lesson.id,
      studentId: session.user.id,
      classId: classContext.id,
    },
  });

  return NextResponse.json({
    classContext,
    completion: {
      completed: false,
    },
  });
}
