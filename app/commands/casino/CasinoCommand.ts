import { differenceInMinutes } from 'date-fns';

import { UserRepository } from '../../infra/repo/UserRepository.js';
import { User } from '../../domain/entities/User.js';
import { TelegramUser } from '../../dto/TelegramUser.js';
import { TelegramAbstractChat } from '../../dto/TelegramChat.js';
import { CommandError } from '../CommandError.js';
import { HtmlResponse } from '../HtmlResponse.js';

import { t } from './locale.js';
import {
  CASINO_COOLDOWN_MINUTES,
  CASINO_DEFAULT_BET,
  CASINO_DELAY_FIRST_SECONDS,
  CASINO_DELAY_SECOND_SECONDS,
  CASINO_REQUIRED_RATING,
  CASINO_VABANK_TRIGGERS,
  CASINO_WIN_CHANCE,
} from './constants.js';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class CasinoCommand {
  constructor(private readonly userRepository: UserRepository) {}

  private checkCooldown(user: User): void {
    const timeDiff = differenceInMinutes(new Date(), user.playedCasinoAt);

    console.log({
      timeDiff,
      CASINO_COOLDOWN_MINUTES,
      now: new Date(),
      lastPlayed: user.playedCasinoAt,
    });

    if (timeDiff < CASINO_COOLDOWN_MINUTES) {
      throw new CommandError(`${t.timeoutText()} ${t.timeoutMinutes({ minutes: CASINO_COOLDOWN_MINUTES - timeDiff })}`);
    }
  }

  private checkRating(user: User): void {
    if (CASINO_REQUIRED_RATING > user.rating) {
      throw new CommandError(t.ratingNotEnough({ required: CASINO_REQUIRED_RATING, current: user.rating }));
    }
  }

  private async updateUser(user: User): Promise<void> {
    user.playedCasinoAt = new Date();

    await this.userRepository.updateBatch([user]);
  }

  private calculateBet(user: User, betArg: string | null): number {
    const maxBet = Math.floor(user.rating * 0.33);

    if (betArg && CASINO_VABANK_TRIGGERS.includes(betArg)) {
      return maxBet;
    }

    const bet = Math.abs(Math.round(Number(betArg)));

    if (bet > maxBet) {
      throw new CommandError(t.maxBetExceeded({ maxBet }));
    }

    return bet || CASINO_DEFAULT_BET;
  }

  private async handleResult(user: User, isWin: boolean, bet: number) {
    let message: string;
    if (isWin) {
      // const winAmount = bet * random(2, 4);
      const winAmount = bet;
      user.rating += winAmount;

      message = t.win({ winAmount, all: user.rating, mention: user.tgMention });
      // t.winBonus({ win: winAmount, all: user.rating, mention: user.tgMention }),
    } else {
      // const loseAmount = bet * random(2, 4);
      const loseAmount = bet;
      user.rating -= loseAmount;

      message = t.lose({ loseAmount, all: user.rating, mention: user.tgMention });
      // t.loseBonus({ lose: loseAmount, all: user.rating, mention: user.tgMention }),
    }

    await this.updateUser(user);

    return new HtmlResponse(message);
  }

  async *execute(text: string, tgUser: TelegramUser, chat: TelegramAbstractChat) {
    const user = await this.userRepository.upsertFromTelegramUser(tgUser, chat);

    try {
      this.checkCooldown(user);

      this.checkRating(user);
    } catch (error: unknown) {
      if (error instanceof CommandError) {
        yield new HtmlResponse(error.message);

        return;
      }

      throw error;
    }

    const [_, betArg = null] = text.split(' ');
    const bet = this.calculateBet(user, betArg);

    await this.updateUser(user); // update last played time now

    yield new HtmlResponse(t.start({ bet }));

    await sleep(CASINO_DELAY_FIRST_SECONDS * 1000);

    yield new HtmlResponse(t.beforeResult());

    await sleep(CASINO_DELAY_SECOND_SECONDS * 1000);

    const isWin = Math.random() < CASINO_WIN_CHANCE;

    yield await this.handleResult(user, isWin, bet);
  }
}
