import * as z from 'zod';

export const LessonScalarFieldEnumSchema = z.enum(['id', 'title', 'description', 'content', 'lessonType', 'gradeLevel', 'order', 'createdAt', 'updatedAt'])

export type LessonScalarFieldEnum = z.infer<typeof LessonScalarFieldEnumSchema>;