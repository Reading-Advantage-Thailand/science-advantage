import { requireRole } from '@/lib/auth/server';
import prisma from '@/lib/prisma';
import { JoinClassForm } from '@/components/features/student/join-class-form';
import { StudentClassesSection } from '@/components/features/student/student-classes-section';
import { StudentAssignmentsCard } from '@/components/features/student/student-assignments-card';
import { GamificationDashboardCard } from '@/components/features/student/gamification-dashboard-card';
import { StudentWelcomeScreen } from '@/components/features/student/student-welcome-screen';
import { OnboardingChecklist } from '@/components/features/onboarding/onboarding-checklist';
import { ContextualHelpPlainText } from '@/components/features/onboarding/contextual-help';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default async function StudentPage() {
  const session = await requireRole('STUDENT');

  const enrolledClasses = await prisma.class.findMany({
    where: { students: { some: { id: session.user.id } } },
    select: { id: true },
    take: 1,
  });
  const firstClassId = enrolledClasses[0]?.id ?? undefined;

  return (
    <div className="space-y-6">
      <StudentWelcomeScreen student={{ name: session.user.name ?? 'Student' }} />

      <div className="flex items-start justify-between gap-4">
        <OnboardingChecklist role="STUDENT" classId={firstClassId} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <Card className="edu-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📚 My Classes
              <ContextualHelpPlainText
                surfaceId="student-classes-help"
                content="Ask your teacher for the 6-character class code to join."
              />
            </CardTitle>
            <CardDescription>Classes you&apos;re enrolled in</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <StudentClassesSection />
            <div className="space-y-3 rounded-2xl border-2 border-dashed border-border bg-muted/30 p-4">
              <div>
                <h3 className="text-sm font-semibold">Join another class</h3>
                <p className="text-sm text-muted-foreground">
                  Enter 6-character code from your teacher.
                </p>
              </div>
              <div className="rounded-2xl bg-card p-4 shadow-md">
                <JoinClassForm />
              </div>
            </div>
          </CardContent>
        </Card>

        <StudentAssignmentsCard studentId={session.user.id} />

        <Card className="edu-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              ⭐ Recent Activity
              <ContextualHelpPlainText
                surfaceId="student-activity-help"
                content="Your latest lesson completions and quiz scores appear here."
              />
            </CardTitle>
            <CardDescription>Your latest learning activities</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">No recent activity.</p>
          </CardContent>
        </Card>

        <Card className="edu-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📈 Progress
              <ContextualHelpPlainText
                surfaceId="student-progress-help"
                content="Earn XP by completing lessons and quizzes. Level up to unlock rewards!"
              />
            </CardTitle>
            <CardDescription>Your XP, level, streak, and badges</CardDescription>
          </CardHeader>
          <CardContent>
            <GamificationDashboardCard studentId={session.user.id} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
