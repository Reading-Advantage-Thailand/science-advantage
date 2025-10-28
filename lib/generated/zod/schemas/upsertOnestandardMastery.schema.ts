import type { Prisma } from '@prisma/client';
import * as z from 'zod';
import { standardMasterySelectObjectSchema as standardMasterySelectObjectSchema } from './objects/standardMasterySelect.schema';
import { standardMasteryIncludeObjectSchema as standardMasteryIncludeObjectSchema } from './objects/standardMasteryInclude.schema';
import { standardMasteryWhereUniqueInputObjectSchema as standardMasteryWhereUniqueInputObjectSchema } from './objects/standardMasteryWhereUniqueInput.schema';
import { standardMasteryCreateInputObjectSchema as standardMasteryCreateInputObjectSchema } from './objects/standardMasteryCreateInput.schema';
import { standardMasteryUncheckedCreateInputObjectSchema as standardMasteryUncheckedCreateInputObjectSchema } from './objects/standardMasteryUncheckedCreateInput.schema';
import { standardMasteryUpdateInputObjectSchema as standardMasteryUpdateInputObjectSchema } from './objects/standardMasteryUpdateInput.schema';
import { standardMasteryUncheckedUpdateInputObjectSchema as standardMasteryUncheckedUpdateInputObjectSchema } from './objects/standardMasteryUncheckedUpdateInput.schema';

export const standardMasteryUpsertOneSchema: z.ZodType<Prisma.standardMasteryUpsertArgs> = z.object({ select: standardMasterySelectObjectSchema.optional(), include: standardMasteryIncludeObjectSchema.optional(), where: standardMasteryWhereUniqueInputObjectSchema, create: z.union([ standardMasteryCreateInputObjectSchema, standardMasteryUncheckedCreateInputObjectSchema ]), update: z.union([ standardMasteryUpdateInputObjectSchema, standardMasteryUncheckedUpdateInputObjectSchema ]) }).strict() as unknown as z.ZodType<Prisma.standardMasteryUpsertArgs>;

export const standardMasteryUpsertOneZodSchema = z.object({ select: standardMasterySelectObjectSchema.optional(), include: standardMasteryIncludeObjectSchema.optional(), where: standardMasteryWhereUniqueInputObjectSchema, create: z.union([ standardMasteryCreateInputObjectSchema, standardMasteryUncheckedCreateInputObjectSchema ]), update: z.union([ standardMasteryUpdateInputObjectSchema, standardMasteryUncheckedUpdateInputObjectSchema ]) }).strict();