import { NextRequest, NextResponse } from 'next/server';

import { getCurrentSession } from '@/lib/auth/session';
import prisma from '@/lib/prisma';

type LessonRouteContext = {
  params: Promise<{
    lessonSlug: string;
  }>;
};

/**
 * GET /api/lessons/{lessonSlug}
 * Returns lesson content with the standards it satisfies.
 *
 * Authentication: Required (must be teacher of, admin of, or enrolled in a class that uses the lesson)
 */
export async function GET(request: NextRequest, context: LessonRouteContext) {
  try {
    const session = await getCurrentSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { lessonSlug } = await context.params;

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonSlug },
      include: {
        standards: true,
        curriculumUnits: {
          include: {
            class: {
              include: {
                teacher: {
                  select: { id: true },
                },
                students: {
                  select: { id: true },
                },
              },
            },
          },
        },
      },
    });

    if (!lesson) {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      );
    }

    const userId = session.user.id;
    const userRole = session.user.role;

    const hasAccess = lesson.curriculumUnits.some(unit => {
      const classRecord = unit.class;
      if (!classRecord) {
        return false;
      }

      if (classRecord.teacher.id === userId) {
        return true;
      }

      if (classRecord.students.some(student => student.id === userId)) {
        return true;
      }

      return userRole === 'ADMIN' || userRole === 'SYSTEM';
    });

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Not enrolled in a class with this lesson' },
        { status: 403 }
      );
    }

    const responsePayload = {
      lesson: {
        id: lesson.id,
        slug: lesson.id, // TODO: Replace with dedicated slug when available
        title: lesson.title,
        titleThai: lesson.title, // TODO: Surface localized title when schema supports it
        content: lesson.content ?? '',
        contentThai: lesson.content ?? '', // TODO: Surface localized content when available
        objectives: lesson.description ? [lesson.description] : [],
        objectivesThai: lesson.description ? [lesson.description] : [],
      },
      standards: lesson.standards.map(standard => ({
        id: standard.id,
        code: standard.code,
        description: standard.description,
        descriptionThai: standard.description, // TODO: Provide Thai translation when available
        framework: standard.framework,
        gradeLevel: standard.gradeLevel,
      })),
    };

    return NextResponse.json(responsePayload, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch lesson:', error);

    return NextResponse.json(
      { error: 'An unexpected error occurred while fetching the lesson' },
      { status: 500 }
    );
  }
}
