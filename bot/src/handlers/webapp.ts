import { Bot, Context } from 'grammy';
import api from '../utils/api';

/**
 * Interface for data received from the Mini App
 */
interface WebAppData {
  type: string;
  [key: string]: any;
}

/**
 * Register handlers for web_app_data messages from the Mini App
 */
export function registerWebappHandlers(bot: Bot) {
  // Handle data sent from the Mini App
  bot.on('message:web_app_data', async (ctx) => {
    try {
      const rawData = ctx.message.web_app_data.data;
      let data: WebAppData;

      try {
        data = JSON.parse(rawData);
      } catch (parseErr) {
        console.error('[WebApp] Failed to parse web_app_data:', rawData);
        await ctx.reply(
          '⚠️ Ошибка обработки данных. Пожалуйста, попробуйте снова.'
        );
        return;
      }

      console.log('[WebApp] Received data:', { type: data.type });

      switch (data.type) {
        case 'invite_created':
          await handleInviteCreated(ctx, data);
          break;

        case 'guests_added':
          await handleGuestsAdded(ctx, data);
          break;

        case 'payment_success':
          await handlePaymentSuccess(ctx, data);
          break;

        case 'payment_canceled':
          await handlePaymentCanceled(ctx, data);
          break;

        default:
          console.warn('[WebApp] Unknown data type:', data.type);
          await ctx.reply('⚠️ Неизвестный тип данных от приложения.');
      }
    } catch (err) {
      console.error('[WebApp] Error handling web_app_data:', err);
      await ctx.reply(
        '⚠️ Произошла ошибка. Пожалуйста, попробуйте позже.'
      );
    }
  });
}

/**
 * Handle invite_created event from Mini App
 */
async function handleInviteCreated(ctx: Context, data: WebAppData) {
  const inviteId = data.inviteId;

  if (!inviteId) {
    console.error('[WebApp] invite_created: missing inviteId');
    await ctx.reply('⚠️ Ошибка: ID приглашения не получен.');
    return;
  }

  await ctx.reply(
    `🎉 Приглашение создано!\n\n` +
      `Теперь добавьте гостей, чтобы отправить им персональные приглашения:`,
    {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '👥 Добавить гостей',
              callback_data: `add_guests:${inviteId}`,
            },
          ],
          [
            {
              text: '✏️ Редактировать приглашение',
              callback_data: `edit_invite:${inviteId}`,
            },
          ],
        ],
      },
    }
  );
}

/**
 * Handle guests_added event from Mini App
 */
async function handleGuestsAdded(ctx: Context, data: WebAppData) {
  const inviteId = data.inviteId;
  const count = data.count || 0;

  if (!inviteId) {
    console.error('[WebApp] guests_added: missing inviteId');
    await ctx.reply('⚠️ Ошибка: ID приглашения не получен.');
    return;
  }

  await ctx.reply(
    `✅ Гости добавлены (${count} чел.)\n\n` +
      `Готовы отправить приглашения гостям?`,
    {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '📤 Отправить приглашения',
              callback_data: `send:${inviteId}`,
            },
          ],
          [
            {
              text: '👥 Добавить ещё гостей',
              callback_data: `add_guests:${inviteId}`,
            },
          ],
        ],
      },
    }
  );
}

/**
 * Handle payment_success event from Mini App
 */
async function handlePaymentSuccess(ctx: Context, data: WebAppData) {
  const tariff = data.tariff || 'неизвестный';

  await ctx.reply(
    `✅ Оплата прошла успешно!\n\n` +
      `💎 Тариф «${tariff}» активен.\n` +
      `Теперь у вас есть полный доступ ко всем функциям!`,
    {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '⬅️ Вернуться к приглашению',
              web_app: { url: process.env.WEBAPP_URL! },
            },
          ],
        ],
      },
    }
  );
}

/**
 * Handle payment_canceled event from Mini App
 */
async function handlePaymentCanceled(ctx: Context, _data: WebAppData) {
  await ctx.reply(
    `❌ Оплата отменена.\n\n` +
      `Не беспокойтесь — вы можете попробовать снова в любое время.`,
    {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '🔄 Попробовать снова',
              web_app: { url: process.env.WEBAPP_URL! },
            },
          ],
          [
            {
              text: '💡 Узнать о тарифах',
              callback_data: 'show_tariffs',
            },
          ],
        ],
      },
    }
  );
}
