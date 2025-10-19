import * as z from 'zod';
import type { Prisma } from '@prisma/client';
import { StringFieldUpdateOperationsInputObjectSchema as StringFieldUpdateOperationsInputObjectSchema } from './StringFieldUpdateOperationsInput.schema';
import { NullableStringFieldUpdateOperationsInputObjectSchema as NullableStringFieldUpdateOperationsInputObjectSchema } from './NullableStringFieldUpdateOperationsInput.schema';
import { IntFieldUpdateOperationsInputObjectSchema as IntFieldUpdateOperationsInputObjectSchema } from './IntFieldUpdateOperationsInput.schema';
import { DateTimeFieldUpdateOperationsInputObjectSchema as DateTimeFieldUpdateOperationsInputObjectSchema } from './DateTimeFieldUpdateOperationsInput.schema';
import { StandardUpdateManyWithoutLessonsNestedInputObjectSchema as StandardUpdateManyWithoutLessonsNestedInputObjectSchema } from './StandardUpdateManyWithoutLessonsNestedInput.schema';
import { CurriculumUnitUpdateManyWithoutLessonsNestedInputObjectSchema as CurriculumUnitUpdateManyWithoutLessonsNestedInputObjectSchema } from './CurriculumUnitUpdateManyWithoutLessonsNestedInput.schema'

const makeSchema = () => z.object({
  id: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  title: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputObjectSchema)]).optional(),
  description: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  content: z.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputObjectSchema)]).optional().nullable(),
  gradeLevel: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputObjectSchema)]).optional(),
  order: z.union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputObjectSchema)]).optional(),
  createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputObjectSchema)]).optional(),
  updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputObjectSchema)]).optional(),
  standards: z.lazy(() => StandardUpdateManyWithoutLessonsNestedInputObjectSchema).optional(),
  curriculumUnits: z.lazy(() => CurriculumUnitUpdateManyWithoutLessonsNestedInputObjectSchema).optional()
}).strict();
export const LessonUpdateInputObjectSchema: z.ZodType<Prisma.LessonUpdateInput> = makeSchema() as unknown as z.ZodType<Prisma.LessonUpdateInput>;
export const LessonUpdateInputObjectZodSchema = makeSchema();
