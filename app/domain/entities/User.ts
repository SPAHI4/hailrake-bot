import { floor } from 'lodash-es';
import { subDays } from 'date-fns';

import { users } from '../../db/schema.js';
import { Entity } from '../Entity.js';
import {
  RATING_NORMAL_RANGE_MAX,
  RATING_NORMAL_RANGE_MIN,
  RATING_AMOUNT_IF_IN_NORMAL_RANGE,
  RATING_AMOUNT_IF_NEGATIVE,
} from '../../commands/rating/constants.js';
import { TelegramUser } from '../../dto/TelegramUser.js';
import { TelegramAbstractChat } from '../../dto/TelegramChat.js';

export type UserSelect = typeof users.$inferSelect; // return type when queried
export type UserInsert = typeof users.$inferInsert;

/*
// reply_to_message
{
  "message_id": 89394,
  "from": {
    "id": 111031330,
    "is_bot": false,
    "first_name": "Anton",
    "last_name": "S",
    "username": "spahi4",
    "language_code": "en",
    "is_premium": true
  },
  "chat": {
    "id": 111031330,
    "first_name": "Anton",
    "last_name": "S",
    "username": "spahi4",
    "type": "private"
  },
  "date": 1717877317,
  "text": "hi"
}
 */

export class User implements Entity<UserSelect> {
  id: number;
  chatId: number;
  username: string | null;
  firstName: string;
  lastName: string | null;
  isBot: boolean;

  rating: number;
  votedAt: Date; // default to day ago

  playedCasinoAt: Date; // default to day ago

  createdAt: Date;
  updatedAt: Date;

  constructor(data: UserSelect) {
    this.id = data.id;
    this.chatId = data.chatId;
    this.username = data.username;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.isBot = data.isBot;
    this.rating = data.rating;
    this.votedAt = data.votedAt;
    this.playedCasinoAt = data.playedCasinoAt;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  get rateAmount(): number {
    // don't apply formula if rating is in range 0-10
    if (this.rating >= RATING_NORMAL_RANGE_MIN && this.rating <= RATING_NORMAL_RANGE_MAX) {
      return RATING_AMOUNT_IF_IN_NORMAL_RANGE;
    }

    const voteAmount = floor(Math.sqrt(this.rating) / 3, 1);

    return voteAmount > 0 ? voteAmount : RATING_AMOUNT_IF_NEGATIVE;
  }

  get displayName(): string {
    return this.username ?? [this.firstName, this.lastName].filter(Boolean).join(' ');
  }

  public setDataFromTelegramUser(tgUser: TelegramUser): void {
    this.username = tgUser.username ?? null;
    this.firstName = tgUser.first_name;
    this.lastName = tgUser.last_name ?? null;
    this.isBot = tgUser.is_bot;
  }

  public static fromTelegramUser(tgUser: TelegramUser, chat: TelegramAbstractChat): User {
    const now = new Date();
    const yesterday = subDays(now, 1);

    return new User({
      id: tgUser.id,
      chatId: chat.id,
      username: tgUser.username ?? null,
      firstName: tgUser.first_name,
      lastName: tgUser.last_name ?? null,
      isBot: tgUser.is_bot,
      rating: 1,
      votedAt: yesterday,
      playedCasinoAt: yesterday,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}
