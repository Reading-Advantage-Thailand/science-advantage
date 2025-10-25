import * as z from 'zod';
import type { Prisma } from '@prisma/client';
import { LessonTypeSchema } from '../enums/LessonType.schema';
import { StandardCreateNestedManyWithoutLessonsInputObjectSchema as StandardCreateNestedManyWithoutLessonsInputObjectSchema } from './StandardCreateNestedManyWithoutLessonsInput.schema';
import { QuizQuestionCreateNestedManyWithoutLessonInputObjectSchema as QuizQuestionCreateNestedManyWithoutLessonInputObjectSchema } from './QuizQuestionCreateNestedManyWithoutLessonInput.schema';
import { AttemptCreateNestedManyWithoutLessonInputObjectSchema as AttemptCreateNestedManyWithoutLessonInputObjectSchema } from './AttemptCreateNestedManyWithoutLessonInput.schema';
import { LessonCompletionCreateNestedManyWithoutLessonInputObjectSchema as LessonCompletionCreateNestedManyWithoutLessonInputObjectSchema } from './LessonCompletionCreateNestedManyWithoutLessonInput.schema'

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
  standards: z.lazy(() => StandardCreateNestedManyWithoutLessonsInputObjectSchema).optional(),
  quizQuestions: z.lazy(() => QuizQuestionCreateNestedManyWithoutLessonInputObjectSchema).optional(),
  attempts: z.lazy(() => AttemptCreateNestedManyWithoutLessonInputObjectSchema).optional(),
  lessonCompletions: z.lazy(() => LessonCompletionCreateNestedManyWithoutLessonInputObjectSchema).optional()
}).strict();
export const LessonCreateWithoutCurriculumUnitsInputObjectSchema: z.ZodType<Prisma.LessonCreateWithoutCurriculumUnitsInput> = makeSchema() as unknown as z.ZodType<Prisma.LessonCreateWithoutCurriculumUnitsInput>;
export const LessonCreateWithoutCurriculumUnitsInputObjectZodSchema = makeSchema();
