import * as React from 'react';
import { useTranslations } from 'next-intl';
import { translateError } from '@/lib/errors/translate-error';

type TranslationFunction = ReturnType<typeof useTranslations>;

interface FormErrorProps {
  message: string | unknown;
  className?: string;
  t?: TranslationFunction;
}

export function FormError({ message, className, t }: FormErrorProps) {
  // Translate error if translation function is provided
  const translatedMessage = React.useMemo(() => {
    if (!message) return '';
    if (t) {
      return translateError(message, t);
    }
    // Fallback to string conversion if no translation function
    if (typeof message === 'string') return message;
    if (message instanceof Error) return message.message;
    return String(message);
  }, [message, t]);

  if (!translatedMessage) return null;

  return (
    <div
      className={`rounded-md bg-red-50 p-4 ${className || ''}`}
      role="alert"
    >
      <p className="text-sm text-red-800">{translatedMessage}</p>
    </div>
  );
}

