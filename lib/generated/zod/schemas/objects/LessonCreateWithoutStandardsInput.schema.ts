import * as z from 'zod';
import type { Prisma } from '@prisma/client';
import { CurriculumUnitCreateNestedManyWithoutLessonsInputObjectSchema as CurriculumUnitCreateNestedManyWithoutLessonsInputObjectSchema } from './CurriculumUnitCreateNestedManyWithoutLessonsInput.schema'

const makeSchema = () => z.object({
  id: z.string().optional(),
  title: z.string(),
  description: z.string().optional().nullable(),
  content: z.string().optional().nullable(),
  gradeLevel: z.number().int(),
  order: z.number().int(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  curriculumUnits: z.lazy(() => CurriculumUnitCreateNestedManyWithoutLessonsInputObjectSchema).optional()
}).strict();
export const LessonCreateWithoutStandardsInputObjectSchema: z.ZodType<Prisma.LessonCreateWithoutStandardsInput> = makeSchema() as unknown as z.ZodType<Prisma.LessonCreateWithoutStandardsInput>;
export const LessonCreateWithoutStandardsInputObjectZodSchema = makeSchema();
