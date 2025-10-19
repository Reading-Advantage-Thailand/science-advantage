import { NextRequest, NextResponse } from 'next/server';

import { getCurrentSession } from '@/lib/auth/session';
import { getClassDetailWithCurriculum } from '@/lib/services/classes/get-class-detail';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ classId: string }> }
) {
  try {
    const session = await getCurrentSession();

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { classId } = await context.params;

    const classDetail = await getClassDetailWithCurriculum(classId);

    if (!classDetail) {
      return NextResponse.json(
        { success: false, error: 'Class not found' },
        { status: 404 }
      );
    }

    const { user } = session;
    const isTeacherOwner = classDetail.teacherId === user.id;
    const isAdmin = user.role === 'ADMIN' || user.role === 'SYSTEM';
    const isEnrolledStudent = classDetail.students.some(student => student.id === user.id);

    if (!isTeacherOwner && !isAdmin && !isEnrolledStudent) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          id: classDetail.id,
          name: classDetail.name,
          gradeLevel: classDetail.gradeLevel,
          standardsAlignment: classDetail.standardsAlignment,
          joinCode: classDetail.joinCode,
          studentCount: classDetail.studentCount,
          curriculumUnits: classDetail.curriculumUnits,
          createdAt: classDetail.createdAt.toISOString(),
          updatedAt: classDetail.updatedAt.toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching class detail:', error);

    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
