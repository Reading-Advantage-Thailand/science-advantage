'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { BookOpen, FlaskConical, Gamepad2, ClipboardCheck, LayoutGrid } from 'lucide-react';
import type { LessonType } from '@prisma/client';

type FilterType = 'ALL' | LessonType;

const FILTER_CONFIG: {
  type: FilterType;
  label: string;
  icon: typeof LayoutGrid;
}[] = [
  { type: 'ALL', label: 'All', icon: LayoutGrid },
  { type: 'LESSON', label: 'Lessons', icon: BookOpen },
  { type: 'LAB', label: 'Labs', icon: FlaskConical },
  { type: 'REVIEW', label: 'Reviews', icon: Gamepad2 },
  { type: 'ASSESSMENT', label: 'Assessments', icon: ClipboardCheck },
];

interface LessonTypeFilterProps {
  selectedType: FilterType;
  onChange: (type: FilterType) => void;
  className?: string;
}

export function LessonTypeFilter({ selectedType, onChange, className }: LessonTypeFilterProps) {
  return (
    <div
      className={cn(
        'flex flex-wrap gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3',
        className
      )}
      role="group"
      aria-label="Filter lessons by type"
    >
      {FILTER_CONFIG.map(({ type, label, icon: Icon }) => (
        <Button
          key={type}
          variant={selectedType === type ? 'default' : 'outline'}
          size="sm"
          onClick={() => onChange(type)}
          className={cn(
            'gap-1.5',
            selectedType === type && type !== 'ALL' && 'bg-rose-600 hover:bg-rose-700'
          )}
          aria-pressed={selectedType === type}
        >
          <Icon className="h-4 w-4" />
          {label}
        </Button>
      ))}
    </div>
  );
}

export function filterLessons<T extends { lessonType: LessonType }>(
  lessons: T[],
  filterType: FilterType
): T[] {
  if (filterType === 'ALL') return lessons;
  return lessons.filter(lesson => lesson.lessonType === filterType);
}