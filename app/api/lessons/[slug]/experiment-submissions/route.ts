import { LessonType, Role } from "@prisma/client";
import { NextResponse } from "next/server";

import { getServerAuthSession } from "@/lib/auth";
import { findStudentClassContext } from "@/lib/class-context.server";
import { parseExperimentSubmissionPayload } from "@/lib/experiments";
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
      type: true,
    },
  });

  if (!lesson || lesson.type !== LessonType.EXPERIMENT) {
    return NextResponse.json({ error: "Experiment not found" }, { status: 404 });
  }

  const classContext = await findStudentClassContext(session.user.id);

  if (!classContext) {
    return NextResponse.json(
      { error: "Class enrollment required" },
      { status: 403 }
    );
  }

  const submission = await prisma.experimentSubmission.findUnique({
    where: {
      lessonId_studentId_classId: {
        lessonId: lesson.id,
        studentId: session.user.id,
        classId: classContext.id,
      },
    },
  });

  if (!submission) {
    return NextResponse.json({
      classContext,
      submission: null,
    });
  }

  return NextResponse.json({
    classContext,
    submission: {
      data: submission.data,
      submittedAt: submission.submittedAt.toISOString(),
    },
  });
}

export async function POST(request: Request, { params }: RouteContext) {
  const { slug } = await Promise.resolve(params);

  const session = await getServerAuthSession();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== Role.STUDENT) {
    return NextResponse.json({ error: "Only students can submit data" }, { status: 403 });
  }

  const lesson = await prisma.lesson.findUnique({
    where: { slug },
    select: {
      id: true,
      type: true,
    },
  });

  if (!lesson || lesson.type !== LessonType.EXPERIMENT) {
    return NextResponse.json({ error: "Experiment not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const record = body as Record<string, unknown>;
  const classId = typeof record.classId === "string" ? record.classId : undefined;

  const classContext = await findStudentClassContext(session.user.id, classId);

  if (!classContext) {
    return NextResponse.json(
      { error: "Unauthorized class access" },
      { status: 403 }
    );
  }

  const parsed = parseExperimentSubmissionPayload(record.data);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.errors.join(", ") }, { status: 400 });
  }

  const submission = await prisma.experimentSubmission.upsert({
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
      data: parsed.data,
    },
    update: {
      data: parsed.data,
      submittedAt: new Date(),
    },
    select: {
      data: true,
      submittedAt: true,
    },
  });

  return NextResponse.json({
    classContext,
    submission: {
      data: submission.data,
      submittedAt: submission.submittedAt.toISOString(),
    },
  });
}
