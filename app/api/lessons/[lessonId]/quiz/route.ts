import { NextRequest, NextResponse } from 'next/server';

import { getCurrentSession } from '@/lib/auth/session';
import prisma from '@/lib/prisma';

/**
 * GET /api/lessons/{lessonId}/quiz
 * Returns a random set of N questions from the lesson's 4N question bank to start a new quiz attempt.
 *
 * Authentication: Required
 * Authorization: Student must be enrolled in a class using this lesson OR teacher must own the class
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ lessonId: string }> }
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

    // 2. Get lessonId from params
    const { lessonId } = await context.params;

    // 3. Fetch the lesson with curriculum units to find associated classes
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
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
        quizQuestions: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!lesson) {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      );
    }

    // 4. Authorization: Check if user is teacher or enrolled student in any class using this lesson
    const hasAccess = lesson.curriculumUnits.some(unit => {
      const isTeacher = unit.class.teacher.id === session.user.id;
      const isEnrolledStudent = unit.class.students.some(
        student => student.id === session.user.id
      );
      return isTeacher || isEnrolledStudent;
    });

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Not enrolled in class with this lesson' },
        { status: 403 }
      );
    }

    // 5. Validate question pool size (should be 4N questions for N-question quiz)
    const totalQuestions = lesson.quizQuestions.length;
    if (totalQuestions < 4) {
      return NextResponse.json(
        { error: 'Insufficient questions in question bank' },
        { status: 500 }
      );
    }

    // Calculate N (number of questions to serve) as totalQuestions / 4
    const N = Math.floor(totalQuestions / 4);
    if (N === 0) {
      return NextResponse.json(
        { error: 'Insufficient questions in question bank' },
        { status: 500 }
      );
    }

    // 6. Randomly select N questions from the pool
    const shuffled = [...lesson.quizQuestions].sort(() => Math.random() - 0.5);
    const selectedQuestions = shuffled.slice(0, N);

    // 7. Calculate attempt number for this student-lesson pair
    const previousAttempts = await prisma.attempt.count({
      where: {
        studentId: session.user.id,
        lessonId,
      },
    });
    const attemptNumber = previousAttempts + 1;

    // 8. Calculate total points
    const totalPoints = selectedQuestions.reduce((sum, q) => sum + q.points, 0);

    // 9. Create an attempt record
    const attempt = await prisma.attempt.create({
      data: {
        studentId: session.user.id,
        lessonId,
        maxScore: totalPoints,
        attemptNumber,
        startedAt: new Date(),
      },
    });

    // 10. Format response (exclude correctAnswer)
    const response = {
      quizId: attempt.id,
      lessonId,
      questions: selectedQuestions.map((q, index) => ({
        id: q.id,
        type: q.type,
        text: q.text,
        options: q.options,
        points: q.points,
        order: index + 1, // Order within this quiz
      })),
      totalPoints,
      startedAt: attempt.startedAt.toISOString(),
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch quiz:', error);

    return NextResponse.json(
      { error: 'An unexpected error occurred while fetching the quiz' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/lessons/{lessonId}/quiz/submit
 * Submit a completed quiz attempt with question responses and timing data.
 *
 * Authentication: Required
 * Authorization: Student must be enrolled in class and quiz must belong to them
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ lessonId: string }> }
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

    // 2. Get lessonId from params
    const { lessonId } = await context.params;

    // 3. Parse request body
    const body = await request.json();
    const { attemptId, responses } = body;

    if (!attemptId || !responses || !Array.isArray(responses)) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    // 4. Fetch the attempt and verify ownership
    const attempt = await prisma.attempt.findUnique({
      where: { id: attemptId },
      include: {
        lesson: {
          include: {
            quizQuestions: true,
          },
        },
      },
    });

    if (!attempt) {
      return NextResponse.json(
        { error: 'Attempt not found' },
        { status: 404 }
      );
    }

    // Authorization: verify student owns this attempt
    if (attempt.studentId !== session.user.id) {
      return NextResponse.json(
        { error: 'Not authorized to submit this attempt' },
        { status: 403 }
      );
    }

    // Check if already submitted
    if (attempt.completedAt) {
      return NextResponse.json(
        { error: 'Attempt already submitted' },
        { status: 409 }
      );
    }

    // 5. Get all questions for this lesson to validate and grade
    const questionMap = new Map(
      attempt.lesson.quizQuestions.map(q => [q.id, q])
    );

    // 6. Validate that all questions are answered
    if (responses.length === 0) {
      return NextResponse.json(
        { error: 'All questions must be answered' },
        { status: 400 }
      );
    }

    // 7. Grade each response and create QuestionResponse records
    let totalScore = 0;
    const breakdown: any[] = [];
    const questionResponsesToCreate: any[] = [];

    for (const response of responses) {
      const question = questionMap.get(response.questionId);
      if (!question) {
        return NextResponse.json(
          { error: `Invalid question ID: ${response.questionId}` },
          { status: 400 }
        );
      }

      // Auto-grade based on question type
      const isCorrect = gradeAnswer(
        question.type,
        response.studentAnswer,
        question.correctAnswer
      );

      const pointsEarned = isCorrect ? question.points : 0;
      totalScore += pointsEarned;

      // Prepare question response record
      questionResponsesToCreate.push({
        attemptId,
        questionId: question.id,
        studentAnswer: response.studentAnswer,
        isCorrect,
        timeSpentSeconds: response.timeSpentSeconds || 0,
        answeredAt: response.answeredAt ? new Date(response.answeredAt) : new Date(),
        order: response.order,
      });

      // Add to breakdown for response
      breakdown.push({
        questionId: question.id,
        questionText: question.text,
        studentAnswer: response.studentAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        points: pointsEarned,
        timeSpentSeconds: response.timeSpentSeconds || 0,
      });
    }

    // 8. Use transaction to ensure data consistency
    await prisma.$transaction(async tx => {
      // Update attempt with score and completion time
      await tx.attempt.update({
        where: { id: attemptId },
        data: {
          score: totalScore,
          completedAt: new Date(),
        },
      });

      // Create all question responses
      await tx.questionResponse.createMany({
        data: questionResponsesToCreate,
      });

      // Update or create LessonCompletion record
      const percentage = (totalScore / attempt.maxScore) * 100;

      const existingCompletion = await tx.lessonCompletion.findUnique({
        where: {
          studentId_lessonId: {
            studentId: session.user.id,
            lessonId,
          },
        },
      });

      if (existingCompletion) {
        // Update existing completion
        await tx.lessonCompletion.update({
          where: {
            studentId_lessonId: {
              studentId: session.user.id,
              lessonId,
            },
          },
          data: {
            attemptsCount: { increment: 1 },
            mostRecentScore: totalScore,
            mostRecentScorePercentage: percentage,
            bestScore:
              existingCompletion.bestScore !== null
                ? Math.max(existingCompletion.bestScore, totalScore)
                : totalScore,
            bestScorePercentage:
              existingCompletion.bestScorePercentage !== null
                ? Math.max(existingCompletion.bestScorePercentage, percentage)
                : percentage,
            lastAttemptAt: new Date(),
            status: percentage >= 60 ? 'COMPLETED' : 'IN_PROGRESS',
            completedAt: percentage >= 60 ? new Date() : existingCompletion.completedAt,
          },
        });
      } else {
        // Create new completion record
        await tx.lessonCompletion.create({
          data: {
            studentId: session.user.id,
            lessonId,
            status: percentage >= 60 ? 'COMPLETED' : 'IN_PROGRESS',
            attemptsCount: 1,
            bestScore: totalScore,
            bestScorePercentage: percentage,
            mostRecentScore: totalScore,
            mostRecentScorePercentage: percentage,
            lastAttemptAt: new Date(),
            completedAt: percentage >= 60 ? new Date() : null,
          },
        });
      }
    });

    // 9. Format and return response
    const percentage = (totalScore / attempt.maxScore) * 100;

    return NextResponse.json(
      {
        attemptId,
        score: totalScore,
        maxScore: attempt.maxScore,
        percentage: parseFloat(percentage.toFixed(2)),
        attemptNumber: attempt.attemptNumber,
        completedAt: new Date().toISOString(),
        breakdown,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to submit quiz:', error);

    return NextResponse.json(
      { error: 'An unexpected error occurred while submitting the quiz' },
      { status: 500 }
    );
  }
}

/**
 * Auto-grade a student's answer based on question type
 */
