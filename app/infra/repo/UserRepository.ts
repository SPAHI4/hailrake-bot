import { and, eq } from 'drizzle-orm';

import { db as appDb } from '../drizzle.js';
import { User } from '../../domain/entities/User.js';
import { users } from '../../db/schema.js';
import { TelegramUser } from '../../dto/TelegramUser.js';
import { TelegramAbstractChat } from '../../dto/TelegramChat.js';

import { DrizzleRepository } from './DrizzleRepository.js';

export class UserRepository extends DrizzleRepository<User> {
  constructor(private readonly db: typeof appDb) {
    super();
  }

  async findOne([id, chatId]: [number, number]): Promise<User | null> {
    const user = await this.db.query.users.findFirst({
      where: (users, { and, eq }) => and(eq(users.id, id), eq(users.chatId, chatId)),
    });

    if (!user) {
      return null;
    }

    return new User(user);
  }

  async insert(entity: User): Promise<void> {
    await this.db.insert(users).values(entity);
  }

  async updateBatch(entities: User[]): Promise<void> {
    await Promise.all(
      entities.map((user) =>
        this.db
          .update(users)
          .set(user)
          .where(and(eq(users.id, user.id), eq(users.chatId, user.chatId))),
      ),
    );
  }

  async upsertFromTelegramUser(user: TelegramUser, chat: TelegramAbstractChat): Promise<User> {
    // could be done with onConflictDoUpdate but it's easier this way
    const existingUser = await this.findOne([user.id, chat.id]);

    if (existingUser) {
      existingUser.setDataFromTelegramUser(user);

      return existingUser;
    }

    const newUser = User.fromTelegramUser(user, chat);

    await this.insert(newUser);

    return newUser;
  }
}
