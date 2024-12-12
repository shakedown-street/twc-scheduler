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
 * Format a string or number to a currency string
 */
export function formatMoney(value: string | number, maximumFractionDigits = 2): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return num.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits });
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
