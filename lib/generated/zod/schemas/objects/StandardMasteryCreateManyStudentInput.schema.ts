import * as z from 'zod';
import { Prisma } from '@prisma/client';


import { DecimalJSLikeSchema, isValidDecimalInput } from '../../helpers/decimal-helpers';
const makeSchema = () => z.object({
  id: z.string().optional(),
  standardId: z.string(),
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
export const StandardMasteryCreateManyStudentInputObjectSchema: z.ZodType<Prisma.StandardMasteryCreateManyStudentInput> = makeSchema() as unknown as z.ZodType<Prisma.StandardMasteryCreateManyStudentInput>;
export const StandardMasteryCreateManyStudentInputObjectZodSchema = makeSchema();
