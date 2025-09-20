"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

type JoinDemoClassButtonProps = {
  className?: string;
  children?: React.ReactNode;
};

export function JoinDemoClassButton({
  className,
  children = "Join demo class",
}: JoinDemoClassButtonProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleJoin = () => {
    setError(null);

    startTransition(async () => {
      try {
        const response = await fetch("/api/demo/join", {
          method: "POST",
        });

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as
            | { error?: string }
            | null;

          throw new Error(payload?.error ?? "Unable to join class");
        }

        router.refresh();
      } catch (exception) {
        setError(
          exception instanceof Error ? exception.message : "Unable to join class"
        );
      }
    });
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Button type="button" size="sm" onClick={handleJoin} disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Joining…
          </>
        ) : (
          children
        )}
      </Button>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
