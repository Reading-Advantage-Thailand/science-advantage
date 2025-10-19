import { requireRole } from '@/lib/auth/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default async function TeacherClassesPage() {
  await requireRole('TEACHER');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Classes</h1>
          <p className="text-gray-600 mt-2">
            Manage your classes and students
          </p>
        </div>
        <Button className="bg-rose-600 hover:bg-rose-700">
          Create New Class
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Classes</CardTitle>
          <CardDescription>Your teaching schedule</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No classes yet. Create your first class to begin teaching.</p>
        </CardContent>
      </Card>
    </div>
  );
}
