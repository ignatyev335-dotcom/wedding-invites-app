import { Router } from 'express';
import { PrismaClient, RsvpStatus, TransferType } from '@prisma/client';
import { validateBody, validateParams } from '../middleware/validate';
import { notifyNewRsvp } from '../services/bot';

const router = Router();
const prisma = new PrismaClient();

/**
 * POST /api/guests/:id/rsvp
 * Submit or update an RSVP response for a guest.
 * Public endpoint - no auth required.
 */
router.post(
  '/:id/rsvp',
  validateParams('id'),
  validateBody([
    {
      field: 'rsvpStatus',
      required: true,
      type: 'string',
      custom: (value) =>
        ['PENDING', 'ATTENDING', 'NOT_ATTENDING', 'MAYBE'].includes(value)
          ? true
          : 'rsvpStatus must be one of: PENDING, ATTENDING, NOT_ATTENDING, MAYBE',
    },
    { field: 'message', type: 'string', max: 500 },
  ]),
  async (req, res) => {
    try {
      const guestId = Number(req.params.id);
      const { rsvpStatus, message } = req.body;

      // Find guest with invite info
      const existingGuest = await prisma.guest.findUnique({
        where: { id: guestId },
        include: {
          invite: {
            include: { user: true },
          },
        },
      });

      if (!existingGuest) {
        res.status(404).json({ error: 'Guest not found' });
        return;
      }

      // Verify the invite is published
      if (!existingGuest.invite.isPublished) {
        res.status(403).json({ error: 'Invite is not published' });
        return;
      }

      // Update RSVP
      const guest = await prisma.guest.update({
        where: { id: guestId },
        data: {
          rsvpStatus: rsvpStatus as RsvpStatus,
          rsvpDate: new Date(),
          message: message || existingGuest.message,
        },
      });

      // Update analytics RSVP count
      await prisma.analytics.updateMany({
        where: { inviteId: existingGuest.inviteId },
        data: {
          rsvpCount: {
            increment: 1,
          },
        },
      });

      // Notify the couple about new RSVP
      try {
        await notifyNewRsvp(
          existingGuest.invite.user.telegramId,
          guest.name,
          rsvpStatus,
          message
        );
      } catch (notifyError) {
        console.error('[Guests] Failed to notify couple:', notifyError);
        // Don't fail the request if notification fails
      }

      res.json({
        guest: {
          id: guest.id,
          name: guest.name,
          rsvpStatus: guest.rsvpStatus,
          rsvpDate: guest.rsvpDate,
          message: guest.message,
        },
        message: 'RSVP submitted successfully',
      });
    } catch (error) {
      console.error('[Guests] RSVP error:', error);
      res.status(500).json({ error: 'Failed to submit RSVP' });
    }
  }
);

/**
 * POST /api/guests/:id/transfer
 * Submit or update transfer preference for a guest.
 * Public endpoint - no auth required.
 */
router.post(
  '/:id/transfer',
  validateParams('id'),
  validateBody([
    {
      field: 'transferNeed',
      required: true,
      type: 'string',
      custom: (value) =>
        ['SELF', 'CAR', 'NEED'].includes(value)
          ? true
          : 'transferNeed must be one of: SELF, CAR, NEED',
    },
  ]),
  async (req, res) => {
    try {
      const guestId = Number(req.params.id);
      const { transferNeed } = req.body;

      // Find guest with invite info
      const existingGuest = await prisma.guest.findUnique({
        where: { id: guestId },
        include: {
          invite: true,
        },
      });

      if (!existingGuest) {
        res.status(404).json({ error: 'Guest not found' });
        return;
      }

      // Verify the invite has transfer enabled
      if (!existingGuest.invite.hasTransfer) {
        res.status(400).json({ error: 'Transfer is not enabled for this invite' });
        return;
      }

      // Update transfer preference
      const guest = await prisma.guest.update({
        where: { id: guestId },
        data: {
          transferNeed: transferNeed as TransferType,
        },
      });

      // Update analytics transfer requests count
      if (transferNeed === 'NEED') {
        await prisma.analytics.updateMany({
          where: { inviteId: existingGuest.inviteId },
          data: {
            transferRequests: {
              increment: 1,
            },
          },
        });
      }

      const transferLabels: Record<string, string> = {
        SELF: 'Самостоятельно',
        CAR: 'На машине',
        NEED: 'Нужен трансфер',
      };

      res.json({
        guest: {
          id: guest.id,
          name: guest.name,
          transferNeed: guest.transferNeed,
        },
        message: `Transfer preference updated: ${transferLabels[transferNeed]}`,
      });
    } catch (error) {
      console.error('[Guests] Transfer error:', error);
      res.status(500).json({ error: 'Failed to update transfer preference' });
    }
  }
);

/**
 * GET /api/guests/:id/details
 * Get guest details by ID.
 * Public endpoint - used when guest opens invite via unique link.
 */
router.get('/:id/details', validateParams('id'), async (req, res) => {
  try {
    const guestId = Number(req.params.id);

    const guest = await prisma.guest.findUnique({
      where: { id: guestId },
      include: {
        invite: {
          select: {
            slug: true,
            isPublished: true,
            brideName: true,
            groomName: true,
            ceremonyDate: true,
            ceremonyTime: true,
            ceremonyPlace: true,
            hasBanquet: true,
            banquetDate: true,
            banquetTime: true,
            banquetPlace: true,
            hasTransfer: true,
            language: true,
          },
        },
      },
    });

    if (!guest) {
      res.status(404).json({ error: 'Guest not found' });
      return;
    }

    if (!guest.invite.isPublished) {
      res.status(403).json({ error: 'Invite is not published' });
      return;
    }

    res.json({
      guest: {
        id: guest.id,
        name: guest.name,
        isPair: guest.isPair,
        pairName: guest.pairName,
        rsvpStatus: guest.rsvpStatus,
        transferNeed: guest.transferNeed,
        message: guest.message,
      },
      invite: guest.invite,
    });
  } catch (error) {
    console.error('[Guests] Get details error:', error);
    res.status(500).json({ error: 'Failed to fetch guest details' });
  }
});

export default router;
