
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Define student profiles
const studentProfiles = [
  { profile: 'High-Achiever', count: 2, scoreRange: [0.9, 1.0], attempts: 1 },
  { profile: 'Consistent-Performer', count: 5, scoreRange: [0.75, 0.9], attempts: 1 },
  { profile: 'Struggling-Learner', count: 3, scoreRange: [0.4, 0.6], attempts: 3 },
  { profile: 'Improving-Learner', count: 2, scoreRange: [0.5, 0.9], attempts: 2 },
  { profile: 'Disengaged-Learner', count: 2, scoreRange: [0.6, 0.8], attempts: 1, completedLessons: 2 },
];

export async function seedActivityData(prisma: PrismaClient) {
  console.log('Seeding activity data...');

  const password = 'Password123!';
  const hashedPassword = await bcrypt.hash(password, 10);

  // 1. Expand Student Roster
  const demoClass = await prisma.class.findUnique({
    where: { joinCode: 'DEMO3T' },
    include: { students: true },
  });

  if (!demoClass) {
    console.error('Demo class with join code DEMO3T not found.');
    return;
  }

  let studentCount = 1; // Start from 1 since student_demo already exists
  for (const { profile, count } of studentProfiles) {
    for (let i = 1; i <= count; i++) {
      studentCount++;
      const username = `student_demo_${studentCount.toString().padStart(2, '0')}`;
      const email = `student${studentCount.toString().padStart(2, '0')}@demo.local`;
      const name = `${profile} ${i}`;

      const user = await prisma.user.upsert({
        where: { username },
        update: {},
        create: {
          id: `student-${username}`,
          username,
          displayUsername: username,
          name,
          email,
          role: 'STUDENT',
          gradeLevel: 3,
          emailVerified: false,
          image: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      const accountId = `${user.id}_credential`;
      await prisma.account.upsert({
        where: { id: accountId },
        update: {},
        create: {
          id: accountId,
          userId: user.id,
          accountId: user.username,
          providerId: 'credential',
          password: hashedPassword,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      await prisma.class.update({
        where: { id: demoClass.id },
        data: {
          students: {
            connect: { id: user.id },
          },
        },
      });
    }
  }

  console.log('  ✓ Expanded student roster to 15 students.');

  // (Optional) Enhance Admin View
  const teacher2 = await prisma.user.upsert({
    where: { username: 'teacher_demo_02' },
    update: {},
    create: {
      id: 'teacher-demo-02',
      username: 'teacher_demo_02',
      displayUsername: 'teacher_demo_02',
      name: 'Demo Teacher 2',
      email: 'teacher2@demo.local',
      role: 'TEACHER',
      gradeLevel: null,
      emailVerified: false,
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const accountId = `${teacher2.id}_credential`;
  await prisma.account.upsert({
    where: { id: accountId },
    update: {},
    create: {
      id: accountId,
      userId: teacher2.id,
      accountId: teacher2.username,
      providerId: 'credential',
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  await prisma.class.upsert({
    where: { joinCode: 'DEMO4T' },
    update: {},
    create: {
      name: 'Grade 4 Science (Thai Standards)',
      gradeLevel: 4,
      standardsAlignment: 'THAI',
      joinCode: 'DEMO4T',
      teacherId: teacher2.id,
    },
  });

  console.log('  ✓ (Optional) Enhanced admin view with additional teacher and class.');

  // 2. Generate Realistic Assessment Activity
  const lessons = await prisma.lesson.findMany({
    where: { gradeLevel: 3 },
    include: { quizQuestions: true },
  });

  // Refetch the class with updated student list
  const refreshedClass = await prisma.class.findUnique({
    where: { id: demoClass.id },
    include: { students: true },
  });

  if (!refreshedClass) {
    console.error('Could not refetch demo class');
    return;
  }

  const students = refreshedClass.students;

  const hardLesson = lessons.find(l => l.title.includes('Diversity'));
  const trickyQuestionIds = hardLesson?.quizQuestions.slice(0, 2).map(q => q.id) || [];

  for (const student of students) {
    const studentProfile = studentProfiles.find(p => student.name.startsWith(p.profile));
    if (!studentProfile) continue;

    const lessonsToComplete = studentProfile.completedLessons ? lessons.slice(0, studentProfile.completedLessons) : lessons;

    for (const lesson of lessonsToComplete) {
      for (let i = 1; i <= studentProfile.attempts; i++) {
        const attempt = await prisma.attempt.create({
          data: {
            studentId: student.id,
            lessonId: lesson.id,
            attemptNumber: i,
            score: 0, // Will be updated after responses
            maxScore: 9,
            startedAt: new Date(),
            completedAt: new Date(),
          },
        });

        let score = 0;
        const questionResponses = [];
        const questions = lesson.quizQuestions.sort(() => 0.5 - Math.random()).slice(0, 9);

        for (const question of questions) {
          let isCorrect = Math.random() < (lesson.id === hardLesson?.id ? 0.65 : studentProfile.scoreRange[0]);
          if (trickyQuestionIds.includes(question.id)) {
            isCorrect = Math.random() < 0.4;
          }

          if (isCorrect) score++;

          questionResponses.push(prisma.questionResponse.create({
            data: {
              attemptId: attempt.id,
              questionId: question.id,
              studentAnswer: '...', // Placeholder
              isCorrect,
              timeSpentSeconds: Math.floor(Math.random() * (120 - 30 + 1)) + 30, // 30-120 seconds
              answeredAt: new Date(),
            },
          }));
        }

        await Promise.all(questionResponses);

        await prisma.attempt.update({
          where: { id: attempt.id },
          data: { score },
        });
      }
    }
  }

  console.log('  ✓ Generated realistic assessment activity.');

  // 3. Ensure Accurate LessonCompletion Data
  for (const student of students) {
    const attempts = await prisma.attempt.findMany({
      where: { studentId: student.id },
      orderBy: { completedAt: 'asc' },
    });

    const lessonCompletions = new Map();

    for (const attempt of attempts) {
      const { lessonId, score, maxScore } = attempt;
      const percentage = (score / maxScore) * 100;

      if (!lessonCompletions.has(lessonId)) {
        lessonCompletions.set(lessonId, {
          studentId: student.id,
          lessonId,
          status: 'COMPLETED',
          completedAt: attempt.completedAt,
          attemptsCount: 0,
          bestScore: 0,
          bestScorePercentage: 0,
          mostRecentScore: 0,
          mostRecentScorePercentage: 0,
          totalTimeSpentSeconds: 0,
          lastAttemptAt: attempt.completedAt,
        });
      }

      const completion = lessonCompletions.get(lessonId);
      completion.attemptsCount++;
      completion.mostRecentScore = score;
      completion.mostRecentScorePercentage = percentage;
      completion.lastAttemptAt = attempt.completedAt;
      if (percentage > completion.bestScorePercentage) {
        completion.bestScore = score;
        completion.bestScorePercentage = percentage;
      }
    }

    for (const completion of lessonCompletions.values()) {
      await prisma.lessonCompletion.upsert({
        where: { studentId_lessonId: { studentId: completion.studentId, lessonId: completion.lessonId } },
        update: completion,
        create: completion,
      });
    }
  }

  console.log('  ✓ Ensured accurate LessonCompletion data.');

  console.log('Activity data seeding complete.');
}
