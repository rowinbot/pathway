export function debounce<A extends unknown[]>(
  fn: (...args: A) => void,
  delay: number
) {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return function (...args: A) {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }

    timeoutId = setTimeout(() => fn(...args), delay);
  };
}
