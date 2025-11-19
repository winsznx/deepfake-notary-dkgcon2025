# Agent Layer Documentation

## Overview

The Verifiable Deepfake Notary implements a multi-agent architecture where specialized AI agents coordinate to perform deepfake detection, consensus validation, and access monetization. This document describes the three core agents and their interactions within the Agent-Knowledge-Trust framework.

## Agent Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      AGENT LAYER                             │
│                                                               │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────┐ │
│  │   Deepfake       │  │   Consensus      │  │Monetization│ │
│  │   Analysis       │  │   Validation     │  │   Agent    │ │
│  │   Agent          │  │   Agent          │  │  (x402)    │ │
│  └────────┬─────────┘  └────────┬─────────┘  └─────┬──────┘ │
│           │                     │                   │        │
│           │                     │                   │        │
└───────────┼─────────────────────┼───────────────────┼────────┘
            │                     │                   │
            ↓                     ↓                   ↓
    ┌───────────────────────────────────────────────────┐
    │            KNOWLEDGE LAYER (DKG)                   │
    │    Knowledge Assets published as JSON-LD/RDF      │
    └───────────────────────────────────────────────────┘
            │                     │                   │
            ↓                     ↓                   ↓
    ┌───────────────────────────────────────────────────┐
    │              TRUST LAYER                           │
    │    Staking, Reputation, Guardian Social Graph     │
    └───────────────────────────────────────────────────┘
```

## Agent 1: Deepfake Analysis Agent

**File**: `backend/src/services/deepfake-analysis.service.ts`

**Purpose**: Automated deepfake detection and artifact analysis

### Responsibilities

1. **Media Hashing**
   - Compute SHA-256 hash of uploaded media
   - Ensure content integrity and uniqueness
   - Enable duplicate detection

2. **Deepfake Detection**
   - Apply AI model (XceptionNet-based architecture)
   - Generate deepfake probability score (0.0 = authentic, 1.0 = deepfake)
   - Identify manipulation artifacts

3. **Confidence Scoring**
   - Calculate model confidence in prediction
   - Account for media quality factors
   - Provide uncertainty quantification

4. **Artifact Detection**
   - Face warping detection
   - Color inconsistency analysis
   - Lighting anomaly detection
   - Temporal coherence issues (for video)

### Interface

```typescript
interface DeepfakeResult {
  deepfakeScore: number;        // 0.0 - 1.0
  confidenceScore: number;      // 0.0 - 1.0
  artifactsDetected: string[];  // Array of artifact types
  processingTime: number;       // Seconds
  modelUsed: string;           // Model identifier
}

async analyzeMedia(mediaPath: string): Promise<DeepfakeResult>
```

### Example Output

```json
{
  "deepfakeScore": 0.12,
  "confidenceScore": 0.89,
  "artifactsDetected": ["face_warping", "color_inconsistency"],
  "processingTime": 3.45,
  "modelUsed": "XceptionNet-v2.1"
}
```

### Integration Points

- **Input**: Media file path from upload endpoint
- **Output**: Deepfake analysis results to DKG Service
- **Dependencies**: File system, AI model weights

## Agent 2: Consensus Validation Agent

**File**: `backend/src/services/consensus.service.ts`

**Purpose**: Aggregate multiple fact-checks and calculate reputation-weighted consensus

### Responsibilities

1. **Consensus Calculation**
   - Aggregate multiple Guardian verifications
   - Weight by stake amounts and reputation scores
   - Determine majority verdict
   - Calculate overall confidence

2. **Reputation Integration**
   - Fetch Guardian reputation from social graph
   - Apply reputation weighting to votes
   - Track historical accuracy

3. **Rewards & Slashing**
   - Distribute rewards to majority voters (+15%)
   - Slash minority voters (-10%)
   - Update stake balances
   - Adjust Guardian reputation scores

4. **Consensus Scoring**
   - Calculate weighted confidence score
   - Determine consensus strength
   - Identify edge cases requiring manual review

### Consensus Formula

```
confidenceScore =
  0.40 × weightedStakeAgreement +
  0.30 × guardianReputationAvg +
  0.20 × modelConfidenceAvg +
  0.10 × verificationCountWeight

where:
  weightedStakeAgreement = Σ(stake_i × sqrt(reputation_i)) / Σ(stake_i)
  guardianReputationAvg = Σ(reputation_i) / n
  modelConfidenceAvg = Σ(confidence_i) / n
  verificationCountWeight = min(1.0, verificationCount / 10)
```

### Interface

```typescript
interface ConsensusResult {
  mediaId: string;
  consensusScore: number;
  totalStake: number;
  guardianCount: number;
  agreementPercentage: number;
  majorityVerdict: 'authentic' | 'deepfake';
  rewardsDistributed: number;
  slashedAmount: number;
}

