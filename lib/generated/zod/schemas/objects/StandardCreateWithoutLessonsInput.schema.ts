import * as z from 'zod';
import type { Prisma } from '@prisma/client';
import { StandardsAlignmentSchema } from '../enums/StandardsAlignment.schema';
import { QuizQuestionCreateNestedManyWithoutStandardsInputObjectSchema as QuizQuestionCreateNestedManyWithoutStandardsInputObjectSchema } from './QuizQuestionCreateNestedManyWithoutStandardsInput.schema';
import { standardMasteryCreateNestedManyWithoutStandardInputObjectSchema as standardMasteryCreateNestedManyWithoutStandardInputObjectSchema } from './standardMasteryCreateNestedManyWithoutStandardInput.schema'

const makeSchema = () => z.object({
  id: z.string().optional(),
  framework: StandardsAlignmentSchema,
  code: z.string(),
  description: z.string(),
  gradeLevel: z.number().int().optional().nullable(),
  quizQuestions: z.lazy(() => QuizQuestionCreateNestedManyWithoutStandardsInputObjectSchema).optional(),
  masteryRecords: z.lazy(() => standardMasteryCreateNestedManyWithoutStandardInputObjectSchema).optional()
}).strict();
export const StandardCreateWithoutLessonsInputObjectSchema: z.ZodType<Prisma.StandardCreateWithoutLessonsInput> = makeSchema() as unknown as z.ZodType<Prisma.StandardCreateWithoutLessonsInput>;
export const StandardCreateWithoutLessonsInputObjectZodSchema = makeSchema();
