import * as z from 'zod';

// prettier-ignore
export const LessonModelSchema = z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().nullable(),
    content: z.string().nullable(),
    gradeLevel: z.number().int(),
    order: z.number().int(),
    standards: z.array(z.unknown()),
    curriculumUnits: z.array(z.unknown()),
    createdAt: z.date(),
    updatedAt: z.date()
}).strict();

export type LessonPureType = z.infer<typeof LessonModelSchema>;
