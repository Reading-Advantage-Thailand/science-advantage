import { cache } from 'react';
import { notFound, redirect } from 'next/navigation';

import { hasRole, requireAuth } from '@/lib/auth/server';
import { getClassDetailWithCurriculum } from '@/lib/services/classes/get-class-detail';
import { ClassDetailHeader } from '@/components/features/teacher/class-detail/class-detail-header';
import { CurriculumAccordion } from '@/components/features/teacher/class-detail/curriculum-accordion';
import { ClassSnapshotPanel } from '@/components/features/teacher/class-detail/class-snapshot-panel';
import { JoinCodePanel } from '@/components/features/classes/join-code-panel';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getStandardsAlignmentLabel } from '@/lib/utils/class-format';

const getClassDetail = cache(async (classId: string) => getClassDetailWithCurriculum(classId));

type RouteParams = Promise<{ classId: string }>;

export async function generateMetadata({ params }: { params: RouteParams }) {
  const { classId } = await params;
  const classDetail = await getClassDetail(classId);

  if (!classDetail) {
    return { title: 'Class Not Found' };
  }

  return {
    title: `${classDetail.name} - Curriculum`,
  };
}

export default async function TeacherClassDetailPage({ params }: { params: RouteParams }) {
  const session = await requireAuth();
  const { classId } = await params;

  if (session.user.role === 'STUDENT') {
    return redirect(`/student/classes/${classId}`);
  }

  const classDetail = await getClassDetail(classId);

  if (!classDetail) {
    return notFound();
  }

  const isTeacherOwner = classDetail.teacherId === session.user.id;
  const isAdmin = hasRole(session, 'ADMIN');

  if (!isTeacherOwner && !isAdmin) {
    return notFound();
  }

  const standardsLabel = getStandardsAlignmentLabel(classDetail.standardsAlignment);

  return (
    <div className="space-y-8">
      <ClassDetailHeader
        classTitle={classDetail.name}
        gradeLevel={classDetail.gradeLevel}
        standardsAlignment={classDetail.standardsAlignment}
        studentCount={classDetail.studentCount}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Curriculum Units</CardTitle>
            <CardDescription>
              Auto-populated units and lessons aligned with your selected standards
            </CardDescription>
          </CardHeader>
          <CardContent>
            {classDetail.curriculumUnits.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-6 text-sm text-gray-600">
                No curriculum available for Grade {classDetail.gradeLevel} {standardsLabel}. Contact
                admin.
              </div>
            ) : (
              <CurriculumAccordion units={classDetail.curriculumUnits} />
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          <JoinCodePanel joinCode={classDetail.joinCode} classTitle={classDetail.name} />
          <ClassSnapshotPanel
            gradeLevel={classDetail.gradeLevel}
            standardsAlignment={classDetail.standardsAlignment}
            studentCount={classDetail.studentCount}
          />
        </div>
      </div>
    </div>
  );
}
