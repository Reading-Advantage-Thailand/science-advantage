import * as z from 'zod';
import type { Prisma } from '@prisma/client';
import { standardMasteryWhereUniqueInputObjectSchema as standardMasteryWhereUniqueInputObjectSchema } from './standardMasteryWhereUniqueInput.schema';
import { standardMasteryCreateWithoutStudentInputObjectSchema as standardMasteryCreateWithoutStudentInputObjectSchema } from './standardMasteryCreateWithoutStudentInput.schema';
import { standardMasteryUncheckedCreateWithoutStudentInputObjectSchema as standardMasteryUncheckedCreateWithoutStudentInputObjectSchema } from './standardMasteryUncheckedCreateWithoutStudentInput.schema'

const makeSchema = () => z.object({
  where: z.lazy(() => standardMasteryWhereUniqueInputObjectSchema),
  create: z.union([z.lazy(() => standardMasteryCreateWithoutStudentInputObjectSchema), z.lazy(() => standardMasteryUncheckedCreateWithoutStudentInputObjectSchema)])
}).strict();
export const standardMasteryCreateOrConnectWithoutStudentInputObjectSchema: z.ZodType<Prisma.standardMasteryCreateOrConnectWithoutStudentInput> = makeSchema() as unknown as z.ZodType<Prisma.standardMasteryCreateOrConnectWithoutStudentInput>;
export const standardMasteryCreateOrConnectWithoutStudentInputObjectZodSchema = makeSchema();
