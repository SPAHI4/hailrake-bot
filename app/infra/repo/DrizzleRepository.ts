export abstract class DrizzleRepository<TEntity> {
  abstract findOne(...args: unknown[]): Promise<TEntity | null>;
  // abstract findMany(): Promise<TEntity[]>;
  // abstract insert(data: TEntity): Promise<TEntity>;
  // abstract update(data: TEntity): Promise<TEntity>;
  // abstract delete(data: TEntity): Promise<void>;
}
