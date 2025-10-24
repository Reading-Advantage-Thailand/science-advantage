import * as z from 'zod';

import { LessonTypeSchema } from '../../enums/LessonType.schema';
// prettier-ignore
export const LessonResultSchema = z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().nullable(),
    content: z.string().nullable(),
    lessonType: LessonTypeSchema,
    gradeLevel: z.number().int(),
    order: z.number().int(),
    standards: z.array(z.unknown()),
    curriculumUnits: z.array(z.unknown()),
    createdAt: z.date(),
    updatedAt: z.date()
}).strict();

export type LessonResultType = z.infer<typeof LessonResultSchema>;
