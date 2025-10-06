"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

type LessonCompletionToggleProps = {
  lessonSlug: string;
  classContext?: {
    id: string;
    name: string;
  } | null;
  initialCompleted?: boolean;
};

export function LessonCompletionToggle({
  lessonSlug,
  classContext,
  initialCompleted = false,
}: LessonCompletionToggleProps) {
  const [context, setContext] = useState(classContext ?? null);
  const [completed, setCompleted] = useState(initialCompleted);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const actionLabel = completed ? "Mark incomplete" : "Mark complete";

  const handleToggle = () => {
    if (!context) {
      setError("Ask your teacher to add you to a class before marking completion.");
      return;
    }

    setError(null);

    startTransition(async () => {
      try {
        const response = await fetch(`/api/lessons/${lessonSlug}/completion`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            completed: !completed,
            classId: context?.id,
          }),
        });

        let payload: {
          completion?: { completed: boolean };
          classContext?: { id: string; name: string } | null;
          error?: string;
        } | null = null;

        try {
          payload = (await response.json()) as {
            completion?: { completed: boolean };
            classContext?: { id: string; name: string } | null;
            error?: string;
          };
        } catch {
          payload = null;
        }

        if (!response.ok || !payload?.completion) {
          throw new Error(payload?.error ?? "Failed to update completion");
        }

        setCompleted(payload.completion.completed);

        if (payload.classContext !== undefined) {
          setContext(payload.classContext ?? null);
        }
      } catch (exception) {
        setError(exception instanceof Error ? exception.message : "Unable to update completion");
      }
    });
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            {context ? `Completion for ${context.name}` : "Completion"}
          </p>
          <p className={cn("text-sm", completed ? "text-emerald-600" : "text-muted-foreground")}>
            {completed ? "Marked complete" : "Not yet completed"}
          </p>
        </div>

        <Button
          onClick={handleToggle}
          disabled={isPending || !context}
          variant={completed ? "outline" : "default"}
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : (
            actionLabel
          )}
        </Button>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
