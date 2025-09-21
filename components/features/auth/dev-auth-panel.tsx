"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import type { DevAuthClientSession, DevAuthRole } from "@/lib/dev-auth";

import { useRouter } from "next/navigation";

const roles: Array<{ role: DevAuthRole; label: string; description: string }> = [
  {
    role: "TEACHER",
    label: "Impersonate teacher",
    description: "Access class dashboards, experiment exports, and management tools.",
  },
  {
    role: "STUDENT",
    label: "Impersonate student",
    description: "Run through lesson, quiz, and experiment flows as a learner.",
  },
];

type DevAuthPanelProps = {
  initialSession: DevAuthClientSession | null;
};

const devAuthEnabled = process.env.NEXT_PUBLIC_DEV_AUTH === "true";

export function DevAuthPanel({ initialSession }: DevAuthPanelProps) {
  const router = useRouter();
  const [session, setSession] = useState<DevAuthClientSession | null>(initialSession);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!devAuthEnabled) {
    return null;
  }

  const handleSelect = (role: DevAuthRole) => {
    setError(null);

    startTransition(async () => {
      try {
        const response = await fetch("/api/dev/auth/impersonate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ role }),
        });

        const result = await response.json().catch(() => null);

        if (!response.ok || !result?.session) {
          throw new Error(result?.error ?? "Unable to activate dev auth");
        }

        setSession(result.session);
        router.refresh();
      } catch (exception) {
        setError(
          exception instanceof Error
            ? exception.message
            : "Unable to activate dev auth"
        );
      }
    });
  };

  const handleClear = () => {
    setError(null);

    startTransition(async () => {
      try {
        await fetch("/api/dev/auth/impersonate", {
          method: "DELETE",
        });
        setSession(null);
        router.refresh();
      } catch (exception) {
        setError(
          exception instanceof Error
            ? exception.message
            : "Unable to clear dev auth"
        );
      }
    });
  };

  return (
    <div className="space-y-4 rounded-xl border border-dashed border-border/60 bg-muted/30 p-4 text-left">
      <div className="space-y-1">
        <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Dev auth override
        </p>
        <p className="text-xs text-muted-foreground">
          Enabled only in local builds. Use these controls to impersonate teacher or student roles without Google SSO.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {roles.map((option) => (
          <button
            key={option.role}
            type="button"
            onClick={() => handleSelect(option.role)}
            disabled={isPending}
            className="rounded-lg border border-border/60 bg-background p-4 text-left transition hover:border-primary/70 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <p className="text-sm font-semibold text-foreground">{option.label}</p>
            <p className="mt-1 text-xs text-muted-foreground">{option.description}</p>
            {session?.role === option.role ? (
              <p className="mt-2 text-xs font-semibold text-emerald-600">Active</p>
            ) : null}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" size="sm" variant="outline" disabled={isPending || !session} onClick={handleClear}>
          Clear override
        </Button>
        {session ? (
          <p className="text-xs text-muted-foreground">
            Acting as {session.role.toLowerCase()} ({session.email})
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">No override active</p>
        )}
      </div>

      {error ? <p className="text-xs font-medium text-destructive">{error}</p> : null}
    </div>
  );
}
