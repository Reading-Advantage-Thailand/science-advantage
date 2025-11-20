import { requireRole } from '@/lib/auth/server';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { TeacherDashboardClasses } from '@/components/features/teacher/teacher-dashboard-classes';
import { InterventionAlertsWidget } from '@/components/features/teacher/intervention-alerts-widget';
import prisma from '@/lib/prisma';

export default async function TeacherPage() {
  const session = await requireRole('TEACHER');

  // Fetch teacher's classes for intervention widget
  const teacherClasses = await prisma.class.findMany({
    where: { teacherId: session.user.id },
    select: { id: true, name: true },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold edu-title">
          Welcome, {session.user.name}! 🍎
        </h1>
        <p className="text-muted-foreground">
          Manage your classes, assignments, and student progress from one place.
        </p>
        <p className="text-sm text-muted-foreground">
          ยินดีต้อนรับ! จัดการชั้นเรียน งานมอบหมาย
          และความก้าวหน้าของนักเรียนได้จากที่เดียว
        </p>
      </header>

      {teacherClasses.length > 0 && (
        <InterventionAlertsWidget
          initialClassId={teacherClasses[0].id}
          classes={teacherClasses}
        />
      )}

      <TeacherDashboardClasses />

      <section className="grid gap-6 md:grid-cols-2">
        <Card className="edu-card hover-wiggle">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📊 Recent Activity
            </CardTitle>
            <CardDescription>
              Latest student submissions and progress
              <span className="block text-xs text-muted-foreground">
                กิจกรรมล่าสุดและความก้าวหน้าของนักเรียน
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              No recent activity.
              <span className="block text-xs text-muted-foreground">
                ยังไม่มีกิจกรรมล่าสุด
              </span>
            </p>
          </CardContent>
        </Card>

        <Card className="edu-card hover-wiggle">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📅 Upcoming Assignments
            </CardTitle>
            <CardDescription>
              Assignment due dates and deadlines
              <span className="block text-xs text-muted-foreground">
                กำหนดส่งงานและเดดไลน์สำคัญ
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              No upcoming deadlines.
              <span className="block text-xs text-muted-foreground">
                ยังไม่มีกำหนดส่งงานที่ใกล้ถึง
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Assignments</CardTitle>
            <CardDescription>
              Assignment due dates and deadlines
              <span className="block text-xs text-gray-500">
                กำหนดส่งงานและเดดไลน์สำคัญ
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">
              No upcoming deadlines.
              <span className="block text-xs text-gray-400">
                ยังไม่มีกำหนดส่งงานที่ใกล้ถึง
              </span>
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
