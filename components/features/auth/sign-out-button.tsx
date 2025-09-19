"use client";

import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";
import { Loader2 } from "lucide-react";

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
          await signOut({ callbackUrl: redirectTo });
        })
      }
    >
      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      Sign out
    </Button>
  );
}
