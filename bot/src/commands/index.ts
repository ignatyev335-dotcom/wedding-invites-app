import { Bot, Context } from 'grammy';

/**
 * Register all bot commands
 */
export function registerCommands(bot: Bot) {
  // /start - Entry point for new users
  bot.command('start', async (ctx) => {
    const webAppUrl = process.env.WEBAPP_URL;

    if (!webAppUrl) {
      console.error('[Bot] WEBAPP_URL is not defined in environment');
      await ctx.reply(
        '⚠️ Произошла ошибка конфигурации. Пожалуйста, попробуйте позже.'
      );
      return;
    }

    await ctx.reply(
      '💍 Создайте свадебное приглашение за 5 минут!\n' +
        'Выберите шаблон, заполните данные, отправьте гостям.',
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '✨ Создать приглашение',
                web_app: { url: webAppUrl },
              },
            ],
          ],
        },
      }
    );
  });

  // /help - Show help information
  bot.command('help', async (ctx) => {
    await ctx.reply(
      '💍 *Wedding Invites Bot*\n\n' +
        '*Доступные команды:*\n' +
        '/start - Начать создание приглашения\n' +
        '/help - Показать эту справку\n\n' +
        '*Как использовать:*\n' +
        '1\. Нажмите «Создать приглашение»\n' +
        '2\. Выберите шаблон и заполните данные\n' +
        '3\. Добавьте гостей\n' +
        '4\. Отправьте приглашения\n\n' +
        'Гости получат персональное приглашение и смогут ответить на RSVP\.',
      { parse_mode: 'MarkdownV2' }
    );
  });

  // /status - Check invitation status (requires inviteId as argument)
  bot.command('status', async (ctx) => {
    const args = ctx.message?.text?.split(' ').slice(1);
    if (!args || args.length === 0) {
      await ctx.reply(
        'ℹ️ Укажите ID приглашения: /status <invite_id>'
      );
      return;
    }

    const inviteId = parseInt(args[0], 10);
    if (isNaN(inviteId)) {
      await ctx.reply('⚠️ ID приглашения должен быть числом.');
      return;
    }

    // Open Mini App with status tab
    const url = `${process.env.WEBAPP_URL}?invite=${inviteId}&tab=status`;

    await ctx.reply(
      `📊 Статус приглашения #${inviteId}:`,
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '👀 Просмотреть статус',
                web_app: { url },
              },
            ],
          ],
        },
      }
    );
  });
}
