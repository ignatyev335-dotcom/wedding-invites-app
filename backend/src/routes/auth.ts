import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { validateTelegramData, extractTelegramUser } from '../utils/telegram';
import { validateBody } from '../middleware/validate';

const router = Router();
const prisma = new PrismaClient();

/**
 * POST /api/auth/telegram
 * Authenticate via Telegram WebApp initData.
 *
 * Body: { initData: string }
 * Response: { token: string, user: User }
 *
 * Validates the HMAC signature from Telegram, creates or updates
 * the user in the database, and returns a JWT token.
 */
router.post(
  '/telegram',
  validateBody([
    { field: 'initData', required: true, type: 'string', min: 10 },
  ]),
  async (req, res) => {
    try {
      const { initData } = req.body;
      const botToken = process.env.BOT_TOKEN;
      const jwtSecret = process.env.JWT_SECRET;

      if (!botToken) {
        res.status(500).json({ error: 'Bot token not configured' });
        return;
      }

      if (!jwtSecret) {
        res.status(500).json({ error: 'JWT secret not configured' });
        return;
      }

      // Validate Telegram WebApp signature
      const isValid = validateTelegramData(initData, botToken);
      if (!isValid) {
        res.status(401).json({ error: 'Invalid Telegram initData signature' });
        return;
      }

      // Extract user info from initData
      const telegramUser = extractTelegramUser(initData);
      if (!telegramUser) {
        res.status(400).json({ error: 'Could not extract user data from initData' });
        return;
      }

      // Upsert user in database
      const user = await prisma.user.upsert({
        where: { telegramId: telegramUser.id },
        update: {
          username: telegramUser.username || null,
          firstName: telegramUser.firstName || null,
          lastName: telegramUser.lastName || null,
        },
        create: {
          telegramId: telegramUser.id,
          username: telegramUser.username || null,
          firstName: telegramUser.firstName || null,
          lastName: telegramUser.lastName || null,
        },
      });

      // Generate JWT token
      const token = jwt.sign(
        {
          userId: user.id,
          telegramId: user.telegramId,
          tariff: user.tariff,
        },
        jwtSecret,
        { expiresIn: '30d' }
      );

      res.json({
        token,
        user: {
          id: user.id,
          telegramId: user.telegramId,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          tariff: user.tariff,
          createdAt: user.createdAt,
        },
      });
    } catch (error) {
      console.error('[Auth] Telegram auth error:', error);
      res.status(500).json({ error: 'Authentication failed' });
    }
  }
);

/**
 * GET /api/auth/me
 * Get current authenticated user info.
 *
 * Headers: Authorization: Bearer <token>
 * Response: { user: User }
 */
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const token = authHeader.substring(7);
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      res.status(500).json({ error: 'JWT secret not configured' });
      return;
    }

    const decoded = jwt.verify(token, jwtSecret) as { userId: number };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        _count: {
          select: { invites: true, payments: true },
        },
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      user: {
        id: user.id,
        telegramId: user.telegramId,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        tariff: user.tariff,
        createdAt: user.createdAt,
        inviteCount: user._count.invites,
        paymentCount: user._count.payments,
      },
    });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }
    console.error('[Auth] Me error:', error);
    res.status(500).json({ error: 'Failed to get user info' });
  }
});

export default router;
