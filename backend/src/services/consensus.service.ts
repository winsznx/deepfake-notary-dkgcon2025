/**
 * Consensus Validation Agent
 * Calculates consensus from multiple fact-checks
 */
import { PrismaClient } from '@prisma/client';
import { config } from '../config';

const prisma = new PrismaClient();

export interface ConsensusResult {
  totalStake: number;
  participantCount: number;
  agreementRate: number;
  majorityVerdict: 'deepfake' | 'real';
  confidenceScore: number;
}

export class ConsensusService {
  /**
   * Calculates consensus for a media hash
   * @param mediaId - Media ID
   * @returns ConsensusResult
   */
  async calculateConsensus(mediaId: string): Promise<ConsensusResult> {
    // Get all fact-checks for this media
    const factChecks = await prisma.factCheck.findMany({
      where: { mediaId },
      include: {
        guardian: true,
        stakes: true
      }
    });

    if (factChecks.length === 0) {
      throw new Error('No fact-checks found for this media');
    }

    // Calculate weighted votes
    let totalStake = 0;
    let deepfakeStake = 0;
    let realStake = 0;

    for (const factCheck of factChecks) {
      const stake = factCheck.stakes.reduce((sum, s) => sum + s.amount, 0);
      const effectiveStake = stake * Math.sqrt(factCheck.guardian.reputationScore);

      totalStake += effectiveStake;

      if (factCheck.deepfakeScore > 0.5) {
        deepfakeStake += effectiveStake;
      } else {
        realStake += effectiveStake;
      }
    }

    const agreementRate = Math.max(deepfakeStake, realStake) / totalStake;
    const majorityVerdict = deepfakeStake > realStake ? 'deepfake' : 'real';

    // Calculate confidence using formula from blueprint
    const weightedStakeAgreement = agreementRate;
    const guardianReputationAvg = factChecks.reduce(
      (sum, fc) => sum + fc.guardian.reputationScore, 0
    ) / factChecks.length;
    const modelConfidenceAvg = factChecks.reduce(
      (sum, fc) => sum + fc.confidenceScore, 0
    ) / factChecks.length;
    const verificationCountWeight = Math.min(factChecks.length / 10, 1.0);

    const confidenceScore = (
      0.40 * weightedStakeAgreement +
      0.30 * guardianReputationAvg +
      0.20 * modelConfidenceAvg +
      0.10 * verificationCountWeight
    );

    return {
      totalStake,
      participantCount: factChecks.length,
      agreementRate,
      majorityVerdict,
      confidenceScore
    };
  }

  /**
   * Executes rewards and slashing based on consensus
   */
  async executeRewardsAndSlashing(factCheckId: string): Promise<void> {
    const factCheck = await prisma.factCheck.findUnique({
      where: { id: factCheckId },
      include: { consensus: true, stakes: true, media: true }
    });

    if (!factCheck || !factCheck.consensus) {
      throw new Error('Fact-check or consensus not found');
    }

    const { agreementRate, majorityVerdict } = factCheck.consensus;

    // Only execute if consensus threshold reached
    if (agreementRate < config.staking.consensusThreshold) {
      return;
    }

    for (const stake of factCheck.stakes) {
      const factCheckVerdict = factCheck.deepfakeScore > 0.5 ? 'deepfake' : 'real';
      const isCorrect = factCheckVerdict === majorityVerdict;

      if (isCorrect) {
        // Reward
        const rewardAmount = stake.amount * (config.staking.rewardPercentage / 100);
        await prisma.stake.update({
          where: { id: stake.id },
          data: {
            rewarded: true,
            rewardAmount,
            locked: false
          }
        });
      } else {
        // Slash
        const slashAmount = stake.amount * (config.staking.slashPercentage / 100);
        await prisma.stake.update({
          where: { id: stake.id },
          data: {
            slashed: true,
            slashAmount,
            locked: false
          }
        });
      }
    }
  }
}

export const consensusService = new ConsensusService();
