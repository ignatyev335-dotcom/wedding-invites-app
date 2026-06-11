import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { validateParams } from '../middleware/validate';

const router = Router();
const prisma = new PrismaClient();

/**
 * POST /api/analytics/track
 * Track analytics events for an invite.
 * Public endpoint - no auth required. Called from the frontend invite page.
 *
 * Body: { inviteId: number, event: string, data?: any }
 */
router.post('/track', async (req, res) => {
  try {
    const { inviteId, event, data } = req.body;

    if (!inviteId || !event) {
      res.status(400).json({ error: 'inviteId and event are required' });
      return;
    }

    const inviteIdNum = Number(inviteId);
    if (isNaN(inviteIdNum)) {
      res.status(400).json({ error: 'Invalid inviteId' });
      return;
    }

    // Find existing analytics record
    const analytics = await prisma.analytics.findUnique({
      where: { inviteId: inviteIdNum },
    });

    if (!analytics) {
      res.status(404).json({ error: 'Analytics record not found' });
      return;
    }

    const updateData: any = {};

    switch (event) {
      case 'open': {
        // Increment open count
        updateData.opens = { increment: 1 };
        break;
      }

      case 'scroll': {
        // Update scroll depth tracking
        // data should contain { section: string, depth: number }
        const { section, depth } = data || {};
        if (section && typeof depth === 'number') {
          const scrollDepth = (analytics.scrollDepth as Record<string, number>) || {};
          scrollDepth[section] = Math.max(scrollDepth[section] || 0, depth);
          updateData.scrollDepth = scrollDepth;
        }
        break;
      }

      case 'music_play': {
        updateData.musicPlays = { increment: 1 };
        break;
      }

      case 'music_duration': {
        // data should contain { seconds: number }
        const { seconds } = data || {};
        if (typeof seconds === 'number') {
          updateData.musicDuration = { increment: seconds };
        }
        break;
      }

      case 'map_click': {
        updateData.mapClicks = { increment: 1 };
        break;
      }

      case 'rsvp_submit': {
        updateData.rsvpCount = { increment: 1 };
        break;
      }

      case 'transfer_request': {
        updateData.transferRequests = { increment: 1 };
        break;
      }

      default: {
        // Unknown event - silently ignore
        res.json({ success: true, tracked: false });
        return;
      }
    }

    // Update analytics record
    await prisma.analytics.update({
      where: { inviteId: inviteIdNum },
      data: updateData,
    });

    res.json({ success: true, tracked: true, event });
  } catch (error) {
    console.error('[Analytics] Track error:', error);
    // Return 200 even on error to not break the frontend
    res.status(200).json({ success: false, error: 'Tracking failed' });
  }
});

/**
 * GET /api/analytics/:inviteId
 * Get analytics data for an invite.
 * Requires authentication and ownership.
 */
router.get(
  '/:inviteId',
  authenticateToken,
  validateParams('inviteId'),
  async (req: AuthRequest, res) => {
    try {
      const user = req.user!;
      const inviteId = Number(req.params.inviteId);

      // Verify ownership
      const invite = await prisma.invite.findFirst({
        where: { id: inviteId, userId: user.id },
        include: {
          analytics: true,
          guests: {
            select: {
              id: true,
              name: true,
              rsvpStatus: true,
              rsvpDate: true,
              transferNeed: true,
              isPair: true,
              createdAt: true,
            },
          },
        },
      });

      if (!invite) {
        res.status(404).json({ error: 'Invite not found or access denied' });
        return;
      }

      if (!invite.analytics) {
        res.status(404).json({ error: 'Analytics not found' });
        return;
      }

      // Calculate RSVP statistics
      const rsvpBreakdown = {
        pending: 0,
        attending: 0,
        notAttending: 0,
        maybe: 0,
      };

      for (const guest of invite.guests) {
        switch (guest.rsvpStatus) {
          case 'PENDING': rsvpBreakdown.pending++; break;
          case 'ATTENDING': rsvpBreakdown.attending++; break;
          case 'NOT_ATTENDING': rsvpBreakdown.notAttending++; break;
          case 'MAYBE': rsvpBreakdown.maybe++; break;
        }
      }

      // Calculate transfer statistics
      const transferStats = {
        self: invite.guests.filter((g) => g.transferNeed === 'SELF').length,
        car: invite.guests.filter((g) => g.transferNeed === 'CAR').length,
        need: invite.guests.filter((g) => g.transferNeed === 'NEED').length,
      };

      res.json({
        analytics: invite.analytics,
        guests: {
          total: invite.guests.length,
          rsvpBreakdown,
          transferStats,
          list: invite.guests,
        },
        invite: {
          slug: invite.slug,
          brideName: invite.brideName,
          groomName: invite.groomName,
          ceremonyDate: invite.ceremonyDate,
          isPublished: invite.isPublished,
        },
      });
    } catch (error) {
      console.error('[Analytics] Get error:', error);
      res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  }
);

/**
 * GET /api/analytics/:inviteId/timeline
 * Get RSVP timeline for an invite.
 * Requires authentication and ownership.
 */
router.get(
  '/:inviteId/timeline',
  authenticateToken,
  validateParams('inviteId'),
  async (req: AuthRequest, res) => {
    try {
      const user = req.user!;
      const inviteId = Number(req.params.inviteId);

      // Verify ownership
      const invite = await prisma.invite.findFirst({
        where: { id: inviteId, userId: user.id },
      });

      if (!invite) {
        res.status(404).json({ error: 'Invite not found or access denied' });
        return;
      }

      // Get guests with RSVP dates
      const guests = await prisma.guest.findMany({
        where: { inviteId, rsvpDate: { not: null } },
        orderBy: { rsvpDate: 'desc' },
        select: {
          id: true,
          name: true,
          rsvpStatus: true,
          rsvpDate: true,
          isPair: true,
          pairName: true,
          message: true,
        },
      });

      // Group by date
      const timeline: Record<string, typeof guests> = {};
      for (const guest of guests) {
        if (guest.rsvpDate) {
          const dateKey = guest.rsvpDate.toISOString().split('T')[0];
          if (!timeline[dateKey]) timeline[dateKey] = [];
          timeline[dateKey].push(guest);
        }
      }

      res.json({ timeline });
    } catch (error) {
      console.error('[Analytics] Timeline error:', error);
      res.status(500).json({ error: 'Failed to fetch timeline' });
    }
  }
);

export default router;
