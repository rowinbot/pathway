/// <reference types="astro/client" />

type NTuple<T, N extends number, A extends any[] = []> = A extends { length: N }
  ? A
  : NTuple<T, N, [...A, T]>;
