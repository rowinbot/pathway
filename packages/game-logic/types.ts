export type TupleMatrix<T, N extends number, A extends any[] = []> = A extends {
  length: N;
}
  ? A
  : TupleMatrix<T, N, [...A, T]>;
