import * as z from 'zod';
import type { Prisma } from '@prisma/client';
import { standardMasteryCreateWithoutStudentInputObjectSchema as standardMasteryCreateWithoutStudentInputObjectSchema } from './standardMasteryCreateWithoutStudentInput.schema';
import { standardMasteryUncheckedCreateWithoutStudentInputObjectSchema as standardMasteryUncheckedCreateWithoutStudentInputObjectSchema } from './standardMasteryUncheckedCreateWithoutStudentInput.schema';
import { standardMasteryCreateOrConnectWithoutStudentInputObjectSchema as standardMasteryCreateOrConnectWithoutStudentInputObjectSchema } from './standardMasteryCreateOrConnectWithoutStudentInput.schema';
import { standardMasteryCreateManyStudentInputEnvelopeObjectSchema as standardMasteryCreateManyStudentInputEnvelopeObjectSchema } from './standardMasteryCreateManyStudentInputEnvelope.schema';
import { standardMasteryWhereUniqueInputObjectSchema as standardMasteryWhereUniqueInputObjectSchema } from './standardMasteryWhereUniqueInput.schema'

const makeSchema = () => z.object({
  create: z.union([z.lazy(() => standardMasteryCreateWithoutStudentInputObjectSchema), z.lazy(() => standardMasteryCreateWithoutStudentInputObjectSchema).array(), z.lazy(() => standardMasteryUncheckedCreateWithoutStudentInputObjectSchema), z.lazy(() => standardMasteryUncheckedCreateWithoutStudentInputObjectSchema).array()]).optional(),
  connectOrCreate: z.union([z.lazy(() => standardMasteryCreateOrConnectWithoutStudentInputObjectSchema), z.lazy(() => standardMasteryCreateOrConnectWithoutStudentInputObjectSchema).array()]).optional(),
  createMany: z.lazy(() => standardMasteryCreateManyStudentInputEnvelopeObjectSchema).optional(),
  connect: z.union([z.lazy(() => standardMasteryWhereUniqueInputObjectSchema), z.lazy(() => standardMasteryWhereUniqueInputObjectSchema).array()]).optional()
}).strict();
export const standardMasteryUncheckedCreateNestedManyWithoutStudentInputObjectSchema: z.ZodType<Prisma.standardMasteryUncheckedCreateNestedManyWithoutStudentInput> = makeSchema() as unknown as z.ZodType<Prisma.standardMasteryUncheckedCreateNestedManyWithoutStudentInput>;
export const standardMasteryUncheckedCreateNestedManyWithoutStudentInputObjectZodSchema = makeSchema();
