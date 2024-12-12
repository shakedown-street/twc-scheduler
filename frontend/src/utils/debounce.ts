import React from 'react';

/**
 * Debounce a function to throttle its execution to a certain delay.
 */
export function debounce(callback: (...args: any[]) => void, delay: number) {
  let timeoutId: NodeJS.Timeout | undefined = undefined;

  return (...args: any[]) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => callback(...args), delay);
  };
}

/**
 * Attach debounce to a ref to persist the debounced function between renders.
 */
export function debounceRef(callback: (value: any) => void, delay: number) {
  const ref = React.useRef(
    debounce((v: any) => {
      callback(v);
    }, delay)
  );

  return ref.current;
}
