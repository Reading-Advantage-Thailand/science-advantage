import * as z from 'zod';
export const StandardCreateResultSchema = z.object({
  id: z.string(),
  framework: z.unknown(),
  code: z.string(),
  description: z.string(),
  gradeLevel: z.number().int().optional(),
  lessons: z.array(z.unknown())
});