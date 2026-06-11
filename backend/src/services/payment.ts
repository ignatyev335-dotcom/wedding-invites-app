import YooKassa from 'yookassa-ts/lib/yookassa';
import { Tariff } from '@prisma/client';

// Validate required environment variables
const shopId = process.env.YOOKASSA_SHOP_ID;
const secretKey = process.env.YOOKASSA_SECRET_KEY;

if (!shopId || !secretKey) {
  console.warn('[YooKassa] Missing environment variables: YOOKASSA_SHOP_ID or YOOKASSA_SECRET_KEY');
}

/**
 * YooKassa payment client instance.
 * Configured with shop credentials from environment variables.
 */
export const yookassa = new YooKassa({
  shopId: shopId || '',
  secretKey: secretKey || '',
});

/**
 * Creates a new payment in YooKassa.
 *
 * @param userId - The internal user ID
 * @param amount - Payment amount in rubles
 * @param tariff - Selected tariff plan
 * @returns YooKassa payment object with confirmation URL
 */
export async function createPayment(userId: number, amount: number, tariff: Tariff) {
  if (!shopId || !secretKey) {
    throw new Error('YooKassa credentials not configured');
  }

  const frontendUrl = process.env.FRONTEND_URL || 'https://wedding-app.ru';

  const payment = await yookassa.createPayment({
    amount: {
      value: amount.toFixed(2),
      currency: 'RUB',
    },
    capture: true,
    confirmation: {
      type: 'redirect',
      return_url: `${frontendUrl}/payment/success`,
    },
    metadata: {
      userId: String(userId),
      tariff,
    },
    description: `Тариф ${tariff} для свадебных приглашений`,
  });

  return payment;
}

/**
 * Handles YooKassa webhook notifications.
 * Processes payment.succeeded and payment.canceled events.
 *
 * @param payload - The webhook payload from YooKassa
 * @returns Object with action type and associated data
 */
export async function handleWebhook(payload: any): Promise<{
  event: 'success' | 'canceled' | 'refunded' | 'unknown';
  userId?: number;
  tariff?: Tariff;
  yookassaId?: string;
  amount?: number;
}> {
  const eventType = payload?.event;
  const paymentObject = payload?.object;

  if (!paymentObject?.metadata?.userId) {
    return { event: 'unknown' };
  }

  const userId = Number(paymentObject.metadata.userId);
  const tariff = paymentObject.metadata.tariff as Tariff;
  const yookassaId = String(paymentObject.id);
  const amount = Math.round(parseFloat(paymentObject.amount.value) * 100);

  if (eventType === 'payment.succeeded') {
    return {
      event: 'success',
      userId,
      tariff,
      yookassaId,
      amount,
    };
  }

  if (eventType === 'payment.canceled') {
    return {
      event: 'canceled',
      userId,
      tariff,
      yookassaId,
      amount,
    };
  }

  if (eventType === 'payment.refunded') {
    return {
      event: 'refunded',
      userId,
      yookassaId,
    };
  }

  return { event: 'unknown' };
}

/**
 * Maps tariff name to its price in rubles.
 */
export function getTariffPrice(tariff: Tariff): number {
  switch (tariff) {
    case 'LIGHT':
      return 499;
    case 'PREMIUM':
      return 999;
    case 'FREE':
    default:
      return 0;
  }
}
