# Architecture Documentation

## System Overview

The Verifiable Deepfake Notary is a full-stack decentralized application that integrates AI deepfake detection with blockchain-based knowledge verification. The system demonstrates a complete Agent → Knowledge → Trust pipeline.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND LAYER                        │
│                  React + JavaScript                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │ Landing  │  │Dashboard │  │  Upload  │  │Details  │ │
│  │   Page   │  │   Page   │  │   Page   │  │  Page   │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
└────────────────────┬────────────────────────────────────┘
                     │ REST API (axios)
                     ↓
┌─────────────────────────────────────────────────────────┐
│                    BACKEND LAYER                         │
│              Express + TypeScript + Prisma               │
│  ┌──────────────────────────────────────────────────┐  │
│  │             API Routes Layer                      │  │
│  │  /media  /factcheck  /staking  /consensus  /x402 │  │
│  └──────────────────┬──────────────────────────────┘   │
│                     ↓                                    │
│  ┌──────────────────────────────────────────────────┐  │
│  │             Services Layer (Agents)               │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │  │
│  │  │Deepfake  │  │Consensus │  │Monetization  │   │  │
│  │  │Analysis  │  │  Agent   │  │   Agent      │   │  │
│  │  └──────────┘  └──────────┘  └──────────────┘   │  │
│  │  ┌──────────┐  ┌──────────┐                      │  │
│  │  │   DKG    │  │ Guardian │                      │  │
│  │  │ Service  │  │ Service  │                      │  │
│  │  └──────────┘  └──────────┘                      │  │
│  └──────────────────┬──────────────────────────────┘   │
│                     ↓                                    │
│  ┌──────────────────────────────────────────────────┐  │
│  │           Data Layer (Prisma + SQLite)            │  │
│  │  Guardian | Media | FactCheck | Stake |          │  │
│  │  Consensus | ConsensusVote | X402Payment         │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────┐
│              EXTERNAL INTEGRATIONS                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ OriginTrail  │  │   Guardian   │  │     x402     │  │
│  │     DKG      │  │  Social Graph│  │ Micropayments│  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Frontend (React + JavaScript)

**Technology Stack:**
- React 18.2
- Vite (build tool)
- Tailwind CSS (styling)
- React Router (navigation)
- Axios (HTTP client)
- Lucide React (icons)

**Key Pages:**
- **Landing Page**: Feature showcase and project overview
- **Dashboard**: Statistics and recent fact-checks
- **Upload Page**: Media upload with drag-and-drop
- **Fact-Check Detail**: Comprehensive verification results
- **Staking Page**: Token staking interface
- **High-Confidence Access**: x402-gated premium notes

