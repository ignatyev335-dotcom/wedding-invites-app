import { Router } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { validateBody, validateParams } from '../middleware/validate';
import { generateSlug } from '../utils/telegram';
import { sendInviteSent } from '../services/bot';

const router = Router();
const prisma = new PrismaClient();

/**
 * POST /api/invites
 * Create a new wedding invite.
 * Requires authentication.
 */
router.post(
  '/',
  authenticateToken,
  validateBody([
    { field: 'templateId', required: true, type: 'number' },
    { field: 'envelopeId', required: true, type: 'number' },
    { field: 'brideName', required: true, type: 'string', min: 1, max: 100 },
    { field: 'groomName', required: true, type: 'string', min: 1, max: 100 },
    { field: 'ceremonyDate', required: true, type: 'date' },
    { field: 'ceremonyTime', required: true, type: 'string', min: 1, max: 20 },
    { field: 'ceremonyPlace', required: true, type: 'string', min: 1, max: 200 },
    { field: 'language', type: 'string', min: 2, max: 5 },
  ]),
  async (req: AuthRequest, res) => {
    try {
      const user = req.user!;
      const {
        templateId, envelopeId, language, brideName, groomName,
        ceremonyDate, ceremonyTime, ceremonyPlace, ceremonyMapUrl,
        hasBanquet, banquetDate, banquetTime, banquetPlace, banquetMapUrl,
        hasTransfer, transferDetails, dressCodeId, giftWishes, contacts,
        couplePhoto, illustrationId, musicId, blockOrder,
      } = req.body;

      // Verify user's invite limit based on tariff
      const inviteCount = await prisma.invite.count({
        where: { userId: user.id },
      });

      // FREE: max 1 invite, LIGHT: max 3 invites, PREMIUM: unlimited
      const maxInvites = user.tariff === 'FREE' ? 1 : user.tariff === 'LIGHT' ? 3 : Infinity;
      if (inviteCount >= maxInvites) {
        res.status(403).json({
          error: 'Invite limit reached',
          message: `Your tariff "${user.tariff}" allows maximum ${maxInvites} invite(s). Upgrade to create more.`,
        });
        return;
      }

      // Check if template requires premium
      const template = await prisma.template.findUnique({ where: { id: templateId } });
      if (!template) {
        res.status(400).json({ error: 'Template not found' });
        return;
      }
      if (template.isPremium && user.tariff !== 'PREMIUM') {
        res.status(403).json({ error: 'Premium template requires PREMIUM tariff' });
        return;
      }
      if (template.isLight && user.tariff === 'FREE') {
        res.status(403).json({ error: 'This template requires at least LIGHT tariff' });
        return;
      }

      // Generate unique slug
      const slug = generateSlug(groomName, brideName);

      // Create invite
      const invite = await prisma.invite.create({
        data: {
          userId: user.id,
          slug,
          templateId,
          envelopeId,
          language: language || 'ru',
          brideName,
          groomName,
          ceremonyDate: new Date(ceremonyDate),
          ceremonyTime,
          ceremonyPlace,
          ceremonyMapUrl: ceremonyMapUrl || null,
          hasBanquet: hasBanquet || false,
          banquetDate: banquetDate ? new Date(banquetDate) : null,
          banquetTime: banquetTime || null,
          banquetPlace: banquetPlace || null,
          banquetMapUrl: banquetMapUrl || null,
          hasTransfer: hasTransfer || false,
          transferDetails: transferDetails || null,
          dressCodeId: dressCodeId || null,
          giftWishes: giftWishes || null,
          contacts: contacts || null,
          couplePhoto: couplePhoto || null,
          illustrationId: illustrationId || null,
          musicId: musicId || null,
          blockOrder: blockOrder || Prisma.JsonNull,
          watermark: user.tariff === 'FREE',
          isPublished: false,
        },
        include: {
          template: true,
          envelope: true,
          dressCode: true,
          illustration: true,
          music: true,
        },
      });

      // Create empty analytics record
      await prisma.analytics.create({
        data: { inviteId: invite.id },
      });

      res.status(201).json({ invite });
    } catch (error) {
      console.error('[Invites] Create error:', error);
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        res.status(409).json({ error: 'An invite with this slug already exists. Please try again.' });
        return;
      }
      res.status(500).json({ error: 'Failed to create invite' });
    }
  }
);

/**
 * GET /api/invites
 * Get all invites for the authenticated user.
 * Requires authentication.
 */
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    const invites = await prisma.invite.findMany({
      where: { userId: user.id },
      include: {
        template: {
          select: { id: true, name: true, style: true, thumbnail: true, isPremium: true },
        },
        envelope: {
          select: { id: true, name: true, style: true, image: true },
        },
        _count: {
          select: { guests: true },
        },
        analytics: {
          select: { opens: true, rsvpCount: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ invites });
  } catch (error) {
    console.error('[Invites] List error:', error);
    res.status(500).json({ error: 'Failed to fetch invites' });
  }
});

