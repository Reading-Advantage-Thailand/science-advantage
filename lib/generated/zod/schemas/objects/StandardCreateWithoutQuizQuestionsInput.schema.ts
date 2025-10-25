import * as z from 'zod';
import type { Prisma } from '@prisma/client';
import { StandardsAlignmentSchema } from '../enums/StandardsAlignment.schema';
import { LessonCreateNestedManyWithoutStandardsInputObjectSchema as LessonCreateNestedManyWithoutStandardsInputObjectSchema } from './LessonCreateNestedManyWithoutStandardsInput.schema'

const makeSchema = () => z.object({
  id: z.string().optional(),
  framework: StandardsAlignmentSchema,
  code: z.string(),
  description: z.string(),
  gradeLevel: z.number().int().optional().nullable(),
  lessons: z.lazy(() => LessonCreateNestedManyWithoutStandardsInputObjectSchema).optional()
}).strict();
export const StandardCreateWithoutQuizQuestionsInputObjectSchema: z.ZodType<Prisma.StandardCreateWithoutQuizQuestionsInput> = makeSchema() as unknown as z.ZodType<Prisma.StandardCreateWithoutQuizQuestionsInput>;
export const StandardCreateWithoutQuizQuestionsInputObjectZodSchema = makeSchema();
