import * as z from 'zod';
import type { Prisma } from '@prisma/client';


const makeSchema = () => z.object({
  studentId: z.string(),
  standardId: z.string()
}).strict();
export const standardMasteryStudentIdStandardIdCompoundUniqueInputObjectSchema: z.ZodType<Prisma.standardMasteryStudentIdStandardIdCompoundUniqueInput> = makeSchema() as unknown as z.ZodType<Prisma.standardMasteryStudentIdStandardIdCompoundUniqueInput>;
export const standardMasteryStudentIdStandardIdCompoundUniqueInputObjectZodSchema = makeSchema();
