import { z } from 'zod';

// Use translation keys for error messages
export const loginSchema = z.object({
  email: z.email('validation.emailInvalid').min(1, 'validation.emailRequired'),
  password: z.string().min(1, 'validation.passwordRequired'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    email: z
      .email('validation.emailInvalid')
      .min(1, 'validation.emailRequired'),
    firstName: z.string().min(1, 'validation.firstNameRequired'),
    lastName: z.string().min(1, 'validation.lastNameRequired'),
    password: z
      .string()
      .min(8, 'validation.passwordMinLength')
      .max(20, 'validation.passwordMaxLength'),
    confirmPassword: z.string().min(1, 'validation.confirmPasswordRequired'),
  })
  .refine(
    (data: { password: string; confirmPassword: string }) =>
      data.password === data.confirmPassword,
    {
      message: 'validation.passwordsDoNotMatch',
      path: ['confirmPassword'],
    },
  );

export type RegisterFormData = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'validation.emailRequired')
    .email('validation.emailInvalid'),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
