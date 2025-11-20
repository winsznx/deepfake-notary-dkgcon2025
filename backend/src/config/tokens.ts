/**
 * Multi-Token Staking Configuration
 * Polkadot Ecosystem Integration
 */

export interface TokenConfig {
  symbol: string;
  name: string;
  multiplier: number; // Reputation weight multiplier
  minStake: number;
  maxStake: number;
  network: string;
  icon?: string;
}

/**
 * Supported staking tokens
 *
 * NEURO (NeuroWeb) - 15% bonus for using Polkadot ecosystem token
 * DOT (Polkadot) - 10% bonus for using native Polkadot token
 * TRAC (OriginTrail) - Standard staking token
 */
export const TOKEN_CONFIGS: Record<string, TokenConfig> = {
  TRAC: {
    symbol: 'TRAC',
    name: 'OriginTrail',
    multiplier: 1.0,
    minStake: 10,
    maxStake: 500,
    network: 'NeuroWeb'
  },
  NEURO: {
    symbol: 'NEURO',
    name: 'NeuroWeb',
    multiplier: 1.15, // 15% Polkadot ecosystem bonus
    minStake: 1,
    maxStake: 50,
    network: 'NeuroWeb Parachain'
  },
  DOT: {
    symbol: 'DOT',
    name: 'Polkadot',
    multiplier: 1.10, // 10% Polkadot native bonus
    minStake: 0.1,
    maxStake: 5,
    network: 'Polkadot Relay Chain'
  }
};

/**
 * Calculate effective stake weight
 *
 * @param amount - Amount staked
 * @param tokenType - Token symbol (TRAC, NEURO, DOT)
 * @param reputationScore - Guardian's reputation (0-1)
 * @returns Effective weight for consensus calculations
 */
export function calculateEffectiveWeight(
  amount: number,
  tokenType: string,
  reputationScore: number
): number {
  const config = TOKEN_CONFIGS[tokenType] || TOKEN_CONFIGS.TRAC;

  // Effective weight = amount × token multiplier × sqrt(reputation)
  const effectiveWeight = amount * config.multiplier * Math.sqrt(reputationScore);

  return effectiveWeight;
}

/**
 * Validate stake amount for token type
 */
export function validateStakeAmount(amount: number, tokenType: string): {
  valid: boolean;
  error?: string;
} {
  const config = TOKEN_CONFIGS[tokenType];

  if (!config) {
    return {
      valid: false,
      error: `Unsupported token type: ${tokenType}. Supported tokens: ${Object.keys(TOKEN_CONFIGS).join(', ')}`
    };
  }

  if (amount < config.minStake) {
    return {
      valid: false,
      error: `Minimum stake for ${tokenType} is ${config.minStake}`
    };
  }

  if (amount > config.maxStake) {
    return {
      valid: false,
      error: `Maximum stake for ${tokenType} is ${config.maxStake}`
    };
  }

  return { valid: true };
}

/**
 * Get token configuration
 */
export function getTokenConfig(tokenType: string): TokenConfig {
  return TOKEN_CONFIGS[tokenType] || TOKEN_CONFIGS.TRAC;
}

/**
 * Get all supported tokens
 */
export function getSupportedTokens(): TokenConfig[] {
  return Object.values(TOKEN_CONFIGS);
}

export default {
  TOKEN_CONFIGS,
  calculateEffectiveWeight,
  validateStakeAmount,
  getTokenConfig,
  getSupportedTokens
};
