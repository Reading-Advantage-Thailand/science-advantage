"use client";

import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";

type SignInButtonProps = {
  provider?: "google";
  redirectTo?: string;
  className?: string;
};

export function SignInButton({
  provider = "google",
  redirectTo = "/dashboard",
  className,
}: SignInButtonProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      size="lg"
      className={cn("w-full sm:w-auto", className)}
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await signIn(provider, { callbackUrl: redirectTo });
        })
      }
    >
      {isPending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Redirecting…
        </>
      ) : (
        "Sign in with Google"
      )}
    </Button>
  );
}
