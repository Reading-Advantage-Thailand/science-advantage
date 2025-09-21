import { NextResponse } from "next/server";

import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await getServerAuthSession();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const classroom = await prisma.class.findFirst({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
    },
  });

  if (!classroom) {
    return NextResponse.json(
      { error: "No demo class configured" },
      { status: 400 }
    );
  }

  const enrollment = await prisma.classEnrollment.upsert({
    where: {
      classId_studentId: {
        classId: classroom.id,
        studentId: session.user.id,
      },
    },
    update: {},
    create: {
      classId: classroom.id,
      studentId: session.user.id,
    },
    select: {
      id: true,
    },
  });

  return NextResponse.json({
    classId: classroom.id,
    className: classroom.name,
    enrollmentId: enrollment.id,
  });
}
