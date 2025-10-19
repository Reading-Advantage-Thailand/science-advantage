import * as z from 'zod';
import type { Prisma } from '@prisma/client';
import { SortOrderSchema } from '../enums/SortOrder.schema'

const makeSchema = () => z.object({
  id: SortOrderSchema.optional(),
  title: SortOrderSchema.optional(),
  description: SortOrderSchema.optional(),
  content: SortOrderSchema.optional(),
  gradeLevel: SortOrderSchema.optional(),
  order: SortOrderSchema.optional(),
  createdAt: SortOrderSchema.optional(),
  updatedAt: SortOrderSchema.optional()
}).strict();
export const LessonMaxOrderByAggregateInputObjectSchema: z.ZodType<Prisma.LessonMaxOrderByAggregateInput> = makeSchema() as unknown as z.ZodType<Prisma.LessonMaxOrderByAggregateInput>;
export const LessonMaxOrderByAggregateInputObjectZodSchema = makeSchema();
