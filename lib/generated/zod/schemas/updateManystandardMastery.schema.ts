import type { Prisma } from '@prisma/client';
import * as z from 'zod';
import { standardMasteryUpdateManyMutationInputObjectSchema as standardMasteryUpdateManyMutationInputObjectSchema } from './objects/standardMasteryUpdateManyMutationInput.schema';
import { standardMasteryWhereInputObjectSchema as standardMasteryWhereInputObjectSchema } from './objects/standardMasteryWhereInput.schema';

export const standardMasteryUpdateManySchema: z.ZodType<Prisma.standardMasteryUpdateManyArgs> = z.object({ data: standardMasteryUpdateManyMutationInputObjectSchema, where: standardMasteryWhereInputObjectSchema.optional() }).strict() as unknown as z.ZodType<Prisma.standardMasteryUpdateManyArgs>;

export const standardMasteryUpdateManyZodSchema = z.object({ data: standardMasteryUpdateManyMutationInputObjectSchema, where: standardMasteryWhereInputObjectSchema.optional() }).strict();