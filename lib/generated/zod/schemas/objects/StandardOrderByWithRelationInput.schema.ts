import * as z from 'zod';
import type { Prisma } from '@prisma/client';
import { SortOrderSchema } from '../enums/SortOrder.schema';
import { SortOrderInputObjectSchema as SortOrderInputObjectSchema } from './SortOrderInput.schema';
import { LessonOrderByRelationAggregateInputObjectSchema as LessonOrderByRelationAggregateInputObjectSchema } from './LessonOrderByRelationAggregateInput.schema'

const makeSchema = () => z.object({
  id: SortOrderSchema.optional(),
  framework: SortOrderSchema.optional(),
  code: SortOrderSchema.optional(),
  description: SortOrderSchema.optional(),
  gradeLevel: z.union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)]).optional(),
  lessons: z.lazy(() => LessonOrderByRelationAggregateInputObjectSchema).optional()
}).strict();
export const StandardOrderByWithRelationInputObjectSchema: z.ZodType<Prisma.StandardOrderByWithRelationInput> = makeSchema() as unknown as z.ZodType<Prisma.StandardOrderByWithRelationInput>;
export const StandardOrderByWithRelationInputObjectZodSchema = makeSchema();
