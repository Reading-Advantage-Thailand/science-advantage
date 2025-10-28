import type { Prisma } from '@prisma/client';
import * as z from 'zod';
import { standardMasteryCreateManyInputObjectSchema as standardMasteryCreateManyInputObjectSchema } from './objects/standardMasteryCreateManyInput.schema';

export const standardMasteryCreateManySchema: z.ZodType<Prisma.standardMasteryCreateManyArgs> = z.object({ data: z.union([ standardMasteryCreateManyInputObjectSchema, z.array(standardMasteryCreateManyInputObjectSchema) ]), skipDuplicates: z.boolean().optional() }).strict() as unknown as z.ZodType<Prisma.standardMasteryCreateManyArgs>;

export const standardMasteryCreateManyZodSchema = z.object({ data: z.union([ standardMasteryCreateManyInputObjectSchema, z.array(standardMasteryCreateManyInputObjectSchema) ]), skipDuplicates: z.boolean().optional() }).strict();