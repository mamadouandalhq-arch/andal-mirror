import * as React from 'react';

interface FormErrorProps {
  message: string;
  className?: string;
}

export function FormError({ message, className }: FormErrorProps) {
  if (!message) return null;

  return (
    <div
      className={`rounded-md bg-red-50 p-4 ${className || ''}`}
      role="alert"
    >
      <p className="text-sm text-red-800">{message}</p>
    </div>
  );
}

