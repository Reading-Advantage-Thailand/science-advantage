import { prisma } from "@/lib/prisma";

export type StudentClassContext = {
  id: string;
  name: string;
};

type EnrollmentWithClass = {
  classId: string;
  class: StudentClassContext;
};

export async function findStudentEnrollment(
  studentId: string
): Promise<EnrollmentWithClass | null> {
  return prisma.classEnrollment.findFirst({
    where: { studentId },
    orderBy: { createdAt: "asc" },
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
}

export async function findStudentClassContext(
  studentId: string,
  classId?: string
): Promise<StudentClassContext | null> {
  if (classId) {
    const enrollment = await prisma.classEnrollment.findFirst({
      where: {
        classId,
        studentId,
      },
      select: {
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

  const enrollment = await findStudentEnrollment(studentId);

  return enrollment?.class ?? null;
}
