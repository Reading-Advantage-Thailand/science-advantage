import type { Prisma } from '@prisma/client';
import * as z from 'zod';
import { standardMasteryOrderByWithRelationInputObjectSchema as standardMasteryOrderByWithRelationInputObjectSchema } from './objects/standardMasteryOrderByWithRelationInput.schema';
import { standardMasteryWhereInputObjectSchema as standardMasteryWhereInputObjectSchema } from './objects/standardMasteryWhereInput.schema';
import { standardMasteryWhereUniqueInputObjectSchema as standardMasteryWhereUniqueInputObjectSchema } from './objects/standardMasteryWhereUniqueInput.schema';
import { StandardMasteryCountAggregateInputObjectSchema as StandardMasteryCountAggregateInputObjectSchema } from './objects/StandardMasteryCountAggregateInput.schema';

export const standardMasteryCountSchema: z.ZodType<Prisma.standardMasteryCountArgs> = z.object({ orderBy: z.union([standardMasteryOrderByWithRelationInputObjectSchema, standardMasteryOrderByWithRelationInputObjectSchema.array()]).optional(), where: standardMasteryWhereInputObjectSchema.optional(), cursor: standardMasteryWhereUniqueInputObjectSchema.optional(), take: z.number().optional(), skip: z.number().optional(), select: z.union([ z.literal(true), StandardMasteryCountAggregateInputObjectSchema ]).optional() }).strict() as unknown as z.ZodType<Prisma.standardMasteryCountArgs>;

export const standardMasteryCountZodSchema = z.object({ orderBy: z.union([standardMasteryOrderByWithRelationInputObjectSchema, standardMasteryOrderByWithRelationInputObjectSchema.array()]).optional(), where: standardMasteryWhereInputObjectSchema.optional(), cursor: standardMasteryWhereUniqueInputObjectSchema.optional(), take: z.number().optional(), skip: z.number().optional(), select: z.union([ z.literal(true), StandardMasteryCountAggregateInputObjectSchema ]).optional() }).strict();