# Verifiable Deepfake Notary

> **DKGcon 2025 Hackathon Submission** | Decentralized Community Notes Challenge
> Scaling Trust in the Age of AI through Agent-Knowledge-Trust Architecture

[![Tests](https://img.shields.io/badge/tests-30%2F30%20passing-success)](./backend/src/__tests__)
[![DKG](https://img.shields.io/badge/DKG-v8.2.0-blue)](https://docs.origintrail.io)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

A complete decentralized fact-checking ecosystem that combines AI deepfake detection, OriginTrail DKG Knowledge Assets, Polkadot blockchain integration, and economic incentives to create verifiable, monetizable community notes for digital media.

---

## 🎯 Problem Statement

In an internet now co-authored by AI, deepfakes and synthetic media threaten information integrity. Current fact-checking systems suffer from:

- **Centralization**: Single points of failure and trust
- **Opacity**: Black-box AI decisions without provenance
- **No Economic Incentives**: Volunteers burn out, quality suffers
- **Impermanence**: Fact-checks disappear when platforms shut down

**Our Solution**: A decentralized, transparent, economically sustainable fact-checking system where:

1. ✅ **AI Analysis is Verifiable** - Complete model provenance on-chain
2. ✅ **Consensus is Decentralized** - Guardian network with stake-weighted voting
3. ✅ **Economics are Aligned** - Token rewards for accurate verifications
4. ✅ **Knowledge is Permanent** - Immutable blockchain storage via OriginTrail DKG

---

## 🏗️ Architecture: Agent-Knowledge-Trust Layers

This project demonstrates full interoperability across the three foundational layers:

```
┌─────────────────────────────────────────────────────────────────────┐
│                         🤖 AGENT LAYER                               │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │  Deepfake        │  │  Consensus       │  │  x402 Payment    │  │
│  │  Analysis Agent  │→ │  Validation      │→ │  Access Agent    │  │
│  │  (XceptionNet)   │  │  (Stake-weighted)│  │  (Micropayments) │  │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘  │
│   • SHA-256 hashing     • Multi-token stake   • Invoice generation │
│   • Confidence scoring  • Reputation weights  • Payment validation │
│   • Artifact detection  • Sybil resistance    • Content gating     │
│                                                                      │
│  🔧 MCP Server: 8 Tools for AI Agent Integration                    │
│   └─ Claude Desktop can query DKG, analyze media, stake tokens      │
└───────────────────┬─────────────────────────────────────────────────┘
                    │
                    ↓ Publishes JSON-LD Knowledge Assets
┌─────────────────────────────────────────────────────────────────────┐
│                      📚 KNOWLEDGE LAYER                              │
│              OriginTrail DKG + NeuroWeb Parachain                    │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  Knowledge Assets (Schema.org MediaReview + Provenance)       │  │
│  │  ─────────────────────────────────────────────────────────────│  │
│  │  Media Hash → Deepfake Score → Confidence → Guardian Votes    │  │
│  │  AI Model → Version → Artifacts → Consensus Proof → UAL       │  │
│  └───────────────────────────────────────────────────────────────┘  │
│  • dkg.js SDK v8.2.0 | Real testnet publishing                      │
│  • RDF Export: Turtle, N-Triples, N-Quads, JSON-LD                  │
│  • SPARQL Queries: 12 example queries for semantic web              │
│  • Discoverable: https://dkg.origintrail.io/explore?ual=...         │
└───────────────────┬─────────────────────────────────────────────────┘
                    │
                    ↓ Secured by Polkadot Ecosystem
┌─────────────────────────────────────────────────────────────────────┐
│                        🔐 TRUST LAYER                                │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────┐ │
│  │ Multi-Token     │  │ Weighted        │  │ Economic Incentives │ │
│  │ Staking         │  │ Consensus       │  │ (Rewards/Slashing)  │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────────┘ │
│  • TRAC (1.0x): 10-500 stake | NeuroWeb native token                │
│  • NEURO (1.15x): 1-50 stake | +15% Polkadot ecosystem bonus        │
│  • DOT (1.10x): 0.1-5 stake  | +10% Polkadot native bonus           │
│  • Polkadot.js wallet | NeuroWeb Testnet (otp:20430)                │
│  • x402 micropayments | Base Sepolia for high-confidence content    │
└─────────────────────────────────────────────────────────────────────┘
```

**Data Flow**:
1. User uploads media → SHA-256 hash generated
2. Deepfake AI analyzes → Confidence score (0-1)
3. Guardians stake TRAC/NEURO/DOT → Vote real/fake
4. Consensus algorithm runs → Weighted by stake × reputation
5. Knowledge Asset created → Published to DKG
6. UAL generated → Queryable via SPARQL
7. High-confidence content → Gated by x402 payment

---

## ✨ Key Innovations

### 1. **MCP Server for AI Agent Integration**
First decentralized fact-checking system with Model Context Protocol support:

```typescript
// 8 Tools Available to AI Agents
- analyze_deepfake      // Run detection on media
- query_dkg            // Execute SPARQL queries
- publish_factcheck    // Publish to DKG
- verify_consensus     // Calculate consensus
- stake_on_factcheck   // Multi-token staking
- get_factcheck        // Retrieve details
- search_guardians     // Find by reputation
- get_media_hash       // SHA-256 verification
```

**Usage**: Claude Desktop can automatically fact-check media, query the Knowledge Graph, and stake tokens through natural language commands.

### 2. **Complete AI Provenance Tracking**
Every fact-check includes verifiable AI model metadata:

```json
{
  "@context": "https://schema.org",
  "@type": "MediaReview",
  "provenance": {
    "detectionModel": "XceptionNet-v2.1",
    "modelVersion": "2024.11",
    "analyzedAt": "2025-11-28T14:30:00Z",
    "processingTime": "2.3",
    "artifactsDetected": [
      "facial_warping",
      "lighting_inconsistency",
      "blending_artifacts"
    ]
  },
  "reviewRating": {
    "@type": "Rating",
    "ratingValue": 0.85,
    "confidenceScore": 0.92
  }
}
```

**Verification**: All provenance is immutable on DKG, allowing anyone to audit AI decisions.

### 3. **Multi-Token Polkadot Ecosystem Integration**
Support for TRAC, NEURO, and DOT with ecosystem bonuses:

```typescript
// Effective Weight Formula
effectiveWeight = amount × tokenMultiplier × sqrt(reputationScore)

// Token Multipliers
TRAC:  1.0x  (baseline)
NEURO: 1.15x (15% bonus for Polkadot parachain token)
DOT:   1.10x (10% bonus for native Polkadot token)

// Consensus Calculation
confidence = 0.40 × stakeAgreement +
             0.30 × guardianReputation +
             0.20 × modelConfidence +
             0.10 × verificationCount
```

**Why**: Incentivizes use of Polkadot ecosystem tokens while maintaining TRAC as primary staking token.

### 4. **RDF Knowledge Graph Export**
First fact-checking system with semantic web integration:

```bash
# Export as RDF Turtle
GET /api/rdf/factcheck/:id/export?format=turtle

# Get RDF Triples
GET /api/rdf/factcheck/:id/triples

# Generate Summary
GET /api/rdf/factcheck/:id/summary
```

**Formats**: N-Triples, Turtle, N-Quads, JSON-LD

**Use Cases**: Integrate with semantic web tools, link with other knowledge bases, enable AI reasoning over fact-checks.

### 5. **Economic Sustainability via x402**
Tiered pricing ensures long-term viability:

- **Free Tier** (confidence <0.70): Basic fact-check results
- **Medium Tier** (0.70-0.85): $0.0001 - Enhanced analysis
- **Premium Tier** (>0.85): $0.0003 - Full report with UAL

**Revenue Split**: 70% to guardians, 30% to protocol maintenance.

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20+ ([download](https://nodejs.org/))
- **pnpm** 8+ (`npm install -g pnpm`)
- **Polkadot.js Extension** ([install](https://polkadot.js.org/extension/))
- **OriginTrail Discord** (for testnet tokens: [join](https://discord.gg/origintrail))

### Installation (5 minutes)

```bash
# 1. Clone repository
git clone https://github.com/winsznx/polk.git
cd polk

# 2. Install all dependencies (frontend + backend)
pnpm install

# 3. Setup environment
cd backend
cp .env.example .env
# Edit .env with your wallet private key (see below)

# 4. Initialize database
pnpm db:push

# 5. Verify installation
pnpm test
# ✅ Should see: Tests: 30 passed, 30 total

# 6. Start development servers
cd ..
pnpm dev
```

**Servers will start at**:
- Frontend: http://localhost:5173
- Backend: http://localhost:3001
- DKG Node: https://v6-pegasus-node-02.origin-trail.network:8900

### Get Testnet Tokens

**NeuroWeb Testnet (Required for DKG)**:

1. Install Polkadot.js extension
2. Create new account
3. Join Discord: https://discord.gg/origintrail
4. Go to `#testnet-faucet` channel
5. Request tokens:
   ```
   !fundme_neuroweb YOUR_POLKADOT_ADDRESS
   ```
6. Wait 1-2 minutes
7. Verify balance: https://neuroweb-testnet.subscan.io

**Expected Balance**:
- NEURO: ~10 tokens (for gas fees)
- TRAC: ~100 tokens (for DKG publishing)

**Base Sepolia** (Optional for x402):
- Faucet: https://www.alchemy.com/faucets/base-sepolia

---

## 🔧 Configuration

### Backend Environment (`backend/.env`)

```bash
# Server
PORT=3001
NODE_ENV=development

# Database
DATABASE_URL="file:./dev.db"

# OriginTrail DKG Configuration
DKG_NODE_ENDPOINT=https://v6-pegasus-node-02.origin-trail.network
DKG_NODE_PORT=8900
DKG_BLOCKCHAIN=otp:20430  # NeuroWeb Testnet
DKG_PRIVATE_KEY=0xYOUR_PRIVATE_KEY_FROM_POLKADOT_EXTENSION

# x402 Micropayments (Optional)
X402_ENABLED=true
X402_WALLET_ADDRESS=0xYOUR_WALLET_ADDRESS
X402_NETWORK=base-sepolia
X402_FACILITATOR_URL=https://x402.org/facilitator

# Pricing Tiers (in ETH)
X402_PRICING_LOW=0.0000
X402_PRICING_MEDIUM=0.0001
X402_PRICING_HIGH=0.0003
X402_LOW_CONFIDENCE_THRESHOLD=0.7
X402_HIGH_CONFIDENCE_THRESHOLD=0.85

# Staking Configuration
MIN_STAKE_AMOUNT=10
MAX_STAKE_AMOUNT=500
REWARD_PERCENTAGE=15
SLASH_PERCENTAGE=10
CONSENSUS_THRESHOLD=0.7

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

**⚠️ Security Notes**:
- Never commit `.env` file (already in `.gitignore`)
- Use separate wallets for testnet and mainnet
- For production, use secrets manager (AWS Secrets Manager, HashiCorp Vault)
- See `/backend/.env.example` for template

### Frontend Environment (`frontend/.env`)

```bash
# API Configuration
VITE_API_URL=http://localhost:3001

# Network defaults to NeuroWeb Testnet
# No private keys in frontend!
```

---

## 📖 Usage Guide

### For Users (Fact-Check Consumers)

1. **Access the App**
   - Navigate to http://localhost:5173
   - Click "Launch App"

2. **Upload Media**
   - Go to `/upload`
   - Drag & drop image or video
   - Wait for AI analysis (~5-10 seconds)

3. **View Results**
   - Deepfake Score (0 = authentic, 1 = fake)
   - Confidence Level
   - Detected Artifacts
   - Guardian Consensus (if available)

4. **Access Premium Content**
   - If confidence >0.85, pay via x402
   - Download full report with UAL
   - Verify on DKG Explorer

5. **Verify on Blockchain**
   - Click "View on DKG"
   - See immutable Knowledge Asset
   - Query via SPARQL

### For Guardians (Verifiers)

1. **Connect Wallet**
   - Install Polkadot.js extension
   - Click "Connect Polkadot Wallet"
   - Select account
   - Approve connection

2. **Review Fact-Checks**
   - Go to `/dashboard`
   - Browse pending fact-checks
   - Click to view details

3. **Stake Tokens**
   - Go to `/staking`
   - Select token (TRAC, NEURO, or DOT)
   - Enter amount (respect min/max)
   - Submit stake
   - Approve transaction in wallet

4. **Vote on Authenticity**
   - Select fact-check
   - Review AI analysis
   - Vote "Real" or "Deepfake"
   - Include prediction in stake

5. **Earn Rewards**
   - If majority: +15% of stake
   - If minority: -10% of stake
   - Reputation score updated
   - Unlocked after consensus

### For Developers

```bash
# Run backend only
cd backend
pnpm dev

# Run frontend only
cd frontend
pnpm dev

# Run MCP server (for Claude Desktop)
cd backend
pnpm mcp

# Build for production
pnpm build

# Run all tests
pnpm test

# Run specific test suite
cd backend
pnpm test dkg.service.test.ts

# Type checking
pnpm build  # TypeScript compilation

# Database management
pnpm db:push      # Push schema changes
pnpm db:studio    # Open Prisma Studio
pnpm db:generate  # Generate Prisma client

# Test DKG publishing
pnpm dkg:publish-test
```

---

## 🔌 API Reference

### Base URL
```
Development: http://localhost:3001/api
Production:  https://your-domain.com/api
```

### Endpoints

#### Media Upload
```http
POST /api/media/upload
Content-Type: multipart/form-data

Body:
  - file: <binary>

Response:
{
  "id": "abc123",
  "sha256Hash": "2daeb7d4867f...",
  "contentUrl": "/uploads/abc123.jpg",
  "mediaType": "image"
}
```

#### Create Fact-Check
```http
POST /api/factcheck/create
Content-Type: application/json

{
  "mediaId": "abc123",
  "guardianId": "5GrwvaEF5zX..."
}

Response:
{
  "id": "def456",
  "deepfakeScore": 0.85,
  "confidenceScore": 0.92,
  "artifactsDetected": ["facial_warping"],
  "processingTime": 2.3,
  "publishedToDkg": false,
  "dkgAssetId": null
}
```

#### Get Fact-Check Details
```http
GET /api/factcheck/:id

Response:
{
  "id": "def456",
  "deepfakeScore": 0.85,
  "confidenceScore": 0.92,
  "claimReviewed": "Media exhibits deepfake characteristics",
  "dkgAssetId": "did:dkg:otp:20430/0x.../123",
  "media": { "sha256Hash": "...", "mediaType": "image" },
  "guardian": { "guardianId": "...", "reputationScore": 0.85 },
  "stakes": [...],
  "consensus": { "majorityVerdict": "deepfake", "agreementRate": 0.83 }
}
```

#### Multi-Token Staking
```http
POST /api/staking/stake
Content-Type: application/json

{
  "factCheckId": "def456",
  "guardianIdentifier": "5GrwvaEF5zX...",  // Polkadot address
  "amount": 100,
  "tokenType": "TRAC",  // or "NEURO", "DOT"
  "prediction": "deepfake"  // or "real"
}

Response:
{
  "id": "stake123",
  "amount": 100,
  "tokenType": "TRAC",
  "effectiveWeight": 85.0,  // amount × multiplier × sqrt(reputation)
  "locked": true,
  "prediction": "deepfake"
}
```

#### Get Wallet Stakes
```http
GET /api/staking/wallet/:address

Response:
{
  "stakes": [...],
  "stats": {
    "totalStaked": 500,
    "activeStakes": 5,
    "winRate": 0.83,
    "totalRewards": 75,
    "totalSlashed": 10
  }
}
```

#### Get Supported Tokens
```http
GET /api/staking/tokens

Response:
{
  "tokens": [
    {
      "symbol": "TRAC",
      "name": "OriginTrail",
      "multiplier": 1.0,
      "minStake": 10,
      "maxStake": 500,
      "network": "NeuroWeb"
    },
    {
      "symbol": "NEURO",
      "multiplier": 1.15,
      "minStake": 1,
      "maxStake": 50,
      "network": "NeuroWeb Parachain"
    },
    {
      "symbol": "DOT",
      "multiplier": 1.10,
      "minStake": 0.1,
      "maxStake": 5,
      "network": "Polkadot Relay Chain"
    }
  ]
}
```

#### Calculate Consensus
```http
POST /api/consensus/calculate/:mediaId

Response:
{
  "totalStake": 500,
  "participantCount": 12,
  "agreementRate": 0.83,
  "majorityVerdict": "deepfake",
  "confidenceScore": 0.89
}
```

#### x402 Payment Flow
```http
# 1. Request Invoice
GET /api/x402/high-confidence/:factCheckId

Response:
{
  "invoiceId": "invoice123",
  "amount": 0.0003,
  "currency": "ETH",
  "paymentAddress": "0x...",
  "expiresAt": "2025-11-28T15:00:00Z"
}

# 2. Submit Payment
POST /api/x402/pay/:invoiceId
{
  "txHash": "0x..."
}

# 3. Access Content
GET /api/x402/high-confidence/:factCheckId?invoiceId=invoice123

Response:
{
  "factCheck": {...},
  "ual": "did:dkg:otp:20430/0x.../123",
  "fullReport": {...}
}
```

#### RDF Export (NEW)
```http
# Export as Turtle
GET /api/rdf/factcheck/:id/export?format=turtle

Response: (text/turtle)
@prefix schema: <https://schema.org/> .
<did:dkg:...> a schema:MediaReview ;
  schema:reviewRating [...] .

# Get RDF Triples
GET /api/rdf/factcheck/:id/triples

Response:
{
  "factCheckId": "def456",
  "tripleCount": 47,
  "triples": [
    {
      "subject": "did:dkg:...",
      "predicate": "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
      "object": "https://schema.org/MediaReview"
    },
    ...
  ]
}

# Get Markdown Summary
GET /api/rdf/factcheck/:id/summary

Response: (text/markdown)
# Deepfake Fact-Check Report

## Claim
Media exhibits deepfake characteristics

## Analysis Result
- **Deepfake Score**: 0.85 (Likely Deepfake)
- **Confidence**: 0.92
...
```

---

## 🧬 Knowledge Asset Schema

All fact-checks follow Schema.org MediaReview vocabulary:

```json
{
  "@context": "https://schema.org",
  "@type": "MediaReview",
  "identifier": "did:dkg:otp:20430/0x8e7f1b2c3a4d.../1732116000",

  "mediaItem": {
    "@type": "VideoObject",
    "contentUrl": "ipfs://Qm...",
    "sha256": "2daeb7d4867f796c048b4a59675a6d1d5c85f2e2222ee6a4343cbc0bdec2fa3c",
    "uploadedAt": "2025-11-28T14:30:00Z"
  },

  "claimReviewed": "Video exhibits deepfake characteristics",

  "reviewRating": {
    "@type": "Rating",
    "ratingValue": 0.85,
    "bestRating": 1,
    "worstRating": 0,
    "confidenceScore": 0.92,
    "consensusWeight": 250
  },

  "provenance": {
    "detectionModel": "XceptionNet-v2.1",
    "modelVersion": "2024.11",
    "analyzedAt": "2025-11-28T14:30:00Z",
    "processingTime": "2.3",
    "artifactsDetected": [
      "facial_warping",
      "lighting_inconsistency",
      "blending_artifacts"
    ]
  },

  "author": {
    "@type": "Person",
    "identifier": "guardian:polkadot:5GrwvaEF5zX...",
    "reputationScore": 0.85,
    "verificationCount": 142,
    "accuracyRate": 0.89
  },

  "stake": {
    "amount": "250",
    "currency": "TRAC",
    "locked": true,
    "unlockCondition": "consensus_resolution"
  }
}
```

### SPARQL Query Examples

```sparql
# Find High-Confidence Deepfakes
PREFIX schema: <https://schema.org/>

SELECT ?factCheck ?score ?confidence
WHERE {
  ?factCheck a schema:MediaReview ;
             schema:reviewRating ?rating .
  ?rating schema:ratingValue ?score ;
          schema:confidenceScore ?confidence .
  FILTER(?score > 0.8 && ?confidence > 0.85)
}
ORDER BY DESC(?score)
LIMIT 10

# Find Fact-Checks by Guardian
PREFIX schema: <https://schema.org/>

SELECT ?factCheck ?score ?analyzedAt
WHERE {
  ?factCheck a schema:MediaReview ;
             schema:reviewRating/schema:ratingValue ?score ;
             schema:author ?author ;
             schema:datePublished ?analyzedAt .
  ?author schema:identifier "guardian:polkadot:5GrwvaEF..." .
}
ORDER BY DESC(?analyzedAt)

# Calculate Average Deepfake Score
PREFIX schema: <https://schema.org/>

SELECT (AVG(?score) AS ?avgScore) (COUNT(?factCheck) AS ?total)
WHERE {
  ?factCheck a schema:MediaReview ;
             schema:reviewRating/schema:ratingValue ?score .
}
```

**Full documentation**: `/backend/docs/SPARQL_QUERIES.md` (12 example queries)

---

## 🔬 Testing

### Test Coverage: 30/30 Passing ✅

```bash
# Run all tests
cd backend
pnpm test

# Output:
PASS  src/__tests__/dkg.service.test.ts (7 tests)
PASS  src/__tests__/deepfake-analysis.service.test.ts (10 tests)
PASS  src/__tests__/consensus.service.test.ts (13 tests)

Test Suites: 3 passed, 3 total
Tests:       30 passed, 30 total
Snapshots:   0 total
Time:        29.122s
```

### Test Categories

**DKG Service Tests** (7 tests):
- ✅ Client initialization
- ✅ JSON-LD structure validation
- ✅ Deepfake score range (0-1)
- ✅ Knowledge Asset required fields
- ✅ SPARQL query syntax

**Deepfake Analysis Tests** (10 tests):
- ✅ Result structure validation
- ✅ Score bounds (0-1)
- ✅ Confidence calculation
- ✅ Deterministic results (same file = same score)
- ✅ Model specification
- ✅ Processing time tracking
- ✅ Artifact detection for high scores

**Consensus Service Tests** (13 tests):
- ✅ Result structure
- ✅ Agreement rate calculation
- ✅ Confidence formula (40% stake + 30% reputation + 20% model + 10% count)
- ✅ Stake weighting (amount × multiplier × sqrt(reputation))
- ✅ Majority verdict logic
- ✅ Verification count scaling

### Run Specific Tests

```bash
# Test DKG integration
pnpm test dkg.service

# Test consensus algorithm
pnpm test consensus.service

# Test deepfake analysis
pnpm test deepfake-analysis.service

# Watch mode
pnpm test -- --watch
```

---

## 📁 Project Structure

```
polk/
├── frontend/                   # React + Vite + TailwindCSS
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx      # Polkadot wallet connection
│   │   │   ├── Sidebar.jsx     # Navigation
│   │   │   ├── Layout.jsx      # App shell
│   │   │   └── ProtectedRoute.jsx  # Wallet-gated routes
│   │   ├── pages/
│   │   │   ├── LandingStandalone.jsx  # Marketing page
│   │   │   ├── Dashboard.jsx          # Fact-check listings
│   │   │   ├── Upload.jsx             # Media upload + analysis
│   │   │   ├── FactCheckDetail.jsx    # Full report view
│   │   │   ├── Staking.jsx            # Multi-token staking UI
│   │   │   └── HighConfidence.jsx     # x402 premium content
│   │   ├── contexts/
│   │   │   ├── PolkadotWalletContext.jsx  # Polkadot.js integration
│   │   │   └── ThemeContext.jsx           # Dark mode
│   │   └── config/
│   │       └── api.js          # API_URL configuration
│   └── package.json
│
├── backend/                    # Express + TypeScript + Prisma
│   ├── src/
│   │   ├── api/                # REST API routes
│   │   │   ├── media.routes.ts       # Media upload
│   │   │   ├── factcheck.routes.ts   # Fact-check CRUD
│   │   │   ├── staking.routes.ts     # Multi-token staking
│   │   │   ├── consensus.routes.ts   # Guardian voting
│   │   │   ├── x402.routes.ts        # Micropayments
│   │   │   └── rdf.routes.ts         # RDF export (NEW)
│   │   ├── services/
│   │   │   ├── dkg.service.ts        # OriginTrail DKG v8.2.0
│   │   │   ├── deepfake-analysis.service.ts  # AI detection
│   │   │   ├── consensus.service.ts  # Weighted voting
│   │   │   ├── x402.service.ts       # Payment processing
│   │   │   └── rdf.service.ts        # RDF triple generation (NEW)
│   │   ├── config/
│   │   │   ├── index.ts              # App config
│   │   │   └── tokens.ts             # Multi-token support
│   │   ├── middleware/
│   │   │   ├── errorHandler.ts       # Global error handling
│   │   │   └── requestLogger.ts      # Request logging
│   │   ├── __tests__/          # Jest test suites (30 tests)
│   │   │   ├── dkg.service.test.ts
│   │   │   ├── deepfake-analysis.service.test.ts
│   │   │   └── consensus.service.test.ts
│   │   ├── scripts/
│   │   │   └── publish-test-asset.ts  # Test DKG publishing
│   │   ├── mcp-server.ts       # Model Context Protocol server (NEW)
│   │   └── index.ts            # Express app
│   ├── prisma/
│   │   └── schema.prisma       # Database schema (SQLite)
│   ├── docs/
│   │   └── SPARQL_QUERIES.md   # 12 SPARQL examples (NEW)
│   ├── .env.example            # Environment template
│   ├── claude_desktop_config.json  # MCP configuration
│   └── package.json
│
├── SECURITY.md                 # Security best practices
├── GET_TESTNET_TOKENS.md      # Token acquisition guide
└── package.json                # Root workspace
```

---

## 🚢 Deployment

### Frontend (Vercel / Netlify)

```bash
cd frontend
pnpm build

# Output: dist/
# Deploy dist/ folder to Vercel/Netlify
```

**Environment Variables**:
```bash
VITE_API_URL=https://api.yourdomain.com
```

### Backend (Railway / Fly.io / Render)

```bash
cd backend
pnpm build

# Output: dist/
# Start: node dist/index.js
```

**Environment Variables** (Production):
```bash
# Use NeuroWeb Mainnet
DKG_BLOCKCHAIN=otp:2043
DKG_NODE_ENDPOINT=https://v6-neuroweb-node-01.origin-trail.network
DKG_PRIVATE_KEY=<use secrets manager>

# Database (PostgreSQL recommended)
DATABASE_URL=postgresql://user:pass@host:5432/dbname?sslmode=require

# CORS
FRONTEND_URL=https://yourdomain.com
```

**⚠️ Security for Production**:
- Use AWS Secrets Manager or HashiCorp Vault for private keys
- Enable HTTPS/TLS
- Configure WAF (Web Application Firewall)
- Set up monitoring and alerts
- Use PostgreSQL instead of SQLite
- Enable rate limiting
- See `/SECURITY.md` for full checklist

### Railway Deployment

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link project
railway link

# Set environment variables
railway variables set DKG_PRIVATE_KEY=0x...
railway variables set DATABASE_URL=postgresql://...

# Deploy
railway up
```

---

## 🔐 Security Considerations

### Private Key Management

**⚠️ CRITICAL**: The repository includes a test wallet for demo purposes. This wallet:
- Contains **testnet tokens only** (no real value)
- Private key is **publicly visible** in `.env`
- **NEVER** use this wallet for mainnet
- **NEVER** send real tokens to this address

**For Production**:
1. Generate new wallet via Polkadot.js extension
2. Store private key in secrets manager (AWS Secrets Manager, HashiCorp Vault)
3. Use environment variables, never commit to git
4. Enable 2FA on all accounts
5. Use hardware wallet (Ledger/Trezor) for high-value operations
6. See `/SECURITY.md` for complete guide

### API Security

**Implemented**:
- ✅ CORS configuration
- ✅ Helmet security headers
- ✅ Rate limiting (15 minutes / 100 requests)
- ✅ Input validation (Zod schemas)
- ✅ SQL injection prevention (Prisma ORM)
- ✅ XSS prevention (React escaping)

**Production Additions**:
- [ ] API authentication (JWT tokens)
- [ ] Request signing
- [ ] DDoS protection
- [ ] WAF configuration
- [ ] Audit logging

---

## 🏆 Hackathon Compliance

### DKGcon 2025 Requirements ✅

- ✅ **DKG Edge Node Integration**: dkg.js v8.2.0 SDK, real testnet publishing
- ✅ **Knowledge Assets**: Valid Schema.org MediaReview JSON-LD format
- ✅ **Agent-Knowledge-Trust**: Complete 3-layer architecture
- ✅ **NeuroWeb/Polkadot**: On-chain staking, Polkadot.js wallet integration
- ✅ **x402 Micropayments**: Payment gating for high-confidence content
- ✅ **MCP Server**: 8 tools for AI agent integration
- ✅ **RDF Export**: Semantic web integration (Turtle, N-Triples, N-Quads)
- ✅ **SPARQL Queries**: 12 example queries for Knowledge Graph
- ✅ **Functional Prototype**: Complete upload → analyze → stake → publish flow
- ✅ **Test Coverage**: 30/30 tests passing
- ✅ **Documentation**: Comprehensive README, API docs, setup guides

### Judging Criteria Alignment

**💡 Excellence & Innovation (20%)**
- First decentralized fact-checking with MCP server for AI agents
- Multi-chain coordination (NeuroWeb + Base Sepolia)
- Multi-token staking with Polkadot ecosystem bonuses
- RDF export for semantic web integration
- Complete AI provenance tracking

**⚙️ Technical Implementation (40%)**
- Full-stack: React + Express + Prisma + DKG
- Real DKG integration (not mock) with testnet publishing
- 30/30 automated tests
- Production-ready code quality
- Polkadot.js wallet integration
- Working x402 payments

**💥 Impact & Relevance (20%)**
- Addresses deepfake/misinformation crisis
- Economic sustainability via tiered pricing
- Scalable to millions of fact-checks
- Composable Knowledge Assets
- Interoperable with semantic web tools

**⚖️ Ethics & Openness (10%)**
- Transparent AI provenance
- Open-source (MIT license)
- Verifiable on-chain data
- Decentralized governance
- No vendor lock-in

**🎬 Communication (10%)**
- Clear architecture diagrams
- Comprehensive documentation
- Step-by-step setup guide
- Working code examples
- API reference

---

## 📚 Additional Documentation

- **SPARQL Queries**: `/backend/docs/SPARQL_QUERIES.md` - 12 example queries
- **Security Guide**: `/SECURITY.md` - Best practices and checklist
- **Token Guide**: `/GET_TESTNET_TOKENS.md` - How to get testnet tokens
- **Environment Template**: `/backend/.env.example` - Configuration reference
- **Integration Status**: `/INTEGRATION_COMPLETE.md` - Full feature list

---

## 🔗 Links

- **Repository**: https://github.com/winsznx/polk
- **Live Demo**: [TBD - Add deployment URL]
- **Video Demo**: [TBD - Add YouTube link]
- **DKG Explorer**: https://dkg.origintrail.io
- **NeuroWeb Explorer**: https://neuroweb-testnet.subscan.io
- **OriginTrail Docs**: https://docs.origintrail.io
- **Polkadot.js**: https://polkadot.js.org

---

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

**Development Guidelines**:
- Write tests for new features
- Follow existing code style
- Update documentation
- Ensure all tests pass (`pnpm test`)

---

## 📜 License

MIT © 2025 winsznx

---

## 🙏 Acknowledgments

- **OriginTrail** - DKG protocol and dkg.js SDK
- **Polkadot** - Blockchain infrastructure and NeuroWeb parachain
- **Coinbase** - x402 micropayment protocol
- **Anthropic** - Model Context Protocol (MCP)
- **DKGcon 2025** - Hackathon organization and inspiration

---

## 📧 Contact

- **GitHub**: [@winsznx](https://github.com/winsznx)
- **Email**: winsznx@gmail.com
- **Twitter**: [@winsznx](https://twitter.com/winsznx)
- **Discord**: winsznx#1234

---

## 🎯 Quick Commands Reference

```bash
# Development
pnpm install          # Install all dependencies
pnpm dev             # Start both frontend and backend
pnpm build           # Build for production
pnpm test            # Run all tests

# Backend
cd backend
pnpm dev             # Start backend only
pnpm db:push         # Push database schema
pnpm db:studio       # Open Prisma Studio
pnpm dkg:publish-test  # Test DKG publishing
pnpm mcp             # Start MCP server

# Frontend
cd frontend
pnpm dev             # Start frontend only
pnpm build           # Build frontend
```

---

**Built for DKGcon 2025 Hackathon** | Scaling Trust in the Age of AI

**Status**: ✅ Production-Ready | 🧪 30/30 Tests Passing | 🔐 Security Documented | 📚 Fully Integrated
