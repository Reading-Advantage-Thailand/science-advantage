import * as z from 'zod';
import type { Prisma } from '@prisma/client';
import { standardMasteryWhereInputObjectSchema as standardMasteryWhereInputObjectSchema } from './standardMasteryWhereInput.schema'

const makeSchema = () => z.object({
  every: z.lazy(() => standardMasteryWhereInputObjectSchema).optional(),
  some: z.lazy(() => standardMasteryWhereInputObjectSchema).optional(),
  none: z.lazy(() => standardMasteryWhereInputObjectSchema).optional()
}).strict();
export const StandardMasteryListRelationFilterObjectSchema: z.ZodType<Prisma.StandardMasteryListRelationFilter> = makeSchema() as unknown as z.ZodType<Prisma.StandardMasteryListRelationFilter>;
export const StandardMasteryListRelationFilterObjectZodSchema = makeSchema();
