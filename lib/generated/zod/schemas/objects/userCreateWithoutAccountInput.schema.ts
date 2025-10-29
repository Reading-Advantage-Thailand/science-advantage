import * as z from 'zod';
import type { Prisma } from '@prisma/client';
import { UserRoleSchema } from '../enums/UserRole.schema';
import { sessionCreateNestedManyWithoutUserInputObjectSchema as sessionCreateNestedManyWithoutUserInputObjectSchema } from './sessionCreateNestedManyWithoutUserInput.schema';
import { ClassCreateNestedManyWithoutTeacherInputObjectSchema as ClassCreateNestedManyWithoutTeacherInputObjectSchema } from './ClassCreateNestedManyWithoutTeacherInput.schema';
import { ClassCreateNestedManyWithoutStudentsInputObjectSchema as ClassCreateNestedManyWithoutStudentsInputObjectSchema } from './ClassCreateNestedManyWithoutStudentsInput.schema';
import { AttemptCreateNestedManyWithoutStudentInputObjectSchema as AttemptCreateNestedManyWithoutStudentInputObjectSchema } from './AttemptCreateNestedManyWithoutStudentInput.schema';
import { LessonCompletionCreateNestedManyWithoutStudentInputObjectSchema as LessonCompletionCreateNestedManyWithoutStudentInputObjectSchema } from './LessonCompletionCreateNestedManyWithoutStudentInput.schema';
import { standardMasteryCreateNestedManyWithoutStudentInputObjectSchema as standardMasteryCreateNestedManyWithoutStudentInputObjectSchema } from './standardMasteryCreateNestedManyWithoutStudentInput.schema';
import { MasteryRunCreateNestedManyWithoutStudentInputObjectSchema as MasteryRunCreateNestedManyWithoutStudentInputObjectSchema } from './MasteryRunCreateNestedManyWithoutStudentInput.schema'

const makeSchema = () => z.object({
  id: z.string(),
  name: z.string(),
  username: z.string(),
  displayUsername: z.string(),
  email: z.string().optional().nullable(),
  emailVerified: z.boolean().optional(),
  image: z.string().optional().nullable(),
  role: UserRoleSchema.optional(),
  gradeLevel: z.number().int().optional().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  session: z.lazy(() => sessionCreateNestedManyWithoutUserInputObjectSchema).optional(),
  taughtClasses: z.lazy(() => ClassCreateNestedManyWithoutTeacherInputObjectSchema).optional(),
  enrolledClass: z.lazy(() => ClassCreateNestedManyWithoutStudentsInputObjectSchema).optional(),
  attempts: z.lazy(() => AttemptCreateNestedManyWithoutStudentInputObjectSchema).optional(),
  lessonCompletions: z.lazy(() => LessonCompletionCreateNestedManyWithoutStudentInputObjectSchema).optional(),
  masteryRecords: z.lazy(() => standardMasteryCreateNestedManyWithoutStudentInputObjectSchema).optional(),
  masteryRuns: z.lazy(() => MasteryRunCreateNestedManyWithoutStudentInputObjectSchema).optional()
}).strict();
export const userCreateWithoutAccountInputObjectSchema: z.ZodType<Prisma.userCreateWithoutAccountInput> = makeSchema() as unknown as z.ZodType<Prisma.userCreateWithoutAccountInput>;
export const userCreateWithoutAccountInputObjectZodSchema = makeSchema();
