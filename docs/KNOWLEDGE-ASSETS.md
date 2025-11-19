# Knowledge Assets Documentation

## Overview

The Verifiable Deepfake Notary publishes fact-check results as Knowledge Assets to the OriginTrail Decentralized Knowledge Graph (DKG). These assets use JSON-LD (JSON for Linking Data) format with schema.org vocabulary to ensure semantic interoperability and verifiability.

## Knowledge Asset Structure

### Complete Example

```json
{
  "@context": "https://schema.org",
  "@type": "MediaReview",
  "identifier": "factcheck-f9d8e7c6b5a4",
  "mediaItem": {
    "@type": "MediaObject",
    "contentUrl": "ipfs://QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
    "sha256": "0x8f4d0ec8d2c2e8b5f6a3d1c9e7b4a2f8e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6",
    "uploadedAt": "2025-11-19T10:21:34Z",
    "encodingFormat": "video/mp4",
    "contentSize": "15728640"
  },
  "claimReviewed": "Media authenticity verification for uploaded video",
  "reviewRating": {
    "@type": "Rating",
    "ratingValue": 0.12,
    "bestRating": 1.0,
    "worstRating": 0.0,
    "ratingExplanation": "Low deepfake probability indicates authentic media",
    "confidenceScore": 0.89,
    "consensusWeight": 0.92
  },
  "provenance": {
    "detectionModel": "XceptionNet-v2.1",
    "modelVersion": "2.1.0",
    "analyzedAt": "2025-11-19T10:21:49Z",
    "processingTime": "3.45s",
    "artifactsDetected": ["face_warping", "color_inconsistency"]
  },
  "author": {
    "@type": "Person",
    "identifier": "guardian:actor:g_12345abc",
    "name": "Guardian Alice",
    "reputationScore": 0.87,
    "verificationCount": 234,
    "accuracyRate": 0.91
  },
  "stake": {
    "amount": "50",
    "currency": "TRAC",
    "locked": true,
    "unlockCondition": "consensus_complete",
    "stakedAt": "2025-11-19T10:21:34Z"
  },
  "datePublished": "2025-11-19T10:21:50Z",
  "dateModified": "2025-11-19T10:21:50Z"
}
```

## Field Definitions

### Root Properties

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `@context` | URI | Yes | Schema.org vocabulary context |
| `@type` | String | Yes | Always "MediaReview" for fact-checks |
| `identifier` | String | Yes | Unique fact-check identifier |
| `mediaItem` | Object | Yes | Media being reviewed |
| `claimReviewed` | String | Yes | Description of claim |
| `reviewRating` | Object | Yes | Deepfake detection results |
| `provenance` | Object | Yes | Analysis metadata |
| `author` | Object | Yes | Guardian who created fact-check |
| `stake` | Object | No | Staking information (if applicable) |
| `datePublished` | ISO 8601 | Yes | Publication timestamp |
| `dateModified` | ISO 8601 | Yes | Last modification timestamp |

### mediaItem Properties

| Field | Type | Description |
|-------|------|-------------|
| `@type` | String | "MediaObject" |
| `contentUrl` | URI | IPFS or storage URL |
| `sha256` | String | SHA-256 hash of media content |
| `uploadedAt` | ISO 8601 | Upload timestamp |
| `encodingFormat` | String | MIME type (e.g., "video/mp4") |
| `contentSize` | String | File size in bytes |

### reviewRating Properties

| Field | Type | Description |
|-------|------|-------------|
| `@type` | String | "Rating" |
| `ratingValue` | Number | Deepfake score (0.0 = authentic, 1.0 = deepfake) |
| `bestRating` | Number | Always 1.0 |
| `worstRating` | Number | Always 0.0 |
| `ratingExplanation` | String | Human-readable interpretation |
| `confidenceScore` | Number | Model confidence (0.0-1.0) |
| `consensusWeight` | Number | Consensus strength (if multiple verifications) |

### provenance Properties

