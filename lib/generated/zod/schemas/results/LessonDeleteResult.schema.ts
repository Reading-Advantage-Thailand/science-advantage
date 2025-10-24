import * as z from 'zod';
export const LessonDeleteResultSchema = z.nullable(z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  content: z.string().optional(),
  lessonType: z.unknown(),
  gradeLevel: z.number().int(),
  order: z.number().int(),
  standards: z.array(z.unknown()),
  curriculumUnits: z.array(z.unknown()),
  createdAt: z.date(),
  updatedAt: z.date()
}));