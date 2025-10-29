import * as z from 'zod';
import type { Prisma } from '@prisma/client';
import { standardMasteryScalarWhereInputObjectSchema as standardMasteryScalarWhereInputObjectSchema } from './standardMasteryScalarWhereInput.schema';
import { standardMasteryUpdateManyMutationInputObjectSchema as standardMasteryUpdateManyMutationInputObjectSchema } from './standardMasteryUpdateManyMutationInput.schema';
import { standardMasteryUncheckedUpdateManyWithoutStudentInputObjectSchema as standardMasteryUncheckedUpdateManyWithoutStudentInputObjectSchema } from './standardMasteryUncheckedUpdateManyWithoutStudentInput.schema'

const makeSchema = () => z.object({
  where: z.lazy(() => standardMasteryScalarWhereInputObjectSchema),
  data: z.union([z.lazy(() => standardMasteryUpdateManyMutationInputObjectSchema), z.lazy(() => standardMasteryUncheckedUpdateManyWithoutStudentInputObjectSchema)])
}).strict();
export const standardMasteryUpdateManyWithWhereWithoutStudentInputObjectSchema: z.ZodType<Prisma.standardMasteryUpdateManyWithWhereWithoutStudentInput> = makeSchema() as unknown as z.ZodType<Prisma.standardMasteryUpdateManyWithWhereWithoutStudentInput>;
export const standardMasteryUpdateManyWithWhereWithoutStudentInputObjectZodSchema = makeSchema();
