import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

/**
 * Admin authorization middleware.
 * Checks if the authenticated user's telegramId matches the ADMIN_TELEGRAM_ID env variable.
 * Must be used AFTER authenticateToken middleware.
 */
export function requireAdmin(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  const adminTelegramId = process.env.ADMIN_TELEGRAM_ID;

  if (!adminTelegramId) {
    res.status(500).json({ error: 'Admin telegram ID not configured' });
    return;
  }

  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  if (req.user.telegramId !== adminTelegramId) {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }

  next();
}
