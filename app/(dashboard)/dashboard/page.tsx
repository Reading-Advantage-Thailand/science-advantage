import { Button } from "@/components/ui/button";

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

export default function DashboardPage() {
  return (
    <section className="space-y-10">
      <header className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Sprint S0 Preview
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          Welcome to your Science Advantage dashboard
        </h1>
        <p className="text-base text-muted-foreground">
          This placeholder view verifies that Tailwind CSS, shadcn/ui, and the App Router are wired
          up. We&apos;ll replace it with live teacher insights as the sprint progresses.
        </p>
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
