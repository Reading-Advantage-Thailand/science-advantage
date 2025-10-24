import * as z from 'zod';
import type { Prisma } from '@prisma/client';
import { LessonTypeSchema } from '../enums/LessonType.schema';
import { StandardUncheckedCreateNestedManyWithoutLessonsInputObjectSchema as StandardUncheckedCreateNestedManyWithoutLessonsInputObjectSchema } from './StandardUncheckedCreateNestedManyWithoutLessonsInput.schema'

const makeSchema = () => z.object({
  id: z.string().optional(),
  title: z.string(),
  description: z.string().optional().nullable(),
  content: z.string().optional().nullable(),
  lessonType: LessonTypeSchema.optional(),
  gradeLevel: z.number().int(),
  order: z.number().int(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  standards: z.lazy(() => StandardUncheckedCreateNestedManyWithoutLessonsInputObjectSchema).optional()
}).strict();
export const LessonUncheckedCreateWithoutCurriculumUnitsInputObjectSchema: z.ZodType<Prisma.LessonUncheckedCreateWithoutCurriculumUnitsInput> = makeSchema() as unknown as z.ZodType<Prisma.LessonUncheckedCreateWithoutCurriculumUnitsInput>;
export const LessonUncheckedCreateWithoutCurriculumUnitsInputObjectZodSchema = makeSchema();
