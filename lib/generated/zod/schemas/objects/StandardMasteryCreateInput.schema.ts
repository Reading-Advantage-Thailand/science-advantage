import * as z from 'zod';
import { Prisma } from '@prisma/client';
import { userCreateNestedOneWithoutMasteryRecordsInputObjectSchema as userCreateNestedOneWithoutMasteryRecordsInputObjectSchema } from './userCreateNestedOneWithoutMasteryRecordsInput.schema';
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
  student: z.lazy(() => userCreateNestedOneWithoutMasteryRecordsInputObjectSchema),
  standard: z.lazy(() => StandardCreateNestedOneWithoutMasteryRecordsInputObjectSchema)
}).strict();
export const StandardMasteryCreateInputObjectSchema: z.ZodType<Prisma.StandardMasteryCreateInput> = makeSchema() as unknown as z.ZodType<Prisma.StandardMasteryCreateInput>;
export const StandardMasteryCreateInputObjectZodSchema = makeSchema();