**Design System:**
- Colors: Pale Blue (#EFFAFD), Royal Blue (#4A8BDF), Eggplant (#A0006D)
- Fonts: DM Sans (body), Space Grotesk (headings)
- Responsive: Mobile-first with sidebar navigation
- Dark/Light mode support

### 2. Backend (Express + TypeScript)

**Technology Stack:**
- Express.js 4.18
- TypeScript 5.3
- Prisma ORM 5.22
- SQLite (database)
- Multer (file uploads)

**API Structure:**

```
/api
  /media
    POST   /upload          - Upload media file
    GET    /:id            - Get media by ID
  /factcheck
    POST   /create         - Create fact-check (runs analysis)
    GET    /:id            - Get fact-check by ID
    GET    /media/:mediaId - Get all fact-checks for media
  /staking
    POST   /stake          - Stake tokens on fact-check
    GET    /guardian/:id   - Get guardian's stakes
  /consensus
    POST   /calculate/:mediaId - Calculate consensus
    GET    /:factCheckId       - Get consensus results
  /x402
    POST   /generate-invoice   - Generate x402 invoice
    POST   /pay/:invoiceId     - Process mock payment
    GET    /high-confidence/:id - Get premium fact-check
```

### 3. Agent Layer

**Three Specialized Agents:**

#### Deepfake Analysis Agent
**File**: `backend/src/services/deepfake-analysis.service.ts`

**Responsibilities:**
- Media hashing (SHA-256)
- Deepfake detection (XceptionNet model - mocked)
- Artifact detection
- Confidence scoring

**Output**: DeepfakeResult with score, confidence, artifacts, processing time

#### Consensus Validation Agent
**File**: `backend/src/services/consensus.service.ts`

**Responsibilities:**
- Aggregate multiple fact-checks
- Calculate reputation-weighted consensus
- Execute rewards/slashing
- Update consensus state

**Formula:**
```
confidenceScore =
  0.40 * weightedStakeAgreement +
  0.30 * guardianReputationAvg +
  0.20 * modelConfidenceAvg +
  0.10 * verificationCountWeight
```

#### Monetization/x402 Agent
**File**: `backend/src/services/x402.service.ts`

**Responsibilities:**
- Generate x402 invoices
- Verify payments (mocked)
- Gate high-confidence access
- Pricing tiers (free / $0.0001 / $0.0003)

### 4. Knowledge Layer

**DKG Service:**
**File**: `backend/src/services/dkg.service.ts`

**Implementation**: Real OriginTrail DKG Edge Node integration using dkg.js SDK v8.2.0

**Configuration:**
- Local: hardhat1:31337 with localhost:8900
- Testnet: otp:20430 (NeuroWeb Testnet)
- Mainnet: otp:2043 (NeuroWeb Mainnet)

**Functions:**
- `publish(asset)`: Publish Knowledge Assets to DKG, returns UAL
- `query(sparql, type)`: Query DKG using SPARQL
- `get(ual)`: Retrieve Knowledge Asset by UAL
- `getNodeInfo()`: Get DKG node information

**DKG Client Configuration:**
```typescript
new DKG({
  endpoint: process.env.DKG_NODE_ENDPOINT,
  port: process.env.DKG_NODE_PORT,
  blockchain: {
    name: 'otp:20430',
    privateKey: process.env.DKG_PRIVATE_KEY,
    rpcEndpoints: ['https://lofar-testnet.origin-trail.network'],
    hubContract: '0xe233b5b78853a62b1e11ebe88bf083e25b0a57a6'
  },
  maxNumberOfRetries: 300,
  frequency: 2,
  contentType: 'all',
  environment: 'testnet'
})
```

**Knowledge Asset Structure (JSON-LD):**
```json
{
  "@context": "https://schema.org",
  "@type": "MediaReview",
  "identifier": "factcheck-abc123",
  "mediaItem": {
    "@type": "MediaObject",
    "contentUrl": "ipfs://...",
    "sha256": "0xabc...",
    "uploadedAt": "2025-11-18T10:21:00Z"
  },
  "claimReviewed": "Media authenticity verification",
  "reviewRating": {
    "@type": "Rating",
    "ratingValue": 0.12,
    "bestRating": 1.0,
    "worstRating": 0.0,
    "confidenceScore": 0.89,
    "consensusWeight": 0.92
  },
  "provenance": {
    "detectionModel": "XceptionNet-v2.1",
    "modelVersion": "2.1.0",
    "analyzedAt": "2025-11-18T10:21:15Z",
    "processingTime": "3.45s",
    "artifactsDetected": ["face_warping", "color_inconsistency"]
  },
  "author": {
    "@type": "Person",
    "identifier": "guardian:actor:12345",
    "reputationScore": 0.87,
    "verificationCount": 234,
    "accuracyRate": 0.91
  },
  "stake": {
    "amount": "50",
    "currency": "TRAC",
    "locked": true,
    "unlockCondition": "consensus_complete"
  }
}
```

**UAL Format:**
`did:dkg:otp:20430/0x{blockchain-address}/{timestamp}`

**Publishing Flow:**
1. Create JSON-LD Knowledge Asset from fact-check data
2. Call `dkgClient.asset.create()` with asset data
3. SDK publishes to configured DKG node
4. Blockchain transaction commits asset to NeuroWeb
5. Returns UAL (Universal Asset Locator)
6. Asset becomes queryable via SPARQL

**Demo Mode:**
- If testnet wallet lacks TRAC tokens, falls back to demo UAL
- Demo UAL format: `did:dkg:otp:20430/0x{random}/{timestamp}`
- Frontend detects demo mode when address length < 42 chars

### 5. Trust Layer

**Guardian Service:**
**File**: `backend/src/services/guardian.service.ts`

Integrates with Guardian Social Graph to:
- Fetch/create Guardian actors
- Track reputation scores
- Calculate verification counts
- Measure accuracy rates

**Staking Mechanism:**
- Min stake: 10 TRAC
- Max stake: 500 TRAC
- Reward: +15% for consensus majority
- Slash: -10% for consensus minority
- Consensus threshold: 70% agreement

### 6. Database Schema

**Models** (7 total):

1. **Guardian**: Actors with reputation
2. **Media**: Uploaded files with SHA-256 hashes
3. **FactCheck**: Analysis results
4. **Stake**: Token stakes on fact-checks
5. **Consensus**: Aggregated verification results
6. **ConsensusVote**: Individual votes
7. **X402Payment**: Micropayment records

**Relationships:**
```
Guardian 1:N FactCheck
Guardian 1:N Stake
Media 1:N FactCheck
FactCheck 1:N Stake
FactCheck 1:1 Consensus
Consensus 1:N ConsensusVote
```

## Data Flow

### Upload & Analysis Flow

```
1. User uploads media → /api/media/upload
2. Backend hashes file (SHA-256)
3. Store Media record in DB
4. Return mediaId to frontend

5. Frontend calls /api/factcheck/create
6. Guardian API: Fetch/create actor
7. Deepfake Agent: Analyze media
8. Generate JSON-LD Knowledge Asset
9. DKG Service: Publish to OriginTrail
10. Store FactCheck in DB
11. Return results to frontend
```

### Staking Flow

```
1. User stakes on fact-check → /api/staking/stake
2. Validate stake amount (10-500 TRAC)
3. Create Stake record
4. Update Guardian totalStake
5. Return confirmation
```

### Consensus Flow

```
1. System calls /api/consensus/calculate/:mediaId
2. Fetch all FactChecks for media
3. Calculate weighted stakes:
   effectiveStake = stake * sqrt(reputationScore)
4. Determine majority verdict
5. Calculate confidence score
6. Create/update Consensus record
7. Execute rewards/slashing for all stakes
8. Return consensus results
```

### x402 Access Flow

```
1. Request high-confidence note
2. Generate invoice with pricing tier
3. Mock payment verification
4. Grant access to fact-check data
5. Log access for revenue distribution
```

## Security Considerations

**Backend:**
- Helmet.js (security headers)
- CORS configuration
- Express rate limiting
- Input validation on all endpoints
- File upload size limits (100MB)
- File type validation

**Frontend:**
- Input sanitization
- Error boundaries
- CSP compliance

## Performance Optimizations

1. **Database Indexing**: SHA-256 hashes, Guardian IDs
2. **File Storage**: Local uploads directory
3. **API Response Caching**: (future enhancement)
4. **Lazy Loading**: Route-based code splitting

## Deployment Architecture

**Development:**
```
Backend:  localhost:3001
Frontend: localhost:5173 (Vite dev server)
Database: SQLite file (./dev.db)
```

**Production:** (recommended)
```
Backend:  Cloud service (AWS/GCP/Azure)
Frontend: CDN (Vercel/Netlify)
Database: PostgreSQL or managed SQLite
DKG Node: Dedicated server or cloud instance
```

## Future Enhancements

1. **Real Deepfake Model**: Integrate actual XceptionNet/EfficientNet
2. **On-Chain Staking**: Deploy smart contracts
3. **Real x402 Integration**: Actual micropayment processing
4. **WebSocket Updates**: Real-time consensus notifications
5. **IPFS Integration**: Decentralized media storage
6. **Advanced Analytics**: Dashboard charts and trends
7. **Multi-Chain Support**: Polkadot parachain integration

## Development Workflow

```bash
# Install dependencies
pnpm install

# Setup database
cd backend
pnpm db:push

# Run development servers
# Terminal 1: Backend
cd backend && pnpm dev

# Terminal 2: Frontend
cd frontend && pnpm dev
```

## Testing Strategy

- **Backend**: Jest + Supertest (API tests)
- **Frontend**: Jest + React Testing Library
- **Integration**: End-to-end with full flow
- **Target Coverage**: 80%+

---

**Last Updated**: 2025-11-18
**Version**: 1.0.0
