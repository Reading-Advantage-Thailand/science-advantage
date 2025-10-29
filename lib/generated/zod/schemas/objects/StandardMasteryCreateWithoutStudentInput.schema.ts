import * as z from 'zod';
import { Prisma } from '@prisma/client';
import { StandardCreateNestedOneWithoutMasteryRecordsInputObjectSchema as StandardCreateNestedOneWithoutMasteryRecordsInputObjectSchema } from './StandardCreateNestedOneWithoutMasteryRecordsInput.schema'

import { DecimalJSLikeSchema, isValidDecimalInput } from '../../helpers/decimal-helpers';
const makeSchema = () => z.object({
  id: z.string().optional(),
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
  updatedAt: z.coerce.date().optional(),
  standard: z.lazy(() => StandardCreateNestedOneWithoutMasteryRecordsInputObjectSchema)
}).strict();
export const StandardMasteryCreateWithoutStudentInputObjectSchema: z.ZodType<Prisma.StandardMasteryCreateWithoutStudentInput> = makeSchema() as unknown as z.ZodType<Prisma.StandardMasteryCreateWithoutStudentInput>;
export const StandardMasteryCreateWithoutStudentInputObjectZodSchema = makeSchema();
