export function debounce<A extends unknown[], R extends unknown>(
  fn: (...args: A) => R | Promise<R>,
  delay: number
) {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return function (...args: A): Promise<R> {
    return new Promise<R>((resolve) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }

      timeoutId = setTimeout(() => {
        const value = fn(...args);

        if (value instanceof Promise) value.then(resolve);
        else resolve(value);
      }, delay);
    });
  };
}
