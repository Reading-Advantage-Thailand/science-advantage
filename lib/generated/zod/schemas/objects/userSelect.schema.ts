import * as z from 'zod';
import type { Prisma } from '@prisma/client';
import { accountFindManySchema as accountFindManySchema } from '../findManyaccount.schema';
import { sessionFindManySchema as sessionFindManySchema } from '../findManysession.schema';
import { ClassFindManySchema as ClassFindManySchema } from '../findManyClass.schema';
import { AttemptFindManySchema as AttemptFindManySchema } from '../findManyAttempt.schema';
import { LessonCompletionFindManySchema as LessonCompletionFindManySchema } from '../findManyLessonCompletion.schema';
import { standardMasteryFindManySchema as standardMasteryFindManySchema } from '../findManystandardMastery.schema';
import { UserCountOutputTypeArgsObjectSchema as UserCountOutputTypeArgsObjectSchema } from './UserCountOutputTypeArgs.schema'

const makeSchema = () => z.object({
  id: z.boolean().optional(),
  name: z.boolean().optional(),
  username: z.boolean().optional(),
  displayUsername: z.boolean().optional(),
  email: z.boolean().optional(),
  emailVerified: z.boolean().optional(),
  image: z.boolean().optional(),
  role: z.boolean().optional(),
  gradeLevel: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  account: z.union([z.boolean(), z.lazy(() => accountFindManySchema)]).optional(),
  session: z.union([z.boolean(), z.lazy(() => sessionFindManySchema)]).optional(),
  taughtClasses: z.union([z.boolean(), z.lazy(() => ClassFindManySchema)]).optional(),
  enrolledClass: z.union([z.boolean(), z.lazy(() => ClassFindManySchema)]).optional(),
  attempts: z.union([z.boolean(), z.lazy(() => AttemptFindManySchema)]).optional(),
  lessonCompletions: z.union([z.boolean(), z.lazy(() => LessonCompletionFindManySchema)]).optional(),
  masteryRecords: z.union([z.boolean(), z.lazy(() => standardMasteryFindManySchema)]).optional(),
  _count: z.union([z.boolean(), z.lazy(() => UserCountOutputTypeArgsObjectSchema)]).optional()
}).strict();
export const userSelectObjectSchema: z.ZodType<Prisma.userSelect> = makeSchema() as unknown as z.ZodType<Prisma.userSelect>;
export const userSelectObjectZodSchema = makeSchema();
