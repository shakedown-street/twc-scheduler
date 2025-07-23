export function dayColor(day: number) {
  switch (day) {
    case 0:
      return '#facc15'; // tw-yellow-400
    case 1:
      return '#22c55e'; // tw-green-500
    case 2:
      return '#3b82f6'; // tw-blue-500
    case 3:
      return '#a855f7'; // tw-purple-500
    case 4:
      return '#ef4444'; // tw-red-500
    default:
      return 'white';
  }
}

export function skillLevelColor(skillLevel: number) {
  switch (skillLevel) {
    case 1:
      return '#bbf7d0'; // tw-green-200
    case 2:
      return '#fef08a'; // tw-yellow-200
    case 3:
      return '#fecaca'; // tw-red-200
    default:
      return 'white';
  }
}

export function striped(color1: string, color2: string) {
  return `repeating-linear-gradient(45deg, ${color1}, ${color1} 4px, ${color2} 4px, ${color2} 8px)`;
}

/**
 * Determines if black or white text should be used on a given background color
 */
export function getContrastTextColor(backgroundColor: string) {
  const hex = backgroundColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? 'black' : 'white';
}
