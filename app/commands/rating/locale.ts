import { pluralize as plural } from 'numeralize-ru';
import { sample as rand } from 'lodash-es';

import { formatNumbers as num } from '../../utils.js';

interface VoteResultPlaceholders {
  oldRaterRating: number;
  newRaterRating: number;
  oldRateeRating: number;
  newRateeRating: number;
  raterName: string;
  rateeName: string;
}

export const t = {
  timeoutText: () => rand(['НОТ РЕДИ', 'НОТ ЭНАФ МАНА', 'ЗЭТ ВОЗ ЭН ЭРРОР']),

  timeoutMinutes: ({ minutes }: { minutes: number }) =>
    `жди ⏳${minutes} ${plural(minutes, 'минуту', 'минуты', 'минут')}`,

  ratingNotEnough: ({ rating }: { rating: number }) =>
    num`баланс рофлов меньше ${rating}... земля тебе пухом, братишка`,

  votedPositive: (p: VoteResultPlaceholders) =>
    num`<i>${p.raterName}</i> (${p.oldRaterRating}) дал 💲 <b>рофланкойн</b> <i>${p.rateeName}</i> (${p.oldRateeRating} → <b>${p.newRateeRating}</b>)`,

  votedNegative: (p: VoteResultPlaceholders) =>
    num`<i>${p.raterName}</i> (${p.oldRaterRating}) залил соляры <i>${p.rateeName}</i> (${p.oldRateeRating} → <b>${p.newRateeRating}</b>)`,

  selfVoteErrorPositive: () => `найс трай, очередняра`,
  selfVoteErrorNegative: () => `Ты что, долбоеб? Нажмите на паузу, у вас долбоеб cам себе минусы ставит`,
};
