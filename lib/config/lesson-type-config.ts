import { LessonType } from '@prisma/client';
import { BookOpen, FlaskConical, Gamepad2, ClipboardCheck } from 'lucide-react';

export const LESSON_TYPE_CONFIG: Record<
  LessonType,
  {
    label: string;
    color: string;
    badgeClass: string;
    icon: typeof BookOpen;
    accentClass: string;
  }
> = {
  LESSON: {
    label: 'Lesson',
    color: 'forest-green',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    icon: BookOpen,
    accentClass: 'border-t-emerald-500',
  },
  LAB: {
    label: 'Lab',
    color: 'blue',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-300',
    icon: FlaskConical,
    accentClass: 'border-t-blue-500',
  },
  ASSESSMENT: {
    label: 'Assessment',
    color: 'gold',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
    icon: ClipboardCheck,
    accentClass: 'border-t-amber-500',
  },
  REVIEW: {
    label: 'Review',
    color: 'coral',
    badgeClass: 'bg-orange-100 text-orange-800 border-orange-300',
    icon: Gamepad2,
    accentClass: 'border-t-orange-500',
  },
};

export type LessonTypeConfig = typeof LESSON_TYPE_CONFIG;
