import * as z from 'zod';
import type { Prisma } from '@prisma/client';
import { SortOrderSchema } from '../enums/SortOrder.schema'

const makeSchema = () => z.object({
  id: SortOrderSchema.optional(),
  name: z.string().min(3).max(100).trim().optional(),
  gradeLevel: z.number().int().int().min(3).max(6).optional(),
  standardsAlignment: SortOrderSchema.optional(),
  joinCode: SortOrderSchema.optional(),
  teacherId: SortOrderSchema.optional(),
  createdAt: SortOrderSchema.optional(),
  updatedAt: SortOrderSchema.optional()
}).strict();
export const ClassMinOrderByAggregateInputObjectSchema: z.ZodType<Prisma.ClassMinOrderByAggregateInput> = makeSchema() as unknown as z.ZodType<Prisma.ClassMinOrderByAggregateInput>;
export const ClassMinOrderByAggregateInputObjectZodSchema = makeSchema();