async calculateConsensus(mediaId: string): Promise<ConsensusResult>
async executeRewardsAndSlashing(consensus: Consensus, votes: ConsensusVote[]): Promise<void>
```

### Example Output

```json
{
  "mediaId": "media_abc123",
  "consensusScore": 0.87,
  "totalStake": 450,
  "guardianCount": 5,
  "agreementPercentage": 0.82,
  "majorityVerdict": "deepfake",
  "rewardsDistributed": 67.5,
  "slashedAmount": 18.0
}
```

### Integration Points

- **Input**: Media ID with multiple fact-checks
- **Output**: Consensus results to DKG and database
- **Dependencies**: Guardian Service, Staking Service, Database

## Agent 3: Monetization Agent (x402)

**File**: `backend/src/services/x402.service.ts`

**Purpose**: Gate access to high-confidence fact-checks via x402 micropayments

### Responsibilities

1. **Invoice Generation**
   - Create x402 payment invoices
   - Calculate pricing based on confidence tier
   - Set expiration times

2. **Payment Verification**
   - Verify micropayment completion (mocked)
   - Grant access to gated content
   - Log payment events

3. **Pricing Tiers**
   - Low confidence (<0.7): Free
   - Medium confidence (0.7-0.85): $0.0001 USDC
   - High confidence (>0.85): $0.0003 USDC

4. **Access Control**
   - Require payment for high-confidence notes
   - Allow free access to low-confidence data
   - Track revenue for future distribution

### Interface

```typescript
interface X402Invoice {
  invoiceId: string;
  amount: number;
  currency: string;
  factCheckId: string;
  paymentUrl: string;
  expiresAt: string;
}

async generateInvoice(factCheckId: string, confidenceScore: number): Promise<X402Invoice>
async verifyPayment(invoiceId: string, payerAddress: string): Promise<boolean>
requiresPayment(confidenceScore: number): boolean
```

### Example Flow

```
1. User requests high-confidence fact-check
2. Agent checks confidence score (0.92 > 0.7)
3. Generate invoice for $0.0003 USDC
4. Return payment URL to user
5. User completes payment
6. Verify payment
7. Grant access to full fact-check data
```

### Integration Points

- **Input**: Fact-check ID and confidence score
- **Output**: Payment invoice and access grants
- **Dependencies**: Database, payment processor (mocked)

## Agent Coordination

### Upload & Analysis Workflow

```
1. User uploads media → Upload endpoint
2. Media hashed and stored
3. Deepfake Analysis Agent triggered
   ↓
4. Analysis results generated
5. DKG Service publishes Knowledge Asset
6. Fact-check stored in database
   ↓
7. If confidence > 0.7:
   - Monetization Agent generates invoice
   - Access gated until payment
8. If confidence ≤ 0.7:
   - Free access granted
```

### Consensus Workflow

```
1. Multiple Guardians analyze same media
2. Each creates fact-check with stake
3. Consensus Validation Agent triggered
   ↓
4. Aggregate all fact-checks
5. Calculate weighted consensus
6. Determine majority verdict
   ↓
7. Execute rewards for majority
8. Execute slashing for minority
9. Update consensus in DKG
10. Update Guardian reputations
```

### High-Confidence Access Workflow

```
1. User requests premium fact-check
2. Monetization Agent checks confidence
3. If requires payment:
   - Generate x402 invoice
   - Return payment URL
4. User pays invoice
5. Monetization Agent verifies payment
6. Grant access to full data
7. Log access for revenue tracking
```

## Agent Communication

All agents communicate through:

1. **Database** (shared state)
   - Prisma ORM with SQLite
   - Ensures consistency

2. **DKG Service** (knowledge layer)
   - Publish Knowledge Assets
   - Query historical data

3. **API Layer** (orchestration)
   - Express routes coordinate agent calls
   - Handle request/response flow

## Future Enhancements

1. **Real AI Models**: Replace mocked deepfake detection with actual XceptionNet
2. **On-Chain Staking**: Move staking to smart contracts
3. **Real x402**: Integrate actual micropayment protocol
4. **Agent Autonomy**: Enable agents to trigger each other autonomously
5. **Multi-Agent Negotiation**: Allow agents to negotiate consensus parameters
6. **Cross-Chain Integration**: Enable agents to work across Polkadot parachains

## Testing

Each agent should have:

- Unit tests for core logic
- Integration tests with dependencies
- Mock external services (AI models, payment processors)
- Performance benchmarks

Example test structure:

```typescript
describe('Deepfake Analysis Agent', () => {
  test('should hash media correctly', async () => {
    const result = await deepfakeAgent.analyzeMedia(testMediaPath);
    expect(result.sha256).toMatch(/^[a-f0-9]{64}$/);
  });

  test('should detect deepfake artifacts', async () => {
    const result = await deepfakeAgent.analyzeMedia(deepfakeMediaPath);
    expect(result.deepfakeScore).toBeGreaterThan(0.5);
    expect(result.artifactsDetected.length).toBeGreaterThan(0);
  });
});
```

---

**Last Updated**: 2025-11-19
**Version**: 1.0.0
