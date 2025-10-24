import * as z from 'zod';
import type { Prisma } from '@prisma/client';
import { StandardFindManySchema as StandardFindManySchema } from '../findManyStandard.schema';
import { CurriculumUnitFindManySchema as CurriculumUnitFindManySchema } from '../findManyCurriculumUnit.schema';
import { LessonCountOutputTypeArgsObjectSchema as LessonCountOutputTypeArgsObjectSchema } from './LessonCountOutputTypeArgs.schema'

const makeSchema = () => z.object({
  id: z.boolean().optional(),
  title: z.boolean().optional(),
  description: z.boolean().optional(),
  content: z.boolean().optional(),
  lessonType: z.boolean().optional(),
  gradeLevel: z.boolean().optional(),
  order: z.boolean().optional(),
  standards: z.union([z.boolean(), z.lazy(() => StandardFindManySchema)]).optional(),
  curriculumUnits: z.union([z.boolean(), z.lazy(() => CurriculumUnitFindManySchema)]).optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  _count: z.union([z.boolean(), z.lazy(() => LessonCountOutputTypeArgsObjectSchema)]).optional()
}).strict();
export const LessonSelectObjectSchema: z.ZodType<Prisma.LessonSelect> = makeSchema() as unknown as z.ZodType<Prisma.LessonSelect>;
export const LessonSelectObjectZodSchema = makeSchema();
