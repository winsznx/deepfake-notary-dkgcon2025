# DKG Edge Node Setup

This guide walks through setting up the OriginTrail DKG Edge Node for local development.

## Prerequisites

- Docker & Docker Compose
- Node.js 18+
- 8GB+ RAM recommended

## Installation Steps

### 1. Clone DKG Edge Node Repository

```bash
git clone https://github.com/OriginTrail/ot-node.git
cd ot-node
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```bash
NODE_ENV=development
BLOCKCHAIN=otp:2043
RPC_ENDPOINT=https://lofar-testnet.origin-trail.network
```

### 3. Start DKG Node

```bash
docker-compose up -d
```

### 4. Verify Node is Running

```bash
curl http://localhost:8900/info
```

You should see node information including:
- Node ID
- Blockchain network
- Version

## Integration with Deepfake Notary

### Update Backend Configuration

In `backend/.env`:

```bash
DKG_NODE_URL=http://localhost:8900
DKG_NODE_PORT=8900
DKG_BLOCKCHAIN=otp:2043
```

### Test Connection

```bash
# From backend directory
npm run test:dkg
```

## Publishing Knowledge Assets

### Example: Publish Fact-Check

```javascript
import { dkgService } from './services/dkg.service';

const asset = {
  '@context': 'https://schema.org',
  '@type': 'MediaReview',
  // ... rest of asset
};

const ual = await dkgService.publish(asset);
console.log('Published to:', ual);
```

### Query Knowledge Assets

```javascript
const results = await dkgService.query(`
  SELECT ?factCheck WHERE {
    ?factCheck a schema:MediaReview .
    ?factCheck schema:reviewRating ?rating .
  }
`);
```

## Troubleshooting

### Node Won't Start

Check Docker logs:
```bash
docker-compose logs -f
```

### Connection Refused

Ensure the node is fully synced:
```bash
curl http://localhost:8900/node/info | jq '.synced'
```

### Port Conflicts

Change port in `.env`:
```bash
DKG_NODE_PORT=8901
```

## Resources

- [OriginTrail Docs](https://docs.origintrail.io)
- [DKG SDK](https://github.com/OriginTrail/dkg.js)
- [Discord Support](https://discord.gg/origintrail)
