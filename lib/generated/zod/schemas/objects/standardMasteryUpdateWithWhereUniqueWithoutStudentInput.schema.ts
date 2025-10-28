import * as z from 'zod';
import type { Prisma } from '@prisma/client';
import { standardMasteryWhereUniqueInputObjectSchema as standardMasteryWhereUniqueInputObjectSchema } from './standardMasteryWhereUniqueInput.schema';
import { standardMasteryUpdateWithoutStudentInputObjectSchema as standardMasteryUpdateWithoutStudentInputObjectSchema } from './standardMasteryUpdateWithoutStudentInput.schema';
import { standardMasteryUncheckedUpdateWithoutStudentInputObjectSchema as standardMasteryUncheckedUpdateWithoutStudentInputObjectSchema } from './standardMasteryUncheckedUpdateWithoutStudentInput.schema'

const makeSchema = () => z.object({
  where: z.lazy(() => standardMasteryWhereUniqueInputObjectSchema),
  data: z.union([z.lazy(() => standardMasteryUpdateWithoutStudentInputObjectSchema), z.lazy(() => standardMasteryUncheckedUpdateWithoutStudentInputObjectSchema)])
}).strict();
export const standardMasteryUpdateWithWhereUniqueWithoutStudentInputObjectSchema: z.ZodType<Prisma.standardMasteryUpdateWithWhereUniqueWithoutStudentInput> = makeSchema() as unknown as z.ZodType<Prisma.standardMasteryUpdateWithWhereUniqueWithoutStudentInput>;
export const standardMasteryUpdateWithWhereUniqueWithoutStudentInputObjectZodSchema = makeSchema();
