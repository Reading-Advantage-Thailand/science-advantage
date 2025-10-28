import type { Prisma } from '@prisma/client';
import * as z from 'zod';
import { standardMasterySelectObjectSchema as standardMasterySelectObjectSchema } from './objects/standardMasterySelect.schema';
import { standardMasteryUpdateManyMutationInputObjectSchema as standardMasteryUpdateManyMutationInputObjectSchema } from './objects/standardMasteryUpdateManyMutationInput.schema';
import { standardMasteryWhereInputObjectSchema as standardMasteryWhereInputObjectSchema } from './objects/standardMasteryWhereInput.schema';

export const standardMasteryUpdateManyAndReturnSchema: z.ZodType<Prisma.standardMasteryUpdateManyAndReturnArgs> = z.object({ select: standardMasterySelectObjectSchema.optional(), data: standardMasteryUpdateManyMutationInputObjectSchema, where: standardMasteryWhereInputObjectSchema.optional() }).strict() as unknown as z.ZodType<Prisma.standardMasteryUpdateManyAndReturnArgs>;

export const standardMasteryUpdateManyAndReturnZodSchema = z.object({ select: standardMasterySelectObjectSchema.optional(), data: standardMasteryUpdateManyMutationInputObjectSchema, where: standardMasteryWhereInputObjectSchema.optional() }).strict();