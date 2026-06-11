/**
 * Telegram Bot notification service.
 * Sends messages to users via the Telegram Bot API.
 */

const BOT_TOKEN = process.env.BOT_TOKEN;
const BOT_API_BASE = 'https://api.telegram.org/bot';

/**
 * Send a text message to a Telegram user.
 */
async function sendMessage(telegramId: string, text: string, options?: any): Promise<boolean> {
  if (!BOT_TOKEN) {
    console.warn('[Bot] BOT_TOKEN not configured, skipping message');
    return false;
  }

  try {
    const response = await fetch(`${BOT_API_BASE}${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: telegramId,
        text,
        parse_mode: 'HTML',
        ...options,
      }),
    });

    if (!response.ok) {
      console.error(`[Bot] Failed to send message: ${response.statusText}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[Bot] Error sending message:', error);
    return false;
  }
}

/**
 * Notify user about successful payment and tariff activation.
 */
export async function notifyPaymentSuccess(
  telegramId: string,
  tariff: string,
  amount: number
): Promise<void> {
  const text = [
    '\u2705 <b>Оплата успешна!</b>',
    '',
    `\uD83D\uDC8D Ваш тариф <b>${tariff}</b> активирован.`,
    `\uD83D\uDCB0 Сумма оплаты: <b>${(amount / 100).toFixed(2)} \u20BD</b>`,
    '',
    'Теперь вы можете пользоваться всеми возможностями выбранного тарифа.',
    '\uD83D\uDC89 Создайте свое первое приглашение прямо сейчас!',
  ].join('\n');

  await sendMessage(telegramId, text);
}

/**
 * Notify user about canceled payment.
 */
export async function notifyPaymentCanceled(
  telegramId: string,
  tariff: string
): Promise<void> {
  const text = [
    '\u274C <b>Оплата отменена</b>',
    '',
    `Оплата тарифа <b>${tariff}</b> была отменена.`,
    '',
    'Если у вас возникли вопросы, обратитесь в поддержку.',
    'Вы можете попробовать снова в любое время.',
  ].join('\n');

  await sendMessage(telegramId, text);
}

/**
 * Notify user that their invite has been sent to guests.
 */
export async function notifyInviteSent(
  telegramId: string,
  slug: string,
  guestCount: number
): Promise<void> {
  const webappUrl = process.env.WEBAPP_URL || 'https://wedding-app.ru';
  const text = [
    '\uD83D\uDCE8 <b>Приглашения отправлены!</b>',
    '',
    `\uD83D\uDC65 Отправлено гостям: <b>${guestCount}</b>`,
    '',
    `\uD83D\uDC8E Ссылка на ваше приглашение:`,
    `<a href="${webappUrl}/invite/${slug}">${webappUrl}/invite/${slug}</a>`,
    '',
    '\uD83D\uDCCA Отслеживайте ответы гостей в разделе аналитики.',
  ].join('\n');

  await sendMessage(telegramId, text, {
    disable_web_page_preview: false,
  });
}

/**
 * Notify user about a new RSVP response from a guest.
 */
export async function notifyNewRsvp(
  telegramId: string,
  guestName: string,
  status: string,
  message?: string
): Promise<void> {
  const statusMap: Record<string, string> = {
    PENDING: '\u23F3 Ожидает ответа',
    ATTENDING: '\u2705 Будет присутствовать',
    NOT_ATTENDING: '\u274C Не сможет присутствовать',
    MAYBE: '\uD83E\uDD14 Возможно',
  };

  const text = [
    '\uD83D\uDCEC <b>Новый ответ от гостя!</b>',
    '',
    `\uD83D\uDC64 Гость: <b>${guestName}</b>`,
    `\uD83D\uDCCC Статус: <b>${statusMap[status] || status}</b>`,
  ];

  if (message) {
    text.push('', `\uD83D\uDCAC Сообщение: <i>${message}</i>`);
  }

  await sendMessage(telegramId, text.join('\n'));
}

/**
 * Send a test notification to verify bot connectivity.
 */
export async function sendTestNotification(telegramId: string): Promise<boolean> {
  return sendMessage(
    telegramId,
    '\uD83D\uDC8D <b>Wedding Invites Bot</b> \uD83D\uDC8D\n\nБот настроен и готов к работе! Вы будете получать уведомления о платежах и ответах гостей.'
  );
}
