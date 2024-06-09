import { bot } from '../bot.js';

process.once('SIGINT', () => {
  bot.stop('SIGINT');
});

process.once('SIGTERM', () => {
  bot.stop('SIGTERM');
});

console.log('Bot starting...');

void bot.launch();
