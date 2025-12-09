'use client';

import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from '@/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { FormField } from '@/components/ui/form-field';
import { FormError } from '@/components/ui/form-error';
import { GoogleButton } from '@/components/google-button';
import { useRegister } from '@/hooks/use-auth';
import { useState } from 'react';
import { registerSchema, type RegisterFormData } from '@/lib/validations/auth';

export function RegisterForm() {
  const t = useTranslations('auth');
  const register = useRegister();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
  });

  const onSubmit = async (data: RegisterFormData) => {
    setError(null);

    try {
      await register.mutateAsync({
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        password: data.password,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-4">
        <GoogleButton />
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="h-px flex-1 bg-border" aria-hidden />
          <span>{t('or')}</span>
          <span className="h-px flex-1 bg-border" aria-hidden />
        </div>
        <FormField
          label={t('email')}
          htmlFor="email"
          error={errors.email?.message}
          t={t}
        >
          <Input
            id="email"
            type="email"
            autoComplete="email"
            {...registerField('email')}
            className="mt-1"
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            label={t('firstName')}
            htmlFor="first_name"
            error={errors.first_name?.message}
            t={t}
          >
            <Input
              id="first_name"
              type="text"
              autoComplete="given-name"
              {...registerField('first_name')}
              className="mt-1"
            />
          </FormField>

          <FormField
            label={t('lastName')}
            htmlFor="last_name"
            error={errors.last_name?.message}
            t={t}
          >
            <Input
              id="last_name"
              type="text"
              autoComplete="family-name"
              {...registerField('last_name')}
              className="mt-1"
            />
          </FormField>
        </div>

        <FormField
          label={t('password')}
          htmlFor="password"
          error={errors.password?.message}
          t={t}
        >
          <PasswordInput
            id="password"
            autoComplete="new-password"
            {...registerField('password')}
            className="mt-1"
            showPassword={showPassword}
            onTogglePassword={() => setShowPassword(!showPassword)}
          />
        </FormField>

        <FormField
          label={t('confirmPassword')}
          htmlFor="confirmPassword"
          error={errors.confirmPassword?.message}
          t={t}
        >
          <PasswordInput
            id="confirmPassword"
            autoComplete="new-password"
            {...registerField('confirmPassword')}
            className="mt-1"
            showPassword={showConfirmPassword}
            onTogglePassword={() =>
              setShowConfirmPassword(!showConfirmPassword)
            }
          />
        </FormField>
      </div>

      <FormError message={error || ''} t={t} />

      <div>
        <Button type="submit" className="w-full" disabled={register.isPending}>
          {register.isPending ? 'Loading...' : t('register')}
        </Button>
      </div>

      <div className="text-center text-sm">
        <span className="text-muted-foreground">
          {t('alreadyHaveAccount')}{' '}
        </span>
        <Link
          href="/login"
          className="font-medium text-primary hover:text-primary/80"
        >
          {t('login')}
        </Link>
      </div>
    </form>
  );
}
