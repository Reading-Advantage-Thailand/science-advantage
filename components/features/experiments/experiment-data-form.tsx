"use client";

import { useMemo, useState, useTransition } from "react";

import type { ExperimentSubmissionData } from "@/lib/experiments";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export type ExperimentDataFormProps = {
  lessonSlug: string;
  classContext: {
    id: string;
    name: string;
  } | null;
  initialSubmission: {
    data: ExperimentSubmissionData;
    submittedAt: string | null;
  } | null;
};

type FormState = {
  teamName: string;
  variableTested: string;
  initialTemperatureC: string;
  finalTemperatureC: string;
  observations: string;
};

const toFormState = (data: ExperimentSubmissionData | null): FormState => ({
  teamName: data?.teamName ?? "",
  variableTested: data?.variableTested ?? "",
  initialTemperatureC:
    data?.initialTemperatureC !== undefined ? data.initialTemperatureC.toString() : "",
  finalTemperatureC:
    data?.finalTemperatureC !== undefined ? data.finalTemperatureC.toString() : "",
  observations: data?.observations ?? "",
});

export function ExperimentDataForm({
  lessonSlug,
  classContext,
  initialSubmission,
}: ExperimentDataFormProps) {
  const [form, setForm] = useState<FormState>(toFormState(initialSubmission?.data ?? null));
  const [lastSubmittedAt, setLastSubmittedAt] = useState<string | null>(
    initialSubmission?.submittedAt ?? null
  );
  const [message, setMessage] = useState<{ variant: "success" | "error"; text: string } | null>(
    null
  );
  const [isPending, startTransition] = useTransition();

  const isDisabled = !classContext || isPending;

  const handleFieldChange = (field: keyof FormState) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = event.target.value;
      setForm((previous) => ({
        ...previous,
        [field]: value,
      }));
    };

  const payload = useMemo(() => {
    const convert = (value: string) => {
      const trimmed = value.trim();

      if (!trimmed) {
        return null;
      }

      const numeric = Number(trimmed);

      return Number.isFinite(numeric) ? numeric : trimmed;
    };

    return {
      teamName: form.teamName.trim(),
      variableTested: form.variableTested.trim(),
      initialTemperatureC: convert(form.initialTemperatureC),
      finalTemperatureC: convert(form.finalTemperatureC),
      observations: form.observations.trim(),
    } satisfies Record<string, unknown>;
  }, [form]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!classContext) {
      setMessage({ variant: "error", text: "Join a class to submit experiment data." });
      return;
    }

    setMessage(null);

    startTransition(async () => {
      try {
        const response = await fetch(`/api/lessons/${lessonSlug}/experiment-submissions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            classId: classContext.id,
            data: payload,
          }),
        });

        const result = await response.json().catch(() => null);

        if (!response.ok || !result?.submission?.data) {
          throw new Error(result?.error ?? "Unable to save submission");
        }

        setForm(toFormState(result.submission.data));
        setLastSubmittedAt(result.submission.submittedAt ?? null);
        setMessage({ variant: "success", text: "Experiment data saved." });
      } catch (error) {
        setMessage({
          variant: "error",
          text:
            error instanceof Error ? error.message : "We could not save your data right now.",
        });
      }
    });
  };

  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Data collection
        </p>
        <p className="text-sm text-muted-foreground">
          {classContext
            ? `Submitting for ${classContext.name}`
            : "Join your class to enable experiment submissions."}
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="team-name">
              Team name
            </label>
            <Input
              id="team-name"
              value={form.teamName}
              onChange={handleFieldChange("teamName")}
              placeholder="Avery & Jordan"
              disabled={isDisabled}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="variable-tested">
              Variable tested
            </label>
            <Input
              id="variable-tested"
              value={form.variableTested}
              onChange={handleFieldChange("variableTested")}
              placeholder="Cover material"
              disabled={isDisabled}
              required
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="initial-temp">
              Initial temperature (°C)
            </label>
            <Input
              id="initial-temp"
              value={form.initialTemperatureC}
              onChange={handleFieldChange("initialTemperatureC")}
              placeholder="21.5"
              inputMode="decimal"
              disabled={isDisabled}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="final-temp">
              Final temperature (°C)
            </label>
            <Input
              id="final-temp"
              value={form.finalTemperatureC}
              onChange={handleFieldChange("finalTemperatureC")}
              placeholder="29.2"
              inputMode="decimal"
              disabled={isDisabled}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground" htmlFor="observations">
            Observations
          </label>
          <Textarea
            id="observations"
            value={form.observations}
            onChange={handleFieldChange("observations")}
            placeholder="Describe what happened during your investigation."
            disabled={isDisabled}
            required
          />
        </div>

        {message ? (
          <p
            className={
              message.variant === "success"
                ? "text-sm font-medium text-emerald-600"
                : "text-sm font-medium text-destructive"
            }
          >
            {message.text}
          </p>
        ) : null}

        {lastSubmittedAt ? (
          <p className="text-xs text-muted-foreground">
            Last saved {new Date(lastSubmittedAt).toLocaleString()}
          </p>
        ) : null}

        <Button type="submit" disabled={isDisabled}>
          {isPending ? "Saving…" : "Submit data"}
        </Button>
      </form>
    </section>
  );
}
