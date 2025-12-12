/**
 * Format a date string to a readable format
 * @param dateString - ISO date string
 * @param options - Formatting options
 * @returns Formatted date string
 */
export function formatDate(
  dateString: string,
  options: {
    includeTime?: boolean;
    monthFormat?: 'short' | 'long' | 'numeric';
  } = {},
): string {
  const { includeTime = false, monthFormat = 'short' } = options;
  const date = new Date(dateString);

  const formatOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: monthFormat,
    day: 'numeric',
  };

  if (includeTime) {
    formatOptions.hour = '2-digit';
    formatOptions.minute = '2-digit';
  }

  return new Intl.DateTimeFormat('en-US', formatOptions).format(date);
}

/**
 * Format a number with locale-specific formatting
 * @param value - Number to format
 * @param locale - Locale string (default: 'en-US')
 * @returns Formatted number string
 */
export function formatNumber(value: number, locale = 'en-US'): string {
  return value.toLocaleString(locale);
}

/**
 * Format points value with locale-specific formatting
 * @param points - Points value to format
 * @param locale - Locale string (default: 'en-US')
 * @returns Formatted points string
 */
export function formatPoints(points: number, locale = 'en-US'): string {
  return formatNumber(points, locale);
}

