export function getSingleHeaderValue(
  headerValue: string | string[] | undefined
): string | undefined {
  if (Array.isArray(headerValue)) {
    return headerValue[0];
  }

  return headerValue;
}
