import * as z from 'zod';
import type { Prisma } from '@prisma/client';
import { standardMasteryWhereUniqueInputObjectSchema as standardMasteryWhereUniqueInputObjectSchema } from './standardMasteryWhereUniqueInput.schema';
import { standardMasteryCreateWithoutStandardInputObjectSchema as standardMasteryCreateWithoutStandardInputObjectSchema } from './standardMasteryCreateWithoutStandardInput.schema';
import { standardMasteryUncheckedCreateWithoutStandardInputObjectSchema as standardMasteryUncheckedCreateWithoutStandardInputObjectSchema } from './standardMasteryUncheckedCreateWithoutStandardInput.schema'

const makeSchema = () => z.object({
  where: z.lazy(() => standardMasteryWhereUniqueInputObjectSchema),
  create: z.union([z.lazy(() => standardMasteryCreateWithoutStandardInputObjectSchema), z.lazy(() => standardMasteryUncheckedCreateWithoutStandardInputObjectSchema)])
}).strict();
export const standardMasteryCreateOrConnectWithoutStandardInputObjectSchema: z.ZodType<Prisma.standardMasteryCreateOrConnectWithoutStandardInput> = makeSchema() as unknown as z.ZodType<Prisma.standardMasteryCreateOrConnectWithoutStandardInput>;
export const standardMasteryCreateOrConnectWithoutStandardInputObjectZodSchema = makeSchema();
