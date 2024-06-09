import { Context } from 'telegraf';

import { db as appDb } from './infra/drizzle.js';
import { UserRepository } from './infra/repo/UserRepository.js';

export interface AppContext extends Context {
  transaction: typeof appDb;
  userRepository: UserRepository;
}