function gradeAnswer(
  questionType: string,
  studentAnswer: any,
  correctAnswer: any
): boolean {
  switch (questionType) {
    case 'MULTIPLE_CHOICE':
    case 'TRUE_FALSE':
      // Exact match for single selection
      return studentAnswer === correctAnswer;

    case 'MULTIPLE_SELECT':
      // All correct answers must be selected, no incorrect answers
      if (!Array.isArray(studentAnswer) || !Array.isArray(correctAnswer)) {
        return false;
      }
      if (studentAnswer.length !== correctAnswer.length) {
        return false;
      }
      const sortedStudent = [...studentAnswer].sort();
      const sortedCorrect = [...correctAnswer].sort();
      return sortedStudent.every((ans, idx) => ans === sortedCorrect[idx]);

    case 'FILL_IN_BLANK':
      // Normalize and compare (case-insensitive, trim whitespace)
      const normalizedStudent = String(studentAnswer || '')
        .toLowerCase()
        .trim()
        .replace(/\s+/g, ' ');
      const normalizedCorrect = String(correctAnswer || '')
        .toLowerCase()
        .trim()
        .replace(/\s+/g, ' ');
      return normalizedStudent === normalizedCorrect;

    case 'VOCABULARY_MATCH':
      // Verify each term is matched to correct definition
      if (typeof studentAnswer !== 'object' || typeof correctAnswer !== 'object') {
        return false;
      }
      const studentKeys = Object.keys(studentAnswer);
      const correctKeys = Object.keys(correctAnswer);
      if (studentKeys.length !== correctKeys.length) {
        return false;
      }
      return studentKeys.every(
        key => studentAnswer[key] === correctAnswer[key]
      );

    default:
      return false;
  }
}
