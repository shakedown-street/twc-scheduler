import React from 'react';

/**
 * Debounce a function to throttle its execution to a certain delay.
 */
export function useDebounce<T extends unknown[]>(callback: (...args: T) => void, delay: number) {
  const timeoutId = React.useRef<NodeJS.Timeout | undefined>(undefined);

  return (...args: T) => {
    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
    }
    timeoutId.current = setTimeout(() => {
      callback(...args);
    }, delay);
  };
}
