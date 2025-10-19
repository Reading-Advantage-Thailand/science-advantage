import * as z from 'zod';
import type { Prisma } from '@prisma/client';
import { UserRoleSchema } from '../enums/UserRole.schema';
import { accountCreateNestedManyWithoutUserInputObjectSchema as accountCreateNestedManyWithoutUserInputObjectSchema } from './accountCreateNestedManyWithoutUserInput.schema';
import { sessionCreateNestedManyWithoutUserInputObjectSchema as sessionCreateNestedManyWithoutUserInputObjectSchema } from './sessionCreateNestedManyWithoutUserInput.schema';
import { ClassCreateNestedManyWithoutTeacherInputObjectSchema as ClassCreateNestedManyWithoutTeacherInputObjectSchema } from './ClassCreateNestedManyWithoutTeacherInput.schema';
import { ClassCreateNestedManyWithoutStudentsInputObjectSchema as ClassCreateNestedManyWithoutStudentsInputObjectSchema } from './ClassCreateNestedManyWithoutStudentsInput.schema'

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
  account: z.lazy(() => accountCreateNestedManyWithoutUserInputObjectSchema),
  session: z.lazy(() => sessionCreateNestedManyWithoutUserInputObjectSchema),
  taughtClasses: z.lazy(() => ClassCreateNestedManyWithoutTeacherInputObjectSchema),
  enrolledClass: z.lazy(() => ClassCreateNestedManyWithoutStudentsInputObjectSchema)
}).strict();
export const userCreateInputObjectSchema: z.ZodType<Prisma.userCreateInput> = makeSchema() as unknown as z.ZodType<Prisma.userCreateInput>;
export const userCreateInputObjectZodSchema = makeSchema();
