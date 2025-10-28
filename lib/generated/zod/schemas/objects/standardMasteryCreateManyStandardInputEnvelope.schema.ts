import * as z from 'zod';
import type { Prisma } from '@prisma/client';
import { standardMasteryCreateManyStandardInputObjectSchema as standardMasteryCreateManyStandardInputObjectSchema } from './standardMasteryCreateManyStandardInput.schema'

const makeSchema = () => z.object({
  data: z.union([z.lazy(() => standardMasteryCreateManyStandardInputObjectSchema), z.lazy(() => standardMasteryCreateManyStandardInputObjectSchema).array()]),
  skipDuplicates: z.boolean().optional()
}).strict();
export const standardMasteryCreateManyStandardInputEnvelopeObjectSchema: z.ZodType<Prisma.standardMasteryCreateManyStandardInputEnvelope> = makeSchema() as unknown as z.ZodType<Prisma.standardMasteryCreateManyStandardInputEnvelope>;
export const standardMasteryCreateManyStandardInputEnvelopeObjectZodSchema = makeSchema();
