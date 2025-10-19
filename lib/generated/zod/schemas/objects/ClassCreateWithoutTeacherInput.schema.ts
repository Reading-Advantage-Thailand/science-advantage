import * as z from 'zod';
import type { Prisma } from '@prisma/client';
import { StandardsAlignmentSchema } from '../enums/StandardsAlignment.schema';
import { userCreateNestedManyWithoutEnrolledClassInputObjectSchema as userCreateNestedManyWithoutEnrolledClassInputObjectSchema } from './userCreateNestedManyWithoutEnrolledClassInput.schema';
import { CurriculumUnitCreateNestedManyWithoutClassInputObjectSchema as CurriculumUnitCreateNestedManyWithoutClassInputObjectSchema } from './CurriculumUnitCreateNestedManyWithoutClassInput.schema'

const makeSchema = () => z.object({
  id: z.string().optional(),
  name: z.string().min(3).max(100).trim(),
  gradeLevel: z.number().int().int().min(3).max(6),
  standardsAlignment: StandardsAlignmentSchema,
  joinCode: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  students: z.lazy(() => userCreateNestedManyWithoutEnrolledClassInputObjectSchema).optional(),
  curriculumUnits: z.lazy(() => CurriculumUnitCreateNestedManyWithoutClassInputObjectSchema).optional()
}).strict();
export const ClassCreateWithoutTeacherInputObjectSchema: z.ZodType<Prisma.ClassCreateWithoutTeacherInput> = makeSchema() as unknown as z.ZodType<Prisma.ClassCreateWithoutTeacherInput>;
export const ClassCreateWithoutTeacherInputObjectZodSchema = makeSchema();
