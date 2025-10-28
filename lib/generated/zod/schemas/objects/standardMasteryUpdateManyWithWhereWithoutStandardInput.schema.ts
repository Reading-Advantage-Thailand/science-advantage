import * as z from 'zod';
import type { Prisma } from '@prisma/client';
import { standardMasteryScalarWhereInputObjectSchema as standardMasteryScalarWhereInputObjectSchema } from './standardMasteryScalarWhereInput.schema';
import { standardMasteryUpdateManyMutationInputObjectSchema as standardMasteryUpdateManyMutationInputObjectSchema } from './standardMasteryUpdateManyMutationInput.schema';
import { standardMasteryUncheckedUpdateManyWithoutStandardInputObjectSchema as standardMasteryUncheckedUpdateManyWithoutStandardInputObjectSchema } from './standardMasteryUncheckedUpdateManyWithoutStandardInput.schema'

const makeSchema = () => z.object({
  where: z.lazy(() => standardMasteryScalarWhereInputObjectSchema),
  data: z.union([z.lazy(() => standardMasteryUpdateManyMutationInputObjectSchema), z.lazy(() => standardMasteryUncheckedUpdateManyWithoutStandardInputObjectSchema)])
}).strict();
export const standardMasteryUpdateManyWithWhereWithoutStandardInputObjectSchema: z.ZodType<Prisma.standardMasteryUpdateManyWithWhereWithoutStandardInput> = makeSchema() as unknown as z.ZodType<Prisma.standardMasteryUpdateManyWithWhereWithoutStandardInput>;
export const standardMasteryUpdateManyWithWhereWithoutStandardInputObjectZodSchema = makeSchema();
