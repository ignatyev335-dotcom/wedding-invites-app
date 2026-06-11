import { Context } from 'grammy';

/**
 * Handle new users who start the bot from a shared invitation link
 * e.g., t.me/BotName?start=INVITE_SLUG
 */
export async function handleStartWithPayload(ctx: Context) {
  const payload = ctx.match as string;

  if (!payload) {
    // Regular /start without payload - handled in commands/index.ts
    return;
  }

  const webAppUrl = process.env.WEBAPP_URL;

  if (!webAppUrl) {
    console.error('[Bot] WEBAPP_URL is not defined in environment');
    await ctx.reply('⚠️ Произошла ошибка конфигурации.');
    return;
  }

  // Payload contains the invitation slug
  const inviteSlug = payload;
  const guestUrl = `${webAppUrl}?invite=${inviteSlug}`;

  await ctx.reply(
    '💌 Вас пригласили на свадьбу!\n\n' +
      'Нажмите кнопку ниже, чтобы открыть приглашение:',
    {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '💌 Открыть приглашение',
              web_app: { url: guestUrl },
            },
          ],
        ],
      },
    }
  );
}
