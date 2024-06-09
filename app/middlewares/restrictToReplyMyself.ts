import { TelegramUser } from '../dto/TelegramUser.js';
import { CommandError } from '../commands/CommandError.js';

export const restrictToReplyMyself = (
  userFrom: TelegramUser,
  userTo: TelegramUser | undefined,
  errorMessage: string,
) => {
  if (!userTo) {
    return;
  }

  if (userFrom.id === userTo.id) {
    throw new CommandError(errorMessage);
  }
};
