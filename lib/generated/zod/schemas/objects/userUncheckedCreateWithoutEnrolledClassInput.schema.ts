import * as z from 'zod';
import type { Prisma } from '@prisma/client';
import { UserRoleSchema } from '../enums/UserRole.schema';
import { accountUncheckedCreateNestedManyWithoutUserInputObjectSchema as accountUncheckedCreateNestedManyWithoutUserInputObjectSchema } from './accountUncheckedCreateNestedManyWithoutUserInput.schema';
import { sessionUncheckedCreateNestedManyWithoutUserInputObjectSchema as sessionUncheckedCreateNestedManyWithoutUserInputObjectSchema } from './sessionUncheckedCreateNestedManyWithoutUserInput.schema';
import { ClassUncheckedCreateNestedManyWithoutTeacherInputObjectSchema as ClassUncheckedCreateNestedManyWithoutTeacherInputObjectSchema } from './ClassUncheckedCreateNestedManyWithoutTeacherInput.schema'

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
  account: z.lazy(() => accountUncheckedCreateNestedManyWithoutUserInputObjectSchema).optional(),
  session: z.lazy(() => sessionUncheckedCreateNestedManyWithoutUserInputObjectSchema).optional(),
  taughtClasses: z.lazy(() => ClassUncheckedCreateNestedManyWithoutTeacherInputObjectSchema).optional()
}).strict();
export const userUncheckedCreateWithoutEnrolledClassInputObjectSchema: z.ZodType<Prisma.userUncheckedCreateWithoutEnrolledClassInput> = makeSchema() as unknown as z.ZodType<Prisma.userUncheckedCreateWithoutEnrolledClassInput>;
export const userUncheckedCreateWithoutEnrolledClassInputObjectZodSchema = makeSchema();
