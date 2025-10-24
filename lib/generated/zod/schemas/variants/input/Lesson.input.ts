import * as z from 'zod';

import { LessonTypeSchema } from '../../enums/LessonType.schema';
// prettier-ignore
export const LessonInputSchema = z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().optional().nullable(),
    content: z.string().optional().nullable(),
    lessonType: LessonTypeSchema,
    gradeLevel: z.number().int(),
    order: z.number().int(),
    standards: z.array(z.unknown()),
    curriculumUnits: z.array(z.unknown()),
    createdAt: z.date(),
    updatedAt: z.date()
}).strict();

export type LessonInputType = z.infer<typeof LessonInputSchema>;
