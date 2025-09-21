import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { Role } from "@prisma/client";
import { LessonCompletionToggle } from "@/components/features/lessons/lesson-completion-toggle";
import { LessonContent } from "@/components/features/lessons/lesson-content";
import { LessonQuiz } from "@/components/features/lessons/lesson-quiz";
import { JoinDemoClassButton } from "@/components/features/demo/join-demo-class-button";
import { Button } from "@/components/ui/button";
import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ScoredResponse } from "@/lib/quiz";

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

  const isTeacher = session.user.role === Role.TEACHER;

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

  const quizQuestions = await prisma.quizQuestion.findMany({
    where: { lessonId: lesson.id },
    orderBy: { order: "asc" },
    select: {
      id: true,
      order: true,
      prompt: true,
      options: true,
    },
  });

  const latestAttempt = quizQuestions.length
    ? await prisma.attempt.findFirst({
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
      })
    : null;

  const sanitizeAttemptResponses = (value: unknown): ScoredResponse[] => {
    if (!Array.isArray(value)) {
      return [];
    }

    return value
      .map((entry) => {
        if (!entry || typeof entry !== "object") {
          return null;
        }

        const record = entry as Record<string, unknown>;
        const questionId = typeof record.questionId === "string" ? record.questionId : null;
        const correctAnswer =
          typeof record.correctAnswer === "string" ? record.correctAnswer : null;
        const selectedOption =
          typeof record.selectedOption === "string" ? record.selectedOption : null;
        const isCorrect = Boolean(record.isCorrect);

        if (!questionId || !correctAnswer) {
          return null;
        }

        return {
          questionId,
          correctAnswer,
          selectedOption,
          isCorrect,
        } satisfies ScoredResponse;
      })
      .filter((entry): entry is ScoredResponse => Boolean(entry));
  };

  const latestAttemptForClient = latestAttempt
    ? {
        id: latestAttempt.id,
        score: latestAttempt.score,
        maxScore: latestAttempt.maxScore,
        responses: sanitizeAttemptResponses(latestAttempt.responses),
        completedAt: latestAttempt.completedAt?.toISOString() ?? null,
        createdAt: latestAttempt.createdAt.toISOString(),
      }
    : null;

  const teacherClass = isTeacher
    ? await prisma.class.findFirst({
        where: { teacherId: session.user.id },
        select: {
          id: true,
          name: true,
        },
      })
    : null;

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
          ) : isTeacher ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Track quiz scores and lesson completion from your class dashboards.
              </p>
              {teacherClass ? (
                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link
                      href={`/classes/${teacherClass.id}/lessons/${slug}/scores`}
                    >
                      View quiz scores
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link
                      href={`/classes/${teacherClass.id}/lessons/${slug}/completions`}
                    >
                      View completion list
                    </Link>
                  </Button>
                </div>
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

      {quizQuestions.length ? (
        <LessonQuiz
          lessonSlug={slug}
          questions={quizQuestions}
          latestAttempt={latestAttemptForClient}
        />
      ) : null}
    </section>
  );
}
