import type { Prisma } from '@prisma/client';
import * as z from 'zod';
import { standardMasteryWhereInputObjectSchema as standardMasteryWhereInputObjectSchema } from './objects/standardMasteryWhereInput.schema';

export const standardMasteryDeleteManySchema: z.ZodType<Prisma.standardMasteryDeleteManyArgs> = z.object({ where: standardMasteryWhereInputObjectSchema.optional() }).strict() as unknown as z.ZodType<Prisma.standardMasteryDeleteManyArgs>;

export const standardMasteryDeleteManyZodSchema = z.object({ where: standardMasteryWhereInputObjectSchema.optional() }).strict();