import * as React from 'react';
import { Label } from './label';
import { useTranslations } from 'next-intl';

type TranslationFunction = ReturnType<typeof useTranslations>;

interface FormFieldProps {
  label: string | React.ReactNode;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
  t?: TranslationFunction;
}

export function FormField({
  label,
  htmlFor,
  error,
  children,
  className,
  t,
}: FormFieldProps) {
  // Translate error message if it's a translation key and translation function is provided
  const translatedError = React.useMemo(() => {
    if (!error) return undefined;
    if (!t) return error;
    
    // Check if the error message is a translation key (starts with 'validation.')
    if (error.startsWith('validation.')) {
      // Since we're using useTranslations('auth'), we can directly use the key
      return t(error);
    }
    
    return error;
  }, [error, t]);

  return (
    <div className={className}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {translatedError && (
        <p className="mt-1 text-sm text-red-600" role="alert">
          {translatedError}
        </p>
      )}
    </div>
  );
}
