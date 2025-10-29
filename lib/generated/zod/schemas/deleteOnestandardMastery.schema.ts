import type { Prisma } from '@prisma/client';
import * as z from 'zod';
import { standardMasterySelectObjectSchema as standardMasterySelectObjectSchema } from './objects/standardMasterySelect.schema';
import { standardMasteryIncludeObjectSchema as standardMasteryIncludeObjectSchema } from './objects/standardMasteryInclude.schema';
import { standardMasteryWhereUniqueInputObjectSchema as standardMasteryWhereUniqueInputObjectSchema } from './objects/standardMasteryWhereUniqueInput.schema';

export const standardMasteryDeleteOneSchema: z.ZodType<Prisma.standardMasteryDeleteArgs> = z.object({ select: standardMasterySelectObjectSchema.optional(), include: standardMasteryIncludeObjectSchema.optional(), where: standardMasteryWhereUniqueInputObjectSchema }).strict() as unknown as z.ZodType<Prisma.standardMasteryDeleteArgs>;

export const standardMasteryDeleteOneZodSchema = z.object({ select: standardMasterySelectObjectSchema.optional(), include: standardMasteryIncludeObjectSchema.optional(), where: standardMasteryWhereUniqueInputObjectSchema }).strict();