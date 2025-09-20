import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { LessonCompletionToggle } from "@/components/features/lessons/lesson-completion-toggle";
import { LessonContent } from "@/components/features/lessons/lesson-content";
import { JoinDemoClassButton } from "@/components/features/demo/join-demo-class-button";
import { Button } from "@/components/ui/button";
import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type LessonPageProps = {
  params: {
    slug: string;
  } | Promise<{
    slug: string;
  }>;
};

export default async function LessonPage({ params }: LessonPageProps) {
  const { slug } = await Promise.resolve(params);

  const session = await getServerAuthSession();

  if (!session?.user) {
    redirect("/signin");
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
    notFound();
  }

  const enrollment = await prisma.classEnrollment.findFirst({
    where: {
      studentId: session.user.id,
    },
    orderBy: {
      createdAt: "asc",
    },
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

  const completion = enrollment
    ? await prisma.lessonCompletion.findUnique({
        where: {
          lessonId_studentId_classId: {
            lessonId: lesson.id,
            studentId: session.user.id,
            classId: enrollment.classId,
          },
        },
        select: {
          completedAt: true,
        },
      })
    : null;

  const hasEnrollment = Boolean(enrollment);

  return (
    <section className="space-y-8">
      <div className="space-y-4">
        <Button variant="ghost" asChild>
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>

        <header className="space-y-3">
          <p className="text-sm uppercase tracking-wide text-muted-foreground">
            Lesson viewer
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">{lesson.title}</h1>
          {lesson.summary ? (
            <p className="text-base text-muted-foreground">{lesson.summary}</p>
          ) : null}
          {hasEnrollment ? (
            <div className="space-y-3">
              <LessonCompletionToggle
                lessonSlug={slug}
                classContext={enrollment?.class ?? null}
                initialCompleted={Boolean(completion)}
              />
              {enrollment?.class ? (
                <Button variant="outline" size="sm" asChild>
                  <Link
                    href={`/classes/${enrollment.class.id}/lessons/${slug}/completions`}
                  >
                    View class completion list
                  </Link>
                </Button>
              ) : null}
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Join the demo class to track your completion status.
              </p>
              <JoinDemoClassButton />
            </div>
          )}
        </header>
      </div>

      <LessonContent content={lesson.content} />
    </section>
  );
}
