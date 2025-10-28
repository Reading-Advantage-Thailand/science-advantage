import * as z from 'zod';
import type { Prisma } from '@prisma/client';
import { standardMasteryCreateManyStudentInputObjectSchema as standardMasteryCreateManyStudentInputObjectSchema } from './standardMasteryCreateManyStudentInput.schema'

const makeSchema = () => z.object({
  data: z.union([z.lazy(() => standardMasteryCreateManyStudentInputObjectSchema), z.lazy(() => standardMasteryCreateManyStudentInputObjectSchema).array()]),
  skipDuplicates: z.boolean().optional()
}).strict();
export const standardMasteryCreateManyStudentInputEnvelopeObjectSchema: z.ZodType<Prisma.standardMasteryCreateManyStudentInputEnvelope> = makeSchema() as unknown as z.ZodType<Prisma.standardMasteryCreateManyStudentInputEnvelope>;
export const standardMasteryCreateManyStudentInputEnvelopeObjectZodSchema = makeSchema();
