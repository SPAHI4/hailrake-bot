import { differenceInMinutes } from 'date-fns';

import { UserRepository } from '../../infra/repo/UserRepository.js';
import { User } from '../../domain/entities/User.js';
import { TelegramUser } from '../../dto/TelegramUser.js';
import { TelegramAbstractChat } from '../../dto/TelegramChat.js';
import { CommandError } from '../CommandError.js';
import { restrictToReplyMyself } from '../../middlewares/restrictToReplyMyself.js';

import {
  RATING_COOLDOWN_MINUTES,
  RATING_NEGATIVE_ADJUST_MULTIPLIER_FOR_RATER,
  RATING_NEGATIVE_TRIGGERS,
  RATING_POSITIVE_ADJUST_MULTIPLIER_FOR_RATER,
  RATING_POSITIVE_TRIGGERS,
  RATING_REQUIRED_TO_VOTE,
} from './constants.js';
import { t } from './locale.js';

const allTriggers = [...RATING_POSITIVE_TRIGGERS, ...RATING_NEGATIVE_TRIGGERS];

export class RatingCommand {
  constructor(private readonly userRepository: UserRepository) {}

  public static TRIGGERS = [...allTriggers, ...allTriggers.map((trigger) => trigger.toLowerCase())];

  private handleCooldown(user: User): void {
    const timeDiffMinutes = differenceInMinutes(new Date(), user.votedAt);

    console.log({ timeDiffMinutes, user, now: new Date() });

    if (timeDiffMinutes < RATING_COOLDOWN_MINUTES) {
      const timeUntilResetMinutes = RATING_COOLDOWN_MINUTES - timeDiffMinutes || 1;

      throw new CommandError(`${t.timeoutText()} \n ${t.timeoutMinutes({ minutes: timeUntilResetMinutes })}`);
    }
  }

  private async vote(userFrom: User, userTo: User, type: 'positive' | 'negative'): Promise<string> {
    this.handleCooldown(userFrom);

    // check if user has enough rating
    if (userFrom.rating < RATING_REQUIRED_TO_VOTE) {
      throw new CommandError(t.ratingNotEnough({ rating: RATING_REQUIRED_TO_VOTE }));
    }

    // give vote
    userFrom.votedAt = new Date();

    const oldRaterRating = userFrom.rating;
    const oldRateeRating = userTo.rating;

    if (type === 'positive') {
      userTo.rating += userFrom.rateAmount;
      userFrom.rating -= userFrom.rateAmount * RATING_POSITIVE_ADJUST_MULTIPLIER_FOR_RATER;

      await this.userRepository.updateBatch([userFrom, userTo]);

      return t.votedPositive({
        oldRaterRating,
        newRaterRating: userFrom.rating,
        oldRateeRating,
        newRateeRating: userTo.rating,
        raterName: userFrom.displayName,
        rateeName: userTo.displayName,
      });
    } else {
      userTo.rating -= userFrom.rateAmount;
      userFrom.rating -= userFrom.rateAmount * RATING_NEGATIVE_ADJUST_MULTIPLIER_FOR_RATER;

      await this.userRepository.updateBatch([userFrom, userTo]);

      return t.votedNegative({
        oldRaterRating,
        newRaterRating: userFrom.rating,
        oldRateeRating,
        newRateeRating: userTo.rating,
        raterName: userFrom.displayName,
        rateeName: userTo.displayName,
      });
    }
  }

  async execute(
    text: string,
    userFrom: TelegramUser,
    userTo: TelegramUser,
    chat: TelegramAbstractChat,
  ): Promise<string> {
    try {
      const voteType = RATING_POSITIVE_TRIGGERS.includes(text.toUpperCase()) ? 'positive' : 'negative';

      restrictToReplyMyself(
        userFrom,
        userTo,
        voteType === 'positive' ? t.selfVoteErrorPositive() : t.selfVoteErrorNegative(),
      );

      const [rater, ratee] = await Promise.all([
        this.userRepository.upsertFromTelegramUser(userFrom, chat),
        this.userRepository.upsertFromTelegramUser(userTo, chat),
      ]);

      return await this.vote(rater, ratee, voteType);
    } catch (error: unknown) {
      if (error instanceof CommandError) {
        return error.message;
      }

      throw error;
    }
  }
}
