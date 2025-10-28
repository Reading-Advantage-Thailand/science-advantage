import * as z from 'zod';
import type { Prisma } from '@prisma/client';
import { standardMasteryCreateWithoutStandardInputObjectSchema as standardMasteryCreateWithoutStandardInputObjectSchema } from './standardMasteryCreateWithoutStandardInput.schema';
import { standardMasteryUncheckedCreateWithoutStandardInputObjectSchema as standardMasteryUncheckedCreateWithoutStandardInputObjectSchema } from './standardMasteryUncheckedCreateWithoutStandardInput.schema';
import { standardMasteryCreateOrConnectWithoutStandardInputObjectSchema as standardMasteryCreateOrConnectWithoutStandardInputObjectSchema } from './standardMasteryCreateOrConnectWithoutStandardInput.schema';
import { standardMasteryCreateManyStandardInputEnvelopeObjectSchema as standardMasteryCreateManyStandardInputEnvelopeObjectSchema } from './standardMasteryCreateManyStandardInputEnvelope.schema';
import { standardMasteryWhereUniqueInputObjectSchema as standardMasteryWhereUniqueInputObjectSchema } from './standardMasteryWhereUniqueInput.schema'

const makeSchema = () => z.object({
  create: z.union([z.lazy(() => standardMasteryCreateWithoutStandardInputObjectSchema), z.lazy(() => standardMasteryCreateWithoutStandardInputObjectSchema).array(), z.lazy(() => standardMasteryUncheckedCreateWithoutStandardInputObjectSchema), z.lazy(() => standardMasteryUncheckedCreateWithoutStandardInputObjectSchema).array()]).optional(),
  connectOrCreate: z.union([z.lazy(() => standardMasteryCreateOrConnectWithoutStandardInputObjectSchema), z.lazy(() => standardMasteryCreateOrConnectWithoutStandardInputObjectSchema).array()]).optional(),
  createMany: z.lazy(() => standardMasteryCreateManyStandardInputEnvelopeObjectSchema).optional(),
  connect: z.union([z.lazy(() => standardMasteryWhereUniqueInputObjectSchema), z.lazy(() => standardMasteryWhereUniqueInputObjectSchema).array()]).optional()
}).strict();
export const standardMasteryCreateNestedManyWithoutStandardInputObjectSchema: z.ZodType<Prisma.standardMasteryCreateNestedManyWithoutStandardInput> = makeSchema() as unknown as z.ZodType<Prisma.standardMasteryCreateNestedManyWithoutStandardInput>;
export const standardMasteryCreateNestedManyWithoutStandardInputObjectZodSchema = makeSchema();