| Field | Type | Description |
|-------|------|-------------|
| `detectionModel` | String | AI model identifier |
| `modelVersion` | String | Model version |
| `analyzedAt` | ISO 8601 | Analysis timestamp |
| `processingTime` | String | Duration of analysis |
| `artifactsDetected` | Array<String> | Detected manipulation artifacts |

### author Properties

| Field | Type | Description |
|-------|------|-------------|
| `@type` | String | "Person" |
| `identifier` | String | Guardian unique ID |
| `name` | String | Guardian display name |
| `reputationScore` | Number | Guardian reputation (0.0-1.0) |
| `verificationCount` | Number | Total verifications by Guardian |
| `accuracyRate` | Number | Historical accuracy (0.0-1.0) |

### stake Properties

| Field | Type | Description |
|-------|------|-------------|
| `amount` | String | Stake amount |
| `currency` | String | Token symbol (e.g., "TRAC") |
| `locked` | Boolean | Whether stake is locked |
| `unlockCondition` | String | Condition for unlocking stake |
| `stakedAt` | ISO 8601 | Staking timestamp |

## Publishing to DKG

### Publishing Flow

```typescript
// 1. Create Knowledge Asset from fact-check data
const knowledgeAsset: KnowledgeAsset = {
  '@context': 'https://schema.org',
  '@type': 'MediaReview',
  identifier: factCheck.id,
  mediaItem: {
    '@type': 'MediaObject',
    sha256: media.sha256Hash,
    uploadedAt: media.uploadedAt.toISOString(),
  },
  reviewRating: {
    '@type': 'Rating',
    ratingValue: factCheck.deepfakeScore,
    confidenceScore: factCheck.confidenceScore,
  },
  provenance: {
    detectionModel: factCheck.modelUsed,
    analyzedAt: factCheck.createdAt.toISOString(),
    processingTime: `${factCheck.processingTime}s`,
  },
  author: {
    '@type': 'Person',
    identifier: guardian.identifier,
    reputationScore: guardian.reputationScore,
  },
};

// 2. Publish to DKG
const ual = await dkgService.publish(knowledgeAsset);

// 3. Store UAL in database
await prisma.factCheck.update({
  where: { id: factCheck.id },
  data: { dkgAssetId: ual },
});
```

### DKG Client Configuration

```typescript
import DKG from 'dkg.js';

const dkgClient = new DKG({
  endpoint: 'https://v6-pegasus-node-02.origin-trail.network',
  port: '8900',
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
});

// Publish asset
const result = await dkgClient.asset.create(
  { public: knowledgeAsset },
  {
    epochsNum: 2,
    minimumNumberOfFinalizationConfirmations: 3,
    minimumNumberOfNodeReplications: 1,
  }
);

const ual = result.UAL;
// Example: did:dkg:otp:20430/0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266/1732012910
```

## UAL (Universal Asset Locator)

### Format

```
did:dkg:{network}/{blockchain-address}/{timestamp}
```

### Examples

**Testnet UAL:**
```
did:dkg:otp:20430/0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266/1732012910
```

**Mainnet UAL:**
```
did:dkg:otp:2043/0xabc123def456789abcdef0123456789abcdef012/1732012910
```

**Demo UAL (fallback):**
```
did:dkg:otp:20430/0x8f4d0ec8d2c2e8b5/1732012910
```

### UAL Components

- `did:dkg` - DID method identifier
- `otp:20430` - Network identifier (NeuroWeb Testnet)
- `0xf39...` - Blockchain address (40 hex chars)
- `1732012910` - Unix timestamp

## Querying Knowledge Assets

### SPARQL Query Example

```sparql
PREFIX schema: <https://schema.org/>

SELECT ?factcheck ?score ?confidence ?guardian
WHERE {
  ?factcheck a schema:MediaReview ;
    schema:reviewRating ?rating ;
    schema:author ?author .

  ?rating schema:ratingValue ?score ;
    schema:confidenceScore ?confidence .

  ?author schema:identifier ?guardian .

  FILTER(?confidence > 0.8)
}
ORDER BY DESC(?confidence)
LIMIT 10
```

### Retrieve by UAL

```typescript
const asset = await dkgClient.asset.get(ual, {
  contentType: 'all'
});

console.log(asset.public); // Knowledge Asset JSON-LD
```

