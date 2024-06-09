import { Context } from 'telegraf';

export abstract class TelegramCommand {
  abstract execute(ctx: Context): Promise<void>;
}
