import * as z from 'zod';

export const LessonTypeSchema = z.enum(['LESSON', 'LAB', 'ASSESSMENT'])

export type LessonType = z.infer<typeof LessonTypeSchema>;