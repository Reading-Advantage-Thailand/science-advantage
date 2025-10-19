import { requireRole } from '@/lib/auth/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TeacherDashboardClasses } from '@/components/features/teacher/teacher-dashboard-classes';

export default async function TeacherPage() {
  const session = await requireRole('TEACHER');

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome, {session.user.name}!
        </h1>
        <p className="text-gray-600">
          Manage your classes, assignments, and student progress from one place.
        </p>
        <p className="text-sm text-gray-500">
          ยินดีต้อนรับ! จัดการชั้นเรียน งานมอบหมาย และความก้าวหน้าของนักเรียนได้จากที่เดียว
        </p>
      </header>

      <TeacherDashboardClasses />

      <section className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest student submissions and progress
              <span className="block text-xs text-gray-500">
                กิจกรรมล่าสุดและความก้าวหน้าของนักเรียน
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">
              No recent activity.
              <span className="block text-xs text-gray-400">ยังไม่มีกิจกรรมล่าสุด</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Assignments</CardTitle>
            <CardDescription>
              Assignment due dates and deadlines
              <span className="block text-xs text-gray-500">กำหนดส่งงานและเดดไลน์สำคัญ</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">
              No upcoming deadlines.
              <span className="block text-xs text-gray-400">ยังไม่มีกำหนดส่งงานที่ใกล้ถึง</span>
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
