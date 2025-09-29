import { differenceInMinutes, format, isAfter, isBefore, parse } from 'date-fns';

/**
 * Parse a time string in the format "HH:mm:ss" into a Date object
 */
export function parseTime(time: string) {
  return parse(time, 'HH:mm:ss', new Date());
}

/**
 * Add minutes to a time string in the format "HH:mm:ss"
 */

export function addMinutes(time: string, minutes: number) {
  const parsedTime = parseTime(time);
  const newTime = new Date(parsedTime.getTime() + minutes * 60000);
  return format(newTime, 'HH:mm:ss');
}

/**
 * Removes minutes to a time string in the format "HH:mm:ss"
 */

export function removeMinutes(time: string, minutes: number) {
  const parsedTime = parseTime(time);
  const newTime = new Date(parsedTime.getTime() - minutes * 60000);
  return format(newTime, 'HH:mm:ss');
}

/**
 * Return true if the minutes of the time string are 0
 */
export function isOnTheHour(time: string) {
  return parseTime(time).getMinutes() === 0;
}

/**
 * Return true if the time string is between the start and end time
 *
 * Does not return true if the time string is equal to the start or end time
 */
export function isBetween(time: string, start: string, end: string) {
  const parsedTime = parseTime(time);
  const parsedStart = parseTime(start);
  const parsedEnd = parseTime(end);
  return isAfter(parsedTime, parsedStart) && isBefore(parsedTime, parsedEnd);
}

/**
 * Return true if the time string is between the start and end time
 *
 * Returns true if the time string is equal to the start or end time
 */
export function isBetweenInclusive(time: string, start: string, end: string) {
  const parsedTime = parseTime(time);
  const parsedStart = parseTime(start);
  const parsedEnd = parseTime(end);
  return !isBefore(parsedTime, parsedStart) && !isAfter(parsedTime, parsedEnd);
}

/**
 * Return true if the time string is between the start and end time
 *
 * Returns true if the time string is equal to the start time, but not the end time
 */
export function isBetweenInclusiveStart(time: string, start: string, end: string) {
  const parsedTime = parseTime(time);
  const parsedStart = parseTime(start);
  const parsedEnd = parseTime(end);
  return !isBefore(parsedTime, parsedStart) && isBefore(parsedTime, parsedEnd);
}

/**
 * Return true if the time string is between the start and end time
 *
 * Returns true if the time string is equal to the end time, but not the start time
 */
export function isBetweenInclusiveEnd(time: string, start: string, end: string) {
  const parsedTime = parseTime(time);
  const parsedStart = parseTime(start);
  const parsedEnd = parseTime(end);
  return isAfter(parsedTime, parsedStart) && !isAfter(parsedTime, parsedEnd);
}

/**
 * Check if there is any intersection between two times
 */
export function checkTimeIntersection(aStart: string, aEnd: string, bStart: string, bEnd: string) {
  return isBetweenInclusiveStart(aStart, bStart, bEnd) || isBetweenInclusiveEnd(aEnd, bStart, bEnd);
}

/**
 * Format a time string in the format "HH:mm:ss" to "h:mm a"
 */
export function formatTime(time: string) {
  const parsedTime = parse(time, 'HH:mm:ss', new Date());
  return format(parsedTime, 'h:mm a');
}

/**
 * Formats a timestamp such as "09:00:00" to "9" or "9:30:00" to "9:30"
 */
export function formatTimeShort(time: string) {
  const parsedTime = parse(time, 'HH:mm:ss', new Date());
  return isOnTheHour(time) ? format(parsedTime, 'h') : format(parsedTime, 'h:mm');
}

/**
 * Niche: For the timeslots on the timeline we want to have the hour, then the intervals of 15 minutes
 *
 * For example: 9, 15, 30, 45
 */
export function formatTimeTimeline(time: string) {
  const parsedTime = parse(time, 'HH:mm:ss', new Date());
  return isOnTheHour(time) ? format(parsedTime, 'h') : format(parsedTime, 'm');
}

/**
 * Return the difference in minutes between two time strings
 */
export function differenceInHoursFractional(startTime: string, endTime: string) {
  const start = parseTime(startTime);
  const end = parseTime(endTime);
  const difference = differenceInMinutes(end, start) / 60;
  return parseFloat(difference.toFixed(2));
}

/**
 * Generate timestamps between two time strings with a given interval
 *
 * For example: generateTimeSlots("09:00:00", "10:00:00", 15) will return ["09:00:00", "09:15:00", "09:30:00", "09:45:00"]
 */
export function generateTimeSlots(startTime: string, endTime: string, interval: number, includeEnd = false) {
  const timeSlots: string[] = [];
  let currentTime = startTime;
  while (currentTime < endTime) {
    timeSlots.push(currentTime);
    // eslint-disable-next-line prefer-const
    let [hours, minutes, seconds] = currentTime.split(':').map(Number);
    minutes += interval;
    if (minutes >= 60) {
      hours += 1;
      minutes -= 60;
    }
    currentTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(
      2,
      '0',
    )}`;
  }
  if (includeEnd) {
    timeSlots.push(endTime);
  }
  return timeSlots;
}

/**
 * Day to string
 */
export function dayToString(day: number, format: 'long' | 'medium' | 'short' = 'long') {
  const long = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const medium = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const short = ['M', 'T', 'W', 'TH', 'F', 'SA', 'SU'];

  switch (format) {
    case 'long':
      return long[day];
    case 'medium':
      return medium[day];
    case 'short':
      return short[day];
    default:
      return long[day];
  }
}
