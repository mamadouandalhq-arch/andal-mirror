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
import { useLogin } from '@/hooks/use-auth';
import { useState } from 'react';
import { loginSchema, type LoginFormData } from '@/lib/validations/auth';

export function LoginForm() {
  const t = useTranslations('auth');
  const login = useLogin();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
  });

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    try {
      await login.mutateAsync(data);
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
      </div>

      <div className="space-y-4">
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
            {...register('email')}
            className="mt-1"
          />
        </FormField>

        <FormField
          label={t('password')}
          htmlFor="password"
          error={errors.password?.message}
          t={t}
        >
          <PasswordInput
            id="password"
            autoComplete="current-password"
            {...register('password')}
            className="mt-1"
            showPassword={showPassword}
            onTogglePassword={() => setShowPassword(!showPassword)}
          />
        </FormField>
      </div>

      <FormError message={error || ''} t={t} />

      <div className="flex items-center justify-between">
        <div className="text-sm">
          <Link
            href="/forgot-password"
            className="font-medium text-primary hover:text-primary/80"
          >
            {t('forgotPassword')}
          </Link>
        </div>
      </div>

      <div>
        <Button type="submit" className="w-full" disabled={login.isPending}>
          {login.isPending ? 'Loading...' : t('login')}
        </Button>
      </div>

      <div className="text-center text-sm">
        <span className="text-muted-foreground">{t('dontHaveAccount')} </span>
        <Link
          href="/register"
          className="font-medium text-primary hover:text-primary/80"
        >
          {t('register')}
        </Link>
      </div>
    </form>
  );
}

