import { PrismaClient, StandardsAlignment, LessonType } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { validateLessonsFile } from './validate-json';

interface LessonData {
  id: string;
  title: string;
  description: string;
  content: string;
  lessonType?: LessonType;
  order: number;
  standards: string[];
  structuredContent?: object;
}

interface LessonsFile {
  framework: StandardsAlignment;
  gradeLevel: number;
  unit: number;
  lessons: LessonData[];
}

export async function seedLessons(
  prisma: PrismaClient,
  options?: {
    framework?: StandardsAlignment;
    gradeLevel?: number;
  }
): Promise<void> {
  console.log('📖 Seeding lessons...');

  const dataDir = path.join(__dirname, '..', 'seed-data', 'lessons');
  const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));

  let lessonsCount = 0;

  for (const file of files) {
    const filePath = path.join(dataDir, file);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const data: LessonsFile = JSON.parse(fileContent);

    // Validate JSON structure
    validateLessonsFile(data);

    // Apply filters if provided
    if (options?.framework && data.framework !== options.framework) {
      continue;
    }
    if (options?.gradeLevel && data.gradeLevel !== options.gradeLevel) {
      continue;
    }

    console.log(`  Processing ${data.framework} Grade ${data.gradeLevel} Unit ${data.unit} lessons...`);

    for (const lessonData of data.lessons) {
      const slug = lessonData.id.toLowerCase().replace(/\s+/g, '-');
      await prisma.lesson.upsert({
        where: { id: lessonData.id },
        update: {
          title: lessonData.title,
          description: lessonData.description,
          content: lessonData.content,
          lessonType: lessonData.lessonType,
          order: lessonData.order,
          structuredContent: lessonData.structuredContent ?? undefined,
          standards: {
            connect: lessonData.standards.map(code => ({
              framework_code: {
                framework: data.framework,
                code,
              },
            })),
          },
        },
        create: {
          id: lessonData.id,
          slug,
          title: lessonData.title,
          description: lessonData.description,
          content: lessonData.content,
          lessonType: lessonData.lessonType,
          gradeLevel: data.gradeLevel,
          order: lessonData.order,
          structuredContent: lessonData.structuredContent ?? undefined,
          standards: {
            connect: lessonData.standards.map(code => ({
              framework_code: {
                framework: data.framework,
                code,
              },
            })),
          },
        },
      });
      lessonsCount++;
    }

    console.log(`  ✓ Seeded ${data.lessons.length} lessons from ${file}`);
  }

  console.log(`✓ Total lessons seeded: ${lessonsCount}\n`);
}
