import { useTranslations } from 'next-intl';
import { RegisterForm } from './_components/register-form';

export default function RegisterPage() {
  const t = useTranslations('auth');

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight">
            {t('register')}
          </h2>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}
