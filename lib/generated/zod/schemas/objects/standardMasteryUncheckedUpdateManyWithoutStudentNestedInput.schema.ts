import * as z from 'zod';
import type { Prisma } from '@prisma/client';
import { standardMasteryCreateWithoutStudentInputObjectSchema as standardMasteryCreateWithoutStudentInputObjectSchema } from './standardMasteryCreateWithoutStudentInput.schema';
import { standardMasteryUncheckedCreateWithoutStudentInputObjectSchema as standardMasteryUncheckedCreateWithoutStudentInputObjectSchema } from './standardMasteryUncheckedCreateWithoutStudentInput.schema';
import { standardMasteryCreateOrConnectWithoutStudentInputObjectSchema as standardMasteryCreateOrConnectWithoutStudentInputObjectSchema } from './standardMasteryCreateOrConnectWithoutStudentInput.schema';
import { standardMasteryUpsertWithWhereUniqueWithoutStudentInputObjectSchema as standardMasteryUpsertWithWhereUniqueWithoutStudentInputObjectSchema } from './standardMasteryUpsertWithWhereUniqueWithoutStudentInput.schema';
import { standardMasteryCreateManyStudentInputEnvelopeObjectSchema as standardMasteryCreateManyStudentInputEnvelopeObjectSchema } from './standardMasteryCreateManyStudentInputEnvelope.schema';
import { standardMasteryWhereUniqueInputObjectSchema as standardMasteryWhereUniqueInputObjectSchema } from './standardMasteryWhereUniqueInput.schema';
import { standardMasteryUpdateWithWhereUniqueWithoutStudentInputObjectSchema as standardMasteryUpdateWithWhereUniqueWithoutStudentInputObjectSchema } from './standardMasteryUpdateWithWhereUniqueWithoutStudentInput.schema';
import { standardMasteryUpdateManyWithWhereWithoutStudentInputObjectSchema as standardMasteryUpdateManyWithWhereWithoutStudentInputObjectSchema } from './standardMasteryUpdateManyWithWhereWithoutStudentInput.schema';
import { standardMasteryScalarWhereInputObjectSchema as standardMasteryScalarWhereInputObjectSchema } from './standardMasteryScalarWhereInput.schema'

const makeSchema = () => z.object({
  create: z.union([z.lazy(() => standardMasteryCreateWithoutStudentInputObjectSchema), z.lazy(() => standardMasteryCreateWithoutStudentInputObjectSchema).array(), z.lazy(() => standardMasteryUncheckedCreateWithoutStudentInputObjectSchema), z.lazy(() => standardMasteryUncheckedCreateWithoutStudentInputObjectSchema).array()]).optional(),
  connectOrCreate: z.union([z.lazy(() => standardMasteryCreateOrConnectWithoutStudentInputObjectSchema), z.lazy(() => standardMasteryCreateOrConnectWithoutStudentInputObjectSchema).array()]).optional(),
  upsert: z.union([z.lazy(() => standardMasteryUpsertWithWhereUniqueWithoutStudentInputObjectSchema), z.lazy(() => standardMasteryUpsertWithWhereUniqueWithoutStudentInputObjectSchema).array()]).optional(),
  createMany: z.lazy(() => standardMasteryCreateManyStudentInputEnvelopeObjectSchema).optional(),
  set: z.union([z.lazy(() => standardMasteryWhereUniqueInputObjectSchema), z.lazy(() => standardMasteryWhereUniqueInputObjectSchema).array()]).optional(),
  disconnect: z.union([z.lazy(() => standardMasteryWhereUniqueInputObjectSchema), z.lazy(() => standardMasteryWhereUniqueInputObjectSchema).array()]).optional(),
  delete: z.union([z.lazy(() => standardMasteryWhereUniqueInputObjectSchema), z.lazy(() => standardMasteryWhereUniqueInputObjectSchema).array()]).optional(),
  connect: z.union([z.lazy(() => standardMasteryWhereUniqueInputObjectSchema), z.lazy(() => standardMasteryWhereUniqueInputObjectSchema).array()]).optional(),
  update: z.union([z.lazy(() => standardMasteryUpdateWithWhereUniqueWithoutStudentInputObjectSchema), z.lazy(() => standardMasteryUpdateWithWhereUniqueWithoutStudentInputObjectSchema).array()]).optional(),
  updateMany: z.union([z.lazy(() => standardMasteryUpdateManyWithWhereWithoutStudentInputObjectSchema), z.lazy(() => standardMasteryUpdateManyWithWhereWithoutStudentInputObjectSchema).array()]).optional(),
  deleteMany: z.union([z.lazy(() => standardMasteryScalarWhereInputObjectSchema), z.lazy(() => standardMasteryScalarWhereInputObjectSchema).array()]).optional()
}).strict();
export const standardMasteryUncheckedUpdateManyWithoutStudentNestedInputObjectSchema: z.ZodType<Prisma.standardMasteryUncheckedUpdateManyWithoutStudentNestedInput> = makeSchema() as unknown as z.ZodType<Prisma.standardMasteryUncheckedUpdateManyWithoutStudentNestedInput>;
export const standardMasteryUncheckedUpdateManyWithoutStudentNestedInputObjectZodSchema = makeSchema();