/**
 * GET /api/invites/:slug
 * Get a public invite by its slug.
 * No authentication required.
 */
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    const invite = await prisma.invite.findUnique({
      where: { slug },
      include: {
        template: {
          select: { id: true, name: true, style: true, css: true, thumbnail: true },
        },
        envelope: {
          select: { id: true, name: true, style: true, image: true, sealImage: true },
        },
        dressCode: true,
        illustration: true,
        music: {
          select: { id: true, name: true, artist: true, url: true, duration: true },
        },
      },
    });

    if (!invite) {
      res.status(404).json({ error: 'Invite not found' });
      return;
    }

    if (!invite.isPublished) {
      res.status(403).json({ error: 'Invite is not published yet' });
      return;
    }

    // Check if invite has expired
    if (invite.expiresAt && new Date(invite.expiresAt) < new Date()) {
      res.status(403).json({ error: 'Invite has expired' });
      return;
    }

    // Return invite without sensitive fields
    res.json({
      invite: {
        slug: invite.slug,
        template: invite.template,
        envelope: invite.envelope,
        language: invite.language,
        brideName: invite.brideName,
        groomName: invite.groomName,
        ceremonyDate: invite.ceremonyDate,
        ceremonyTime: invite.ceremonyTime,
        ceremonyPlace: invite.ceremonyPlace,
        ceremonyMapUrl: invite.ceremonyMapUrl,
        hasBanquet: invite.hasBanquet,
        banquetDate: invite.banquetDate,
        banquetTime: invite.banquetTime,
        banquetPlace: invite.banquetPlace,
        banquetMapUrl: invite.banquetMapUrl,
        hasTransfer: invite.hasTransfer,
        transferDetails: invite.transferDetails,
        dressCode: invite.dressCode,
        giftWishes: invite.giftWishes,
        contacts: invite.contacts,
        couplePhoto: invite.couplePhoto,
        illustration: invite.illustration,
        music: invite.music,
        blockOrder: invite.blockOrder,
        watermark: invite.watermark,
        createdAt: invite.createdAt,
      },
    });
  } catch (error) {
    console.error('[Invites] Get by slug error:', error);
    res.status(500).json({ error: 'Failed to fetch invite' });
  }
});

/**
 * PUT /api/invites/:id
 * Update an invite.
 * Requires authentication and ownership.
 */
router.put(
  '/:id',
  authenticateToken,
  validateParams('id'),
  async (req: AuthRequest, res) => {
    try {
      const user = req.user!;
      const inviteId = Number(req.params.id);
      const {
        templateId, envelopeId, language, brideName, groomName,
        ceremonyDate, ceremonyTime, ceremonyPlace, ceremonyMapUrl,
        hasBanquet, banquetDate, banquetTime, banquetPlace, banquetMapUrl,
        hasTransfer, transferDetails, dressCodeId, giftWishes, contacts,
        couplePhoto, illustrationId, musicId, blockOrder, watermark,
      } = req.body;

      // Verify ownership
      const existing = await prisma.invite.findFirst({
        where: { id: inviteId, userId: user.id },
      });

      if (!existing) {
        res.status(404).json({ error: 'Invite not found or access denied' });
        return;
      }

      // Check tariff for template change
      if (templateId && templateId !== existing.templateId) {
        const template = await prisma.template.findUnique({ where: { id: templateId } });
        if (template?.isPremium && user.tariff !== 'PREMIUM') {
          res.status(403).json({ error: 'Premium template requires PREMIUM tariff' });
          return;
        }
        if (template?.isLight && user.tariff === 'FREE') {
          res.status(403).json({ error: 'This template requires at least LIGHT tariff' });
          return;
        }
      }

      const invite = await prisma.invite.update({
        where: { id: inviteId },
        data: {
          ...(templateId !== undefined && { templateId }),
          ...(envelopeId !== undefined && { envelopeId }),
          ...(language !== undefined && { language }),
          ...(brideName !== undefined && { brideName }),
          ...(groomName !== undefined && { groomName }),
          ...(ceremonyDate !== undefined && { ceremonyDate: new Date(ceremonyDate) }),
          ...(ceremonyTime !== undefined && { ceremonyTime }),
          ...(ceremonyPlace !== undefined && { ceremonyPlace }),
          ...(ceremonyMapUrl !== undefined && { ceremonyMapUrl }),
          ...(hasBanquet !== undefined && { hasBanquet }),
          ...(banquetDate !== undefined && { banquetDate: banquetDate ? new Date(banquetDate) : null }),
          ...(banquetTime !== undefined && { banquetTime }),
          ...(banquetPlace !== undefined && { banquetPlace }),
          ...(banquetMapUrl !== undefined && { banquetMapUrl }),
          ...(hasTransfer !== undefined && { hasTransfer }),
          ...(transferDetails !== undefined && { transferDetails }),
          ...(dressCodeId !== undefined && { dressCodeId: dressCodeId || null }),
          ...(giftWishes !== undefined && { giftWishes }),
          ...(contacts !== undefined && { contacts }),
          ...(couplePhoto !== undefined && { couplePhoto }),
          ...(illustrationId !== undefined && { illustrationId: illustrationId || null }),
          ...(musicId !== undefined && { musicId: musicId || null }),
          ...(blockOrder !== undefined && { blockOrder }),
          ...(watermark !== undefined && { watermark }),
        },
        include: {
          template: true,
          envelope: true,
          dressCode: true,
          illustration: true,
          music: true,
        },
      });

      res.json({ invite });
    } catch (error) {
      console.error('[Invites] Update error:', error);
      res.status(500).json({ error: 'Failed to update invite' });
    }
  }
);

