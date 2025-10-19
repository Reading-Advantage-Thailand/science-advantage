import Link from 'next/link';
import { notFound } from 'next/navigation';

import { requireRole } from '@/lib/auth/server';
import prisma from '@/lib/prisma';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatStudentCount, getStandardsAlignmentLabel } from '@/lib/utils/class-format';

interface TeacherClassDetailPageProps {
  params: Promise<{ classId: string }>;
}

export default async function TeacherClassDetailPage({ params }: TeacherClassDetailPageProps) {
  const session = await requireRole('TEACHER');
  const { classId } = await params;

  const classWithDetails = await prisma.class.findFirst({
    where: {
      id: classId,
      teacherId: session.user.id,
    },
    include: {
      _count: {
        select: { students: true },
      },
      curriculumUnits: {
        include: {
          lessons: {
            select: {
              id: true,
              title: true,
              order: true,
            },
            orderBy: { order: 'asc' },
          },
        },
        orderBy: { order: 'asc' },
      },
    },
  });

  if (!classWithDetails) {
    return notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase text-rose-600">Class</p>
          <h1 className="text-3xl font-bold text-gray-900">{classWithDetails.name}</h1>
          <p className="mt-2 text-gray-600">
            Grade {classWithDetails.gradeLevel} ·{' '}
            {getStandardsAlignmentLabel(classWithDetails.standardsAlignment)}
          </p>
        </div>

        <div className="flex flex-col items-start gap-3 md:items-end">
          <div className="rounded-lg border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            Join Code:{' '}
            <span className="font-semibold text-rose-900">{classWithDetails.joinCode}</span>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/teacher/classes">Back to classes</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr,1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Curriculum Units</CardTitle>
            <CardDescription>
              Auto-populated units and lessons aligned with your selected standards
            </CardDescription>
          </CardHeader>
          <CardContent>
            {classWithDetails.curriculumUnits.length === 0 ? (
              <p className="text-gray-500">No curriculum units assigned yet.</p>
            ) : (
              <div className="space-y-4">
                {classWithDetails.curriculumUnits.map(unit => (
                  <div
                    key={unit.id}
                    className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold uppercase text-rose-600">
                          Unit {unit.order}
                        </p>
                        <h3 className="text-lg font-semibold text-gray-900">{unit.title}</h3>
                      </div>
                      <span className="text-sm text-gray-500">
                        {unit.lessons.length} {unit.lessons.length === 1 ? 'lesson' : 'lessons'}
                      </span>
                    </div>
                    {unit.description && (
                      <p className="mt-2 text-sm text-gray-600">{unit.description}</p>
                    )}

                    {unit.lessons.length > 0 && (
                      <ol className="mt-3 list-decimal space-y-1 pl-4 text-sm text-gray-700">
                        {unit.lessons.map(lesson => (
                          <li key={lesson.id}>{lesson.title}</li>
                        ))}
                      </ol>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Class Snapshot</CardTitle>
            <CardDescription>
              Quick stats to help you understand who is enrolled and ready to learn
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <p className="text-sm text-gray-500">Students</p>
              <p className="text-xl font-semibold text-gray-900">
                {formatStudentCount(classWithDetails._count.students)}
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <p className="text-sm text-gray-500">Standards Alignment</p>
              <p className="text-base font-medium text-gray-900">
                {getStandardsAlignmentLabel(classWithDetails.standardsAlignment)}
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <p className="text-sm text-gray-500">Grade Level</p>
              <p className="text-base font-medium text-gray-900">
                Grade {classWithDetails.gradeLevel}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
