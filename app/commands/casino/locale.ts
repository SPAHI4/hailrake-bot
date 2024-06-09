import { pluralize as plural } from 'numeralize-ru';
import { sample as rand } from 'lodash-es';

import { Dictionary } from '../../Dictionary.js';

const roflancoins = (value: number) => plural(value, 'рофланкойн', 'рофланкойна', 'рофланкойнов');

export const t = {
  timeoutText: () => rand(['НОТ РЕДИ', 'НОТ ЭНАФ МАНА', 'ЗЭТ ВОЗ ЭН ЭРРОР']),

  timeoutMinutes: ({ minutes }: { minutes: number }) =>
    `жди ⏳${minutes} ${plural(minutes, 'минуту', 'минуты', 'минут')}`,

  ratingNotEnough: ({ required, current }: { required: number; current: number }) =>
    `Соре, нужно <b>${required}</b> ${roflancoins(required)}, у тебя <b>${current}</b>`,

  start: ({ bet }: { bet: number }) => `Открываем игру, ставка: ${bet} рофланкойнов`,

  beforeResult: () => 'Такс такс такс...',

  maxBetExceeded: ({ maxBet }: { maxBet: number }) => `Соре, максимальная ставка для тебя: <b>${maxBet}</b>`,

  winBonus: ({ win, all, mention }: { win: number; all: number; mention: string }) =>
    `Ебааать, бонус от Мелстроя! Легчайшие +${win} для ${mention}! Теперь у тебя ${all} рофланкойнов}`,

  win: ({ winAmount, all, mention }: { winAmount: number; all: number; mention: string }) =>
    `ДА ПОЧЕМУУУ БЛЯТЬ! +${winAmount}! Теперь у тебя ${all} рофланкойнов, ${mention}`,

  lose: ({ loseAmount, all, mention }: { loseAmount: number; all: number; mention: string }) =>
    `Изи сабжи для величайшего (меня). -${loseAmount}! У тебя осталось <b>${all}</b> рофланкойнов, ${mention}`,

  loseBonus: ({ lose, all, mention }: { lose: number; all: number; mention: string }) =>
    `Привет! Это Навальный! Спасибо за передачку! -${lose} рофланкойнов, ${mention} (${all})`,
} satisfies Dictionary;
