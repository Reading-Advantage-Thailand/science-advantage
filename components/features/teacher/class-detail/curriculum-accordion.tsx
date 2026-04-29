'use client';

import Link from 'next/link';
import { CheckCircle2, Circle } from 'lucide-react';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface LessonSummary {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  order: number;
  gradeLevel: number;
  completionCount?: number;
}

interface CurriculumUnitSummary {
  id: string;
  title: string;
  description: string | null;
  order: number;
  lessons: LessonSummary[];
}

interface CurriculumAccordionProps {
  units: CurriculumUnitSummary[];
  classId: string;
  studentCount: number;
  completionsLoading?: boolean;
}

export function CurriculumAccordion({
  units,
  classId,
  studentCount,
  completionsLoading = false,
}: CurriculumAccordionProps) {
  if (units.length === 0) {
    return null;
  }

  return (
    <Accordion type="multiple" className="divide-y divide-gray-200">
      {units.map(unit => (
        <AccordionItem key={unit.id} value={unit.id} className="px-2">
          <AccordionTrigger>
            <div className="flex flex-col gap-1 text-left">
              <span className="text-xs font-semibold uppercase tracking-wide text-rose-600">
                Unit {unit.order}
              </span>
              <span className="text-lg font-semibold text-gray-900">{unit.title}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-1 pb-4">
            {unit.description && (
              <p className="mb-4 text-sm text-gray-600">{unit.description}</p>
            )}

            {unit.lessons.length > 0 ? (
              <ol className="space-y-3">
                {unit.lessons.map(lesson => (
                  <li key={lesson.id}>
                    <Link
                      href={`/teacher/classes/${classId}/lessons/${lesson.slug}`}
                      className="block rounded-lg border border-gray-100 bg-white p-4 shadow-sm transition hover:border-rose-200 hover:shadow-md"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold uppercase tracking-wide text-rose-500">
                            Lesson {lesson.order}
                          </p>
                          <p className="text-base font-medium text-gray-900">{lesson.title}</p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          {completionsLoading ? (
                            <Skeleton className="h-5 w-16 rounded-full" />
                          ) : lesson.completionCount !== undefined ? (
                            <Badge
                              variant={lesson.completionCount === studentCount ? 'scoreGreen' : 'secondary'}
                              className="text-xs"
                            >
                              {lesson.completionCount}/{studentCount}
                            </Badge>
                          ) : null}
                          {lesson.completionCount !== undefined && lesson.completionCount === studentCount ? (
                            <CheckCircle2 className="size-5 text-green-500" />
                          ) : (
                            <Circle className="size-5 text-gray-300" />
                          )}
                        </div>
                      </div>
                      {lesson.description && (
                        <p className="mt-2 text-sm text-gray-600">{lesson.description}</p>
                      )}
                    </Link>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-gray-500">No lessons added yet.</p>
            )}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
