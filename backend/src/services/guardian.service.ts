/**
 * Guardian API Service
 * Fetches actor data from Guardian Social Graph
 */
// import axios from 'axios';
// import { config } from '../config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface GuardianActor {
  guardianId: string;
  address?: string;
  username?: string;
  reputationScore: number;
  verificationCount: number;
  accuracyRate: number;
}

export class GuardianService {
  /**
   * Fetches or creates Guardian actor
   * @param identifier - Address or username
   * @returns Guardian record
   */
  async getOrCreateGuardian(identifier: string): Promise<any> {
    // Try to find existing guardian
    let guardian = await prisma.guardian.findFirst({
      where: {
        OR: [
          { address: identifier },
          { username: identifier },
          { guardianId: identifier }
        ]
      }
    });

    if (guardian) {
      return guardian;
    }

    // Fetch from Guardian API
    const actorData = await this.fetchFromAPI(identifier);

    // Create new guardian
    guardian = await prisma.guardian.create({
      data: {
        guardianId: actorData.guardianId,
        address: actorData.address,
        username: actorData.username,
        reputationScore: actorData.reputationScore,
        verificationCount: actorData.verificationCount,
        accuracyRate: actorData.accuracyRate
      }
    });

    return guardian;
  }

  /**
   * Fetches actor data from Guardian API
   */
  private async fetchFromAPI(identifier: string): Promise<GuardianActor> {
    try {
      // TODO: Implement actual Guardian API call
      // const response = await axios.get(
      //   `${config.guardian.apiUrl}/actors/${identifier}`,
      //   { headers: { 'X-API-Key': config.guardian.apiKey } }
      // );

      // Mock data for now
      return {
        guardianId: `guardian:actor:${Math.floor(Math.random() * 99999)}`,
        address: identifier.startsWith('0x') ? identifier : undefined,
        username: !identifier.startsWith('0x') ? identifier : undefined,
        reputationScore: 0.7 + Math.random() * 0.25, // 0.7-0.95
        verificationCount: Math.floor(Math.random() * 200),
        accuracyRate: 0.8 + Math.random() * 0.15 // 0.8-0.95
      };
    } catch (error) {
      console.error('Guardian API error:', error);
      // Return default values if API fails
      return {
        guardianId: `guardian:actor:${Math.floor(Math.random() * 99999)}`,
        address: identifier.startsWith('0x') ? identifier : undefined,
        username: !identifier.startsWith('0x') ? identifier : undefined,
        reputationScore: 0.5,
        verificationCount: 0,
        accuracyRate: 0.5
      };
    }
  }
}

export const guardianService = new GuardianService();
