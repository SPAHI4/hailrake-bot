import { differenceInMinutes } from 'date-fns';

import { UserRepository } from '../../infra/repo/UserRepository.js';
import { User } from '../../domain/entities/User.js';
import { TelegramUser } from '../../dto/TelegramUser.js';
import { TelegramAbstractChat } from '../../dto/TelegramChat.js';
import { CommandError } from '../CommandError.js';
import { restrictToReplyMyself } from '../../middlewares/restrictToReplyMyself.js';
import { HtmlResponse } from '../HtmlResponse.js';
import { ImageResponse } from '../ImageResponse.js';
import { TelegramResponse } from '../TelegramResponse.js';

import {
  RATING_CHANCE_BLADEMAIL,
  RATING_CHANCE_DAEDALUS,
  RATING_CHANCE_MEKANSM,
  RATING_CHANCE_VANGUARD,
  RATING_COOLDOWN_MINUTES,
  RATING_CRIT_MULTIPLIER,
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

    if (timeDiffMinutes < RATING_COOLDOWN_MINUTES) {
      const timeUntilResetMinutes = RATING_COOLDOWN_MINUTES - timeDiffMinutes || 1;

      throw new CommandError(`${t.timeoutText()} \n ${t.timeoutMinutes({ minutes: timeUntilResetMinutes })}`);
    }
  }

  // handle bonuses
  // blademail: returns 100% of the damage taken to the attacker (user who voted negative), chance 50%
  // vanguard: reduces the damage taken by 30%
  // mekansm: heals votee by 30% additional rating

  handlePositiveSpells(userFrom: User, userTo: User) {
    const oldRaterRating = userFrom.rating;
    const oldRateeRating = userTo.rating;

    // mekansm
    if (Math.random() < RATING_CHANCE_MEKANSM) {
      userTo.rating += userFrom.rateAmount * 1.3;
      userFrom.rating -= userFrom.rateAmount * RATING_POSITIVE_ADJUST_MULTIPLIER_FOR_RATER;

      return new ImageResponse(
        'dota2/mekansm.png',
        t.votedPositiveMekansm({
          oldRaterRating,
          newRaterRating: userFrom.rating,
          oldRateeRating,
          newRateeRating: userTo.rating,
          raterName: userFrom.displayName,
          rateeName: userTo.displayName,
        }),
      );
    }

    return null;
  }

  handleNegativeSpells(userFrom: User, userTo: User) {
    const oldRaterRating = userFrom.rating;
    const oldRateeRating = userTo.rating;

    // blademail
    if (Math.random() < RATING_CHANCE_BLADEMAIL) {
      userFrom.rating -= userFrom.rateAmount;
      userTo.rating -= userFrom.rateAmount;

      return new ImageResponse(
        'dota2/blademail.png',
        t.votedNegativeBlademail({
          oldRaterRating,
          newRaterRating: userFrom.rating,
          oldRateeRating,
          newRateeRating: userTo.rating,
          raterName: userFrom.displayName,
          rateeName: userTo.displayName,
        }),
      );
    }

    // vanguard
    if (Math.random() < RATING_CHANCE_VANGUARD) {
      userFrom.rating -= userFrom.rateAmount * RATING_NEGATIVE_ADJUST_MULTIPLIER_FOR_RATER;
      userTo.rating -= userFrom.rateAmount * 0.7;

      return new ImageResponse(
        'dota2/vanguard.png',
        t.votedNegativeVanuard({
          oldRaterRating,
          newRaterRating: userFrom.rating,
          oldRateeRating,
          newRateeRating: userTo.rating,
          raterName: userFrom.displayName,
          rateeName: userTo.displayName,
        }),
      );
    }

    // daedalus
    if (Math.random() < RATING_CHANCE_DAEDALUS) {
      userFrom.rating -= userFrom.rateAmount * RATING_NEGATIVE_ADJUST_MULTIPLIER_FOR_RATER;
      userTo.rating -= userFrom.rateAmount * RATING_CRIT_MULTIPLIER;

      return new ImageResponse(
        'dota2/daedalus.png',
        t.votedNegativeDaedalus({
          oldRaterRating,
          newRaterRating: userFrom.rating,
          oldRateeRating,
          newRateeRating: userTo.rating,
          raterName: userFrom.displayName,
          rateeName: userTo.displayName,
        }),
      );
    }

    return null;
  }

  private async handleNegative(userFrom: User, userTo: User) {
    const oldRaterRating = userFrom.rating;
    const oldRateeRating = userTo.rating;

    userTo.rating -= userFrom.rateAmount;
    userFrom.rating -= userFrom.rateAmount * RATING_NEGATIVE_ADJUST_MULTIPLIER_FOR_RATER;

    await this.userRepository.updateBatch([userFrom, userTo]);

    return new HtmlResponse(
      t.votedNegative({
        oldRaterRating,
        newRaterRating: userFrom.rating,
        oldRateeRating,
        newRateeRating: userTo.rating,
        raterName: userFrom.displayName,
        rateeName: userTo.displayName,
      }),
    );
  }

  private async handlePositive(userFrom: User, userTo: User) {
    const oldRaterRating = userFrom.rating;
    const oldRateeRating = userTo.rating;

    userTo.rating += userFrom.rateAmount;
    userFrom.rating -= userFrom.rateAmount * RATING_POSITIVE_ADJUST_MULTIPLIER_FOR_RATER;

    await this.userRepository.updateBatch([userFrom, userTo]);

    return new HtmlResponse(
      t.votedPositive({
        oldRaterRating,
        newRaterRating: userFrom.rating,
        oldRateeRating,
        newRateeRating: userTo.rating,
        raterName: userFrom.displayName,
        rateeName: userTo.displayName,
      }),
    );
  }

  private async vote(userFrom: User, userTo: User, type: 'positive' | 'negative') {
    // give vote
    userFrom.votedAt = new Date();

    if (type === 'positive') {
      const spellsResult = this.handlePositiveSpells(userFrom, userTo);

      if (spellsResult) {
        await this.userRepository.updateBatch([userFrom, userTo]);

        return spellsResult;
      }

      return this.handlePositive(userFrom, userTo);
    } else {
      // negative
      const spellsResult = this.handleNegativeSpells(userFrom, userTo);

      if (spellsResult) {
        await this.userRepository.updateBatch([userFrom, userTo]);

        return spellsResult;
      }

      return this.handleNegative(userFrom, userTo);
    }
  }

  async execute(
    text: string,
    userFrom: TelegramUser,
    userTo: TelegramUser,
    chat: TelegramAbstractChat,
  ): Promise<TelegramResponse> {
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

      this.handleCooldown(rater);

      // check if user has enough rating
      if (rater.rating < RATING_REQUIRED_TO_VOTE) {
        throw new CommandError(t.ratingNotEnough({ rating: RATING_REQUIRED_TO_VOTE }));
      }

      return await this.vote(rater, ratee, voteType);
    } catch (error: unknown) {
      if (error instanceof CommandError) {
        return new HtmlResponse(error.message);
      }

      throw error;
    }
  }
}
