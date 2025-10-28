import type { Prisma } from '@prisma/client';
import * as z from 'zod';
import { standardMasterySelectObjectSchema as standardMasterySelectObjectSchema } from './objects/standardMasterySelect.schema';
import { standardMasteryIncludeObjectSchema as standardMasteryIncludeObjectSchema } from './objects/standardMasteryInclude.schema';
import { standardMasteryUpdateInputObjectSchema as standardMasteryUpdateInputObjectSchema } from './objects/standardMasteryUpdateInput.schema';
import { standardMasteryUncheckedUpdateInputObjectSchema as standardMasteryUncheckedUpdateInputObjectSchema } from './objects/standardMasteryUncheckedUpdateInput.schema';
import { standardMasteryWhereUniqueInputObjectSchema as standardMasteryWhereUniqueInputObjectSchema } from './objects/standardMasteryWhereUniqueInput.schema';

export const standardMasteryUpdateOneSchema: z.ZodType<Prisma.standardMasteryUpdateArgs> = z.object({ select: standardMasterySelectObjectSchema.optional(), include: standardMasteryIncludeObjectSchema.optional(), data: z.union([standardMasteryUpdateInputObjectSchema, standardMasteryUncheckedUpdateInputObjectSchema]), where: standardMasteryWhereUniqueInputObjectSchema }).strict() as unknown as z.ZodType<Prisma.standardMasteryUpdateArgs>;

export const standardMasteryUpdateOneZodSchema = z.object({ select: standardMasterySelectObjectSchema.optional(), include: standardMasteryIncludeObjectSchema.optional(), data: z.union([standardMasteryUpdateInputObjectSchema, standardMasteryUncheckedUpdateInputObjectSchema]), where: standardMasteryWhereUniqueInputObjectSchema }).strict();