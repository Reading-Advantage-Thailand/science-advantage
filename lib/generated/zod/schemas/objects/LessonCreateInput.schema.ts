import * as z from 'zod';
import type { Prisma } from '@prisma/client';
import { StandardCreateNestedManyWithoutLessonsInputObjectSchema as StandardCreateNestedManyWithoutLessonsInputObjectSchema } from './StandardCreateNestedManyWithoutLessonsInput.schema';
import { CurriculumUnitCreateNestedManyWithoutLessonsInputObjectSchema as CurriculumUnitCreateNestedManyWithoutLessonsInputObjectSchema } from './CurriculumUnitCreateNestedManyWithoutLessonsInput.schema'

const makeSchema = () => z.object({
  id: z.string().optional(),
  title: z.string(),
  description: z.string().optional().nullable(),
  content: z.string().optional().nullable(),
  gradeLevel: z.number().int(),
  order: z.number().int(),
  createdAt: z.coerce.date().optional(),
  standards: z.lazy(() => StandardCreateNestedManyWithoutLessonsInputObjectSchema),
  curriculumUnits: z.lazy(() => CurriculumUnitCreateNestedManyWithoutLessonsInputObjectSchema)
}).strict();
export const LessonCreateInputObjectSchema: z.ZodType<Prisma.LessonCreateInput> = makeSchema() as unknown as z.ZodType<Prisma.LessonCreateInput>;
export const LessonCreateInputObjectZodSchema = makeSchema();
