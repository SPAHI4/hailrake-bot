import { Telegraf } from 'telegraf';

import { env } from '../config/env.js';
import { db } from '../infra/drizzle.js';
import { UserRepository } from '../infra/repo/UserRepository.js';
import { RatingCommand } from '../commands/rating/RatingCommand.js';

const bot = new Telegraf(env.BOT_TOKEN);

console.log('Bot starting...');

bot.hears(RatingCommand.TRIGGERS, async (ctx) => {
  await db.transaction(
    async (tx) => {
      if (!ctx.message.reply_to_message?.from) {
        return;
      }

      const userRepository = new UserRepository(tx);

      const ratingCommand = new RatingCommand(userRepository);

      const replyText = await ratingCommand.execute(
        ctx.message.text,
        ctx.from,
        ctx.message.reply_to_message.from,
        ctx.message.chat,
      );

      // @ts-expect-error reply_to_message_id actually exists
      await ctx.replyWithHTML(replyText, { reply_to_message_id: ctx.message.message_id });
    },
    {
      isolationLevel: 'repeatable read',
      accessMode: 'read write',
    },
  );
});

process.once('SIGINT', () => {
  bot.stop('SIGINT');
});

process.once('SIGTERM', () => {
  bot.stop('SIGTERM');
});

void bot.launch();
