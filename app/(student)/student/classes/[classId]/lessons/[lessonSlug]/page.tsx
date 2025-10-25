"use client";

import { useState, use } from 'react';
import { LessonViewer } from '@/components/features/student/lesson-viewer';
import { QuizPlayer } from '@/components/features/student/quiz-player';
import { Button } from '@/components/ui/button';
import { BookOpen, FileQuestion } from 'lucide-react';

interface PageProps {
  params: Promise<{
    classId: string;
    lessonSlug: string;
  }>;
}

export default function LessonPage({ params }: PageProps) {
  const [view, setView] = useState<'lesson' | 'quiz'>('lesson');
  const { classId, lessonSlug } = use(params);

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      {/* View Toggle */}
      <div className="flex gap-2 border-b border-gray-200">
        <Button
          variant={view === 'lesson' ? 'default' : 'ghost'}
          onClick={() => setView('lesson')}
          className="gap-2 rounded-b-none"
        >
          <BookOpen className="h-4 w-4" />
          Lesson
        </Button>
        <Button
          variant={view === 'quiz' ? 'default' : 'ghost'}
          onClick={() => setView('quiz')}
          className="gap-2 rounded-b-none"
        >
          <FileQuestion className="h-4 w-4" />
          Quiz
        </Button>
      </div>

      {/* Content */}
      {view === 'lesson' ? (
        <LessonViewer classId={classId} lessonSlug={lessonSlug} />
      ) : (
        <QuizPlayer classId={classId} lessonSlug={lessonSlug} />
      )}
    </div>
  );
}
