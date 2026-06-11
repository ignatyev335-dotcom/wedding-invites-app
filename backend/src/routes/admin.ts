import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { requireAdmin } from '../middleware/admin';
import { validateBody, validateParams } from '../middleware/validate';

const router = Router();
const prisma = new PrismaClient();

// Apply auth and admin middleware to all routes
router.use(authenticateToken, requireAdmin);

/**
 * GET /api/admin/stats
 * Dashboard statistics.
 * Returns aggregated counts and recent activity.
 */
router.get('/stats', async (_req, res) => {
  try {
    const [
      totalUsers,
      totalInvites,
      publishedInvites,
      totalGuests,
      rsvpStats,
      totalPayments,
      revenueResult,
      recentUsers,
      recentPayments,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.invite.count(),
      prisma.invite.count({ where: { isPublished: true } }),
      prisma.guest.count(),
      prisma.guest.groupBy({
        by: ['rsvpStatus'],
        _count: { rsvpStatus: true },
      }),
      prisma.payment.count(),
      prisma.payment.aggregate({
        where: { status: 'SUCCESS' },
        _sum: { amount: true },
      }),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          telegramId: true,
          username: true,
          firstName: true,
          tariff: true,
          createdAt: true,
          _count: { select: { invites: true } },
        },
      }),
      prisma.payment.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, telegramId: true, username: true, firstName: true },
          },
        },
      }),
    ]);

    const rsvpBreakdown = {
      pending: 0,
      attending: 0,
      notAttending: 0,
      maybe: 0,
    };

    for (const stat of rsvpStats) {
      switch (stat.rsvpStatus) {
        case 'PENDING': rsvpBreakdown.pending = stat._count.rsvpStatus; break;
        case 'ATTENDING': rsvpBreakdown.attending = stat._count.rsvpStatus; break;
        case 'NOT_ATTENDING': rsvpBreakdown.notAttending = stat._count.rsvpStatus; break;
        case 'MAYBE': rsvpBreakdown.maybe = stat._count.rsvpStatus; break;
      }
    }

    res.json({
      stats: {
        totalUsers,
        totalInvites,
        publishedInvites,
        unpublishedInvites: totalInvites - publishedInvites,
        totalGuests,
        rsvpBreakdown,
        totalPayments,
        totalRevenueKopecks: revenueResult._sum.amount || 0,
        totalRevenueRubles: (revenueResult._sum.amount || 0) / 100,
      },
      recentUsers,
      recentPayments,
    });
  } catch (error) {
    console.error('[Admin] Stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

/**
 * GET /api/admin/users
 * List all users with pagination.
 */
router.get('/users', async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const skip = (page - 1) * limit;
    const search = req.query.search as string | undefined;

    const where = search
      ? {
          OR: [
            { telegramId: { contains: search } },
            { username: { contains: search, mode: 'insensitive' as const } },
            { firstName: { contains: search, mode: 'insensitive' as const } },
            { lastName: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { invites: true, payments: true },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('[Admin] Users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

/**
 * GET /api/admin/payments
 * List all payments with pagination.
 */
router.get('/payments', async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const skip = (page - 1) * limit;
    const status = req.query.status as string | undefined;

    const where = status
      ? { status: status as 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED' }
      : {};

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, telegramId: true, username: true, firstName: true },
          },
        },
      }),
      prisma.payment.count({ where }),
    ]);

    res.json({
      payments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('[Admin] Payments error:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// ─── Templates Management ───

/**
 * GET /api/admin/templates
 * List all templates.
 */
router.get('/templates', async (_req, res) => {
  try {
    const templates = await prisma.template.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json({ templates });
  } catch (error) {
    console.error('[Admin] List templates error:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

/**
 * POST /api/admin/templates
 * Create a new template.
 */
router.post(
  '/templates',
  validateBody([
    { field: 'name', required: true, type: 'string', min: 1, max: 100 },
    { field: 'style', required: true, type: 'string', min: 1, max: 50 },
    { field: 'css', required: true, type: 'string', min: 1 },
    { field: 'thumbnail', required: true, type: 'string', min: 1 },
    { field: 'isPremium', type: 'boolean' },
    { field: 'isLight', type: 'boolean' },
  ]),
  async (req: AuthRequest, res) => {
    try {
      const { name, style, css, thumbnail, isPremium, isLight } = req.body;

      const template = await prisma.template.create({
        data: {
          name,
          style,
          css,
          thumbnail,
          isPremium: isPremium || false,
          isLight: isLight || false,
        },
      });

      res.status(201).json({ template });
    } catch (error) {
      console.error('[Admin] Create template error:', error);
      res.status(500).json({ error: 'Failed to create template' });
    }
  }
);

/**
 * PUT /api/admin/templates/:id
 * Update a template.
 */
router.put(
  '/templates/:id',
  validateParams('id'),
  async (req: AuthRequest, res) => {
    try {
      const templateId = Number(req.params.id);
      const { name, style, css, thumbnail, isPremium, isLight } = req.body;

      const template = await prisma.template.update({
        where: { id: templateId },
        data: {
          ...(name !== undefined && { name }),
          ...(style !== undefined && { style }),
          ...(css !== undefined && { css }),
          ...(thumbnail !== undefined && { thumbnail }),
          ...(isPremium !== undefined && { isPremium }),
          ...(isLight !== undefined && { isLight }),
        },
      });

      res.json({ template });
    } catch (error) {
      console.error('[Admin] Update template error:', error);
      res.status(500).json({ error: 'Failed to update template' });
    }
  }
);

/**
 * DELETE /api/admin/templates/:id
 * Delete a template.
 */
router.delete(
  '/templates/:id',
  validateParams('id'),
  async (_req, res) => {
    try {
      const templateId = Number(_req.params.id);
      await prisma.template.delete({ where: { id: templateId } });
      res.json({ message: 'Template deleted successfully' });
    } catch (error) {
      console.error('[Admin] Delete template error:', error);
      res.status(500).json({ error: 'Failed to delete template' });
    }
  }
);

// ─── Envelopes Management ───

/**
 * GET /api/admin/envelopes
 * List all envelopes.
 */
router.get('/envelopes', async (_req, res) => {
  try {
    const envelopes = await prisma.envelope.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json({ envelopes });
  } catch (error) {
    console.error('[Admin] List envelopes error:', error);
    res.status(500).json({ error: 'Failed to fetch envelopes' });
  }
});

/**
 * POST /api/admin/envelopes
 * Create a new envelope.
 */
router.post(
  '/envelopes',
  validateBody([
    { field: 'name', required: true, type: 'string', min: 1, max: 100 },
    { field: 'style', required: true, type: 'string', min: 1, max: 50 },
    { field: 'image', required: true, type: 'string', min: 1 },
    { field: 'sealImage', required: true, type: 'string', min: 1 },
    { field: 'isPremium', type: 'boolean' },
    { field: 'isLight', type: 'boolean' },
  ]),
  async (req: AuthRequest, res) => {
    try {
      const { name, style, image, sealImage, isPremium, isLight } = req.body;

      const envelope = await prisma.envelope.create({
        data: {
          name,
          style,
          image,
          sealImage,
          isPremium: isPremium || false,
          isLight: isLight || false,
        },
      });

      res.status(201).json({ envelope });
    } catch (error) {
      console.error('[Admin] Create envelope error:', error);
      res.status(500).json({ error: 'Failed to create envelope' });
    }
  }
);

/**
 * PUT /api/admin/envelopes/:id
 * Update an envelope.
 */
router.put(
  '/envelopes/:id',
  validateParams('id'),
  async (req, res) => {
    try {
      const envelopeId = Number(req.params.id);
      const { name, style, image, sealImage, isPremium, isLight } = req.body;

      const envelope = await prisma.envelope.update({
        where: { id: envelopeId },
        data: {
          ...(name !== undefined && { name }),
          ...(style !== undefined && { style }),
          ...(image !== undefined && { image }),
          ...(sealImage !== undefined && { sealImage }),
          ...(isPremium !== undefined && { isPremium }),
          ...(isLight !== undefined && { isLight }),
        },
      });

      res.json({ envelope });
    } catch (error) {
      console.error('[Admin] Update envelope error:', error);
      res.status(500).json({ error: 'Failed to update envelope' });
    }
  }
);

/**
 * DELETE /api/admin/envelopes/:id
 * Delete an envelope.
 */
router.delete(
  '/envelopes/:id',
  validateParams('id'),
  async (_req, res) => {
    try {
      const envelopeId = Number(_req.params.id);
      await prisma.envelope.delete({ where: { id: envelopeId } });
      res.json({ message: 'Envelope deleted successfully' });
    } catch (error) {
      console.error('[Admin] Delete envelope error:', error);
      res.status(500).json({ error: 'Failed to delete envelope' });
    }
  }
);

// ─── Music Management ───

/**
 * GET /api/admin/music
 * List all music tracks.
 */
router.get('/music', async (_req, res) => {
  try {
    const music = await prisma.music.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json({ music });
  } catch (error) {
    console.error('[Admin] List music error:', error);
    res.status(500).json({ error: 'Failed to fetch music' });
  }
});

/**
 * POST /api/admin/music
 * Create a new music track entry.
 */
router.post(
  '/music',
  validateBody([
    { field: 'name', required: true, type: 'string', min: 1, max: 200 },
    { field: 'artist', required: true, type: 'string', min: 1, max: 200 },
    { field: 'url', required: true, type: 'string', min: 1 },
    { field: 'duration', required: true, type: 'number', min: 1 },
    { field: 'isPremium', type: 'boolean' },
  ]),
  async (req: AuthRequest, res) => {
    try {
      const { name, artist, url, duration, isPremium } = req.body;

      const track = await prisma.music.create({
        data: {
          name,
          artist,
          url,
          duration,
          isPremium: isPremium || false,
        },
      });

      res.status(201).json({ music: track });
    } catch (error) {
      console.error('[Admin] Create music error:', error);
      res.status(500).json({ error: 'Failed to create music track' });
    }
  }
);

/**
 * DELETE /api/admin/music/:id
 * Delete a music track.
 */
router.delete(
  '/music/:id',
  validateParams('id'),
  async (_req, res) => {
    try {
      const musicId = Number(_req.params.id);
      await prisma.music.delete({ where: { id: musicId } });
      res.json({ message: 'Music track deleted successfully' });
    } catch (error) {
      console.error('[Admin] Delete music error:', error);
      res.status(500).json({ error: 'Failed to delete music track' });
    }
  }
);

// ─── Illustrations Management ───

/**
 * GET /api/admin/illustrations
 * List all illustrations.
 */
router.get('/illustrations', async (req, res) => {
  try {
    const category = req.query.category as string | undefined;
    const where = category ? { category } : {};

    const illustrations = await prisma.illustration.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    res.json({ illustrations });
  } catch (error) {
    console.error('[Admin] List illustrations error:', error);
    res.status(500).json({ error: 'Failed to fetch illustrations' });
  }
});

/**
 * POST /api/admin/illustrations
 * Create a new illustration entry.
 */
router.post(
  '/illustrations',
  validateBody([
    { field: 'url', required: true, type: 'string', min: 1 },
    { field: 'category', required: true, type: 'string', min: 1, max: 50 },
    { field: 'tags', type: 'array' },
  ]),
  async (req: AuthRequest, res) => {
    try {
      const { url, category, tags } = req.body;

      const illustration = await prisma.illustration.create({
        data: {
          url,
          category,
          tags: Array.isArray(tags) ? tags : [],
        },
      });

      res.status(201).json({ illustration });
    } catch (error) {
      console.error('[Admin] Create illustration error:', error);
      res.status(500).json({ error: 'Failed to create illustration' });
    }
  }
);

/**
 * DELETE /api/admin/illustrations/:id
 * Delete an illustration.
 */
router.delete(
  '/illustrations/:id',
  validateParams('id'),
  async (_req, res) => {
    try {
      const illustrationId = Number(_req.params.id);
      await prisma.illustration.delete({ where: { id: illustrationId } });
      res.json({ message: 'Illustration deleted successfully' });
    } catch (error) {
      console.error('[Admin] Delete illustration error:', error);
      res.status(500).json({ error: 'Failed to delete illustration' });
    }
  }
);

// ─── DressCodes Management ───

/**
 * GET /api/admin/dresscodes
 * List all dress codes.
 */
router.get('/dresscodes', async (_req, res) => {
  try {
    const dressCodes = await prisma.dressCode.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json({ dressCodes });
  } catch (error) {
    console.error('[Admin] List dressCodes error:', error);
    res.status(500).json({ error: 'Failed to fetch dress codes' });
  }
});

/**
 * POST /api/admin/dresscodes
 * Create a new dress code.
 */
router.post(
  '/dresscodes',
  validateBody([
    { field: 'name', required: true, type: 'string', min: 1, max: 100 },
    { field: 'description', required: true, type: 'string', min: 1, max: 500 },
    { field: 'colors', required: true, type: 'array' },
    { field: 'image', required: true, type: 'string', min: 1 },
    { field: 'isPremium', type: 'boolean' },
  ]),
  async (req: AuthRequest, res) => {
    try {
      const { name, description, colors, image, isPremium } = req.body;

      const dressCode = await prisma.dressCode.create({
        data: {
          name,
          description,
          colors,
          image,
          isPremium: isPremium || false,
        },
      });

      res.status(201).json({ dressCode });
    } catch (error) {
      console.error('[Admin] Create dressCode error:', error);
      res.status(500).json({ error: 'Failed to create dress code' });
    }
  }
);

/**
 * DELETE /api/admin/dresscodes/:id
 * Delete a dress code.
 */
router.delete(
  '/dresscodes/:id',
  validateParams('id'),
  async (_req, res) => {
    try {
      const dressCodeId = Number(_req.params.id);
      await prisma.dressCode.delete({ where: { id: dressCodeId } });
      res.json({ message: 'Dress code deleted successfully' });
    } catch (error) {
      console.error('[Admin] Delete dressCode error:', error);
      res.status(500).json({ error: 'Failed to delete dress code' });
    }
  }
);

export default router;
