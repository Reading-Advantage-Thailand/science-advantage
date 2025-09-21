import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { LessonType, Role } from "@prisma/client";
import { ExperimentDataForm } from "@/components/features/experiments/experiment-data-form";
import { ExperimentGuide } from "@/components/features/experiments/experiment-guide";
import { LessonCompletionToggle } from "@/components/features/lessons/lesson-completion-toggle";
import { LessonContent } from "@/components/features/lessons/lesson-content";
import { LessonQuiz } from "@/components/features/lessons/lesson-quiz";
import { JoinDemoClassButton } from "@/components/features/demo/join-demo-class-button";
import { Button } from "@/components/ui/button";
import { getServerAuthSession } from "@/lib/auth";
import { isDevAuthEnabled } from "@/lib/dev-auth";
import { parseExperimentContent } from "@/lib/experiments";
import type { ExperimentSubmissionData } from "@/lib/experiments";
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
      type: true,
    },
  });

  if (!lesson) {
    notFound();
  }

  const isExperiment = lesson.type === LessonType.EXPERIMENT;

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

  const hasStudentEnrollment = !isTeacher && Boolean(enrollment);
  const demoEnrollmentEnabled = isDevAuthEnabled();

  if (!isTeacher && !enrollment && !demoEnrollmentEnabled) {
    redirect("/dashboard");
  }

  const experimentSubmission =
    isExperiment && !isTeacher && enrollment
      ? await prisma.experimentSubmission.findUnique({
          where: {
            lessonId_studentId_classId: {
              lessonId: lesson.id,
              studentId: session.user.id,
              classId: enrollment.classId,
            },
          },
          select: {
            data: true,
            submittedAt: true,
          },
        })
      : null;

  const experimentGuide = isExperiment ? parseExperimentContent(lesson.content) : null;

  const experimentSubmissionForClient = experimentSubmission
    ? {
        data: experimentSubmission.data as ExperimentSubmissionData,
        submittedAt: experimentSubmission.submittedAt?.toISOString() ?? null,
      }
    : null;

  const experimentTeacherLink =
    isTeacher && teacherClass && isExperiment
      ? `/classes/${teacherClass.id}/lessons/${slug}/experiment-data`
      : null;

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
          {hasStudentEnrollment ? (
            <div className="space-y-3">
              <LessonCompletionToggle
                lessonSlug={slug}
                classContext={enrollment?.class ?? null}
                initialCompleted={Boolean(completion)}
              />
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
                  {isExperiment ? (
                    <Button variant="outline" size="sm" asChild>
                      <Link
                        href={`/classes/${teacherClass.id}/lessons/${slug}/experiment-data`}
                      >
                        View experiment submissions
                      </Link>
                    </Button>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {demoEnrollmentEnabled
                  ? "Join the demo class to track your completion status."
                  : "Ask your teacher to add you to a class to access this lesson."}
              </p>
              {demoEnrollmentEnabled ? <JoinDemoClassButton /> : null}
            </div>
          )}
        </header>
      </div>

      {isExperiment && experimentGuide ? <ExperimentGuide guide={experimentGuide} /> : null}

      {isExperiment ? (
        isTeacher ? (
          experimentTeacherLink ? (
            <div className="space-y-2 rounded-2xl border border-border/70 bg-card/60 p-6 shadow-sm">
              <p className="text-sm text-muted-foreground">
                View class data submissions as they come in.
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link href={experimentTeacherLink}>View experiment submissions</Link>
              </Button>
            </div>
          ) : null
        ) : (
          <ExperimentDataForm
            lessonSlug={slug}
            classContext={enrollment?.class ?? null}
            initialSubmission={experimentSubmissionForClient}
          />
        )
      ) : (
        <>
          <LessonContent content={lesson.content} />

          {!isTeacher && quizQuestions.length ? (
            <LessonQuiz
              lessonSlug={slug}
              questions={quizQuestions}
              latestAttempt={latestAttemptForClient}
            />
          ) : null}
        </>
      )}
    </section>
  );
}