/**
 * DELETE /api/invites/:id
 * Delete an invite and all associated data.
 * Requires authentication and ownership.
 */
router.delete(
  '/:id',
  authenticateToken,
  validateParams('id'),
  async (req: AuthRequest, res) => {
    try {
      const user = req.user!;
      const inviteId = Number(req.params.id);

      // Verify ownership
      const existing = await prisma.invite.findFirst({
        where: { id: inviteId, userId: user.id },
      });

      if (!existing) {
        res.status(404).json({ error: 'Invite not found or access denied' });
        return;
      }

      // Cascading delete: guests, analytics, then invite
      await prisma.$transaction([
        prisma.guest.deleteMany({ where: { inviteId } }),
        prisma.analytics.deleteMany({ where: { inviteId } }),
        prisma.invite.delete({ where: { id: inviteId } }),
      ]);

      res.json({ message: 'Invite deleted successfully' });
    } catch (error) {
      console.error('[Invites] Delete error:', error);
      res.status(500).json({ error: 'Failed to delete invite' });
    }
  }
);

/**
 * POST /api/invites/:id/publish
 * Publish an invite, making it publicly accessible.
 * Requires authentication and ownership.
 */
router.post(
  '/:id/publish',
  authenticateToken,
  validateParams('id'),
  async (req: AuthRequest, res) => {
    try {
      const user = req.user!;
      const inviteId = Number(req.params.id);

      const existing = await prisma.invite.findFirst({
        where: { id: inviteId, userId: user.id },
      });

      if (!existing) {
        res.status(404).json({ error: 'Invite not found or access denied' });
        return;
      }

      if (existing.isPublished) {
        res.status(400).json({ error: 'Invite is already published' });
        return;
      }

      const invite = await prisma.invite.update({
        where: { id: inviteId },
        data: { isPublished: true },
      });

      res.json({ invite, message: 'Invite published successfully' });
    } catch (error) {
      console.error('[Invites] Publish error:', error);
      res.status(500).json({ error: 'Failed to publish invite' });
    }
  }
);

/**
 * POST /api/invites/:id/guests
 * Add guests to an invite.
 * Requires authentication and ownership.
 */
router.post(
  '/:id/guests',
  authenticateToken,
  validateParams('id'),
  validateBody([
    {
      field: 'guests',
      required: true,
      type: 'array',
      custom: (value) =>
        Array.isArray(value) && value.length > 0 && value.every((g: any) => typeof g.name === 'string' && g.name.length > 0)
          ? true
          : 'Guests must be a non-empty array of objects with name property',
    },
  ]),
  async (req: AuthRequest, res) => {
    try {
      const user = req.user!;
      const inviteId = Number(req.params.id);
      const { guests } = req.body;

      // Verify ownership
      const invite = await prisma.invite.findFirst({
        where: { id: inviteId, userId: user.id },
      });

      if (!invite) {
        res.status(404).json({ error: 'Invite not found or access denied' });
        return;
      }

      // Check guest limits
      const currentGuestCount = await prisma.guest.count({ where: { inviteId } });
      const maxGuests = user.tariff === 'FREE' ? 20 : user.tariff === 'LIGHT' ? 50 : 200;

      if (currentGuestCount + guests.length > maxGuests) {
        res.status(403).json({
          error: 'Guest limit would be exceeded',
          message: `Your tariff "${user.tariff}" allows maximum ${maxGuests} guests. You currently have ${currentGuestCount}.`,
        });
        return;
      }

      // Create guests
      const createdGuests = await prisma.$transaction(
        guests.map((guest: any) =>
          prisma.guest.create({
            data: {
              inviteId,
              name: guest.name,
              telegramId: guest.telegramId || null,
              isPair: guest.isPair || false,
              pairName: guest.pairName || null,
            },
          })
        )
      );

      res.status(201).json({
        guests: createdGuests,
        count: createdGuests.length,
      });
    } catch (error) {
      console.error('[Invites] Add guests error:', error);
      res.status(500).json({ error: 'Failed to add guests' });
    }
  }
);

