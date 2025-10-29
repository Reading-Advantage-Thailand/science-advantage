import * as z from 'zod';
import type { Prisma } from '@prisma/client';
import { SortOrderSchema } from '../enums/SortOrder.schema';
import { userOrderByWithRelationInputObjectSchema as userOrderByWithRelationInputObjectSchema } from './userOrderByWithRelationInput.schema';
import { StandardOrderByWithRelationInputObjectSchema as StandardOrderByWithRelationInputObjectSchema } from './StandardOrderByWithRelationInput.schema'

const makeSchema = () => z.object({
  id: SortOrderSchema.optional(),
  studentId: SortOrderSchema.optional(),
  standardId: SortOrderSchema.optional(),
  masteryLevel: SortOrderSchema.optional(),
  evidenceCount: SortOrderSchema.optional(),
  lastAssessedAt: SortOrderSchema.optional(),
  createdAt: SortOrderSchema.optional(),
  updatedAt: SortOrderSchema.optional(),
  student: z.lazy(() => userOrderByWithRelationInputObjectSchema).optional(),
  standard: z.lazy(() => StandardOrderByWithRelationInputObjectSchema).optional()
}).strict();
export const standardMasteryOrderByWithRelationInputObjectSchema: z.ZodType<Prisma.standardMasteryOrderByWithRelationInput> = makeSchema() as unknown as z.ZodType<Prisma.standardMasteryOrderByWithRelationInput>;
export const standardMasteryOrderByWithRelationInputObjectZodSchema = makeSchema();
