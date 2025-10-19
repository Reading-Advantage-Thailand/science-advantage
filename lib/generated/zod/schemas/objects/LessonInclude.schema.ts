import * as z from 'zod';
import type { Prisma } from '@prisma/client';
import { StandardFindManySchema as StandardFindManySchema } from '../findManyStandard.schema';
import { CurriculumUnitFindManySchema as CurriculumUnitFindManySchema } from '../findManyCurriculumUnit.schema';
import { LessonCountOutputTypeArgsObjectSchema as LessonCountOutputTypeArgsObjectSchema } from './LessonCountOutputTypeArgs.schema'

const makeSchema = () => z.object({
  standards: z.union([z.boolean(), z.lazy(() => StandardFindManySchema)]).optional(),
  curriculumUnits: z.union([z.boolean(), z.lazy(() => CurriculumUnitFindManySchema)]).optional(),
  _count: z.union([z.boolean(), z.lazy(() => LessonCountOutputTypeArgsObjectSchema)]).optional()
}).strict();
export const LessonIncludeObjectSchema: z.ZodType<Prisma.LessonInclude> = makeSchema() as unknown as z.ZodType<Prisma.LessonInclude>;
export const LessonIncludeObjectZodSchema = makeSchema();