## Consensus Updates

When multiple Guardians verify the same media, a consensus Knowledge Asset is created:

```json
{
  "@context": "https://schema.org",
  "@type": "MediaReview",
  "identifier": "consensus-media_abc123",
  "mediaItem": {
    "@type": "MediaObject",
    "sha256": "0x8f4d0ec8..."
  },
  "reviewRating": {
    "@type": "AggregateRating",
    "ratingValue": 0.15,
    "ratingCount": 5,
    "bestRating": 1.0,
    "worstRating": 0.0,
    "confidenceScore": 0.92
  },
  "provenance": {
    "consensusMethod": "weighted_stake_reputation",
    "participantCount": 5,
    "totalStake": "450 TRAC",
    "agreementPercentage": 0.82
  },
  "reviews": [
    { "@id": "did:dkg:otp:20430/0x.../1732012910" },
    { "@id": "did:dkg:otp:20430/0x.../1732012925" },
    { "@id": "did:dkg:otp:20430/0x.../1732012940" }
  ]
}
```

## Linking to Guardian Social Graph

Knowledge Assets reference Guardian actors from the Umanitek Guardian social graph:

```json
{
  "author": {
    "@type": "Person",
    "identifier": "guardian:actor:g_12345abc",
    "@id": "did:dkg:otp:20430/0x.../guardian-g_12345abc",
    "sameAs": "https://dkg.origintrail.io/explore?ual=did:dkg:otp:20430/0x.../guardian-g_12345abc"
  }
}
```

This allows:
- Tracing reputation across fact-checks
- Building verifier networks
- Detecting collusion patterns
- Rewarding high-quality contributors

## x402 Gated Assets

High-confidence Knowledge Assets can be protected with x402 micropayments:

```json
{
  "@context": "https://schema.org",
  "@type": "MediaReview",
  "identifier": "factcheck-premium-xyz789",
  "reviewRating": {
    "confidenceScore": 0.95
  },
  "accessControl": {
    "@type": "PaymentRequired",
    "paymentMethod": "x402",
    "price": {
      "@type": "PriceSpecification",
      "price": "0.0003",
      "priceCurrency": "USDC"
    },
    "invoiceEndpoint": "/api/x402/generate-invoice"
  }
}
```

## Verification & Trust

### Verifying Knowledge Asset Integrity

```typescript
// 1. Retrieve asset from DKG
const asset = await dkgClient.asset.get(ual);

// 2. Verify media hash
const mediaHash = asset.public.mediaItem.sha256;
const computedHash = await hashMedia(mediaFile);
assert(mediaHash === computedHash);

// 3. Verify Guardian signature (future: cryptographic signatures)
const guardian = await guardianService.getByIdentifier(
  asset.public.author.identifier
);
assert(guardian.reputationScore > 0.5);

// 4. Verify consensus (if exists)
if (asset.public.reviews) {
  const consensus = await consensusService.verify(asset.public.reviews);
  assert(consensus.agreementPercentage > 0.7);
}
```

## Best Practices

1. **Always include provenance**: Model version, timestamps, processing metadata
2. **Link to Guardian identities**: Enable reputation tracking
3. **Use schema.org vocabulary**: Ensures semantic interoperability
4. **Include SHA-256 hashes**: Verify content integrity
5. **Timestamp all events**: Upload, analysis, publication, consensus
6. **Store UALs**: Reference Knowledge Assets in your database
7. **Update consensus assets**: When new verifications arrive
8. **Gate high-confidence data**: Use x402 for premium access

## Future Enhancements

1. **Cryptographic Signatures**: Sign Knowledge Assets with Guardian private keys
2. **IPFS Integration**: Store media on IPFS, reference in Knowledge Assets
3. **Cross-Chain Links**: Link to Polkadot parachain data
4. **Versioning**: Track Knowledge Asset updates over time
5. **Multi-Media Support**: Audio, images, documents
6. **Anomaly Detection**: AI-generated content detection beyond deepfakes

---

**Last Updated**: 2025-11-19
**Version**: 1.0.0
