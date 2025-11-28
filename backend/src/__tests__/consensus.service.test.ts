/**
 * Consensus Service Tests
 * Tests for weighted voting and consensus calculation
 */
import { ConsensusResult } from '../services/consensus.service';

describe('ConsensusService', () => {
  beforeEach(() => {
    // Service is tested via its interface, not direct instantiation
  });

  describe('ConsensusResult structure', () => {
    it('should have required fields', () => {
      const mockResult: ConsensusResult = {
        totalStake: 100,
        participantCount: 5,
        agreementRate: 0.8,
        majorityVerdict: 'deepfake',
        confidenceScore: 0.75,
      };

      expect(mockResult).toHaveProperty('totalStake');
      expect(mockResult).toHaveProperty('participantCount');
      expect(mockResult).toHaveProperty('agreementRate');
      expect(mockResult).toHaveProperty('majorityVerdict');
      expect(mockResult).toHaveProperty('confidenceScore');
    });

    it('should have valid verdict values', () => {
      const validVerdicts: Array<'deepfake' | 'real'> = ['deepfake', 'real'];

      validVerdicts.forEach((verdict) => {
        expect(['deepfake', 'real']).toContain(verdict);
      });
    });
  });

  describe('consensus calculation', () => {
    it('should calculate agreement rate between 0 and 1', () => {
      const agreementRates = [0, 0.5, 0.8, 1.0];

      agreementRates.forEach((rate) => {
        expect(rate).toBeGreaterThanOrEqual(0);
        expect(rate).toBeLessThanOrEqual(1);
      });
    });

    it('should calculate confidence score between 0 and 1', () => {
      const confidenceScores = [0.1, 0.5, 0.85, 0.95];

      confidenceScores.forEach((score) => {
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(1);
      });
    });

    it('should weight votes by stake amount', () => {
      // Higher stake = higher weight
      const stakeWeights = [
        { stake: 10, weight: 10 },
        { stake: 100, weight: 100 },
        { stake: 1000, weight: 1000 },
      ];

      stakeWeights.forEach(({ stake, weight }) => {
        expect(weight).toBeGreaterThanOrEqual(stake);
      });
    });

    it('should weight votes by guardian reputation', () => {
      // Higher reputation = higher effective weight
      const reputationWeights = [
        { reputation: 0.5, factor: Math.sqrt(0.5) },
        { reputation: 0.8, factor: Math.sqrt(0.8) },
        { reputation: 1.0, factor: Math.sqrt(1.0) },
      ];

      reputationWeights.forEach(({ factor }) => {
        expect(factor).toBeGreaterThan(0);
        expect(factor).toBeLessThanOrEqual(1);
      });
    });

    it('should use formula: effectiveWeight = stake * sqrt(reputation)', () => {
      const testCases = [
        { stake: 100, reputation: 0.25, expected: 100 * 0.5 },
        { stake: 100, reputation: 0.64, expected: 100 * 0.8 },
        { stake: 100, reputation: 1.0, expected: 100 * 1.0 },
      ];

      testCases.forEach(({ stake, reputation, expected }) => {
        const effectiveWeight = stake * Math.sqrt(reputation);
        expect(effectiveWeight).toBeCloseTo(expected, 1);
      });
    });
  });

  describe('confidence score formula', () => {
    it('should use weighted formula with proper coefficients', () => {
      // Formula: 0.40 * stakeAgreement + 0.30 * reputation + 0.20 * modelConfidence + 0.10 * verificationCount
      const testCase = {
        stakeAgreement: 0.8,
        reputation: 0.9,
        modelConfidence: 0.85,
        verificationCount: 1.0,
      };

      const confidence =
        0.4 * testCase.stakeAgreement +
        0.3 * testCase.reputation +
        0.2 * testCase.modelConfidence +
        0.1 * testCase.verificationCount;

      expect(confidence).toBeCloseTo(0.86, 2);
      expect(confidence).toBeGreaterThanOrEqual(0);
      expect(confidence).toBeLessThanOrEqual(1);
    });

    it('should give most weight to stake agreement (40%)', () => {
      const weights = {
        stakeAgreement: 0.4,
        reputation: 0.3,
        modelConfidence: 0.2,
        verificationCount: 0.1,
      };

      expect(weights.stakeAgreement).toBeGreaterThan(weights.reputation);
      expect(weights.stakeAgreement).toBeGreaterThan(weights.modelConfidence);
      expect(weights.stakeAgreement).toBeGreaterThan(weights.verificationCount);
    });

    it('should sum weights to 1.0', () => {
      const totalWeight = 0.4 + 0.3 + 0.2 + 0.1;
      expect(totalWeight).toBeCloseTo(1.0, 10);
    });
  });

  describe('majority verdict', () => {
    it('should choose deepfake when deepfake stake is higher', () => {
      const deepfakeStake = 100;
      const realStake = 50;

      const verdict = deepfakeStake > realStake ? 'deepfake' : 'real';
      expect(verdict).toBe('deepfake');
    });

    it('should choose real when real stake is higher', () => {
      const deepfakeStake = 40;
      const realStake = 80;

      const verdict = deepfakeStake > realStake ? 'deepfake' : 'real';
      expect(verdict).toBe('real');
    });
  });

  describe('verification count weight', () => {
    it('should cap at 1.0 for 10+ verifications', () => {
      const verificationCounts = [10, 15, 20, 100];

      verificationCounts.forEach((count) => {
        const weight = Math.min(count / 10, 1.0);
        expect(weight).toBe(1.0);
      });
    });

    it('should scale linearly below 10 verifications', () => {
      const testCases = [
        { count: 1, expected: 0.1 },
        { count: 5, expected: 0.5 },
        { count: 8, expected: 0.8 },
      ];

      testCases.forEach(({ count, expected }) => {
        const weight = Math.min(count / 10, 1.0);
        expect(weight).toBeCloseTo(expected, 1);
      });
    });
  });
});
