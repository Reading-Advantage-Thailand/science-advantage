import Link from 'next/link';

import { requireRole } from '@/lib/auth/server';
import prisma from '@/lib/prisma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatStudentCount, getStandardsAlignmentLabel } from '@/lib/utils/class-format';

export default async function TeacherPage() {
  const session = await requireRole('TEACHER');
  const classes = await prisma.class.findMany({
    where: { teacherId: session.user.id },
    include: {
      _count: { select: { students: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 3,
  });

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
          <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>My Classes</CardTitle>
              <CardDescription>Classes you&apos;re teaching</CardDescription>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link href="/teacher/classes">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {classes.length === 0 ? (
              <p className="text-gray-500">
                No classes yet. Create your first class to get started.
              </p>
            ) : (
              <div className="space-y-4">
                {classes.map(cls => (
                  <Link
                    key={cls.id}
                    href={`/teacher/classes/${cls.id}`}
                    className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:border-rose-200 hover:shadow md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <p className="text-base font-semibold text-gray-900">{cls.name}</p>
                      <p className="text-sm text-gray-600">
                        Grade {cls.gradeLevel} &middot; {getStandardsAlignmentLabel(cls.standardsAlignment)}
                      </p>
                    </div>
                    <div className="text-sm text-gray-500 md:text-right">
                      <p className="font-semibold text-rose-600">
                        Join Code: {cls.joinCode}
                      </p>
                      <p>{formatStudentCount(cls._count.students)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
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
