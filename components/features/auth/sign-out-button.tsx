"use client";

import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";
import { Loader2 } from "lucide-react";

const devAuthEnabled = process.env.NEXT_PUBLIC_DEV_AUTH === "true";

type SignOutButtonProps = {
  redirectTo?: string;
  className?: string;
};

export function SignOutButton({ redirectTo = "/signin", className }: SignOutButtonProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={cn("gap-2", className)}
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          if (devAuthEnabled) {
            try {
              await fetch("/api/dev/auth/impersonate", { method: "DELETE" });
            } catch (error) {
              console.warn("Failed to clear dev auth override", error);
            }
          }

          await signOut({ callbackUrl: redirectTo });
        })
      }
    >
      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      Sign out
    </Button>
  );
}
