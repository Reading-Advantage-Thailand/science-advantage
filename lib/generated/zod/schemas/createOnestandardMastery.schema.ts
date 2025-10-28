import type { Prisma } from '@prisma/client';
import * as z from 'zod';
import { standardMasterySelectObjectSchema as standardMasterySelectObjectSchema } from './objects/standardMasterySelect.schema';
import { standardMasteryIncludeObjectSchema as standardMasteryIncludeObjectSchema } from './objects/standardMasteryInclude.schema';
import { standardMasteryCreateInputObjectSchema as standardMasteryCreateInputObjectSchema } from './objects/standardMasteryCreateInput.schema';
import { standardMasteryUncheckedCreateInputObjectSchema as standardMasteryUncheckedCreateInputObjectSchema } from './objects/standardMasteryUncheckedCreateInput.schema';

export const standardMasteryCreateOneSchema: z.ZodType<Prisma.standardMasteryCreateArgs> = z.object({ select: standardMasterySelectObjectSchema.optional(), include: standardMasteryIncludeObjectSchema.optional(), data: z.union([standardMasteryCreateInputObjectSchema, standardMasteryUncheckedCreateInputObjectSchema]) }).strict() as unknown as z.ZodType<Prisma.standardMasteryCreateArgs>;

export const standardMasteryCreateOneZodSchema = z.object({ select: standardMasterySelectObjectSchema.optional(), include: standardMasteryIncludeObjectSchema.optional(), data: z.union([standardMasteryCreateInputObjectSchema, standardMasteryUncheckedCreateInputObjectSchema]) }).strict();