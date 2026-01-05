import { z } from 'zod';

// Canadian phone number regex: +1XXXXXXXXXX
const canadianPhoneRegex = /^\+1[2-9]\d{2}[2-9]\d{2}\d{4}$/;

export const updateProfileSchema = z.object({
  firstName: z.string().min(1, 'validation.firstNameRequired'),
  lastName: z.string().min(1, 'validation.lastNameRequired'),
  city: z.string().optional(),
  street: z.string().optional(),
  building: z.string().optional(),
  apartment: z.string().optional(),
  phoneNumber: z
    .string()
    .optional()
    .refine(
      (val) => !val || canadianPhoneRegex.test(val),
      'validation.invalidCanadianPhone',
    ),
});

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
