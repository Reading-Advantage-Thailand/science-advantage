import * as z from 'zod';
import type { Prisma } from '@prisma/client';
import { StandardUncheckedCreateNestedManyWithoutLessonsInputObjectSchema as StandardUncheckedCreateNestedManyWithoutLessonsInputObjectSchema } from './StandardUncheckedCreateNestedManyWithoutLessonsInput.schema';
import { CurriculumUnitUncheckedCreateNestedManyWithoutLessonsInputObjectSchema as CurriculumUnitUncheckedCreateNestedManyWithoutLessonsInputObjectSchema } from './CurriculumUnitUncheckedCreateNestedManyWithoutLessonsInput.schema'

const makeSchema = () => z.object({
  id: z.string().optional(),
  title: z.string(),
  description: z.string().optional().nullable(),
  content: z.string().optional().nullable(),
  gradeLevel: z.number().int(),
  order: z.number().int(),
  createdAt: z.coerce.date().optional(),
  standards: z.lazy(() => StandardUncheckedCreateNestedManyWithoutLessonsInputObjectSchema),
  curriculumUnits: z.lazy(() => CurriculumUnitUncheckedCreateNestedManyWithoutLessonsInputObjectSchema)
}).strict();
export const LessonUncheckedCreateInputObjectSchema: z.ZodType<Prisma.LessonUncheckedCreateInput> = makeSchema() as unknown as z.ZodType<Prisma.LessonUncheckedCreateInput>;
export const LessonUncheckedCreateInputObjectZodSchema = makeSchema();
