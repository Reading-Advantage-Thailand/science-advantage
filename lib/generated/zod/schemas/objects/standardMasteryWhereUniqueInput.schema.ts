import * as z from 'zod';
import type { Prisma } from '@prisma/client';
import { standardMasteryStudentIdStandardIdCompoundUniqueInputObjectSchema as standardMasteryStudentIdStandardIdCompoundUniqueInputObjectSchema } from './standardMasteryStudentIdStandardIdCompoundUniqueInput.schema'

const makeSchema = () => z.object({
  id: z.string().optional(),
  studentId_standardId: z.lazy(() => standardMasteryStudentIdStandardIdCompoundUniqueInputObjectSchema).optional()
}).strict();
export const standardMasteryWhereUniqueInputObjectSchema: z.ZodType<Prisma.standardMasteryWhereUniqueInput> = makeSchema() as unknown as z.ZodType<Prisma.standardMasteryWhereUniqueInput>;
export const standardMasteryWhereUniqueInputObjectZodSchema = makeSchema();
