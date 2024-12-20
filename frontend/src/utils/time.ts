import { parse, isBefore, isAfter, format } from 'date-fns';

export function parseTime(time: string) {
  return parse(time, 'HH:mm:ss', new Date());
}

export function isOnTheHour(time: string) {
  return parseTime(time).getMinutes() === 0;
}

export function isBetween(time: string, start: string, end: string) {
  const parsedTime = parseTime(time);
  const parsedStart = parseTime(start);
  const parsedEnd = parseTime(end);

  return isAfter(parsedTime, parsedStart) && isBefore(parsedTime, parsedEnd);
}

export function isBetweenInclusive(time: string, start: string, end: string) {
  const parsedTime = parseTime(time);
  const parsedStart = parseTime(start);
  const parsedEnd = parseTime(end);

  return !isBefore(parsedTime, parsedStart) && !isAfter(parsedTime, parsedEnd);
}

export function isBetweenInclusiveStart(time: string, start: string, end: string) {
  const parsedTime = parseTime(time);
  const parsedStart = parseTime(start);
  const parsedEnd = parseTime(end);

  return !isBefore(parsedTime, parsedStart) && isBefore(parsedTime, parsedEnd);
}

export function isBetweenInclusiveEnd(time: string, start: string, end: string) {
  const parsedTime = parseTime(time);
  const parsedStart = parseTime(start);
  const parsedEnd = parseTime(end);

  return isAfter(parsedTime, parsedStart) && !isAfter(parsedTime, parsedEnd);
}

/**
 * Formats a timestamp such as "09:00:00" to "9" or "9:30:00" to "9:30"
 */

export function formatTimeShort(time: string) {
  const parsedTime = parse(time, 'HH:mm:ss', new Date());

  return isOnTheHour(time) ? format(parsedTime, 'h') : format(parsedTime, 'h:mm');
}

/**
 * For the timeslots on the timeline we want to have the hour, then the intervals of 15 minutes
 * For example: 9, 15, 30, 45
 */

export function formatTimeTimeline(time: string) {
  const parsedTime = parse(time, 'HH:mm:ss', new Date());

  return isOnTheHour(time) ? format(parsedTime, 'h') : format(parsedTime, 'm');
}
