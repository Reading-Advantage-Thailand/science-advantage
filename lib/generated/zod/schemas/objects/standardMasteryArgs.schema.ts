import * as z from 'zod';
import type { Prisma } from '@prisma/client';
import { standardMasterySelectObjectSchema as standardMasterySelectObjectSchema } from './standardMasterySelect.schema';
import { standardMasteryIncludeObjectSchema as standardMasteryIncludeObjectSchema } from './standardMasteryInclude.schema'

const makeSchema = () => z.object({
  select: z.lazy(() => standardMasterySelectObjectSchema).optional(),
  include: z.lazy(() => standardMasteryIncludeObjectSchema).optional()
}).strict();
export const standardMasteryArgsObjectSchema = makeSchema();
export const standardMasteryArgsObjectZodSchema = makeSchema();
