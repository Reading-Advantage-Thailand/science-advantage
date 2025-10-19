"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface LessonSummary {
  id: string;
  title: string;
  description: string | null;
  order: number;
  gradeLevel: number;
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
}

export function CurriculumAccordion({ units }: CurriculumAccordionProps) {
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
                  <li
                    key={lesson.id}
                    className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-rose-500">
                          Lesson {lesson.order}
                        </p>
                        <p className="text-base font-medium text-gray-900">{lesson.title}</p>
                      </div>
                    </div>
                    {lesson.description && (
                      <p className="mt-2 text-sm text-gray-600">{lesson.description}</p>
                    )}
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
