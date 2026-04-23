import * as z from 'zod';

export const LessonScalarFieldEnumSchema = z.enum(['id', 'slug', 'title', 'description', 'content', 'structuredContent', 'lessonType', 'gradeLevel', 'order', 'createdAt', 'updatedAt'])

export type LessonScalarFieldEnum = z.infer<typeof LessonScalarFieldEnumSchema>;