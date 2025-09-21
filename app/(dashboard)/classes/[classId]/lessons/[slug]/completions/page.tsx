import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type LessonCompletionListPageProps = {
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

export default async function LessonCompletionListPage({
  params,
}: LessonCompletionListPageProps) {
  const { classId, slug } = await Promise.resolve(params);

  const session = await getServerAuthSession();

  if (!session?.user) {
    redirect("/signin");
  }

  const classroom = await prisma.class.findUnique({
    where: {
      id: classId,
    },
    select: {
      id: true,
      name: true,
      teacherId: true,
      enrollments: {
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  if (!classroom) {
    notFound();
  }

  const isTeacher = classroom.teacherId === session.user.id;

  if (!isTeacher) {
    redirect("/dashboard");
  }

  const lesson = await prisma.lesson.findUnique({
    where: { slug },
    select: {
      id: true,
      title: true,
    },
  });

  if (!lesson) {
    notFound();
  }

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

  const students = classroom.enrollments
    .map(({ student }) => {
      const completedAt = completionMap.get(student.id);

      return {
        id: student.id,
        name: student.name ?? student.email,
        email: student.email,
        completed: Boolean(completedAt),
        completedAt,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <section className="space-y-8">
      <div className="space-y-4">
        <Button variant="ghost" asChild>
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>

        <header className="space-y-2">
          <p className="text-sm uppercase tracking-wide text-muted-foreground">
            Lesson completion overview
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">
            {lesson.title}
          </h1>
          <p className="text-sm text-muted-foreground">Class: {classroom.name}</p>
        </header>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border/70 bg-card/70 shadow-sm">
        <table className="min-w-full divide-y divide-border/60 text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left font-medium text-muted-foreground">
                Student
              </th>
              <th scope="col" className="px-6 py-3 text-left font-medium text-muted-foreground">
                Email
              </th>
              <th scope="col" className="px-6 py-3 text-left font-medium text-muted-foreground">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 bg-card/50">
            {students.map((student) => (
              <tr key={student.id}>
                <td className="px-6 py-4 font-medium text-foreground">{student.name}</td>
                <td className="px-6 py-4 text-muted-foreground">{student.email}</td>
                <td className="px-6 py-4">
                  {student.completed ? (
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                      Completed
                    </span>
                  ) : (
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                      Pending
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
