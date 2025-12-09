import { useTranslations } from 'next-intl';
import { LoginForm } from './_components/login-form';

export default function LoginPage() {
  const t = useTranslations('auth');

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight">
            {t('login')}
          </h2>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
