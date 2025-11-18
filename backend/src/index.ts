/**
 * Main entry point for Verifiable Deepfake Notary Backend
 */
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import mediaRoutes from './api/media.routes';
import factCheckRoutes from './api/factcheck.routes';
import stakingRoutes from './api/staking.routes';
import consensusRoutes from './api/consensus.routes';
import x402Routes from './api/x402.routes';

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
