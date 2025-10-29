import * as z from 'zod';
import type { Prisma } from '@prisma/client';
import { SortOrderSchema } from '../enums/SortOrder.schema'

const makeSchema = () => z.object({
  masteryLevel: SortOrderSchema.optional(),
  evidenceCount: SortOrderSchema.optional()
}).strict();
export const standardMasterySumOrderByAggregateInputObjectSchema: z.ZodType<Prisma.standardMasterySumOrderByAggregateInput> = makeSchema() as unknown as z.ZodType<Prisma.standardMasterySumOrderByAggregateInput>;
export const standardMasterySumOrderByAggregateInputObjectZodSchema = makeSchema();
