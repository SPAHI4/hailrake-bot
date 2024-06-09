export const RATING_REQUIRED_TO_VOTE = -20; // user can't vote if his rating is lower than this value
export const RATING_COOLDOWN_MINUTES = 5; // user can't vote more often than this value

// use 1 as a default value if rating is in normal range (0-10)
export const RATING_AMOUNT_IF_IN_NORMAL_RANGE = 1;
export const RATING_NORMAL_RANGE_MIN = 0;
export const RATING_NORMAL_RANGE_MAX = 10;

// if rating is negative then rating value is this
export const RATING_AMOUNT_IF_NEGATIVE = 0.1;

// charge user with some rating as a fee for voting by multiplying voteValue by this value
export const RATING_POSITIVE_ADJUST_MULTIPLIER_FOR_RATER = 0.2;
export const RATING_NEGATIVE_ADJUST_MULTIPLIER_FOR_RATER = 0.2;

export const RATING_POSITIVE_TRIGGERS = [
  '+',
  'СПС',
  'ДЯКУЮ',
  'ОРУ',
  '🗡ОРУ🗡',
  'LUL',
  'ПЛЮС',
  '👍',
  'ТУПА ЛИКЕ',
  'ТУТ СЫГЛЫ',
  'ТУТ СЫГЛЫ+++',
  'КЛЕВЫЙ НИК',
  'СПРАВЕДЛИВО',
  'СОГЛЫ',
  'СОЛИДАРЕН',
  'roflanOru',
  'ИЗВЕНИ',
  'ИЗВИНИ',
  'ОТ ДУШИ',
  'БЛАГОДАРЮ',
  'ТУТ СОГЛЫ',
  'СПАСИБО',
  'СПАСИБКИ',
  'БЛАГОДАРЕН',
  'СОГЛАСЕН',
  'ПЛЮС',
  'ПОДТВЕРЖДАЮ',
  'SPS',
  'TY',
  'THX',
  'ХЕХ',
  'БАЗА',
];

export const RATING_NEGATIVE_TRIGGERS = [
  '-',
  'МИНУС',
  'СОСИ',
  'ДЕБИЛ',
  'ДИНАХ',
  '👎',
  'САСАТ',
  'ДЕБИК',
  'ИМБЕЦИЛ',
  'САСАТЬ',
  'САСИ',
  'УЕБИЩЕ',
  'ГАНДОН',
  'ГОНДОН',
  'УБЛЮДОК',
  'ДАУН',
  'МИНУС',
  'ТУПА МИНУС',
  'МРАКОБЕС',
  'ЕБЛАН',
  'АВТОР ЕБЛАН',
  'РАССКАЖЕШЬ',
];
