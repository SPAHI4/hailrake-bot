import { UserRepository } from '../../infra/repo/UserRepository.js';
import { TelegramAbstractChat } from '../../dto/TelegramChat.js';
import { HtmlResponse } from '../HtmlResponse.js';
import { User } from '../../domain/entities/User.js';
import { TelegramUser } from '../../dto/TelegramUser.js';

/*
export const topLaddera = async ctx => {
	const topCount = 5;
	const users = await ctx.userRepository
		.createQueryBuilder('user')
		.where('user.chatId = :chatId', { chatId: ctx.message.chat.id })
		.orderBy('user.karma', 'DESC')
		// .setLimit(10)
		.getMany();

	const getUserString = (user, i) => formatFloats`${getIcon(i + 1)} ${String(ctx.message.from.id) === String(user.id) ? `<b>${user.getName()}</b>` : user.getName()} (<b>${user.karma || 0}</b>)`;
	let top = users.map(getUserString);

	let content = top.slice(0, topCount);
	const displayedUsers = [...users.slice(0, topCount), ...users.slice(-3)];
	if (!displayedUsers.some(user => String(user.id) === String(ctx.message.from.id))) {
		const userIndex = users.findIndex(user => String(user.id) === String(ctx.message.from.id));
		if (userIndex !== -1) {
			userIndex > topCount && content.push('...\n');
			content.push(getUserString(users[userIndex], userIndex));
		}
	}

	if (top.length) {
		content.push('...\n Уебаны 1000 ранга 🤢');
		content.push(...top.slice(-3));
	}

	return ctx.replyWithHTML(`Топ-3 ладдера по версии этого чятика:\n\n Имморталы 😎 \n${content.join('\n')}`);
};

const getIcon = i => {
	if (i === 1) {
		return '🥇';
	}
	if (i === 2) {
		return '🥈';
	}
	if (i === 3) {
		return '🥉';
	} else {
		return `${i.toString()}.`;
	}
}

 */

const getIcon = (i: number) => {
  if (i === 1) {
    return '🥇';
  }
  if (i === 2) {
    return '🥈';
  }
  if (i === 3) {
    return '🥉';
  }

  return `${i.toString()}.`;
};

const renderUser = (user: User, index: number, isCurrent: boolean) => {
  const icon = getIcon(index + 1);

  return `${icon} ${isCurrent ? `<b>> ${user.displayName}</b>` : user.displayName} (<b>${user.rating.toLocaleString(
    'ru-RU',
    {
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    },
  )}</b>)`;
};

export class TopRatingCommand {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(tgUser: TelegramUser, tgChat: TelegramAbstractChat) {
    const users = await this.userRepository.findTopRating(tgChat.id);

    const topCount = 5;
    const top = users.map((item, index) => renderUser(item, index, tgUser.id === item.id));

    const content = top.slice(0, topCount);
    const displayedUsers = [...users.slice(0, topCount), ...users.slice(-3)];
    if (!displayedUsers.some((user) => user.id === tgUser.id)) {
      const userIndex = users.findIndex((user) => user.id === tgUser.id);
      if (userIndex !== -1) {
        if (userIndex > topCount) {
          content.push('...\n');
        }
        content.push(renderUser(users[userIndex]!, userIndex, true));
      }
    }

    if (top.length) {
      content.push('...\n Уебаны 1000 ранга 🤢');
      content.push(...top.slice(-3));
    }

    return new HtmlResponse(`Топ-3 ладдера по версии этого чятика:\n\n Титаны 😎 \n${content.join('\n')}`);
  }
}
