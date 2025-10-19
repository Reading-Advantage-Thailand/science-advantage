import { requireRole } from '@/lib/auth/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function StudentPage() {
  const session = await requireRole('STUDENT');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome, {session.user.name}!
        </h1>
        <p className="text-gray-600 mt-2">
          Your student dashboard - View your classes, assignments, and progress
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>My Classes</CardTitle>
            <CardDescription>Classes you&apos;re enrolled in</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">No classes yet. Join a class using a class code.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Assignments</CardTitle>
            <CardDescription>Your pending work</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">No assignments yet.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest learning activities</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">No recent activity.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Progress</CardTitle>
            <CardDescription>Your overall progress</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">Progress tracking coming soon.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
