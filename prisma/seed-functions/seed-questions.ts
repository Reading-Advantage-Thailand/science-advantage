import { PrismaClient, QuestionType } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

interface QuestionData {
  type: string;
  text: string;
  options?: any;
  correctAnswer: any;
  points: number;
  standards: string[];
}

interface QuestionsFile {
  lessonId: string;
  questions: QuestionData[];
}

export async function seedQuestions(
  prisma: PrismaClient,
  options?: {
    lessonId?: string;
  }
): Promise<void> {
  console.log('❓ Seeding questions...');

  const dataDir = path.join(__dirname, '..', 'seed-data', 'questions');

  // Check if directory exists
  if (!fs.existsSync(dataDir)) {
    console.log('  ℹ No questions directory found - skipping question seeding');
    return;
  }

  const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));

  if (files.length === 0) {
    console.log('  ℹ No question files found - skipping question seeding\n');
    return;
  }

  let totalQuestionsSeeded = 0;
  let filesProcessed = 0;

  for (const file of files) {
    const filePath = path.join(dataDir, file);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const questionData: QuestionsFile = JSON.parse(fileContent);

    // Skip if filtering by lessonId and this isn't the one
    if (options?.lessonId && questionData.lessonId !== options.lessonId) {
      continue;
    }

    // Find the lesson
    const lesson = await prisma.lesson.findFirst({
      where: { id: questionData.lessonId }
    });

    if (!lesson) {
      console.log(`  ⚠ Warning: Lesson ${questionData.lessonId} not found - skipping ${file}`);
      continue;
    }

    let questionsCreated = 0;
    let questionsSkipped = 0;

    for (let i = 0; i < questionData.questions.length; i++) {
      const q = questionData.questions[i];

      // Create a unique identifier for this question based on lesson, order, and text
      // This helps with idempotency
      const questionIdentifier = `${lesson.id}-${i}-${q.text.substring(0, 50)}`;

      try {
        // Check if question already exists (for idempotency)
        const existingQuestion = await prisma.quizQuestion.findFirst({
          where: {
            lessonId: lesson.id,
            order: i + 1,
            text: q.text
          }
        });

        if (existingQuestion) {
          questionsSkipped++;
          continue;
        }

        // Find the standards for this question
        const standardRecords = await prisma.standard.findMany({
          where: {
            code: {
              in: q.standards
            }
          }
        });

        if (standardRecords.length === 0) {
          console.log(`  ⚠ Warning: No standards found for question in ${file} (order ${i + 1})`);
          console.log(`    Standards requested: ${q.standards.join(', ')}`);
        }

        // Create the question
        await prisma.quizQuestion.create({
          data: {
            lessonId: lesson.id,
            type: q.type as QuestionType,
            text: q.text,
            options: q.options || null,
            correctAnswer: q.correctAnswer,
            points: q.points,
            order: i + 1,
            version: 1,
            standards: {
              connect: standardRecords.map(s => ({ id: s.id }))
            }
          }
        });

        questionsCreated++;
      } catch (error) {
        console.log(`  ⚠ Error creating question ${i + 1} in ${file}:`, error);
      }
    }

    console.log(`  ✓ Lesson: ${questionData.lessonId}`);
    console.log(`    - Created: ${questionsCreated} questions`);
    if (questionsSkipped > 0) {
      console.log(`    - Skipped: ${questionsSkipped} (already exist)`);
    }

    totalQuestionsSeeded += questionsCreated;
    filesProcessed++;
  }

  console.log(`\n  ✅ Total: ${totalQuestionsSeeded} questions seeded from ${filesProcessed} files\n`);
}
