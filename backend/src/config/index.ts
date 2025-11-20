/**
 * Centralized configuration
 */
import dotenv from 'dotenv';

// Load environment variables before reading config
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  database: {
    url: process.env.DATABASE_URL || 'file:./dev.db'
  },

  dkg: {
    nodeUrl: process.env.DKG_NODE_URL || 'http://localhost:8900',
    nodePort: parseInt(process.env.DKG_NODE_PORT || '8900', 10),
    blockchain: process.env.DKG_BLOCKCHAIN || 'otp:2043'
  },

  guardian: {
    apiUrl: process.env.GUARDIAN_API_URL || 'https://guardian-api.umanitek.com',
    apiKey: process.env.GUARDIAN_API_KEY || ''
  },

  x402: {
    enabled: process.env.X402_ENABLED === 'true',
    walletAddress: process.env.X402_WALLET_ADDRESS || '0xYourWalletAddress',
    network: process.env.X402_NETWORK || 'base-sepolia',
    facilitatorUrl: process.env.X402_FACILITATOR_URL || 'https://x402.org/facilitator',
    pricing: {
      low: parseFloat(process.env.X402_PRICING_LOW || '0.0000'),
      medium: parseFloat(process.env.X402_PRICING_MEDIUM || '0.0001'),
      high: parseFloat(process.env.X402_PRICING_HIGH || '0.0003')
    },
    thresholds: {
      lowConfidence: parseFloat(process.env.X402_LOW_CONFIDENCE_THRESHOLD || '0.7'),
      highConfidence: parseFloat(process.env.X402_HIGH_CONFIDENCE_THRESHOLD || '0.85')
    },
    // CDP facilitator for mainnet (optional)
    cdp: {
      apiKeyId: process.env.CDP_API_KEY_ID || '',
      apiKeySecret: process.env.CDP_API_KEY_SECRET || ''
    }
  },

  deepfake: {
    modelPath: process.env.DEEPFAKE_MODEL_PATH || './models/xception_weights.pth',
    confidenceThreshold: parseFloat(process.env.DEEPFAKE_CONFIDENCE_THRESHOLD || '0.5')
  },

  staking: {
    minStake: parseFloat(process.env.MIN_STAKE_AMOUNT || '10'),
    maxStake: parseFloat(process.env.MAX_STAKE_AMOUNT || '500'),
    rewardPercentage: parseFloat(process.env.REWARD_PERCENTAGE || '15'),
    slashPercentage: parseFloat(process.env.SLASH_PERCENTAGE || '10'),
    consensusThreshold: parseFloat(process.env.CONSENSUS_THRESHOLD || '0.7')
  }
};
