import { Role } from "@prisma/client";
import { NextResponse } from "next/server";

import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params:
    | {
        classId: string;
        slug: string;
      }
    | Promise<{
        classId: string;
        slug: string;
      }>;
};

export async function GET(_: Request, { params }: RouteContext) {
  const { classId, slug } = await Promise.resolve(params);

  const session = await getServerAuthSession();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const classroom = await prisma.class.findUnique({
    where: { id: classId },
    select: {
      id: true,
      name: true,
      teacherId: true,
    },
  });

  if (!classroom) {
    return NextResponse.json({ error: "Class not found" }, { status: 404 });
  }

  const isTeacher =
    session.user.role === Role.TEACHER && classroom.teacherId === session.user.id;

  if (!isTeacher) {
    const membership = await prisma.classEnrollment.findFirst({
      where: {
        classId: classroom.id,
        studentId: session.user.id,
      },
      select: { id: true },
    });

    if (!membership) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
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

  const enrollments = await prisma.classEnrollment.findMany({
    where: { classId: classroom.id },
    include: {
      student: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  const studentIds = enrollments.map((enrollment) => enrollment.student.id);

  if (studentIds.length === 0) {
    return NextResponse.json({
      class: {
        id: classroom.id,
        name: classroom.name,
      },
      lesson,
      students: [],
    });
  }

  const attempts = await prisma.attempt.findMany({
    where: {
      lessonId: lesson.id,
      studentId: { in: studentIds },
    },
    orderBy: [
      { completedAt: "desc" },
      { createdAt: "desc" },
    ],
    select: {
      id: true,
      studentId: true,
      score: true,
      maxScore: true,
      completedAt: true,
      createdAt: true,
    },
  });

  const attemptMap = new Map<string, (typeof attempts)[number]>();

  for (const attempt of attempts) {
    if (!attemptMap.has(attempt.studentId)) {
      attemptMap.set(attempt.studentId, attempt);
    }
  }

  const students = enrollments
    .map((enrollment) => {
      const attempt = attemptMap.get(enrollment.student.id);

      return {
        studentId: enrollment.student.id,
        name: enrollment.student.name ?? enrollment.student.email,
        email: enrollment.student.email,
        score: attempt ? attempt.score : null,
        maxScore: attempt ? attempt.maxScore : null,
        completedAt: attempt?.completedAt
          ? attempt.completedAt.toISOString()
          : null,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  return NextResponse.json({
    class: {
      id: classroom.id,
      name: classroom.name,
    },
    lesson,
    students,
  });
}
