import * as z from 'zod';

export const CurriculumUnitScalarFieldEnumSchema = z.enum(['id', 'title', 'description', 'framework', 'gradeLevel', 'order', 'classId', 'createdAt', 'updatedAt'])

export type CurriculumUnitScalarFieldEnum = z.infer<typeof CurriculumUnitScalarFieldEnumSchema>;