"use client";

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Loader2, CheckCircle2, Circle } from 'lucide-react';

interface Lesson {
  id: string;
  slug: string;
  title: string;
  titleThai: string;
  order: number;
  completed: boolean;
  started: boolean;
}

interface CurriculumUnit {
  id: string;
  title: string;
  titleThai: string;
  order: number;
  lessons: Lesson[];
}

interface CurriculumData {
  class: {
    id: string;
    name: string;
    gradeLevel: number;
    standardsAlignment: string;
  };
  units: CurriculumUnit[];
}

interface StudentCurriculumViewProps {
  classId: string;
}

export function StudentCurriculumView({ classId }: StudentCurriculumViewProps) {
  const [curriculum, setCurriculum] = useState<CurriculumData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCurriculum() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/classes/${classId}/curriculum`);

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Please sign in to view this class');
          } else if (response.status === 403) {
            throw new Error('You are not enrolled in this class');
          } else if (response.status === 404) {
            throw new Error('Class not found');
          } else {
            throw new Error('Failed to load curriculum');
          }
        }

        const data = await response.json();
        setCurriculum(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchCurriculum();
  }, [classId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-rose-600" />
        <span className="ml-2 text-gray-600">Loading curriculum...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-sm font-medium text-red-800">{error}</p>
      </div>
    );
  }

  if (!curriculum || curriculum.units.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-6 text-center">
        <p className="text-sm text-gray-600">
          No curriculum available for this class yet. Please check back later.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="text-lg font-semibold text-gray-900">{curriculum.class.name}</h2>
        <div className="mt-1 flex items-center gap-3 text-sm text-gray-600">
          <span>Grade {curriculum.class.gradeLevel}</span>
          <span>•</span>
          <span>{curriculum.class.standardsAlignment}</span>
        </div>
      </div>

      <Accordion type="multiple" className="divide-y divide-gray-200">
        {curriculum.units.map(unit => (
          <AccordionItem key={unit.id} value={unit.id} className="px-2">
            <AccordionTrigger>
              <div className="flex flex-col gap-1 text-left">
                <span className="text-xs font-semibold uppercase tracking-wide text-rose-600">
                  Unit {unit.order}
                </span>
                <span className="text-lg font-semibold text-gray-900">{unit.title}</span>
                {unit.titleThai !== unit.title && (
                  <span className="text-sm text-gray-600">{unit.titleThai}</span>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-1 pb-4">
              {unit.lessons.length > 0 ? (
                <ol className="space-y-3">
                  {unit.lessons.map(lesson => (
                    <li
                      key={lesson.id}
                      className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm transition hover:border-rose-200 hover:shadow-md cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            {lesson.completed ? (
                              <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                            ) : lesson.started ? (
                              <Circle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                            ) : (
                              <Circle className="h-5 w-5 text-gray-300 flex-shrink-0" />
                            )}
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wide text-rose-500">
                                Lesson {lesson.order}
                              </p>
                              <p className="text-base font-medium text-gray-900">{lesson.title}</p>
                              {lesson.titleThai !== lesson.title && (
                                <p className="text-sm text-gray-600">{lesson.titleThai}</p>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {lesson.completed && (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              Completed
                            </Badge>
                          )}
                          {lesson.started && !lesson.completed && (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              In Progress
                            </Badge>
                          )}
                        </div>
                      </div>
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
    </div>
  );
}
