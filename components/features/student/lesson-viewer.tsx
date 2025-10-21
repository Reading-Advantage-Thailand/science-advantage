"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Standard {
  id: string;
  code: string;
  description: string;
  descriptionThai: string;
  framework: 'THAI' | 'NGSS';
  gradeLevel: number;
}

interface LessonData {
  lesson: {
    id: string;
    slug: string;
    title: string;
    titleThai: string;
    content: string;
    contentThai: string;
    objectives: string[];
    objectivesThai: string[];
  };
  standards: Standard[];
}

interface LessonViewerProps {
  classId: string;
  lessonSlug: string;
}

export function LessonViewer({ classId, lessonSlug }: LessonViewerProps) {
  const router = useRouter();
  const [lessonData, setLessonData] = useState<LessonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLesson() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/lessons/${lessonSlug}`);

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Please sign in to view this lesson');
          } else if (response.status === 403) {
            throw new Error('You are not enrolled in a class with this lesson');
          } else if (response.status === 404) {
            throw new Error('Lesson not found');
          } else {
            throw new Error('Failed to load lesson');
          }
        }

        const data = await response.json();
        setLessonData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchLesson();
  }, [lessonSlug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-rose-600" />
        <span className="ml-2 text-gray-600">Loading lesson...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to curriculum
        </Button>
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  if (!lessonData) {
    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to curriculum
        </Button>
        <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-6 text-center">
          <p className="text-sm text-gray-600">No lesson data available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        onClick={() => router.push(`/student/classes/${classId}`)}
        className="gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to curriculum
      </Button>

      {/* Lesson Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">{lessonData.lesson.title}</h1>
        {lessonData.lesson.titleThai !== lessonData.lesson.title && (
          <p className="text-xl text-gray-600">{lessonData.lesson.titleThai}</p>
        )}
      </div>

      {/* Learning Objectives */}
      {lessonData.lesson.objectives.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Learning Objectives</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc space-y-2 pl-5">
              {lessonData.lesson.objectives.map((objective, index) => (
                <li key={index} className="text-gray-700">
                  {objective}
                </li>
              ))}
            </ul>
            {lessonData.lesson.objectivesThai.some(
              (thai, i) => thai !== lessonData.lesson.objectives[i]
            ) && (
              <div className="mt-4 border-t pt-4">
                <p className="mb-2 text-sm font-semibold text-gray-600">วัตถุประสงค์การเรียนรู้:</p>
                <ul className="list-disc space-y-2 pl-5">
                  {lessonData.lesson.objectivesThai.map((objective, index) => (
                    <li key={index} className="text-gray-700">
                      {objective}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Lesson Content */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Lesson Content</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            <div className="whitespace-pre-wrap text-gray-700">
              {lessonData.lesson.content || 'No content available for this lesson.'}
            </div>
            {lessonData.lesson.contentThai !== lessonData.lesson.content && (
              <div className="mt-6 border-t pt-6">
                <p className="mb-3 text-sm font-semibold text-gray-600">เนื้อหาบทเรียน:</p>
                <div className="whitespace-pre-wrap text-gray-700">
                  {lessonData.lesson.contentThai}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Standards Covered */}
      {lessonData.standards.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Standards Covered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lessonData.standards.map((standard) => (
                <div
                  key={standard.id}
                  className="rounded-lg border border-gray-200 bg-gray-50 p-4"
                >
                  <div className="flex items-start gap-3">
                    <Badge
                      variant="outline"
                      className={
                        standard.framework === 'THAI'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-purple-50 text-purple-700 border-purple-200'
                      }
                    >
                      {standard.framework}
                    </Badge>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">
                        {standard.code}
                      </p>
                      <p className="mt-1 text-sm text-gray-700">
                        {standard.description}
                      </p>
                      {standard.descriptionThai !== standard.description && (
                        <p className="mt-2 text-sm text-gray-600">
                          {standard.descriptionThai}
                        </p>
                      )}
                      <p className="mt-2 text-xs text-gray-500">
                        Grade {standard.gradeLevel}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
