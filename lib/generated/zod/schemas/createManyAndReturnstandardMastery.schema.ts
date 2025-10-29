import type { Prisma } from '@prisma/client';
import * as z from 'zod';
import { standardMasterySelectObjectSchema as standardMasterySelectObjectSchema } from './objects/standardMasterySelect.schema';
import { standardMasteryCreateManyInputObjectSchema as standardMasteryCreateManyInputObjectSchema } from './objects/standardMasteryCreateManyInput.schema';

export const standardMasteryCreateManyAndReturnSchema: z.ZodType<Prisma.standardMasteryCreateManyAndReturnArgs> = z.object({ select: standardMasterySelectObjectSchema.optional(), data: z.union([ standardMasteryCreateManyInputObjectSchema, z.array(standardMasteryCreateManyInputObjectSchema) ]), skipDuplicates: z.boolean().optional() }).strict() as unknown as z.ZodType<Prisma.standardMasteryCreateManyAndReturnArgs>;

export const standardMasteryCreateManyAndReturnZodSchema = z.object({ select: standardMasterySelectObjectSchema.optional(), data: z.union([ standardMasteryCreateManyInputObjectSchema, z.array(standardMasteryCreateManyInputObjectSchema) ]), skipDuplicates: z.boolean().optional() }).strict();