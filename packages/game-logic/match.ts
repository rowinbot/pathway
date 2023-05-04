const MATCH_CODE_REGEX = /^P-[0-9a-zA-Z]{0,4}$/;

export function isMatchCodeValid(code: string): boolean {
  return MATCH_CODE_REGEX.test(code);
}
