# DKG Integration Status

## Current Implementation: Simulation Layer

For the hackathon demo, the DKG integration uses a **simulation layer** that generates valid DKG-compatible data structures without requiring a live Edge Node.

### What's Simulated

**DKG Service** (`backend/src/services/dkg.service.ts`):
- `publish()` - Generates mock UAL (Universal Asset Locator)
- `query()` - Returns empty results
- `get()` - Returns null

**Why Simulation?**
- Rapid prototyping and testing
- No dependency on external node availability
- Demonstrates complete Agent → Knowledge → Trust pipeline
- All data structures are production-ready

### What's Production-Ready

✅ **JSON-LD Knowledge Assets**
- Fully compliant with schema.org standards
- Complete provenance metadata
- Guardian reputation integration
- Staking and consensus data

✅ **Architecture**
- Service layer abstraction
- Environment configuration
- Error handling
- Logging

✅ **Data Flow**
- Media → Analysis → Knowledge Asset → DKG
- Consensus → Update Asset
- x402 → Monetization

---

## Production Integration Guide

### Step 1: Install DKG SDK

```bash
cd backend
pnpm add dkg.js
```

### Step 2: Setup DKG Edge Node

Follow the official guide:
https://docs.origintrail.io/dkg-v6-beta/node-setup-instructions/setup-instructions-dockerless

Or use Docker:
```bash
git clone https://github.com/OriginTrail/ot-node.git
cd ot-node
docker-compose up -d
```

Verify node is running:
```bash
curl http://localhost:8900/info
```

### Step 3: Update DKG Service

Replace the mock implementation in `backend/src/services/dkg.service.ts`:

```typescript
import DKG from 'dkg.js';
import { config } from '../config';

export class DKGService {
  private dkg: any;

  constructor() {
    this.dkg = new DKG({
      endpoint: config.dkg.nodeUrl,
      port: config.dkg.nodePort,
      blockchain: {
        name: config.dkg.blockchain,
        publicKey: process.env.DKG_PUBLIC_KEY,
        privateKey: process.env.DKG_PRIVATE_KEY
      }
    });
  }

  async publish(asset: KnowledgeAsset): Promise<string> {
    try {
      const result = await this.dkg.asset.create(
        {
          public: asset
        },
        {
          epochsNum: 2
        }
      );

      console.log('Published to DKG:', result.UAL);
      return result.UAL;
    } catch (error) {
      console.error('DKG publish error:', error);
      throw new Error('Failed to publish to DKG');
    }
  }

  async query(query: string): Promise<any[]> {
    try {
      const results = await this.dkg.graph.query(query, 'SELECT');
      return results.data;
    } catch (error) {
      console.error('DKG query error:', error);
      throw new Error('Failed to query DKG');
    }
  }

  async get(ual: string): Promise<KnowledgeAsset | null> {
    try {
      const result = await this.dkg.asset.get(ual);
      return result.public;
    } catch (error) {
      console.error('DKG get error:', error);
      return null;
    }
  }
}
```

### Step 4: Add Environment Variables

Update `backend/.env`:

```bash
# DKG Configuration
DKG_NODE_URL=http://localhost:8900
DKG_NODE_PORT=8900
DKG_BLOCKCHAIN=otp:2043
DKG_PUBLIC_KEY=0x...
DKG_PRIVATE_KEY=0x...
```

### Step 5: Test Integration

```bash
# Start DKG node
cd ot-node && docker-compose up -d

# Start backend
cd backend && pnpm dev

# Upload media and verify UAL is real
curl -X POST http://localhost:3001/api/factcheck/create \
  -H "Content-Type: application/json" \
  -d '{"mediaId":"...","guardianIdentifier":"0x123"}'
```

---

## Migration Checklist

When ready for production:

- [ ] Install dkg.js SDK
- [ ] Run DKG Edge Node (local or remote)
- [ ] Update DKG service implementation
- [ ] Add blockchain credentials to .env
- [ ] Test publish/query/get operations
- [ ] Update frontend to show real DKG explorer links
- [ ] Monitor gas costs and optimize epochs

---

## Demo vs Production

| Feature | Demo (Current) | Production |
|---------|---------------|------------|
| Knowledge Assets | ✅ Valid JSON-LD | ✅ Same |
| UAL Generation | Mock format | Real blockchain UAL |
| Query Support | Returns empty | Real SPARQL queries |
| Persistence | Database only | Blockchain + Database |
| Verifiability | Local | Global DKG network |
| Gas Costs | Free | TRAC tokens required |

---

## Why This Approach Works

**For Hackathons:**
- Demonstrates understanding of DKG architecture
- Shows correct data modeling
- Enables full demo without infrastructure complexity
- Faster iteration during development

**For Production:**
- Drop-in replacement (service pattern)
- No changes to business logic
- Same Knowledge Asset format
- Minimal refactoring needed

---

**Status:** Demo-ready ✅ | Production-ready architecture ✅ | Real integration: ~2 hours
