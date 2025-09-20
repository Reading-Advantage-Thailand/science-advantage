import { redirect } from "next/navigation";

import { SignOutButton } from "@/components/features/auth/sign-out-button";
import { Button } from "@/components/ui/button";
import { getServerAuthSession } from "@/lib/auth";

const highlights = [
  {
    label: "Classes",
    value: "3",
    description: "Active Grade 6 cohorts",
  },
  {
    label: "Lessons",
    value: "5",
    description: "NGSS Unit 1 ready to teach",
  },
  {
    label: "Assessments",
    value: "20",
    description: "Auto-graded MCQs seeded",
  },
];

export default async function DashboardPage() {
  const session = await getServerAuthSession();

  if (!session?.user) {
    redirect("/signin");
  }

  const displayName = session.user.name ?? "Science Advantage educator";

  return (
    <section className="space-y-10">
      <header className="space-y-4">
        <div className="flex flex-col gap-4 rounded-2xl border border-border/80 bg-card/70 p-6 backdrop-blur md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Sprint S0 Preview
            </p>
            <h1 className="text-3xl font-semibold tracking-tight">Welcome back, {displayName}</h1>
            <p className="text-sm text-muted-foreground">
              You&apos;re signed in with Google. We&apos;ll replace this placeholder with live class insights as the sprint progresses.
            </p>
          </div>

          <SignOutButton className="self-start md:self-center" />
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-3">
        {highlights.map((item) => (
          <article
            key={item.label}
            className="rounded-xl border border-border bg-card/70 p-6 shadow-sm backdrop-blur transition hover:shadow-md"
          >
            <h2 className="text-sm font-medium text-muted-foreground">{item.label}</h2>
            <p className="mt-2 text-3xl font-semibold text-foreground">{item.value}</p>
            <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
          </article>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button size="lg">Start a class demo</Button>
        <Button variant="outline" size="lg">
          View sprint backlog
        </Button>
      </div>
    </section>
  );
}
