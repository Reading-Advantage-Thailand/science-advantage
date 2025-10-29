import * as z from 'zod';
import type { Prisma } from '@prisma/client';
import { SortOrderSchema } from '../enums/SortOrder.schema';
import { standardMasteryCountOrderByAggregateInputObjectSchema as standardMasteryCountOrderByAggregateInputObjectSchema } from './standardMasteryCountOrderByAggregateInput.schema';
import { standardMasteryAvgOrderByAggregateInputObjectSchema as standardMasteryAvgOrderByAggregateInputObjectSchema } from './standardMasteryAvgOrderByAggregateInput.schema';
import { standardMasteryMaxOrderByAggregateInputObjectSchema as standardMasteryMaxOrderByAggregateInputObjectSchema } from './standardMasteryMaxOrderByAggregateInput.schema';
import { standardMasteryMinOrderByAggregateInputObjectSchema as standardMasteryMinOrderByAggregateInputObjectSchema } from './standardMasteryMinOrderByAggregateInput.schema';
import { standardMasterySumOrderByAggregateInputObjectSchema as standardMasterySumOrderByAggregateInputObjectSchema } from './standardMasterySumOrderByAggregateInput.schema'

const makeSchema = () => z.object({
  id: SortOrderSchema.optional(),
  studentId: SortOrderSchema.optional(),
  standardId: SortOrderSchema.optional(),
  masteryLevel: SortOrderSchema.optional(),
  evidenceCount: SortOrderSchema.optional(),
  lastAssessedAt: SortOrderSchema.optional(),
  createdAt: SortOrderSchema.optional(),
  updatedAt: SortOrderSchema.optional(),
  _count: z.lazy(() => standardMasteryCountOrderByAggregateInputObjectSchema).optional(),
  _avg: z.lazy(() => standardMasteryAvgOrderByAggregateInputObjectSchema).optional(),
  _max: z.lazy(() => standardMasteryMaxOrderByAggregateInputObjectSchema).optional(),
  _min: z.lazy(() => standardMasteryMinOrderByAggregateInputObjectSchema).optional(),
  _sum: z.lazy(() => standardMasterySumOrderByAggregateInputObjectSchema).optional()
}).strict();
export const standardMasteryOrderByWithAggregationInputObjectSchema: z.ZodType<Prisma.standardMasteryOrderByWithAggregationInput> = makeSchema() as unknown as z.ZodType<Prisma.standardMasteryOrderByWithAggregationInput>;
export const standardMasteryOrderByWithAggregationInputObjectZodSchema = makeSchema();
