import * as z from 'zod';
import type { Prisma } from '@prisma/client';
import { CurriculumUnitUncheckedCreateNestedManyWithoutLessonsInputObjectSchema as CurriculumUnitUncheckedCreateNestedManyWithoutLessonsInputObjectSchema } from './CurriculumUnitUncheckedCreateNestedManyWithoutLessonsInput.schema'

const makeSchema = () => z.object({
  id: z.string().optional(),
  title: z.string(),
  description: z.string().optional().nullable(),
  content: z.string().optional().nullable(),
  gradeLevel: z.number().int(),
  order: z.number().int(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  curriculumUnits: z.lazy(() => CurriculumUnitUncheckedCreateNestedManyWithoutLessonsInputObjectSchema).optional()
}).strict();
export const LessonUncheckedCreateWithoutStandardsInputObjectSchema: z.ZodType<Prisma.LessonUncheckedCreateWithoutStandardsInput> = makeSchema() as unknown as z.ZodType<Prisma.LessonUncheckedCreateWithoutStandardsInput>;
export const LessonUncheckedCreateWithoutStandardsInputObjectZodSchema = makeSchema();
