import * as z from 'zod';
import type { Prisma } from '@prisma/client';
import { UserRoleSchema } from '../enums/UserRole.schema';
import { accountCreateNestedManyWithoutUserInputObjectSchema as accountCreateNestedManyWithoutUserInputObjectSchema } from './accountCreateNestedManyWithoutUserInput.schema';
import { sessionCreateNestedManyWithoutUserInputObjectSchema as sessionCreateNestedManyWithoutUserInputObjectSchema } from './sessionCreateNestedManyWithoutUserInput.schema';
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
  account: z.lazy(() => accountCreateNestedManyWithoutUserInputObjectSchema).optional(),
  session: z.lazy(() => sessionCreateNestedManyWithoutUserInputObjectSchema).optional(),
  enrolledClass: z.lazy(() => ClassCreateNestedManyWithoutStudentsInputObjectSchema).optional()
}).strict();
export const userCreateWithoutTaughtClassesInputObjectSchema: z.ZodType<Prisma.userCreateWithoutTaughtClassesInput> = makeSchema() as unknown as z.ZodType<Prisma.userCreateWithoutTaughtClassesInput>;
export const userCreateWithoutTaughtClassesInputObjectZodSchema = makeSchema();
