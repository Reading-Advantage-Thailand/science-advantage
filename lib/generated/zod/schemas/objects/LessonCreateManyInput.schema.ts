import * as z from 'zod';
import type { Prisma } from '@prisma/client';


const makeSchema = () => z.object({
  id: z.string().optional(),
  title: z.string(),
  description: z.string().optional().nullable(),
  content: z.string().optional().nullable(),
  gradeLevel: z.number().int(),
  order: z.number().int(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();
export const LessonCreateManyInputObjectSchema: z.ZodType<Prisma.LessonCreateManyInput> = makeSchema() as unknown as z.ZodType<Prisma.LessonCreateManyInput>;
export const LessonCreateManyInputObjectZodSchema = makeSchema();
