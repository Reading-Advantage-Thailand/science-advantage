import type { Prisma } from '@prisma/client';
import * as z from 'zod';
import { standardMasteryIncludeObjectSchema as standardMasteryIncludeObjectSchema } from './objects/standardMasteryInclude.schema';
import { standardMasteryOrderByWithRelationInputObjectSchema as standardMasteryOrderByWithRelationInputObjectSchema } from './objects/standardMasteryOrderByWithRelationInput.schema';
import { standardMasteryWhereInputObjectSchema as standardMasteryWhereInputObjectSchema } from './objects/standardMasteryWhereInput.schema';
import { standardMasteryWhereUniqueInputObjectSchema as standardMasteryWhereUniqueInputObjectSchema } from './objects/standardMasteryWhereUniqueInput.schema';
import { StandardMasteryScalarFieldEnumSchema } from './enums/StandardMasteryScalarFieldEnum.schema';

// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const standardMasteryFindManySelectSchema: z.ZodType<Prisma.standardMasterySelect> = z.object({
    id: z.boolean().optional(),
    studentId: z.boolean().optional(),
    standardId: z.boolean().optional(),
    masteryLevel: z.boolean().optional(),
    evidenceCount: z.boolean().optional(),
    lastAssessedAt: z.boolean().optional(),
    createdAt: z.boolean().optional(),
    updatedAt: z.boolean().optional(),
    student: z.boolean().optional(),
    standard: z.boolean().optional()
  }).strict() as unknown as z.ZodType<Prisma.standardMasterySelect>;

export const standardMasteryFindManySelectZodSchema = z.object({
    id: z.boolean().optional(),
    studentId: z.boolean().optional(),
    standardId: z.boolean().optional(),
    masteryLevel: z.boolean().optional(),
    evidenceCount: z.boolean().optional(),
    lastAssessedAt: z.boolean().optional(),
    createdAt: z.boolean().optional(),
    updatedAt: z.boolean().optional(),
    student: z.boolean().optional(),
    standard: z.boolean().optional()
  }).strict();

export const standardMasteryFindManySchema: z.ZodType<Prisma.standardMasteryFindManyArgs> = z.object({ select: standardMasteryFindManySelectSchema.optional(), include: standardMasteryIncludeObjectSchema.optional(), orderBy: z.union([standardMasteryOrderByWithRelationInputObjectSchema, standardMasteryOrderByWithRelationInputObjectSchema.array()]).optional(), where: standardMasteryWhereInputObjectSchema.optional(), cursor: standardMasteryWhereUniqueInputObjectSchema.optional(), take: z.number().optional(), skip: z.number().optional(), distinct: z.union([StandardMasteryScalarFieldEnumSchema, StandardMasteryScalarFieldEnumSchema.array()]).optional() }).strict() as unknown as z.ZodType<Prisma.standardMasteryFindManyArgs>;

export const standardMasteryFindManyZodSchema = z.object({ select: standardMasteryFindManySelectSchema.optional(), include: standardMasteryIncludeObjectSchema.optional(), orderBy: z.union([standardMasteryOrderByWithRelationInputObjectSchema, standardMasteryOrderByWithRelationInputObjectSchema.array()]).optional(), where: standardMasteryWhereInputObjectSchema.optional(), cursor: standardMasteryWhereUniqueInputObjectSchema.optional(), take: z.number().optional(), skip: z.number().optional(), distinct: z.union([StandardMasteryScalarFieldEnumSchema, StandardMasteryScalarFieldEnumSchema.array()]).optional() }).strict();