import { Input, Telegraf } from 'telegraf';

import { env } from './config/env.js';
import { db } from './infra/drizzle.js';
import { UserRepository } from './infra/repo/UserRepository.js';
import { RatingCommand } from './commands/rating/RatingCommand.js';
import { ImageResponse } from './commands/ImageResponse.js';
import { HtmlResponse } from './commands/HtmlResponse.js';
import { CasinoCommand } from './commands/casino/CasinoCommand.js';
import { TopRatingCommand } from './commands/rating/TopRatingCommand.js';
import { ConfigsCommand } from './commands/ConigsCommand.js';

export const bot = new Telegraf(env.BOT_TOKEN);

bot.hears(RatingCommand.TRIGGERS, async (ctx) => {
  console.log('Received update in HEARS:', ctx.update);

  await db
    .transaction(
      async (tx) => {
        console.log('Transaction, message:', ctx.message);

        if (!ctx.message.reply_to_message?.from) {
          return;
        }

        const userRepository = new UserRepository(tx);

        const ratingCommand = new RatingCommand(userRepository);

        const response = await ratingCommand.execute(
          ctx.message.text,
          ctx.from,
          ctx.message.reply_to_message.from,
          ctx.message.chat,
        );

        console.log('Reply:', response.getPayload());

        if (response instanceof ImageResponse) {
          const [path, caption] = response.getPayload();

          await ctx.replyWithPhoto(Input.fromLocalFile(path), {
            caption: caption ?? '',
            parse_mode: 'HTML',
            // @ts-expect-error reply_to_message_id actually exists
            reply_to_message_id: ctx.message.message_id,
          });
        } else if (response instanceof HtmlResponse) {
          await ctx.replyWithHTML(response.getPayload(), {
            // @ts-expect-error reply_to_message_id actually exists
            reply_to_message_id: ctx.message.message_id,
          });
        }
      },
      // {
      //   isolationLevel: 'repeatable read',
      //   accessMode: 'read write',
      // },
    )
    .catch((error: unknown) => {
      console.error('Error in transaction:', error);
    });
});

bot.command(['casino', 'azino777'], async (ctx) => {
  console.log('Received update in COMMAND:', ctx.update);

  const userRepository = new UserRepository(db);

  const casinoCommand = new CasinoCommand(userRepository);

  const commandGenerator = casinoCommand.execute(ctx.message.text, ctx.from, ctx.message.chat);

  for await (const response of commandGenerator) {
    // if (response instanceof ImageResponse) {
    //   const [path, caption] = response.getPayload();
    //
    //   await ctx.replyWithPhoto(Input.fromLocalFile(path), {
    //     caption: caption ?? '',
    //     parse_mode: 'HTML',
    //     // @ts-expect-error reply_to_message_id actually exists
    //     reply_to_message_id: ctx.message.message_id,
    //   });
    // } else if (response instanceof HtmlResponse) {
    await ctx.replyWithHTML(response.getPayload(), {
      // @ts-expect-error reply_to_message_id actually exists
      reply_to_message_id: ctx.message.message_id,
    });
    // }
  }
});

bot.command('topladder', async (ctx) => {
  console.log('Received update in TOP LADDER:', ctx.update);

  const userRepository = new UserRepository(db);

  const ratingCommand = new TopRatingCommand(userRepository);

  const response = await ratingCommand.execute(ctx.message.from, ctx.message.chat);

  await ctx.replyWithHTML(response.getPayload(), {
    // @ts-expect-error reply_to_message_id actually exists
    reply_to_message_id: ctx.message.message_id,
  });
});

bot.command('configs', async (ctx) => {
  const response = new ConfigsCommand().execute();

  await ctx.replyWithHTML(response.getPayload(), {
    // @ts-expect-error reply_to_message_id actually exists
    reply_to_message_id: ctx.message.message_id,
  });
});

// TODO: handle reactions, probably save every message to the database
bot.reaction(['👍', '-👍'], (ctx) => {
  console.log('Received update in REACTION:', ctx.update, ctx.message);
});
