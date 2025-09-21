import { Role } from "@prisma/client";
import { NextResponse } from "next/server";

import { getServerAuthSession } from "@/lib/auth";
import { findStudentClassContext } from "@/lib/class-context.server";
import { prisma } from "@/lib/prisma";
import { sanitizeResponses, scoreQuizAttempt } from "@/lib/quiz";

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

  const questions = await prisma.quizQuestion.findMany({
    where: { lessonId: lesson.id },
    orderBy: { order: "asc" },
    select: {
      id: true,
      order: true,
      prompt: true,
      options: true,
    },
  });

  const attempt = await prisma.attempt.findFirst({
    where: {
      lessonId: lesson.id,
      studentId: session.user.id,
    },
    orderBy: [
      { completedAt: "desc" },
      { createdAt: "desc" },
    ],
    select: {
      id: true,
      score: true,
      maxScore: true,
      responses: true,
      completedAt: true,
      createdAt: true,
    },
  });

  return NextResponse.json({
    lesson,
    questions,
    latestAttempt: attempt
      ? {
          id: attempt.id,
          score: attempt.score,
          maxScore: attempt.maxScore,
          responses: attempt.responses,
          completedAt: attempt.completedAt?.toISOString() ?? null,
          createdAt: attempt.createdAt.toISOString(),
        }
      : null,
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
    select: {
      id: true,
      title: true,
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

  const questions = await prisma.quizQuestion.findMany({
    where: { lessonId: lesson.id },
    orderBy: { order: "asc" },
    select: {
      id: true,
      prompt: true,
      options: true,
      answer: true,
    },
  });

  if (questions.length === 0) {
    return NextResponse.json(
      { error: "Quiz not available for this lesson" },
      { status: 400 }
    );
  }

  const body = await request.json().catch(() => null);
  const responses = sanitizeResponses(body?.responses);

  if (!responses) {
    return NextResponse.json(
      { error: "Invalid responses payload" },
      { status: 400 }
    );
  }

  const scoringResult = scoreQuizAttempt(questions, responses);

  const attempt = await prisma.attempt.create({
    data: {
      studentId: session.user.id,
      lessonId: lesson.id,
      score: scoringResult.score,
      maxScore: scoringResult.maxScore,
      responses: scoringResult.responses,
      completedAt: new Date(),
    },
    select: {
      id: true,
      score: true,
      maxScore: true,
      responses: true,
      completedAt: true,
      createdAt: true,
    },
  });

  return NextResponse.json({
    lesson,
    attempt: {
      id: attempt.id,
      score: attempt.score,
      maxScore: attempt.maxScore,
      responses: attempt.responses,
      completedAt: attempt.completedAt?.toISOString() ?? null,
      createdAt: attempt.createdAt.toISOString(),
    },
  });
}
