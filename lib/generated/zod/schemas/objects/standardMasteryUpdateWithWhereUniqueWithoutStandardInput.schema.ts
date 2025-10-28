import * as z from 'zod';
import type { Prisma } from '@prisma/client';
import { standardMasteryWhereUniqueInputObjectSchema as standardMasteryWhereUniqueInputObjectSchema } from './standardMasteryWhereUniqueInput.schema';
import { standardMasteryUpdateWithoutStandardInputObjectSchema as standardMasteryUpdateWithoutStandardInputObjectSchema } from './standardMasteryUpdateWithoutStandardInput.schema';
import { standardMasteryUncheckedUpdateWithoutStandardInputObjectSchema as standardMasteryUncheckedUpdateWithoutStandardInputObjectSchema } from './standardMasteryUncheckedUpdateWithoutStandardInput.schema'

const makeSchema = () => z.object({
  where: z.lazy(() => standardMasteryWhereUniqueInputObjectSchema),
  data: z.union([z.lazy(() => standardMasteryUpdateWithoutStandardInputObjectSchema), z.lazy(() => standardMasteryUncheckedUpdateWithoutStandardInputObjectSchema)])
}).strict();
export const standardMasteryUpdateWithWhereUniqueWithoutStandardInputObjectSchema: z.ZodType<Prisma.standardMasteryUpdateWithWhereUniqueWithoutStandardInput> = makeSchema() as unknown as z.ZodType<Prisma.standardMasteryUpdateWithWhereUniqueWithoutStandardInput>;
export const standardMasteryUpdateWithWhereUniqueWithoutStandardInputObjectZodSchema = makeSchema();
