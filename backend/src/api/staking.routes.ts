/**
 * Staking routes
 */
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { config } from '../config';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * POST /api/staking/stake
 * Stake tokens on a fact-check
 */
router.post('/stake', async (req, res) => {
  try {
    const { factCheckId, guardianIdentifier, amount } = req.body;

    if (!factCheckId || !guardianIdentifier || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate stake amount
    if (amount < config.staking.minStake || amount > config.staking.maxStake) {
      return res.status(400).json({
        error: `Stake amount must be between ${config.staking.minStake} and ${config.staking.maxStake}`
      });
    }

    // Get fact-check
    const factCheck = await prisma.factCheck.findUnique({
      where: { id: factCheckId }
    });

    if (!factCheck) {
      return res.status(404).json({ error: 'Fact-check not found' });
    }

    // Get guardian
    const guardian = await prisma.guardian.findFirst({
      where: {
        OR: [
          { guardianId: guardianIdentifier },
          { address: guardianIdentifier },
          { username: guardianIdentifier }
        ]
      }
    });

    if (!guardian) {
      return res.status(404).json({ error: 'Guardian not found' });
    }

    // Create stake
    const stake = await prisma.stake.create({
      data: {
        factCheckId,
        guardianId: guardian.id,
        amount,
        locked: true
      }
    });

    // Update guardian total stake
    await prisma.guardian.update({
      where: { id: guardian.id },
      data: { totalStake: { increment: amount } }
    });

    return res.json(stake);
  } catch (error) {
    console.error('Staking error:', error);
    return res.status(500).json({ error: 'Failed to create stake' });
  }
});

/**
 * GET /api/staking/guardian/:guardianId
 * Get all stakes for a guardian
 */
router.get('/guardian/:guardianId', async (req, res) => {
  try {
    const stakes = await prisma.stake.findMany({
      where: { guardianId: req.params.guardianId },
      include: { factCheck: { include: { media: true } } }
    });

    return res.json(stakes);
  } catch (error) {
    console.error('Get stakes error:', error);
    return res.status(500).json({ error: 'Failed to retrieve stakes' });
  }
});

export default router;
