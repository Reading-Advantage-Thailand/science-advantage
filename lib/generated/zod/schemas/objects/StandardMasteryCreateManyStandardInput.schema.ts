import * as z from 'zod';
import { Prisma } from '@prisma/client';


import { DecimalJSLikeSchema, isValidDecimalInput } from '../../helpers/decimal-helpers';
const makeSchema = () => z.object({
  id: z.string().optional(),
  studentId: z.string(),
  masteryLevel: z.union([
  z.number(),
  z.string(),
  z.instanceof(Prisma.Decimal),
  DecimalJSLikeSchema,
]).refine((v) => isValidDecimalInput(v), {
  message: 'Field 'masteryLevel' must be a Decimal',
}),
  evidenceCount: z.number().int().optional(),
  lastAssessedAt: z.coerce.date(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();
export const StandardMasteryCreateManyStandardInputObjectSchema: z.ZodType<Prisma.StandardMasteryCreateManyStandardInput> = makeSchema() as unknown as z.ZodType<Prisma.StandardMasteryCreateManyStandardInput>;
export const StandardMasteryCreateManyStandardInputObjectZodSchema = makeSchema();
