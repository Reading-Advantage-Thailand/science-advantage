import * as z from 'zod';
import type { Prisma } from '@prisma/client';
import { standardMasteryCreateWithoutStandardInputObjectSchema as standardMasteryCreateWithoutStandardInputObjectSchema } from './standardMasteryCreateWithoutStandardInput.schema';
import { standardMasteryUncheckedCreateWithoutStandardInputObjectSchema as standardMasteryUncheckedCreateWithoutStandardInputObjectSchema } from './standardMasteryUncheckedCreateWithoutStandardInput.schema';
import { standardMasteryCreateOrConnectWithoutStandardInputObjectSchema as standardMasteryCreateOrConnectWithoutStandardInputObjectSchema } from './standardMasteryCreateOrConnectWithoutStandardInput.schema';
import { standardMasteryUpsertWithWhereUniqueWithoutStandardInputObjectSchema as standardMasteryUpsertWithWhereUniqueWithoutStandardInputObjectSchema } from './standardMasteryUpsertWithWhereUniqueWithoutStandardInput.schema';
import { standardMasteryCreateManyStandardInputEnvelopeObjectSchema as standardMasteryCreateManyStandardInputEnvelopeObjectSchema } from './standardMasteryCreateManyStandardInputEnvelope.schema';
import { standardMasteryWhereUniqueInputObjectSchema as standardMasteryWhereUniqueInputObjectSchema } from './standardMasteryWhereUniqueInput.schema';
import { standardMasteryUpdateWithWhereUniqueWithoutStandardInputObjectSchema as standardMasteryUpdateWithWhereUniqueWithoutStandardInputObjectSchema } from './standardMasteryUpdateWithWhereUniqueWithoutStandardInput.schema';
import { standardMasteryUpdateManyWithWhereWithoutStandardInputObjectSchema as standardMasteryUpdateManyWithWhereWithoutStandardInputObjectSchema } from './standardMasteryUpdateManyWithWhereWithoutStandardInput.schema';
import { standardMasteryScalarWhereInputObjectSchema as standardMasteryScalarWhereInputObjectSchema } from './standardMasteryScalarWhereInput.schema'

const makeSchema = () => z.object({
  create: z.union([z.lazy(() => standardMasteryCreateWithoutStandardInputObjectSchema), z.lazy(() => standardMasteryCreateWithoutStandardInputObjectSchema).array(), z.lazy(() => standardMasteryUncheckedCreateWithoutStandardInputObjectSchema), z.lazy(() => standardMasteryUncheckedCreateWithoutStandardInputObjectSchema).array()]).optional(),
  connectOrCreate: z.union([z.lazy(() => standardMasteryCreateOrConnectWithoutStandardInputObjectSchema), z.lazy(() => standardMasteryCreateOrConnectWithoutStandardInputObjectSchema).array()]).optional(),
  upsert: z.union([z.lazy(() => standardMasteryUpsertWithWhereUniqueWithoutStandardInputObjectSchema), z.lazy(() => standardMasteryUpsertWithWhereUniqueWithoutStandardInputObjectSchema).array()]).optional(),
  createMany: z.lazy(() => standardMasteryCreateManyStandardInputEnvelopeObjectSchema).optional(),
  set: z.union([z.lazy(() => standardMasteryWhereUniqueInputObjectSchema), z.lazy(() => standardMasteryWhereUniqueInputObjectSchema).array()]).optional(),
  disconnect: z.union([z.lazy(() => standardMasteryWhereUniqueInputObjectSchema), z.lazy(() => standardMasteryWhereUniqueInputObjectSchema).array()]).optional(),
  delete: z.union([z.lazy(() => standardMasteryWhereUniqueInputObjectSchema), z.lazy(() => standardMasteryWhereUniqueInputObjectSchema).array()]).optional(),
  connect: z.union([z.lazy(() => standardMasteryWhereUniqueInputObjectSchema), z.lazy(() => standardMasteryWhereUniqueInputObjectSchema).array()]).optional(),
  update: z.union([z.lazy(() => standardMasteryUpdateWithWhereUniqueWithoutStandardInputObjectSchema), z.lazy(() => standardMasteryUpdateWithWhereUniqueWithoutStandardInputObjectSchema).array()]).optional(),
  updateMany: z.union([z.lazy(() => standardMasteryUpdateManyWithWhereWithoutStandardInputObjectSchema), z.lazy(() => standardMasteryUpdateManyWithWhereWithoutStandardInputObjectSchema).array()]).optional(),
  deleteMany: z.union([z.lazy(() => standardMasteryScalarWhereInputObjectSchema), z.lazy(() => standardMasteryScalarWhereInputObjectSchema).array()]).optional()
}).strict();
export const standardMasteryUncheckedUpdateManyWithoutStandardNestedInputObjectSchema: z.ZodType<Prisma.standardMasteryUncheckedUpdateManyWithoutStandardNestedInput> = makeSchema() as unknown as z.ZodType<Prisma.standardMasteryUncheckedUpdateManyWithoutStandardNestedInput>;
export const standardMasteryUncheckedUpdateManyWithoutStandardNestedInputObjectZodSchema = makeSchema();
