import { Role } from "@prisma/client";
import { NextResponse } from "next/server";

import { getServerAuthSession } from "@/lib/auth";
import { findStudentClassContext } from "@/lib/class-context.server";
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

export async function GET(_: Request, { params }: RouteContext) {
  const { slug } = await Promise.resolve(params);

  const session = await getServerAuthSession();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== Role.STUDENT) {
    return NextResponse.json({ error: "Students only" }, { status: 403 });
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

  const classContext = await findStudentClassContext(session.user.id);

  if (!classContext) {
    return NextResponse.json(
      { error: "Class enrollment required" },
      { status: 403 }
    );
  }

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

  const completion = existing
    ? {
        completed: true,
        completedAt: existing.completedAt.toISOString(),
      }
    : { completed: false };

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

  if (session.user.role !== Role.STUDENT) {
    return NextResponse.json({ error: "Students only" }, { status: 403 });
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

  const classId = typeof body.classId === "string" ? body.classId : null;

  if (!classId) {
    return NextResponse.json(
      { error: "Class enrollment required" },
      { status: 400 }
    );
  }

  const classContext = await findStudentClassContext(session.user.id, classId);

  if (!classContext) {
    return NextResponse.json(
      { error: "Unauthorized class access" },
      { status: 403 }
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
