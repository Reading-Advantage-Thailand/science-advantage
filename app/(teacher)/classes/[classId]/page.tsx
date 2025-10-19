import { requireRole } from '@/lib/auth/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface TeacherClassDetailPageProps {
  params: Promise<{ classId: string }>;
}

export default async function TeacherClassDetailPage({ params }: TeacherClassDetailPageProps) {
  await requireRole('TEACHER');
  const { classId } = await params;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Class Management</h1>
        <p className="text-gray-600 mt-2">Class ID: {classId}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Class Roster</CardTitle>
            <CardDescription>Students enrolled in this class</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">No students enrolled yet.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assignments</CardTitle>
            <CardDescription>Class assignments and due dates</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">No assignments created yet.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
