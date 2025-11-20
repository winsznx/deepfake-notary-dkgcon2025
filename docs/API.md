# API Documentation

## Base URL

```
Development: http://localhost:3001/api
Production: https://your-domain.com/api
```

## Response Format

All API responses follow this structure:

**Success:**
```json
{
  "data": { ... },
  "success": true
}
```

**Error:**
```json
{
  "error": "Error message",
  "success": false
}
```

---

## Media Endpoints

### Upload Media

Upload a media file for deepfake analysis.

**Endpoint:** `POST /media/upload`

**Request:**
- Content-Type: `multipart/form-data`
- Body:
  - `media`: File (video or image)

**Accepted Formats:**
- Video: MP4, WebM
- Image: JPEG, PNG
- Max size: 100MB

**Response:**
```json
{
  "id": "uuid",
  "sha256Hash": "0xabc123...",
  "mediaType": "video",
  "uploadedAt": "2025-11-18T10:21:00.000Z"
}
```

**Example:**
```bash
curl -X POST http://localhost:3001/api/media/upload \
  -F "media=@/path/to/video.mp4"
```

---

### Get Media

Retrieve media information by ID.

**Endpoint:** `GET /media/:id`

**Parameters:**
- `id` (path): Media UUID

**Response:**
```json
{
  "id": "uuid",
  "sha256Hash": "0xabc123...",
  "contentUrl": "/uploads/abc123.mp4",
  "mediaType": "video",
  "uploadedAt": "2025-11-18T10:21:00.000Z",
  "factChecks": [...]
}
```

---

## Fact-Check Endpoints

### Create Fact-Check

Run deepfake analysis on uploaded media.

**Endpoint:** `POST /factcheck/create`

**Request Body:**
```json
{
  "mediaId": "uuid",
  "guardianIdentifier": "0x..." or "username"
}
```

**Response:**
```json
{
  "factCheck": {
    "id": "uuid",
    "mediaId": "uuid",
    "guardianId": "uuid",
    "dkgAssetId": "did:dkg:otp/...",
    "claimReviewed": "Video exhibits authentic characteristics",
    "deepfakeScore": 0.12,
    "confidenceScore": 0.89,
    "consensusWeight": 0.0,
    "modelUsed": "XceptionNet-v2.1",
    "artifactsDetected": "[]",
    "processingTime": 3.2,
    "createdAt": "2025-11-18T10:21:15.000Z",
    "publishedToDkg": true
  },
  "knowledgeAsset": {
    "@context": "https://schema.org",
    "@type": "MediaReview",
    ...
  },
  "dkgAssetId": "did:dkg:otp/0x.../123456789"
}
```

**Example:**
```bash
curl -X POST http://localhost:3001/api/factcheck/create \
  -H "Content-Type: application/json" \
  -d '{"mediaId":"abc-123","guardianIdentifier":"0x123..."}'
```

---

### Get Fact-Check

Retrieve fact-check details by ID.

**Endpoint:** `GET /factcheck/:id`

**Parameters:**
- `id` (path): Fact-check UUID

**Response:**
```json
{
  "id": "uuid",
  "deepfakeScore": 0.12,
  "confidenceScore": 0.89,
  "modelUsed": "XceptionNet-v2.1",
  "guardian": {...},
  "media": {...},
  "stakes": [...],
  "consensus": {...}
}
```

---

### Get Fact-Checks by Media

Get all fact-checks for a specific media item.

**Endpoint:** `GET /factcheck/media/:mediaId`

**Parameters:**
- `mediaId` (path): Media UUID

**Response:**
```json
[
  {
    "id": "uuid",
    "deepfakeScore": 0.12,
    "guardian": {...},
    "stakes": [...]
  },
  ...
]
```

---

## Staking Endpoints

### Stake on Fact-Check

Place a token stake on a fact-check verification.

**Endpoint:** `POST /staking/stake`

**Request Body:**
```json
{
  "factCheckId": "uuid",
  "guardianIdentifier": "0x..." or "username",
  "amount": 50.0
}
```

**Validation:**
- Amount: 10-500 TRAC
- Guardian must exist or will be created

**Response:**
```json
{
  "id": "uuid",
  "factCheckId": "uuid",
  "guardianId": "uuid",
  "amount": 50.0,
  "locked": true,
  "rewarded": false,
  "slashed": false,
  "createdAt": "2025-11-18T10:25:00.000Z"
}
```

---

### Get Guardian Stakes

Retrieve all stakes for a guardian.

**Endpoint:** `GET /staking/guardian/:guardianId`

**Parameters:**
- `guardianId` (path): Guardian UUID

**Response:**
```json
[
  {
    "id": "uuid",
    "amount": 50.0,
    "locked": true,
    "factCheck": {
      "id": "uuid",
      "media": {...}
    }
  },
  ...
]
```

---

## Consensus Endpoints

