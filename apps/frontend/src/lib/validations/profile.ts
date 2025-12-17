import { z } from 'zod';

export const updateProfileSchema = z.object({
  firstName: z.string().min(1, 'validation.firstNameRequired'),
  lastName: z.string().min(1, 'validation.lastNameRequired'),
  address: z.string().optional(),
});

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
