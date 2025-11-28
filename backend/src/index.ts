/**
 * Main entry point for Verifiable Deepfake Notary Backend
 */
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
// @ts-ignore - x402-express types issue
import { paymentMiddleware } from 'x402-express';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import mediaRoutes from './api/media.routes';
import factCheckRoutes from './api/factcheck.routes';
import stakingRoutes from './api/staking.routes';
import consensusRoutes from './api/consensus.routes';
import x402Routes from './api/x402.routes';
import rdfRoutes from './api/rdf.routes';

dotenv.config();

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(requestLogger);

// x402 Payment Middleware for high-confidence fact-checks
// Note: x402-express middleware is for real blockchain payments
// For demo purposes with dynamic pricing, we handle payments in routes
// Uncomment below to enable real x402 protocol integration

/*
if (config.x402.enabled) {
  const facilitatorConfig = config.x402.facilitatorUrl
    ? { url: config.x402.facilitatorUrl }
    : undefined; // Use CDP facilitator for mainnet if no URL specified

  app.use(paymentMiddleware(
    config.x402.walletAddress,
    {
      'GET /api/x402/high-confidence/:factCheckId': {
        price: `$${config.x402.pricing.high.toFixed(4)}`,
        network: config.x402.network as any,
        config: {
          description: 'Access high-confidence deepfake analysis results with verified consensus',
          outputSchema: {
            type: 'object',
            properties: {
              factCheck: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  deepfakeScore: { type: 'number', description: '0.0 (authentic) to 1.0 (deepfake)' },
                  confidenceScore: { type: 'number', description: 'Model confidence 0.0 to 1.0' },
                  consensus: { type: 'object', description: 'Guardian consensus data' }
                }
              },
              payment: {
                type: 'object',
                properties: {
                  invoiceId: { type: 'string' },
                  amount: { type: 'number' },
                  paidAt: { type: 'string', format: 'date-time' }
                }
              }
            }
          }
        }
      }
    },
    facilitatorConfig
  ));
}
*/

console.log(`💰 x402 Micropayments: ${config.x402.enabled ? 'ENABLED' : 'DISABLED'}`);
console.log(`💳 Payment Network: ${config.x402.network}`);
console.log(`👛 Payment Wallet: ${config.x402.walletAddress}`);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/media', mediaRoutes);
app.use('/api/factcheck', factCheckRoutes);
app.use('/api/staking', stakingRoutes);
app.use('/api/consensus', consensusRoutes);
app.use('/api/x402', x402Routes);
app.use('/api/rdf', rdfRoutes);

// Error handling
app.use(errorHandler);

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`📊 Environment: ${config.nodeEnv}`);
  console.log(`🔗 DKG Node: ${config.dkg.nodeUrl}`);
});

export default app;
