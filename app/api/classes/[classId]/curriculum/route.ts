import { NextRequest, NextResponse } from 'next/server';

import { getCurrentSession } from '@/lib/auth/session';
import prisma from '@/lib/prisma';

/**
 * GET /api/classes/{classId}/curriculum
 * Returns the curriculum for a given class, organized by units and lessons.
 *
 * Authentication: Required (student must be enrolled OR teacher owns class)
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ classId: string }> }
) {
  try {
    // 1. Authenticate user
    const session = await getCurrentSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // 2. Get classId from params
    const { classId } = await context.params;

    // 3. Fetch the class with authorization check
    const classRecord = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        teacher: {
          select: {
            id: true,
          },
        },
        students: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!classRecord) {
      return NextResponse.json(
        { error: 'Class not found' },
        { status: 404 }
      );
    }

    // 4. Authorization: Check if user is teacher or enrolled student
    const isTeacher = classRecord.teacher.id === session.user.id;
    const isEnrolledStudent = classRecord.students.some(
      student => student.id === session.user.id
    );

    if (!isTeacher && !isEnrolledStudent) {
      return NextResponse.json(
        { error: 'Not enrolled in this class' },
        { status: 403 }
      );
    }

    // 5. Fetch curriculum units with lessons
    const units = await prisma.curriculumUnit.findMany({
      where: {
        classId,
      },
      include: {
        lessons: {
          orderBy: {
            order: 'asc',
          },
        },
      },
      orderBy: {
        order: 'asc',
      },
    });

    // 6. Format response according to API contract
    const response = {
      class: {
        id: classRecord.id,
        name: classRecord.name,
        gradeLevel: classRecord.gradeLevel,
        standardsAlignment: classRecord.standardsAlignment,
      },
      units: units.map(unit => ({
        id: unit.id,
        title: unit.title,
        titleThai: unit.title, // TODO: Add Thai translations when schema supports it
        order: unit.order,
        lessons: unit.lessons.map(lesson => ({
          id: lesson.id,
          slug: lesson.id, // TODO: Use slug field when schema supports it
          title: lesson.title,
          titleThai: lesson.title, // TODO: Add Thai translations when schema supports it
          order: lesson.order,
          completed: false, // Placeholder - will be implemented with progress tracking
          started: false,   // Placeholder - will be implemented with progress tracking
        })),
      })),
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch curriculum:', error);

    return NextResponse.json(
      { error: 'An unexpected error occurred while fetching the curriculum' },
      { status: 500 }
    );
  }
}
