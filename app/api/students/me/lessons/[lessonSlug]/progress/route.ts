import { NextRequest, NextResponse } from 'next/server';

import { getCurrentSession } from '@/lib/auth/session';
import prisma from '@/lib/prisma';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ lessonSlug: string }> }
) {
  try {
    const session = await getCurrentSession();

    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { lessonSlug } = await context.params;

    const lesson = await prisma.lesson.findUnique({
      where: { slug: lessonSlug },
      include: {
        curriculumUnits: {
          include: {
            class: {
              include: {
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
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    const targetStudentId = session.user.id;

    const hasAccess = lesson.curriculumUnits.some(unit =>
      unit.class.students.some(student => student.id === targetStudentId)
    );

    if (!hasAccess) {
      return NextResponse.json({ error: 'Not enrolled in a class with this lesson' }, { status: 403 });
    }

    const completion = await prisma.lessonCompletion.findUnique({
      where: {
        studentId_lessonId: {
          studentId: targetStudentId,
          lessonId: lesson.id,
        },
      },
    });

    const response = {
      studentId: targetStudentId,
      lessonId: lesson.id,
      status: completion?.status ?? 'NOT_STARTED',
      attemptsCount: completion?.attemptsCount ?? 0,
      bestScore: completion?.bestScore ?? null,
      bestScorePercentage: completion?.bestScorePercentage ?? null,
      mostRecentScore: completion?.mostRecentScore ?? null,
      mostRecentScorePercentage: completion?.mostRecentScorePercentage ?? null,
      totalTimeSpentSeconds: completion?.totalTimeSpentSeconds ?? 0,
      lastAttemptAt: completion?.lastAttemptAt?.toISOString() ?? null,
      completedAt: completion?.completedAt?.toISOString() ?? null,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch lesson progress:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while fetching progress' },
      { status: 500 }
    );
  }
}