/**
 * POST /api/invites/:id/send
 * Send invites to all guests via Telegram bot.
 * Requires authentication and ownership.
 */
router.post(
  '/:id/send',
  authenticateToken,
  validateParams('id'),
  async (req: AuthRequest, res) => {
    try {
      const user = req.user!;
      const inviteId = Number(req.params.id);

      const invite = await prisma.invite.findFirst({
        where: { id: inviteId, userId: user.id },
        include: {
          guests: true,
          template: { select: { name: true } },
        },
      });

      if (!invite) {
        res.status(404).json({ error: 'Invite not found or access denied' });
        return;
      }

      if (!invite.isPublished) {
        res.status(400).json({ error: 'Invite must be published before sending' });
        return;
      }

      // Count guests with telegramId
      const guestsWithTelegram = invite.guests.filter((g) => g.telegramId);
      const webappUrl = process.env.WEBAPP_URL || 'https://wedding-app.ru';
      const inviteUrl = `${webappUrl}/invite/${invite.slug}`;

      // Send notifications via bot
      const results = { sent: 0, failed: 0 };

      for (const guest of guestsWithTelegram) {
        try {
          const response = await fetch(
            `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: guest.telegramId,
                text: [
                  '\uD83D\uDC8D <b>Приглашение на свадьбу!</b> \uD83D\uDC8D',
                  '',
                  `\uD83E\uDD1D ${invite.groomName} & ${invite.brideName} приглашают вас на их свадьбу!`,
                  '',
                  `\uD83D\uDCC5 Дата: ${new Date(invite.ceremonyDate).toLocaleDateString('ru-RU')}`,
                  `\uD83D\uDD50 Время: ${invite.ceremonyTime}`,
                  `\uD83D\uDCCD Место: ${invite.ceremonyPlace}`,
                  '',
                  `\uD83D\uDC8E <a href="${inviteUrl}">Открыть приглашение</a>`,
                ].join('\n'),
                parse_mode: 'HTML',
                disable_web_page_preview: false,
              }),
            }
          );

          if (response.ok) {
            results.sent++;
          } else {
            results.failed++;
          }
        } catch {
          results.failed++;
        }
      }

      // Notify the couple
      await sendInviteSent(user.telegramId, invite.slug, invite.guests.length);

      res.json({
        message: 'Invitations sent',
        inviteUrl,
        totalGuests: invite.guests.length,
        guestsWithTelegram: guestsWithTelegram.length,
        results,
      });
    } catch (error) {
      console.error('[Invites] Send error:', error);
      res.status(500).json({ error: 'Failed to send invitations' });
    }
  }
);

/**
 * GET /api/invites/:id/guests
 * Get guests for an invite (owner view).
 * Requires authentication.
 */
router.get(
  '/:id/guests',
  authenticateToken,
  validateParams('id'),
  async (req: AuthRequest, res) => {
    try {
      const user = req.user!;
      const inviteId = Number(req.params.id);

      const invite = await prisma.invite.findFirst({
        where: { id: inviteId, userId: user.id },
        include: {
          guests: {
            orderBy: { createdAt: 'asc' },
          },
        },
      });

      if (!invite) {
        res.status(404).json({ error: 'Invite not found or access denied' });
        return;
      }

      // Count RSVP statuses
      const rsvpStats = {
        total: invite.guests.length,
        pending: invite.guests.filter((g) => g.rsvpStatus === 'PENDING').length,
        attending: invite.guests.filter((g) => g.rsvpStatus === 'ATTENDING').length,
        notAttending: invite.guests.filter((g) => g.rsvpStatus === 'NOT_ATTENDING').length,
        maybe: invite.guests.filter((g) => g.rsvpStatus === 'MAYBE').length,
      };

      res.json({ guests: invite.guests, rsvpStats });
    } catch (error) {
      console.error('[Invites] Get guests error:', error);
      res.status(500).json({ error: 'Failed to fetch guests' });
    }
  }
);

export default router;
