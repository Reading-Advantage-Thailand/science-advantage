import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

// Placeholder types for future question bank schema
interface QuestionData {
  id: string;
  type: string;
  content: string;
  // Additional fields will be defined when question schema is implemented
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
    console.log('  (This is expected until Story #92 implements question schema)\n');
    return;
  }

  const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));

  if (files.length === 0) {
    console.log('  ℹ No question files found - skipping question seeding\n');
    return;
  }

  // TODO: Implement question seeding once QuizQuestion schema is added in Story #92
  console.log('  ℹ Question seeding not yet implemented');
  console.log('  Will be completed in Story #92: Assessment Data Schema & Question Bank\n');
}
