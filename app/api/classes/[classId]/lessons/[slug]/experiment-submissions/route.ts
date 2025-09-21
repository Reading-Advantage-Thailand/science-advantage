import { LessonType, Role } from "@prisma/client";
import { NextResponse } from "next/server";

import { getServerAuthSession } from "@/lib/auth";
import {
  experimentSubmissionsToCsv,
  sanitizeExperimentSubmission,
} from "@/lib/experiments";
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

export async function GET(request: Request, { params }: RouteContext) {
  const { classId, slug } = await Promise.resolve(params);

  const session = await getServerAuthSession();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== Role.TEACHER) {
    return NextResponse.json({ error: "Teachers only" }, { status: 403 });
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

  if (classroom.teacherId !== session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const lesson = await prisma.lesson.findUnique({
    where: { slug },
    select: {
      id: true,
      title: true,
      type: true,
    },
  });

  if (!lesson || lesson.type !== LessonType.EXPERIMENT) {
    return NextResponse.json({ error: "Experiment not found" }, { status: 404 });
  }

  const submissions = await prisma.experimentSubmission.findMany({
    where: {
      classId: classroom.id,
      lessonId: lesson.id,
    },
    include: {
      student: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      submittedAt: "desc",
    },
  });

  const sanitized = submissions
    .map((submission) => {
      const data = sanitizeExperimentSubmission(submission);

      if (!data) {
        return null;
      }

      return {
        studentId: submission.student.id,
        studentName: submission.student.name ?? submission.student.email,
        studentEmail: submission.student.email,
        submittedAt: submission.submittedAt,
        data,
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
    .sort((a, b) => a.studentName.localeCompare(b.studentName));

  const format = new URL(request.url).searchParams.get("format");

  if (format === "csv") {
    const csv = experimentSubmissionsToCsv({
      className: classroom.name,
      lessonTitle: lesson.title,
      submissions: sanitized,
    });

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${classroom.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-${lesson.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-submissions.csv"`,
      },
    });
  }

  return NextResponse.json({
    class: {
      id: classroom.id,
      name: classroom.name,
    },
    lesson: {
      id: lesson.id,
      title: lesson.title,
    },
    submissions: sanitized.map((submission) => ({
      studentId: submission.studentId,
      name: submission.studentName,
      email: submission.studentEmail,
      submittedAt: submission.submittedAt.toISOString(),
      data: submission.data,
    })),
  });
}
