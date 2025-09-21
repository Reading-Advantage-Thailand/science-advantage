import type { ExperimentGuide as ExperimentGuideData } from "@/lib/experiments";

export type ExperimentGuideProps = {
  guide: ExperimentGuideData;
};

export function ExperimentGuide({ guide }: ExperimentGuideProps) {
  return (
    <article className="space-y-6 rounded-2xl border border-border/70 bg-card/70 p-6 shadow-sm">
      <section className="space-y-3">
        <header>
          <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Investigation overview
          </p>
        </header>
        {guide.overview.length ? (
          <div className="space-y-2 text-sm leading-relaxed text-foreground">
            {guide.overview.map((line, index) => (
              <p key={`${line}-${index}`}>{line}</p>
            ))}
          </div>
        ) : null}
      </section>

      {guide.steps.length ? (
        <section className="space-y-3">
          <header>
            <h2 className="text-base font-semibold tracking-tight text-foreground">
              Steps
            </h2>
          </header>
          <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-foreground">
            {guide.steps.map((step, index) => (
              <li key={`${step}-${index}`}>{step}</li>
            ))}
          </ol>
        </section>
      ) : null}

      {guide.safetyNotes.length ? (
        <section className="space-y-3">
          <header>
            <h2 className="text-base font-semibold tracking-tight text-foreground">
              Safety notes
            </h2>
          </header>
          <ul className="space-y-2 rounded-xl border border-amber-500/40 bg-amber-50/60 p-4 text-sm font-medium text-amber-900">
            {guide.safetyNotes.map((note, index) => (
              <li key={`${note}-${index}`} className="flex items-start gap-2">
                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-amber-500" aria-hidden />
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  );
}
