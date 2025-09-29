/**
 * Formats a phone number to the format (XXX) XXX-XXXX
 */
export function formatPhoneNumber(phoneNumber: string): string {
  if (!phoneNumber) {
    return '';
  }

  // Remove all non-numeric characters from the phone number
  const cleaned = phoneNumber.replace(/\D/g, '');

  // Check the length of the cleaned phone number
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }

  return '';
}

/**
 * Format a string or number to a currency string.  Only includes cents if the value is not a whole number.
 */
export function formatCurrency(value: string | number, currency: string = 'USD'): string {
  const parsed = typeof value === 'string' ? parseFloat(value) : value;
  const language = navigator.language || 'en-US';
  const formatted = new Intl.NumberFormat(language, {
    style: 'currency',
    currency: currency || 'USD',
    minimumFractionDigits: parsed % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(parsed);
  return formatted;
}

/**
 * Format size in bytes to human readable format
 */
export function formatBytes(value: number, decimals = 2): string {
  if (value === 0) {
    return '0 Bytes';
  }
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(value) / Math.log(k));
  return parseFloat((value / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Format a date to a human readable string
 */
export function formatDate(date: Date | string): string {
  if (!date) {
    return '';
  }
  const d = new Date(date);
  return d.toLocaleDateString(navigator.language, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format a date and time to a human readable string
 */
export function formatDateTime(date: Date | string): string {
  if (!date) {
    return '';
  }
  const d = new Date(date);
  return d.toLocaleDateString(navigator.language, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format a time to a human readable string
 */
export function formatTime(date: Date | string): string {
  if (!date) {
    return '';
  }
  const d = new Date(date);
  return d.toLocaleTimeString(navigator.language, {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format a number to a percentage string
 */
export function formatPercentage(value: number, decimals = 2): string {
  if (isNaN(value)) {
    return '0%';
  }
  return `${(value * 100).toFixed(decimals)}%`;
}
