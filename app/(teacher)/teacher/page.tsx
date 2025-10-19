import { requireRole } from '@/lib/auth/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function TeacherPage() {
  const session = await requireRole('TEACHER');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome, {session.user.name}!
        </h1>
        <p className="text-gray-600 mt-2">
          Your teacher dashboard - Manage classes, assignments, and student progress
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>My Classes</CardTitle>
            <CardDescription>Classes you&apos;re teaching</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">No classes yet. Create your first class to get started.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest student submissions and progress</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">No recent activity.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Assignments</CardTitle>
            <CardDescription>Assignment due dates and deadlines</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">No upcoming deadlines.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Class Performance</CardTitle>
            <CardDescription>Overview of class progress</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">Performance metrics coming soon.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
