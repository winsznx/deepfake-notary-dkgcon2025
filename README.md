# Verifiable Deepfake Notary

> Decentralized Community Notes for Multimedia Truth

A complete Agent → Knowledge → Trust ecosystem that combines AI deepfake detection, blockchain-based knowledge assets, and token economics to create verifiable fact-checking for digital media.

## Overview

This system enables users to:
1. **Upload** suspicious media (images/videos)
2. **Analyze** content using AI deepfake detection (XceptionNet)
3. **Verify** through Guardian-based consensus with token staking
4. **Publish** fact-checks as Knowledge Assets to OriginTrail DKG
5. **Monetize** high-confidence notes via x402 micropayments

## Architecture

### DKG Edge Node Integration

**Real OriginTrail DKG Integration:** This project uses the official dkg.js SDK (v8.2.0) to publish Knowledge Assets to the OriginTrail Decentralized Knowledge Graph. The system connects to a local DKG Edge Node for development and can be configured for testnet/mainnet deployment.

See [DKG_SETUP.md](./DKG_SETUP.md) for complete setup instructions.

```
┌─────────────────────────────────────────────────────────┐
│                    AGENT LAYER                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Deepfake    │  │  Consensus   │  │ Monetization │  │
│  │  Analysis    │→ │  Validation  │→ │   Access     │  │
│  │  Agent       │  │  Agent       │  │   Agent      │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└────────────────────┬────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────┐
│                  KNOWLEDGE LAYER                         │
│         OriginTrail DKG + Knowledge Assets              │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Media Hash → FactCheck → Confidence → Guardian  │   │
│  │ Provenance → Model Output → Consensus Proof     │   │
│  └─────────────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────┐
│                    TRUST LAYER                           │
│  Token Staking │ Consensus Scoring │ Slash/Reward       │
│  Guardian Reputation │ x402 Micropayments                │
└─────────────────────────────────────────────────────────┘
```

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm 8+
- Python 3.11+ (for deepfake model)
- Docker Desktop (for local DKG node)

### Installation

```bash
# Install dependencies
pnpm install

# Setup database
pnpm db:push

# Start local DKG Edge Node (see DKG_SETUP.md for details)
cd /Users/macbook/Documents/ot-node/docker
docker compose -f docker-compose-alpine-graphdb.yaml up -d

# Start development servers
cd /Users/macbook/Documents/polk
pnpm dev
```

The frontend will run on `http://localhost:5173`, backend on `http://localhost:3001`, and DKG node on `http://localhost:8900`.

**Important:** The DKG node must be running for full functionality. See [DKG_SETUP.md](./DKG_SETUP.md) for complete setup instructions and troubleshooting.

## Project Structure

```
/
├── frontend/          # React frontend (JavaScript)
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── contexts/     # React contexts (theme, etc.)
│   │   ├── styles/       # Tailwind CSS
│   │   └── main.jsx      # Entry point
│   └── package.json
│
├── backend/           # Express backend (TypeScript)
│   ├── src/
│   │   ├── api/          # REST API routes
│   │   ├── services/     # Business logic & agents
│   │   ├── middleware/   # Express middleware
│   │   ├── config/       # Configuration
│   │   └── index.ts      # Entry point
│   ├── prisma/
│   │   └── schema.prisma # Database schema
│   └── package.json
│
├── common/            # Shared types & constants
├── docs/              # Documentation
└── package.json       # Root workspace config
```

## Design System

**Color Palette:**
- Pale Blue: `#EFFAFD` (background)
- Royal Blue: `#4A8BDF` (primary actions)
- Eggplant: `#A0006D` (accents)

**Fonts:**
- DM Sans (body text)
- Space Grotesk (headings)

## Key Features

### 1. AI Deepfake Detection
- XceptionNet-based analysis
- SHA-256 media hashing
- Artifact detection (facial reenactment, lip-sync, temporal inconsistency)

### 2. Guardian Consensus
- Reputation-weighted voting
- Stake-based incentive alignment
- Sybil-resistant consensus calculation

### 3. Knowledge Assets
- JSON-LD structured data
- OriginTrail DKG publication
- Provenance tracking

### 4. Token Economics
- Stake: 10-500 TRAC per verification
- Reward: +15% for consensus majority
- Slash: -10% for consensus minority

### 5. x402 Micropayments
- High-confidence notes (>0.85): $0.0003
- Medium-confidence (0.7-0.85): $0.0001
- Low-confidence (<0.7): Free

## Documentation

- [ARCHITECTURE.md](./docs/ARCHITECTURE.md) - System architecture details
- [API.md](./docs/API.md) - API endpoints reference
- [DKG_SETUP.md](./docs/DKG_SETUP.md) - DKG Edge Node setup
- [DKG_INTEGRATION.md](./docs/DKG_INTEGRATION.md) - DKG integration status and production guide
- [QUICKSTART.md](./QUICKSTART.md) - 5-minute setup guide

## Testing

```bash
# Run all tests
pnpm test

# Backend tests only
pnpm --filter backend test

# Frontend tests only
pnpm --filter frontend test
```

## Development

### Backend Development
```bash
pnpm backend:dev
```

### Frontend Development
```bash
pnpm frontend:dev
```

### Database Management
```bash
# Push schema changes
pnpm db:push

# Open Prisma Studio
pnpm db:studio
```

## License

MIT

## Links

- [OriginTrail DKG Documentation](https://docs.origintrail.io)
- [Guardian Social Graph](https://umanitek.com/guardian)
- [x402 Protocol](https://www.origintrail.io)
