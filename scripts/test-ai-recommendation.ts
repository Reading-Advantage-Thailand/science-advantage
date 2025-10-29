/**
 * Test AI recommendation endpoint with real database data
 * Run with: npx tsx scripts/test-ai-recommendation.ts
 */

import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Load environment variables
config({ path: '.env.local' });

const prisma = new PrismaClient();

async function testAiRecommendation() {
  console.log('Testing AI Recommendation Flow\n');
  console.log('================================\n');

  try {
    // 1. Find a student with attempts
    const student = await prisma.user.findFirst({
      where: { role: 'STUDENT' },
      include: {
        attempts: {
          include: { lesson: true },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!student || student.attempts.length === 0) {
      console.log('❌ No student with attempts found. Run seed script first.');
      return;
    }

    const attempt = student.attempts[0];

    console.log('✓ Found test data:');
    console.log(`  Student: ${student.name} (${student.email})`);
    console.log(`  Attempt: ${attempt.id}`);
    console.log(`  Lesson: ${attempt.lesson.title}`);
    console.log(`  Score: ${attempt.score}/${attempt.maxScore}\n`);

    // 2. Check candidate lessons
    const lessons = await prisma.lesson.findMany({
      where: { gradeLevel: 3 },
      include: {
        standards: { where: { framework: 'THAI' } },
      },
      orderBy: { order: 'asc' },
    });

    console.log(`✓ Found ${lessons.length} Grade 3 lessons:`);
    lessons.forEach((l, i) => {
      console.log(`  ${i + 1}. ${l.id} - ${l.title} (${l.standards.length} standards)`);
    });
    console.log();

    // 3. Check completion status
    const completions = await prisma.lessonCompletion.findMany({
      where: { studentId: student.id },
    });

    console.log(`✓ Student has ${completions.length} completed lessons`);
    completions.forEach((c) => {
      console.log(`  - ${c.lessonId} (${c.status})`);
    });
    console.log();

    // 4. Make API call
    console.log('Making API call to /api/ai/recommendations...\n');

    const response = await fetch('http://localhost:3000/api/ai/recommendations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `better-auth.session_token=${process.env.TEST_SESSION_TOKEN || ''}`,
      },
      body: JSON.stringify({
        attemptId: attempt.id,
        studentId: student.id,
      }),
    });

    console.log(`Response status: ${response.status}`);

    const data = await response.json();
    console.log('Response body:', JSON.stringify(data, null, 2));

    if (data.success && data.recommendation) {
      console.log('\n✅ AI recommendation successful!');
      console.log(`Recommended: ${data.recommendation.lessonTitle}`);
      console.log(`Model: ${data.model}`);
      console.log(`Fallback: ${data.fallbackUsed}`);
    } else if (data.success && !data.recommendation) {
      console.log('\n✓ No recommendation (all lessons completed)');
    } else {
      console.log('\n❌ AI recommendation failed');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAiRecommendation();
