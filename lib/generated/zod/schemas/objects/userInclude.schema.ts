import * as z from 'zod';
import type { Prisma } from '@prisma/client';
import { accountFindManySchema as accountFindManySchema } from '../findManyaccount.schema';
import { sessionFindManySchema as sessionFindManySchema } from '../findManysession.schema';
import { ClassFindManySchema as ClassFindManySchema } from '../findManyClass.schema';
import { AttemptFindManySchema as AttemptFindManySchema } from '../findManyAttempt.schema';
import { LessonCompletionFindManySchema as LessonCompletionFindManySchema } from '../findManyLessonCompletion.schema';
import { UserCountOutputTypeArgsObjectSchema as UserCountOutputTypeArgsObjectSchema } from './UserCountOutputTypeArgs.schema'

const makeSchema = () => z.object({
  account: z.union([z.boolean(), z.lazy(() => accountFindManySchema)]).optional(),
  session: z.union([z.boolean(), z.lazy(() => sessionFindManySchema)]).optional(),
  taughtClasses: z.union([z.boolean(), z.lazy(() => ClassFindManySchema)]).optional(),
  enrolledClass: z.union([z.boolean(), z.lazy(() => ClassFindManySchema)]).optional(),
  attempts: z.union([z.boolean(), z.lazy(() => AttemptFindManySchema)]).optional(),
  lessonCompletions: z.union([z.boolean(), z.lazy(() => LessonCompletionFindManySchema)]).optional(),
  _count: z.union([z.boolean(), z.lazy(() => UserCountOutputTypeArgsObjectSchema)]).optional()
}).strict();
export const userIncludeObjectSchema: z.ZodType<Prisma.userInclude> = makeSchema() as unknown as z.ZodType<Prisma.userInclude>;
export const userIncludeObjectZodSchema = makeSchema();
