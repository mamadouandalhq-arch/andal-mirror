'use client';

import * as React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
};

const sizeValues = {
  sm: 32,
  md: 40,
  lg: 48,
};

function getInitials(firstName?: string, lastName?: string): string {
  const first = firstName?.charAt(0).toUpperCase() || '';
  const last = lastName?.charAt(0).toUpperCase() || '';
  return first + last || '?';
}

function generateAvatarColor(name: string): string {
  // Generate a consistent color based on the name
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Generate a hue between 0-360
  const hue = Math.abs(hash) % 360;
  // Use a moderate saturation and lightness for better contrast
  return `hsl(${hue}, 65%, 50%)`;
}

export function Avatar({
  src,
  alt,
  fallback,
  size = 'md',
  className,
  ...props
}: AvatarProps) {
  const [imageError, setImageError] = React.useState(false);
  const displaySrc = src && !imageError ? src : null;
  const displayFallback = fallback || '?';
  const bgColor = generateAvatarColor(displayFallback);
  const imageSize = sizeValues[size];
  const isGoogleUrl = displaySrc?.includes('googleusercontent.com');

  return (
    <div
      className={cn(
        'relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted',
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {displaySrc ? (
        <Image
          src={displaySrc}
          alt={alt || 'Avatar'}
          width={imageSize}
          height={imageSize}
          className="h-full w-full object-cover"
          onError={() => setImageError(true)}
          unoptimized={isGoogleUrl}
        />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center font-semibold text-white"
          style={{ backgroundColor: bgColor }}
        >
          {displayFallback}
        </div>
      )}
    </div>
  );
}

export { getInitials, generateAvatarColor };
