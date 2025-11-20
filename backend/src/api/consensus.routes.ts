/**
 * Consensus routes
 */
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { consensusService } from '../services/consensus.service';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * POST /api/consensus/calculate/:mediaId
 * Calculate consensus for a media item
 */
router.post('/calculate/:mediaId', async (req, res) => {
  try {
    const { mediaId } = req.params;

    const result = await consensusService.calculateConsensus(mediaId);

    // Get the first fact-check to attach consensus to
    const factCheck = await prisma.factCheck.findFirst({
      where: { mediaId }
    });

    if (!factCheck) {
      return res.status(404).json({ error: 'No fact-checks found' });
    }

    // Create or update consensus
    const consensus = await prisma.consensus.upsert({
      where: { factCheckId: factCheck.id },
      create: {
        factCheckId: factCheck.id,
        totalStake: result.totalStake,
        participantCount: result.participantCount,
        agreementRate: result.agreementRate,
        majorityVerdict: result.majorityVerdict,
        resolved: true
      },
      update: {
        totalStake: result.totalStake,
        participantCount: result.participantCount,
        agreementRate: result.agreementRate,
        majorityVerdict: result.majorityVerdict,
        resolved: true
      }
    });

    // Execute rewards and slashing
    await consensusService.executeRewardsAndSlashing(factCheck.id);

    return res.json({
      consensus,
      result
    });
  } catch (error) {
    console.error('Consensus calculation error:', error);
    return res.status(500).json({ error: 'Failed to calculate consensus' });
  }
});

/**
 * GET /api/consensus/:factCheckId
 * Get consensus for a fact-check
 */
router.get('/:factCheckId', async (req, res) => {
  try {
    const consensus = await prisma.consensus.findUnique({
      where: { factCheckId: req.params.factCheckId },
      include: { votes: true }
    });

    if (!consensus) {
      return res.status(404).json({ error: 'Consensus not found' });
    }

    return res.json(consensus);
  } catch (error) {
    console.error('Get consensus error:', error);
    return res.status(500).json({ error: 'Failed to retrieve consensus' });
  }
});

/**
 * GET /api/consensus/recent
 * Get recent consensus results
 */
router.get('/recent/all', async (req, res) => {
  try {
    const consensusResults = await prisma.consensus.findMany({
      where: { resolved: true },
      include: {
        factCheck: {
          include: {
            media: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    // Calculate total stake from stakes for each consensus
    const results = await Promise.all(
      consensusResults.map(async (consensus) => {
        const stakes = await prisma.stake.findMany({
          where: { factCheckId: consensus.factCheckId }
        });
        const totalStake = stakes.reduce((sum, s) => sum + s.amount, 0);

        return {
          id: consensus.id,
          factCheckId: consensus.factCheckId,
          mediaHash: consensus.factCheck.media.sha256Hash,
          totalStake,
          participantCount: consensus.participantCount,
          agreementRate: consensus.agreementRate,
          verdict: consensus.majorityVerdict,
          confidenceScore: consensus.factCheck.confidenceScore,
          createdAt: consensus.createdAt
        };
      })
    );

    return res.json(results);
  } catch (error) {
    console.error('Get recent consensus error:', error);
    return res.status(500).json({ error: 'Failed to retrieve consensus results' });
  }
});

export default router;
