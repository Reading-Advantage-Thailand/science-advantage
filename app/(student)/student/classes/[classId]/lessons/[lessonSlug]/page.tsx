import { LessonViewer } from '@/components/features/student/lesson-viewer';

interface PageProps {
  params: Promise<{
    classId: string;
    lessonSlug: string;
  }>;
}

export default async function LessonPage({ params }: PageProps) {
  const { classId, lessonSlug } = await params;

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <LessonViewer classId={classId} lessonSlug={lessonSlug} />
    </div>
  );
}
