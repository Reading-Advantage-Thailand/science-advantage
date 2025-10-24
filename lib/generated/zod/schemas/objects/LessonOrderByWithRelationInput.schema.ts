import * as z from 'zod';
import type { Prisma } from '@prisma/client';
import { SortOrderSchema } from '../enums/SortOrder.schema';
import { SortOrderInputObjectSchema as SortOrderInputObjectSchema } from './SortOrderInput.schema';
import { StandardOrderByRelationAggregateInputObjectSchema as StandardOrderByRelationAggregateInputObjectSchema } from './StandardOrderByRelationAggregateInput.schema';
import { CurriculumUnitOrderByRelationAggregateInputObjectSchema as CurriculumUnitOrderByRelationAggregateInputObjectSchema } from './CurriculumUnitOrderByRelationAggregateInput.schema'

const makeSchema = () => z.object({
  id: SortOrderSchema.optional(),
  title: SortOrderSchema.optional(),
  description: z.union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)]).optional(),
  content: z.union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)]).optional(),
  lessonType: SortOrderSchema.optional(),
  gradeLevel: SortOrderSchema.optional(),
  order: SortOrderSchema.optional(),
  createdAt: SortOrderSchema.optional(),
  updatedAt: SortOrderSchema.optional(),
  standards: z.lazy(() => StandardOrderByRelationAggregateInputObjectSchema).optional(),
  curriculumUnits: z.lazy(() => CurriculumUnitOrderByRelationAggregateInputObjectSchema).optional()
}).strict();
export const LessonOrderByWithRelationInputObjectSchema: z.ZodType<Prisma.LessonOrderByWithRelationInput> = makeSchema() as unknown as z.ZodType<Prisma.LessonOrderByWithRelationInput>;
export const LessonOrderByWithRelationInputObjectZodSchema = makeSchema();
