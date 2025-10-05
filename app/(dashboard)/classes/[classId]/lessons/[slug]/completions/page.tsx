"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

type CompletionData = {
  class: {
    id: string;
    name: string;
  };
  lesson: {
    id: string;
    title: string;
  };
  students: Array<{
    studentId: string;
    name: string;
    email: string;
    completed: boolean;
    completedAt: string | null;
  }>;
};

type LessonCompletionListPageProps = {
  params:
    | {
        classId: string;
        slug: string;
      }
    | Promise<{
        classId: string;
        slug: string;
      }>;
};

export default function LessonCompletionListPage({ params }: LessonCompletionListPageProps) {
  const [data, setData] = useState<CompletionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [classId, setClassId] = useState<string>("");
  const [slug, setSlug] = useState<string>("");

  // Extract params on mount
  useEffect(() => {
    const extractParams = async () => {
      const resolvedParams = await Promise.resolve(params);
      setClassId(resolvedParams.classId);
      setSlug(resolvedParams.slug);
    };
    extractParams();
  }, [params]);

  // Fetch completion data
  const fetchCompletions = useCallback(async () => {
    if (!classId || !slug) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/classes/${classId}/lessons/${slug}/completions`);

      if (!response.ok) {
        if (response.status === 404) {
          notFound();
        }
        throw new Error("Failed to fetch completions");
      }

      const completionData = await response.json();
      setData(completionData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [classId, slug]);

  // Initial fetch and periodic refresh
  useEffect(() => {
    if (!classId || !slug) return;

    fetchCompletions();

    // Set up polling to check for updates every 5 seconds
    const interval = setInterval(fetchCompletions, 5000);

    return () => clearInterval(interval);
  }, [classId, slug, fetchCompletions]);

  if (loading && !data) {
    return (
      <section className="space-y-8">
        <div className="space-y-4">
          <Button variant="ghost" asChild>
            <Link href="/dashboard">Back to dashboard</Link>
          </Button>
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-12 bg-muted rounded w-2/3 mt-2"></div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="space-y-8">
        <div className="space-y-4">
          <Button variant="ghost" asChild>
            <Link href="/dashboard">Back to dashboard</Link>
          </Button>
          <div className="text-destructive">Error: {error}</div>
        </div>
      </section>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <section className="space-y-8">
      <div className="space-y-4">
        <Button variant="ghost" asChild>
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>

        <header className="space-y-2">
          <p className="text-sm uppercase tracking-wide text-muted-foreground">
            Lesson completion overview
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">{data.lesson.title}</h1>
          <p className="text-sm text-muted-foreground">Class: {data.class.name}</p>
          <p className="text-xs text-muted-foreground">Auto-refreshes every 5 seconds</p>
        </header>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border/70 bg-card/70 shadow-sm">
        <table className="min-w-full divide-y divide-border/60 text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left font-medium text-muted-foreground">
                Student
              </th>
              <th scope="col" className="px-6 py-3 text-left font-medium text-muted-foreground">
                Email
              </th>
              <th scope="col" className="px-6 py-3 text-left font-medium text-muted-foreground">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 bg-card/50">
            {data.students.map((student) => (
              <tr key={student.studentId}>
                <td className="px-6 py-4 font-medium text-foreground">{student.name}</td>
                <td className="px-6 py-4 text-muted-foreground">{student.email}</td>
                <td className="px-6 py-4">
                  {student.completed ? (
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                      Completed
                    </span>
                  ) : (
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                      Pending
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