### Calculate Consensus

Calculate consensus for all fact-checks on a media item.

**Endpoint:** `POST /consensus/calculate/:mediaId`

**Parameters:**
- `mediaId` (path): Media UUID

**Process:**
1. Aggregate all fact-checks
2. Calculate reputation-weighted votes
3. Determine majority verdict
4. Execute rewards/slashing
5. Update consensus state

**Response:**
```json
{
  "consensus": {
    "id": "uuid",
    "factCheckId": "uuid",
    "totalStake": 347.5,
    "participantCount": 7,
    "agreementRate": 0.89,
    "majorityVerdict": "real",
    "resolved": true
  },
  "result": {
    "totalStake": 347.5,
    "participantCount": 7,
    "agreementRate": 0.89,
    "majorityVerdict": "real",
    "confidenceScore": 0.92
  }
}
```

**Consensus Formula:**
```
confidenceScore =
  0.40 * weightedStakeAgreement +
  0.30 * guardianReputationAvg +
  0.20 * modelConfidenceAvg +
  0.10 * verificationCountWeight
```

---

### Get Consensus

Retrieve consensus results for a fact-check.

**Endpoint:** `GET /consensus/:factCheckId`

**Parameters:**
- `factCheckId` (path): Fact-check UUID

**Response:**
```json
{
  "id": "uuid",
  "factCheckId": "uuid",
  "totalStake": 347.5,
  "participantCount": 7,
  "agreementRate": 0.89,
  "majorityVerdict": "real",
  "resolved": true,
  "votes": [...]
}
```

---

## x402 Micropayment Endpoints

### Generate Invoice

Generate x402 invoice for high-confidence fact-check access.

**Endpoint:** `POST /x402/generate-invoice`

**Request Body:**
```json
{
  "factCheckId": "uuid"
}
```

**Pricing Tiers:**
- Low confidence (<0.70): $0.0000 (Free)
- Medium (0.70-0.85): $0.0001
- High (>0.85): $0.0003

**Response:**
```json
{
  "invoiceId": "x402-abc123...",
  "amount": 0.0003,
  "currency": "USDC",
  "factCheckId": "uuid",
  "paymentUrl": "/api/x402/pay/x402-abc123...",
  "expiresAt": "2025-11-18T11:21:00.000Z"
}
```

---

### Pay Invoice

Process payment for invoice (mocked for demo).

**Endpoint:** `POST /x402/pay/:invoiceId`

**Parameters:**
- `invoiceId` (path): Invoice ID

**Request Body:**
```json
{
  "payerAddress": "0x..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment verified"
}
```

---

### Get High-Confidence Fact-Check

Access premium fact-check data (requires payment).

**Endpoint:** `GET /x402/high-confidence/:factCheckId`

**Parameters:**
- `factCheckId` (path): Fact-check UUID
- `invoiceId` (query): Paid invoice ID

**Example:**
```
GET /api/x402/high-confidence/abc-123?invoiceId=x402-xyz789
```

**Response:**
```json
{
  "id": "uuid",
  "deepfakeScore": 0.95,
  "confidenceScore": 0.91,
  "guardian": {...},
  "media": {...},
  "stakes": [...],
  "consensus": {...}
}
```

**Error (402 Payment Required):**
```json
{
  "error": "Payment required"
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request (validation error) |
| 402 | Payment Required (x402) |
| 404 | Resource Not Found |
| 500 | Internal Server Error |

---

## Rate Limiting

**Current Limits:**
- General endpoints: 100 requests/minute
- Upload endpoint: 10 requests/minute

**Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1700318400
```

---

## Authentication

**Current Version:** None (demo)

**Future Implementation:**
- JWT tokens
- Guardian wallet signatures
- API keys for programmatic access

---

## Webhooks (Future)

**Events:**
- `factcheck.created`
- `consensus.resolved`
- `stake.rewarded`
- `stake.slashed`

**Payload Example:**
```json
{
  "event": "consensus.resolved",
  "timestamp": "2025-11-18T10:30:00.000Z",
  "data": {
    "mediaId": "uuid",
    "consensus": {...}
  }
}
```

---

## SDK Examples

### JavaScript/TypeScript

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api'
});

// Upload media
const formData = new FormData();
formData.append('media', file);
const uploadResp = await api.post('/media/upload', formData);

// Create fact-check
const factCheckResp = await api.post('/factcheck/create', {
  mediaId: uploadResp.data.id,
  guardianIdentifier: '0x123...'
});

// Stake on verification
await api.post('/staking/stake', {
  factCheckId: factCheckResp.data.factCheck.id,
  guardianIdentifier: '0x123...',
  amount: 50
});
```

---

## Postman Collection

Import the API collection:

```json
{
  "info": {
    "name": "Verifiable Deepfake Notary API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [...]
}
```

---

**Last Updated**: 2025-11-18
**API Version**: 1.0.0
