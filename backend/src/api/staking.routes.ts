/**
 * Staking routes with multi-token support
 */
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { config } from '../config';
import { validateStakeAmount, calculateEffectiveWeight, getSupportedTokens } from '../config/tokens';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * POST /api/staking/stake
 * Stake tokens on a fact-check (multi-token support)
 */
router.post('/stake', async (req, res) => {
  try {
    const { factCheckId, guardianIdentifier, amount, tokenType = 'TRAC' } = req.body;

    if (!factCheckId || !guardianIdentifier || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate stake amount for token type
    const validation = validateStakeAmount(amount, tokenType);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    // Get fact-check
    const factCheck = await prisma.factCheck.findUnique({
      where: { id: factCheckId }
    });

    if (!factCheck) {
      return res.status(404).json({ error: 'Fact-check not found' });
    }

    // Get or create guardian
    let guardian = await prisma.guardian.findFirst({
      where: {
        OR: [
          { guardianId: guardianIdentifier },
          { address: guardianIdentifier },
          { username: guardianIdentifier }
        ]
      }
    });

    // Auto-create guardian if doesn't exist
    if (!guardian) {
      guardian = await prisma.guardian.create({
        data: {
          guardianId: guardianIdentifier,
          address: guardianIdentifier,
          reputationScore: 0.5, // Start with neutral reputation
          totalStake: 0,
          verificationCount: 0,
          accuracyRate: 0.5
        }
      });
    }

    // Calculate effective weight
    const effectiveWeight = calculateEffectiveWeight(
      amount,
      tokenType,
      guardian.reputationScore
    );

    // Create stake with token type and effective weight
    const stake = await prisma.stake.create({
      data: {
        factCheckId,
        guardianId: guardian.id,
        amount,
        tokenType,
        effectiveWeight,
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

/**
 * GET /api/staking/wallet/:address
 * Get all stakes and stats for a wallet address
 */
router.get('/wallet/:address', async (req, res) => {
  try {
    const { address } = req.params;

    // Find guardian by address/identifier
    const guardian = await prisma.guardian.findFirst({
      where: {
        OR: [
          { address },
          { guardianId: address },
          { username: address }
        ]
      }
    });

    if (!guardian) {
      return res.json({
        stakes: [],
        stats: {
          totalStaked: 0,
          activeStakes: 0,
          winRate: 0,
          totalRewards: 0,
          totalSlashed: 0
        }
      });
    }

    // Get stakes
    const stakes = await prisma.stake.findMany({
      where: { guardianId: guardian.id },
      include: {
        factCheck: {
          include: {
            media: true,
            consensus: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate stats
    const activeStakes = stakes.filter(s => s.locked).length;
    const rewardedStakes = stakes.filter(s => s.rewardAmount && s.rewardAmount > 0);
    const slashedStakes = stakes.filter(s => s.slashAmount && s.slashAmount > 0);
    const totalRewards = rewardedStakes.reduce((sum, s) => sum + (s.rewardAmount || 0), 0);
    const totalSlashed = slashedStakes.reduce((sum, s) => sum + (s.slashAmount || 0), 0);
    const totalResolved = rewardedStakes.length + slashedStakes.length;
    const winRate = totalResolved > 0 ? rewardedStakes.length / totalResolved : 0;

    return res.json({
      stakes,
      stats: {
        totalStaked: guardian.totalStake || 0,
        activeStakes,
        winRate: winRate * 100,
        totalRewards,
        totalSlashed
      }
    });
  } catch (error) {
    console.error('Get wallet stakes error:', error);
    return res.status(500).json({ error: 'Failed to retrieve stakes' });
  }
});

/**
 * GET /api/staking/tokens
 * Get supported staking tokens with multipliers
 */
router.get('/tokens', async (_req, res) => {
  try {
    const tokens = getSupportedTokens();
    return res.json({
      tokens,
      info: {
        message: 'Multi-token staking with Polkadot ecosystem bonus',
        polkadotBonus: 'NEURO: +15%, DOT: +10%'
      }
    });
  } catch (error) {
    console.error('Get tokens error:', error);
    return res.status(500).json({ error: 'Failed to retrieve tokens' });
  }
});

export default router;
