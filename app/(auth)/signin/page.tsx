import Link from "next/link";
import { redirect } from "next/navigation";

import { DevAuthPanel } from "@/components/features/auth/dev-auth-panel";
import { SignInButton } from "@/components/features/auth/sign-in-button";
import { Button } from "@/components/ui/button";
import { getServerAuthSession } from "@/lib/auth";
import { isDevAuthEnabled } from "@/lib/dev-auth";
import { getDevAuthCookie } from "@/lib/dev-auth.server";

export default async function SignInPage() {
  const session = await getServerAuthSession();

  if (session?.user) {
    redirect("/dashboard");
  }

  const devAuthEnabled = isDevAuthEnabled();
  const devOverride = devAuthEnabled ? await getDevAuthCookie() : null;
  const devAuthSession = devOverride
    ? {
        role: devOverride.role,
        name: devOverride.name,
        email: devOverride.email,
      }
    : null;

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-border/60 bg-card/80 p-8 text-center shadow-sm">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Sign in to Science Advantage</h1>
          <p className="text-sm text-muted-foreground">
            Use your Google Workspace account to access the sprint dashboard and teacher tools.
          </p>
        </div>

        <SignInButton className="justify-center" />

        <Button variant="ghost" className="w-full justify-center" asChild>
          <Link href="/">Return home</Link>
        </Button>

        {devAuthEnabled ? (
          <DevAuthPanel initialSession={devAuthSession} />
        ) : null}
      </div>
    </div>
  );
}
