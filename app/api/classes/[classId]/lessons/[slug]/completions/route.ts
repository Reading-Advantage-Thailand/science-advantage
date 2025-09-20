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
    where: {
      id: classId,
    },
    select: {
      id: true,
      name: true,
      teacherId: true,
    },
  });

  if (!classroom) {
    return NextResponse.json({ error: "Class not found" }, { status: 404 });
  }

  const isTeacher = classroom.teacherId === session.user.id;

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

  const completions = await prisma.lessonCompletion.findMany({
    where: {
      classId: classroom.id,
      lessonId: lesson.id,
    },
    select: {
      studentId: true,
      completedAt: true,
    },
  });

  const completionMap = new Map(
    completions.map((completion) => [completion.studentId, completion.completedAt])
  );

  const students = enrollments
    .map((enrollment) => {
      const completedAt = completionMap.get(enrollment.student.id);

      return {
        studentId: enrollment.student.id,
        name: enrollment.student.name ?? enrollment.student.email,
        email: enrollment.student.email,
        completed: Boolean(completedAt),
        completedAt: completedAt ? completedAt.toISOString() : null,
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
