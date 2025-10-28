import * as z from 'zod';
import type { Prisma } from '@prisma/client';
import { standardMasteryWhereUniqueInputObjectSchema as standardMasteryWhereUniqueInputObjectSchema } from './standardMasteryWhereUniqueInput.schema';
import { standardMasteryUpdateWithoutStudentInputObjectSchema as standardMasteryUpdateWithoutStudentInputObjectSchema } from './standardMasteryUpdateWithoutStudentInput.schema';
import { standardMasteryUncheckedUpdateWithoutStudentInputObjectSchema as standardMasteryUncheckedUpdateWithoutStudentInputObjectSchema } from './standardMasteryUncheckedUpdateWithoutStudentInput.schema';
import { standardMasteryCreateWithoutStudentInputObjectSchema as standardMasteryCreateWithoutStudentInputObjectSchema } from './standardMasteryCreateWithoutStudentInput.schema';
import { standardMasteryUncheckedCreateWithoutStudentInputObjectSchema as standardMasteryUncheckedCreateWithoutStudentInputObjectSchema } from './standardMasteryUncheckedCreateWithoutStudentInput.schema'

const makeSchema = () => z.object({
  where: z.lazy(() => standardMasteryWhereUniqueInputObjectSchema),
  update: z.union([z.lazy(() => standardMasteryUpdateWithoutStudentInputObjectSchema), z.lazy(() => standardMasteryUncheckedUpdateWithoutStudentInputObjectSchema)]),
  create: z.union([z.lazy(() => standardMasteryCreateWithoutStudentInputObjectSchema), z.lazy(() => standardMasteryUncheckedCreateWithoutStudentInputObjectSchema)])
}).strict();
export const standardMasteryUpsertWithWhereUniqueWithoutStudentInputObjectSchema: z.ZodType<Prisma.standardMasteryUpsertWithWhereUniqueWithoutStudentInput> = makeSchema() as unknown as z.ZodType<Prisma.standardMasteryUpsertWithWhereUniqueWithoutStudentInput>;
export const standardMasteryUpsertWithWhereUniqueWithoutStudentInputObjectZodSchema = makeSchema();
