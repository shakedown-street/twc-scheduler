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
