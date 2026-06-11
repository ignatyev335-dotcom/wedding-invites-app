import { Bot, Context } from 'grammy';
import api from '../utils/api';

/**
 * Register all callback query handlers
 */
export function registerCallbackHandlers(bot: Bot) {
  // Send invitations to all guests
  bot.callbackQuery(/send:(\d+)/, async (ctx) => {
    const inviteId = parseInt(ctx.match[1], 10);

    await ctx.answerCallbackQuery({
      text: '📤 Начинаем отправку приглашений...',
    });

    try {
      // Get invitation details and guests list from API
      const { data: invite } = await api.get(`/invites/${inviteId}`);
      const { data: guests } = await api.get(`/invites/${inviteId}/guests`);

      if (!guests || guests.length === 0) {
        await ctx.reply(
          '⚠️ Нет гостей для отправки. Добавьте гостей сначала.',
          {
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: '👥 Добавить гостей',
                    callback_data: `add_guests:${inviteId}`,
                  },
                ],
              ],
            },
          }
        );
        return;
      }

      let sent = 0;
      let failed = 0;
      const failedGuests: string[] = [];

      for (const guest of guests) {
        try {
          // Generate unique link for each guest
          const guestUrl =
            `${process.env.WEBAPP_URL}?guest=${guest.id}&invite=${invite.slug}`;

          // Format ceremony date
          const ceremonyDate = invite.ceremonyDate
            ? new Date(invite.ceremonyDate).toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })
            : 'дата будет уточнена';

          // Send invitation message to each guest
          await bot.api.sendMessage(
            guest.telegramId,
            `💌 Вас приглашают на свадьбу!\n\n` +
              `${invite.brideName} ❤️ ${invite.groomName}\n` +
              `📅 ${ceremonyDate}\n` +
              `📍 ${invite.ceremonyPlace || 'место будет уточнено'}\n\n` +
              `Нажмите кнопку ниже, чтобы открыть приглашение:`,
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
          sent++;
        } catch (err) {
          failed++;
          failedGuests.push(guest.name || `ID: ${guest.id}`);
          console.error(
            `[Callbacks] Failed to send invitation to guest ${guest.id}:`,
            err
          );
        }
      }

      // Report results
      let resultMessage = `📤 *Результаты отправки:*\n\n`;
      resultMessage += `✅ Успешно отправлено: ${sent}\n`;
      resultMessage += `❌ Не удалось: ${failed}\n`;

      if (failed > 0 && failedGuests.length > 0) {
        resultMessage +=
          `\n⚠️ Не удалось отправить:\n${failedGuests.join('\n')}`;
      }

      await ctx.reply(resultMessage, { parse_mode: 'Markdown' });

      // Update invitation status via API
      try {
        await api.patch(`/invites/${inviteId}/status`, { status: 'SENT' });
      } catch (err) {
        console.error('[Callbacks] Failed to update invitation status:', err);
      }
    } catch (err) {
      console.error('[Callbacks] Error sending invitations:', err);
      await ctx.reply(
        '⚠️ Произошла ошибка при отправке приглашений. Пожалуйста, попробуйте позже.'
      );
    }
  });

  // Open Mini App to add/edit guests
  bot.callbackQuery(/add_guests:(\d+)/, async (ctx) => {
    const inviteId = ctx.match[1];
    const url = `${process.env.WEBAPP_URL}?invite=${inviteId}&tab=guests`;

    await ctx.answerCallbackQuery();
    await ctx.reply('Нажмите кнопку ниже, чтобы добавить гостей:', {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '👥 Добавить гостей',
              web_app: { url },
            },
          ],
        ],
      },
    });
  });

  // Open Mini App to edit invitation
  bot.callbackQuery(/edit_invite:(\d+)/, async (ctx) => {
    const inviteId = ctx.match[1];
    const url = `${process.env.WEBAPP_URL}?invite=${inviteId}&tab=edit`;

    await ctx.answerCallbackQuery();
    await ctx.reply('Нажмите кнопку ниже, чтобы отредактировать приглашение:', {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '✏️ Редактировать приглашение',
              web_app: { url },
            },
          ],
        ],
      },
    });
  });

  // Show tariff information
  bot.callbackQuery('show_tariffs', async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.reply(
      `💡 *Тарифы Wedding Invites*\n\n` +
        `🆓 *Бесплатный* — 1 приглашение, до 10 гостей\n` +
        `💎 *Базовый* — безлимит приглашений, до 50 гостей\n` +
        `👑 *Премиум* — безлимит всего, аналитика RSVP\n\n` +
        `Выберите тариф в приложении:`,
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '💎 Выбрать тариф',
                web_app: { url: `${process.env.WEBAPP_URL}?tab=tariffs` },
              },
            ],
          ],
        },
      }
    );
  });

  // Handle unknown callback queries
  bot.on('callback_query:data', async (ctx) => {
    console.warn('[Callbacks] Unknown callback query:', ctx.callbackQuery.data);
    await ctx.answerCallbackQuery({ text: '⚠️ Неизвестная команда' });
  });
}

