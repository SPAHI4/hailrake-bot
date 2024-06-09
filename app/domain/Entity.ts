export type Entity<TTable> = {
  [K in keyof TTable]: TTable[K];
};
