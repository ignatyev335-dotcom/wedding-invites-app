import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { yookassa, handleWebhook, getTariffPrice } from '../services/payment';
import { notifyPaymentSuccess, notifyPaymentCanceled } from '../services/bot';

const router = Router();
const prisma = new PrismaClient();

/**
 * POST /api/payments/create
 * Create a new payment for tariff upgrade.
 * Requires authentication.
 */
router.post(
  '/create',
  authenticateToken,
  validateBody([
    {
      field: 'tariff',
      required: true,
      type: 'string',
      custom: (value) =>
        ['LIGHT', 'PREMIUM'].includes(value)
          ? true
          : 'tariff must be one of: LIGHT, PREMIUM',
    },
  ]),
  async (req: AuthRequest, res) => {
    try {
      const user = req.user!;
      const { tariff } = req.body;

      // Prevent purchasing same or lower tariff
      const tariffHierarchy: Record<string, number> = {
        FREE: 0,
        LIGHT: 1,
        PREMIUM: 2,
      };

      if (tariffHierarchy[user.tariff] >= tariffHierarchy[tariff]) {
        res.status(400).json({
          error: 'Invalid tariff selection',
          message: `You already have "${user.tariff}" tariff. You can only upgrade to a higher tier.`,
        });
        return;
      }

      const amount = getTariffPrice(tariff as 'LIGHT' | 'PREMIUM');

      // Create payment in database
      const dbPayment = await prisma.payment.create({
        data: {
          userId: user.id,
          amount: amount * 100, // Store in kopecks
          tariff: tariff as 'LIGHT' | 'PREMIUM',
          status: 'PENDING',
        },
      });

      // Create YooKassa payment
      const yookassaPayment = await yookassa.createPayment({
        amount: {
          value: amount.toFixed(2),
          currency: 'RUB',
        },
        capture: true,
        confirmation: {
          type: 'redirect',
          return_url: `${process.env.FRONTEND_URL || 'https://wedding-app.ru'}/payment/success?payment_id=${dbPayment.id}`,
        },
        metadata: {
          userId: String(user.id),
          tariff,
          dbPaymentId: String(dbPayment.id),
        },
        description: `Тариф ${tariff} для свадебных приглашений`,
      });

      // Update payment with YooKassa ID
      await prisma.payment.update({
        where: { id: dbPayment.id },
        data: { yookassaId: yookassaPayment.id },
      });

      res.json({
        payment: {
          id: dbPayment.id,
          amount: amount * 100,
          tariff,
          status: 'PENDING',
          yookassaId: yookassaPayment.id,
        },
        confirmationUrl: yookassaPayment.confirmation.confirmation_url,
      });
    } catch (error) {
      console.error('[Payments] Create error:', error);
      res.status(500).json({ error: 'Failed to create payment' });
    }
  }
);

/**
 * GET /api/payments/my
 * Get payment history for authenticated user.
 */
router.get('/my', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const user = req.user!;

    const payments = await prisma.payment.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ payments });
  } catch (error) {
    console.error('[Payments] List error:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

/**
 * GET /api/payments/:id/status
 * Check payment status.
 */
router.get('/:id/status', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    const paymentId = Number(req.params.id);

    const payment = await prisma.payment.findFirst({
      where: { id: paymentId, userId: user.id },
    });

    if (!payment) {
      res.status(404).json({ error: 'Payment not found' });
      return;
    }

    // If pending, check YooKassa status
    if (payment.status === 'PENDING' && payment.yookassaId) {
      try {
        const yookassaPayment = await yookassa.getPayment(payment.yookassaId);
        res.json({
          payment: {
            id: payment.id,
            amount: payment.amount,
            tariff: payment.tariff,
            status: yookassaPayment.status === 'succeeded' ? 'SUCCESS' : payment.status,
            yookassaId: payment.yookassaId,
            createdAt: payment.createdAt,
          },
        });
        return;
      } catch {
        // Fall through to return DB status
      }
    }

    res.json({
      payment: {
        id: payment.id,
        amount: payment.amount,
        tariff: payment.tariff,
        status: payment.status,
        yookassaId: payment.yookassaId,
        createdAt: payment.createdAt,
      },
    });
  } catch (error) {
    console.error('[Payments] Status error:', error);
    res.status(500).json({ error: 'Failed to check payment status' });
  }
});

/**
 * POST /api/payments/callback
 * YooKassa webhook endpoint.
 * No auth - called by YooKassa servers.
 */
router.post('/callback', async (req, res) => {
  try {
    const payload = req.body;
    console.log('[Payments] Webhook received:', payload.event, payload.object?.id);

    const result = await handleWebhook(payload);

    if (result.event === 'success' && result.userId && result.tariff) {
      // Update payment status
      await prisma.payment.updateMany({
        where: { yookassaId: result.yookassaId },
        data: { status: 'SUCCESS' },
      });

      // Update user tariff
      const updatedUser = await prisma.user.update({
        where: { id: result.userId },
        data: { tariff: result.tariff },
      });

      // Notify user
      await notifyPaymentSuccess(updatedUser.telegramId, result.tariff, result.amount || 0);

      console.log(`[Payments] User ${result.userId} upgraded to ${result.tariff}`);
    }

    if (result.event === 'canceled' && result.userId) {
      await prisma.payment.updateMany({
        where: { yookassaId: result.yookassaId },
        data: { status: 'FAILED' },
      });

      const user = await prisma.user.findUnique({
        where: { id: result.userId },
      });

      if (user && result.tariff) {
        await notifyPaymentCanceled(user.telegramId, result.tariff);
      }

      console.log(`[Payments] Payment ${result.yookassaId} was canceled`);
    }

    if (result.event === 'refunded') {
      await prisma.payment.updateMany({
        where: { yookassaId: result.yookassaId },
        data: { status: 'REFUNDED' },
      });

      console.log(`[Payments] Payment ${result.yookassaId} was refunded`);
    }

    // Always return 200 to YooKassa
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('[Payments] Webhook error:', error);
    // Still return 200 to prevent retries
    res.status(200).json({ received: true, error: 'Processing error logged' });
  }
});

export default router;
