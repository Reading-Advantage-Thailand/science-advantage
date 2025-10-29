import * as z from 'zod';
import type { Prisma } from '@prisma/client';
import { standardMasteryWhereUniqueInputObjectSchema as standardMasteryWhereUniqueInputObjectSchema } from './standardMasteryWhereUniqueInput.schema';
import { standardMasteryUpdateWithoutStandardInputObjectSchema as standardMasteryUpdateWithoutStandardInputObjectSchema } from './standardMasteryUpdateWithoutStandardInput.schema';
import { standardMasteryUncheckedUpdateWithoutStandardInputObjectSchema as standardMasteryUncheckedUpdateWithoutStandardInputObjectSchema } from './standardMasteryUncheckedUpdateWithoutStandardInput.schema';
import { standardMasteryCreateWithoutStandardInputObjectSchema as standardMasteryCreateWithoutStandardInputObjectSchema } from './standardMasteryCreateWithoutStandardInput.schema';
import { standardMasteryUncheckedCreateWithoutStandardInputObjectSchema as standardMasteryUncheckedCreateWithoutStandardInputObjectSchema } from './standardMasteryUncheckedCreateWithoutStandardInput.schema'

const makeSchema = () => z.object({
  where: z.lazy(() => standardMasteryWhereUniqueInputObjectSchema),
  update: z.union([z.lazy(() => standardMasteryUpdateWithoutStandardInputObjectSchema), z.lazy(() => standardMasteryUncheckedUpdateWithoutStandardInputObjectSchema)]),
  create: z.union([z.lazy(() => standardMasteryCreateWithoutStandardInputObjectSchema), z.lazy(() => standardMasteryUncheckedCreateWithoutStandardInputObjectSchema)])
}).strict();
export const standardMasteryUpsertWithWhereUniqueWithoutStandardInputObjectSchema: z.ZodType<Prisma.standardMasteryUpsertWithWhereUniqueWithoutStandardInput> = makeSchema() as unknown as z.ZodType<Prisma.standardMasteryUpsertWithWhereUniqueWithoutStandardInput>;
export const standardMasteryUpsertWithWhereUniqueWithoutStandardInputObjectZodSchema = makeSchema();