/**
 * Notify the invitation creator about a guest's RSVP response
 *
 * @param inviteId - ID of the invitation
 * @param guestName - Name of the guest who responded
 * @param status - RSVP status (ATTENDING, NOT_ATTENDING, MAYBE)
 */
export async function notifyRsvp(
  inviteId: number,
  guestName: string,
  status: string
) {
  const statusText: Record<string, string> = {
    ATTENDING: '✅ Буду!',
    NOT_ATTENDING: '❌ Не смогу',
    MAYBE: '🤔 Пока не уверен',
  };

  const statusEmoji: Record<string, string> = {
    ATTENDING: '🟢',
    NOT_ATTENDING: '🔴',
    MAYBE: '🟡',
  };

  try {
    const { data: invite } = await api.get(`/invites/${inviteId}`);

    if (!invite.user?.telegramId) {
      console.error(
        '[Callbacks] Cannot notify RSVP: creator telegramId not found'
      );
      return;
    }

    const emoji = statusEmoji[status] || '⚪';
    const text = statusText[status] || status;

    await api.post('/notifications/send', {
      telegramId: invite.user.telegramId,
      message:
        `📬 *Новый ответ на приглашение*\n\n` +
        `${emoji} *${guestName}* ответил: _${text}_\n\n` +
        `Приглашение: ${invite.brideName} ❤️ ${invite.groomName}`,
      parseMode: 'Markdown',
    });

    console.log(`[Callbacks] RSVP notification sent for guest ${guestName}`);
  } catch (err) {
    console.error('[Callbacks] Failed to notify RSVP:', err);
  }
}

/**
 * Notify the invitation creator about a new RSVP response
 * Uses bot.api directly when api endpoint is not available
 *
 * @param bot - Bot instance for sending messages
 * @param inviteId - ID of the invitation
 * @param guestName - Name of the guest who responded
 * @param status - RSVP status
 */
export async function notifyRsvpDirect(
  bot: Bot,
  inviteId: number,
  guestName: string,
  status: string
) {
  const statusText: Record<string, string> = {
    ATTENDING: '✅ Буду!',
    NOT_ATTENDING: '❌ Не смогу',
    MAYBE: '🤔 Пока не уверен',
  };

  const statusEmoji: Record<string, string> = {
    ATTENDING: '🟢',
    NOT_ATTENDING: '🔴',
    MAYBE: '🟡',
  };

  try {
    const { data: invite } = await api.get(`/invites/${inviteId}`);

    if (!invite.user?.telegramId) {
      console.error(
        '[Callbacks] Cannot notify RSVP: creator telegramId not found'
      );
      return;
    }

    const emoji = statusEmoji[status] || '⚪';
    const text = statusText[status] || status;

    await bot.api.sendMessage(
      invite.user.telegramId,
      `📬 *Новый ответ на приглашение*\n\n` +
        `${emoji} *${guestName}* ответил: _${text}_\n\n` +
        `Приглашение: ${invite.brideName} ❤️ ${invite.groomName}`,
      { parse_mode: 'Markdown' }
    );

    console.log(
      `[Callbacks] RSVP notification sent directly for guest ${guestName}`
    );
  } catch (err) {
    console.error('[Callbacks] Failed to send direct RSVP notification:', err);
  }
}
