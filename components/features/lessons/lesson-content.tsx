import { memo } from "react";

type LessonContentProps = {
  content: string;
};

function LessonContentComponent({ content }: LessonContentProps) {
  return (
    <article className="rounded-2xl border border-border/70 bg-card/70 p-6 shadow-sm">
      <pre className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
        {content}
      </pre>
    </article>
  );
}

export const LessonContent = memo(LessonContentComponent);
