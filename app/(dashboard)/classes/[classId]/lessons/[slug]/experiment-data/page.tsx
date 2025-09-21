import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { LessonType } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { getServerAuthSession } from "@/lib/auth";
import { sanitizeExperimentSubmission } from "@/lib/experiments";
import { prisma } from "@/lib/prisma";

type ExperimentDataPageProps = {
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

export default async function ExperimentDataPage({ params }: ExperimentDataPageProps) {
  const { classId, slug } = await Promise.resolve(params);

  const session = await getServerAuthSession();

  if (!session?.user) {
    redirect("/signin");
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
    notFound();
  }

  if (classroom.teacherId !== session.user.id) {
    redirect("/dashboard");
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
    notFound();
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

  const rows = submissions
    .map((submission) => {
      const data = sanitizeExperimentSubmission(submission);

      if (!data) {
        return null;
      }

      return {
        studentId: submission.student.id,
        studentName: submission.student.name ?? submission.student.email,
        email: submission.student.email,
        submittedAt: submission.submittedAt.toISOString(),
        data,
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
    .sort((a, b) => a.studentName.localeCompare(b.studentName));

  const csvDownloadHref = `/api/classes/${classroom.id}/lessons/${slug}/experiment-submissions?format=csv`;

  return (
    <section className="space-y-8">
      <div className="space-y-4">
        <Button variant="ghost" asChild>
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>

        <header className="space-y-2">
          <p className="text-sm uppercase tracking-wide text-muted-foreground">
            Experiment data submissions
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">{lesson.title}</h1>
          <p className="text-sm text-muted-foreground">Class: {classroom.name}</p>
        </header>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" asChild size="sm">
            <Link href={csvDownloadHref} prefetch={false}>
              Download CSV
            </Link>
          </Button>
          <Button variant="secondary" size="sm" asChild>
            <Link href={`/lessons/${slug}`}>View investigation</Link>
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border/70 bg-card/70 shadow-sm">
        <table className="min-w-full divide-y divide-border/60 text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left font-medium text-muted-foreground">
                Student
              </th>
              <th scope="col" className="px-6 py-3 text-left font-medium text-muted-foreground">
                Team
              </th>
              <th scope="col" className="px-6 py-3 text-left font-medium text-muted-foreground">
                Variable tested
              </th>
              <th scope="col" className="px-6 py-3 text-left font-medium text-muted-foreground">
                Initial → Final (°C)
              </th>
              <th scope="col" className="px-6 py-3 text-left font-medium text-muted-foreground">
                Submitted
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 bg-card/50">
            {rows.length ? (
              rows.map((submission) => (
                <tr key={submission.studentId}>
                  <td className="px-6 py-4 font-medium text-foreground">
                    <div className="space-y-1">
                      <p>{submission.studentName}</p>
                      <p className="text-xs text-muted-foreground">{submission.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {submission.data.teamName}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {submission.data.variableTested}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {submission.data.initialTemperatureC.toFixed(1)} → {" "}
                    {submission.data.finalTemperatureC.toFixed(1)}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {new Date(submission.submittedAt).toLocaleString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-6 py-8 text-center text-sm text-muted-foreground" colSpan={5}>
                  No submissions yet. Students can add data from the investigation page.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
