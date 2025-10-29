import * as z from 'zod';
import { Prisma } from '@prisma/client';
import { userCreateNestedOneWithoutMasteryRecordsInputObjectSchema as userCreateNestedOneWithoutMasteryRecordsInputObjectSchema } from './userCreateNestedOneWithoutMasteryRecordsInput.schema'

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
  student: z.lazy(() => userCreateNestedOneWithoutMasteryRecordsInputObjectSchema)
}).strict();
export const StandardMasteryCreateWithoutStandardInputObjectSchema: z.ZodType<Prisma.StandardMasteryCreateWithoutStandardInput> = makeSchema() as unknown as z.ZodType<Prisma.StandardMasteryCreateWithoutStandardInput>;
export const StandardMasteryCreateWithoutStandardInputObjectZodSchema = makeSchema();
