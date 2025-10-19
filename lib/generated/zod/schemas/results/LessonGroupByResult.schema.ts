import * as z from 'zod';
export const LessonGroupByResultSchema = z.array(z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  content: z.string(),
  gradeLevel: z.number().int(),
  order: z.number().int(),
  createdAt: z.date(),
  updatedAt: z.date(),
  _count: z.object({
    id: z.number(),
    title: z.number(),
    description: z.number(),
    content: z.number(),
    gradeLevel: z.number(),
    order: z.number(),
    standards: z.number(),
    curriculumUnits: z.number(),
    createdAt: z.number(),
    updatedAt: z.number()
  }).optional(),
  _sum: z.object({
    gradeLevel: z.number().nullable(),
    order: z.number().nullable()
  }).nullable().optional(),
  _avg: z.object({
    gradeLevel: z.number().nullable(),
    order: z.number().nullable()
  }).nullable().optional(),
  _min: z.object({
    id: z.string().nullable(),
    title: z.string().nullable(),
    description: z.string().nullable(),
    content: z.string().nullable(),
    gradeLevel: z.number().int().nullable(),
    order: z.number().int().nullable(),
    createdAt: z.date().nullable(),
    updatedAt: z.date().nullable()
  }).nullable().optional(),
  _max: z.object({
    id: z.string().nullable(),
    title: z.string().nullable(),
    description: z.string().nullable(),
    content: z.string().nullable(),
    gradeLevel: z.number().int().nullable(),
    order: z.number().int().nullable(),
    createdAt: z.date().nullable(),
    updatedAt: z.date().nullable()
  }).nullable().optional()
}));