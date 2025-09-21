"use client";

import { useEffect, useMemo, useState } from "react";

import { CheckCircle2, Loader2, RotateCcw, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ScoredResponse } from "@/lib/quiz";

type LessonQuizProps = {
  lessonSlug: string;
  questions: {
    id: string;
    order: number;
    prompt: string;
    options: string[];
  }[];
  latestAttempt?: {
    id: string;
    score: number;
    maxScore: number;
    responses: ScoredResponse[];
    completedAt: string | null;
    createdAt: string;
  } | null;
};

type ResponseState = Record<string, string>;

type SubmitPayload = {
  attempt?: {
    id: string;
    score: number;
    maxScore: number;
    responses: ScoredResponse[];
    completedAt: string | null;
    createdAt: string;
  };
  error?: string;
};

const toResponseState = (
  attempt: LessonQuizProps["latestAttempt"]
): ResponseState => {
  if (!attempt) {
    return {};
  }

  return attempt.responses.reduce<ResponseState>((state, response) => {
    if (response.selectedOption) {
      state[response.questionId] = response.selectedOption;
    }

    return state;
  }, {});
};

export function LessonQuiz({ lessonSlug, questions, latestAttempt }: LessonQuizProps) {
  const [answers, setAnswers] = useState<ResponseState>(() => toResponseState(latestAttempt ?? null));
  const [attempt, setAttempt] = useState<LessonQuizProps["latestAttempt"]>(
    latestAttempt ?? null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!latestAttempt) {
      setAttempt(null);
      setAnswers({});
      return;
    }

    setAttempt((current) =>
      current?.id === latestAttempt.id ? current : latestAttempt
    );
    setAnswers(toResponseState(latestAttempt));
  }, [latestAttempt]);

  const answeredCount = useMemo(
    () => questions.filter((question) => Boolean(answers[question.id])).length,
    [answers, questions]
  );

  const questionResults = useMemo(() => {
    if (!attempt) {
      return new Map<string, ScoredResponse>();
    }

    return new Map(attempt.responses.map((response) => [response.questionId, response]));
  }, [attempt]);

  const handleSelect = (questionId: string, option: string) => {
    if (isSubmitting || attempt) {
      return;
    }

    setAnswers((previous) => ({
      ...previous,
      [questionId]: option,
    }));
  };

  const handleSubmit = async () => {
    if (attempt) {
      return;
    }

    if (answeredCount !== questions.length) {
      setError("Answer every question before submitting.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/lessons/${lessonSlug}/quiz`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ responses: answers }),
      });

      let payload: SubmitPayload | null = null;

      try {
        payload = (await response.json()) as SubmitPayload;
      } catch {
        payload = null;
      }

      if (!response.ok || !payload?.attempt) {
        throw new Error(payload?.error ?? "Unable to score quiz");
      }

      setAttempt(payload.attempt);
      setAnswers(toResponseState(payload.attempt));
    } catch (exception) {
      setError(
        exception instanceof Error ? exception.message : "Failed to submit quiz"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetake = () => {
    setAttempt(null);
    setAnswers({});
    setError(null);
  };

  const actionButton = attempt ? (
    <Button
      variant="outline"
      size="sm"
      onClick={handleRetake}
      className="flex items-center gap-2"
    >
      <RotateCcw className="h-4 w-4" />
      Retake quiz
    </Button>
  ) : (
    <Button
      onClick={handleSubmit}
      disabled={isSubmitting}
      className="flex items-center gap-2"
    >
      {isSubmitting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Scoring…
        </>
      ) : (
        "Submit quiz"
      )}
    </Button>
  );

  return (
    <section className="space-y-6">
      <div className="rounded-xl border border-border/60 bg-card/70 p-4">
        <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Lesson quiz
        </p>
        <p className="text-sm text-muted-foreground">
          {questions.length} multiple-choice questions. Selected: {answeredCount}/
          {questions.length}.
        </p>
        {attempt ? (
          <p className="text-sm font-semibold text-foreground">
            Score: {attempt.score} / {attempt.maxScore}
          </p>
        ) : null}
      </div>

      <div className="space-y-6">
        {questions.map((question, index) => {
          const selected = answers[question.id];
          const result = questionResults.get(question.id);
          const isCorrect = result?.isCorrect ?? false;
          const showFeedback = Boolean(attempt);

          return (
            <article
              key={question.id}
              className="rounded-2xl border border-border/80 bg-card/60 p-6 shadow-sm"
            >
              <header className="space-y-2">
                <p className="text-sm font-semibold text-muted-foreground">
                  Question {index + 1}
                </p>
                <h3 className="text-lg font-medium text-foreground">
                  {question.prompt}
                </h3>
              </header>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {question.options.map((option) => {
                  const isSelected = selected === option;
                  const isCorrectOption = result?.correctAnswer === option;
                  const isIncorrectSelection = isSelected && !isCorrectOption;

                  return (
                    <button
                      key={option}
                      type="button"
                      disabled={Boolean(attempt) || isSubmitting}
                      onClick={() => handleSelect(question.id, option)}
                      className={cn(
                        "rounded-xl border px-4 py-3 text-left text-sm font-medium transition",
                        "hover:border-primary/60 hover:shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                        {
                          "border-primary bg-primary/10 text-primary":
                            !showFeedback && isSelected,
                          "border-emerald-500 bg-emerald-50 text-emerald-700":
                            showFeedback && isCorrectOption,
                          "border-destructive bg-destructive/10 text-destructive":
                            showFeedback && isIncorrectSelection,
                        },
                        showFeedback && !isCorrectOption && !isIncorrectSelection
                          ? "opacity-75"
                          : ""
                      )}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>

              {showFeedback ? (
                <div className="mt-4 flex items-center gap-2 text-sm">
                  {isCorrect ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span className="font-medium text-emerald-700">
                        You answered correctly.
                      </span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-destructive" />
                      <span className="font-medium text-destructive">
                        Correct answer: {result?.correctAnswer ?? "n/a"}
                      </span>
                    </>
                  )}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>

      <div className="space-y-2">
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <div className="flex justify-end">{actionButton}</div>
      </div>
    </section>
  );
}
