import { useTranslations } from 'next-intl';
import { ForgotPasswordForm } from './_components/forgot-password-form';

export default function ForgotPasswordPage() {
  const t = useTranslations('auth');

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight">
            {t('forgotPassword')}
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            {t('enterEmailForReset')}
          </p>
        </div>
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
