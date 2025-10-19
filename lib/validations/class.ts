import { z } from 'zod';

import { ClassCreateInputObjectZodSchema } from '@/lib/generated/zod/schemas/objects/ClassCreateInput.schema';
import { ClassUpdateInputObjectZodSchema } from '@/lib/generated/zod/schemas/objects/ClassUpdateInput.schema';

/**
 * Base schema derived from Prisma's `ClassCreateInput` definition.
 * Picking only the properties our API accepts directly from the client.
 */
const baseCreateClassSchema = ClassCreateInputObjectZodSchema.pick({
  name: true,
  gradeLevel: true,
  standardsAlignment: true,
});

/**
 * Server-side validation for creating a class.
 * Directly mirrors the Prisma schema so future changes propagate automatically.
 */
export const createClassSchema = baseCreateClassSchema;

export type CreateClassInput = z.infer<typeof createClassSchema>;

/**
 * Update schema derived from Prisma's `ClassUpdateInput`.
 * Restricts to teacher-editable fields and keeps optionality in sync with Prisma.
 */
export const updateClassSchema = ClassUpdateInputObjectZodSchema.pick({
  name: true,
  gradeLevel: true,
  standardsAlignment: true,
});

export type UpdateClassInput = z.infer<typeof updateClassSchema>;

/**
 * Form schema: allows string inputs for numeric fields while piping them
 * through the base validators so client forms stay aligned with the server.
 */
export const createClassFormSchema = z.object({
  name: createClassSchema.shape.name,
  gradeLevel: z.coerce
    .number({
      invalid_type_error: 'Grade level is required',
    })
    .pipe(createClassSchema.shape.gradeLevel),
  standardsAlignment: createClassSchema.shape.standardsAlignment,
});

export type CreateClassFormInput = z.infer<typeof createClassFormSchema>;
