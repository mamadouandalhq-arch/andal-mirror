import * as React from 'react';

import { cn } from '@/lib/utils';

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'muted';
}

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size = 'md', variant = 'primary', ...props }, ref) => {
    const sizeClasses = {
      sm: 'h-4 w-4 border-2',
      md: 'h-6 w-6 border-2',
      lg: 'h-8 w-8 border-[3px]',
    };

    const variantClasses = {
      primary: 'border-primary border-t-transparent',
      secondary: 'border-secondary border-t-transparent',
      muted: 'border-muted-foreground border-t-transparent',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'inline-block animate-spin rounded-full',
          sizeClasses[size],
          variantClasses[variant],
          className,
        )}
        role="status"
        aria-label="Loading"
        {...props}
      >
        <span className="sr-only">Loading...</span>
      </div>
    );
  },
);
Spinner.displayName = 'Spinner';

export { Spinner };

