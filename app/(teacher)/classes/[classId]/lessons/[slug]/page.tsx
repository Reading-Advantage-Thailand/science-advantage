import { requireRole } from '@/lib/auth/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface TeacherLessonPageProps {
  params: Promise<{ classId: string; slug: string }>;
}

export default async function TeacherLessonPage({ params }: TeacherLessonPageProps) {
  await requireRole('TEACHER');
  const { classId, slug } = await params;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Lesson Viewer</h1>
        <p className="text-gray-600 mt-2">
          Class: {classId} | Lesson: {slug}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lesson Content</CardTitle>
          <CardDescription>Preview and manage lesson materials</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Lesson content will appear here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
