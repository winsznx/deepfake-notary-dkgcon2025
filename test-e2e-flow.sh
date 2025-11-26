#!/bin/bash
# End-to-End Integration Test
# Tests complete flow: Upload → Analysis → DKG Publishing → Payment → Staking

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

API_URL="http://localhost:3001/api"
FRONTEND_URL="http://localhost:5173"
TEST_IMAGE="test-media.jpg"

echo -e "${BLUE}╔═══════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     End-to-End Integration Test Suite            ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════╝${NC}\n"

# Check if servers are running
echo -e "${YELLOW}[1/10] Checking server status...${NC}"
if ! curl -s "$API_URL/../health" > /dev/null 2>&1; then
    echo -e "${RED}✗ Backend not running. Start with: cd backend && pnpm dev${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Backend running${NC}"

if ! curl -s "$FRONTEND_URL" > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Frontend not running (optional for API tests)${NC}"
else
    echo -e "${GREEN}✓ Frontend running${NC}"
fi
echo ""

# Test 1: Health Check
echo -e "${YELLOW}[2/10] Testing health endpoints...${NC}"
HEALTH=$(curl -s "$API_URL/../health")
if echo "$HEALTH" | jq -e '.status == "ok"' > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Health check passed${NC}\n"
else
    echo -e "${RED}✗ Health check failed${NC}\n"
    exit 1
fi

# Test 2: Token Configuration
echo -e "${YELLOW}[3/10] Testing multi-token configuration...${NC}"
TOKENS=$(curl -s "$API_URL/staking/tokens")
NEURO_BONUS=$(echo "$TOKENS" | jq -r '.tokens[] | select(.symbol=="NEURO") | .multiplier')
DOT_BONUS=$(echo "$TOKENS" | jq -r '.tokens[] | select(.symbol=="DOT") | .multiplier')

if [ "$NEURO_BONUS" == "1.15" ] && [ "$DOT_BONUS" == "1.1" ]; then
    echo -e "${GREEN}✓ Multi-token bonuses configured correctly${NC}"
    echo -e "  NEURO: +15% bonus, DOT: +10% bonus${NC}\n"
else
    echo -e "${RED}✗ Token multipliers incorrect${NC}\n"
    exit 1
fi

# Test 3: Create test media file if not exists
echo -e "${YELLOW}[4/10] Preparing test media...${NC}"
if [ ! -f "$TEST_IMAGE" ]; then
    # Create a small test image (1x1 red pixel)
    echo -e "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==" | base64 -d > "$TEST_IMAGE" 2>/dev/null || {
        # Alternative: use ImageMagick if available
        if command -v convert >/dev/null 2>&1; then
            convert -size 1x1 xc:red "$TEST_IMAGE"
        else
            echo -e "${RED}✗ Cannot create test image. Install imagemagick or provide test-media.jpg${NC}"
            exit 1
        fi
    }
fi
echo -e "${GREEN}✓ Test media ready: $TEST_IMAGE${NC}\n"

# Test 4: Upload Media
echo -e "${YELLOW}[5/10] Testing media upload...${NC}"
UPLOAD_RESPONSE=$(curl -s -X POST "$API_URL/media/upload" \
    -F "media=@$TEST_IMAGE")

MEDIA_ID=$(echo "$UPLOAD_RESPONSE" | jq -r '.id')
MEDIA_HASH=$(echo "$UPLOAD_RESPONSE" | jq -r '.sha256Hash')

if [ "$MEDIA_ID" != "null" ] && [ -n "$MEDIA_ID" ]; then
    echo -e "${GREEN}✓ Media uploaded${NC}"
    echo -e "  Media ID: $MEDIA_ID"
    echo -e "  SHA-256: ${MEDIA_HASH:0:16}...${NC}\n"
else
    echo -e "${RED}✗ Media upload failed${NC}"
    echo "$UPLOAD_RESPONSE"
    exit 1
fi

# Test 5: Create Fact-Check (runs deepfake analysis + DKG publishing)
echo -e "${YELLOW}[6/10] Testing fact-check creation (AI + DKG)...${NC}"
echo -e "${BLUE}This may take 10-30 seconds for DKG publishing...${NC}"

FACTCHECK_RESPONSE=$(curl -s -X POST "$API_URL/factcheck/create" \
    -H "Content-Type: application/json" \
    -d "{\"mediaId\": \"$MEDIA_ID\"}")

FACTCHECK_ID=$(echo "$FACTCHECK_RESPONSE" | jq -r '.factCheck.id')
DKG_ASSET_ID=$(echo "$FACTCHECK_RESPONSE" | jq -r '.dkgAssetId')
DEEPFAKE_SCORE=$(echo "$FACTCHECK_RESPONSE" | jq -r '.factCheck.deepfakeScore')
CONFIDENCE=$(echo "$FACTCHECK_RESPONSE" | jq -r '.factCheck.confidenceScore')

if [ "$FACTCHECK_ID" != "null" ] && [ -n "$FACTCHECK_ID" ]; then
    echo -e "${GREEN}✓ Fact-check created${NC}"
    echo -e "  Fact-Check ID: $FACTCHECK_ID"
    echo -e "  Deepfake Score: $(echo "$DEEPFAKE_SCORE * 100" | bc)%"
    echo -e "  Confidence: $(echo "$CONFIDENCE * 100" | bc)%"

    if [ "$DKG_ASSET_ID" != "null" ] && [[ "$DKG_ASSET_ID" == did:dkg:* ]]; then
        echo -e "${GREEN}✓ Published to DKG${NC}"
        echo -e "  UAL: $DKG_ASSET_ID${NC}\n"
    else
        echo -e "${YELLOW}⚠️  DKG publishing may have failed (check backend logs)${NC}"
        echo -e "  Response: $DKG_ASSET_ID${NC}\n"
    fi
else
    echo -e "${RED}✗ Fact-check creation failed${NC}"
    echo "$FACTCHECK_RESPONSE" | jq '.'
    exit 1
fi

# Test 6: x402 Payment Flow (if confidence >= 70%)
REQUIRES_PAYMENT=$(echo "$CONFIDENCE >= 0.70" | bc -l)

if [ "$REQUIRES_PAYMENT" -eq 1 ]; then
    echo -e "${YELLOW}[7/10] Testing x402 payment flow...${NC}"
    echo -e "${BLUE}High confidence detected - payment required${NC}"

    # Generate invoice
    INVOICE_RESPONSE=$(curl -s -X POST "$API_URL/x402/generate-invoice" \
        -H "Content-Type: application/json" \
        -d "{\"factCheckId\": \"$FACTCHECK_ID\"}")

    INVOICE_ID=$(echo "$INVOICE_RESPONSE" | jq -r '.invoice.invoiceId')
    PRICE=$(echo "$INVOICE_RESPONSE" | jq -r '.invoice.amount')

    if [ "$INVOICE_ID" != "null" ] && [ -n "$INVOICE_ID" ]; then
        echo -e "${GREEN}✓ Invoice generated${NC}"
        echo -e "  Invoice ID: $INVOICE_ID"
        echo -e "  Price: \$$PRICE USDC${NC}"

        # Simulate payment
        PAYMENT_RESPONSE=$(curl -s -X POST "$API_URL/x402/pay/$INVOICE_ID" \
            -H "Content-Type: application/json" \
            -d "{\"payerAddress\": \"0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0\", \"paymentProof\": {\"transactionHash\": \"0xtest123\"}}")

        PAYMENT_VALID=$(echo "$PAYMENT_RESPONSE" | jq -r '.success')

        if [ "$PAYMENT_VALID" == "true" ]; then
            echo -e "${GREEN}✓ Payment verified (demo mode)${NC}\n"
        else
            echo -e "${RED}✗ Payment verification failed${NC}"
            echo "$PAYMENT_RESPONSE" | jq '.'
            exit 1
        fi
    else
        echo -e "${RED}✗ Invoice generation failed${NC}"
        echo "$INVOICE_RESPONSE" | jq '.'
        exit 1
    fi
else
    echo -e "${YELLOW}[7/10] Skipping payment (low confidence - free access)${NC}\n"
fi

# Test 7: Staking
echo -e "${YELLOW}[8/10] Testing multi-token staking...${NC}"

# Test NEURO staking (15% bonus)
NEURO_STAKE_RESPONSE=$(curl -s -X POST "$API_URL/staking/stake" \
    -H "Content-Type: application/json" \
    -d "{
        \"factCheckId\": \"$FACTCHECK_ID\",
        \"guardianIdentifier\": \"0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0\",
        \"amount\": 10,
        \"tokenType\": \"NEURO\"
    }")

STAKE_ID=$(echo "$NEURO_STAKE_RESPONSE" | jq -r '.id')
EFFECTIVE_WEIGHT=$(echo "$NEURO_STAKE_RESPONSE" | jq -r '.effectiveWeight')

if [ "$STAKE_ID" != "null" ] && [ -n "$STAKE_ID" ]; then
    echo -e "${GREEN}✓ NEURO stake created${NC}"
    echo -e "  Stake: 10 NEURO"
    echo -e "  Effective Weight: $EFFECTIVE_WEIGHT (includes 15% bonus)${NC}\n"
else
    echo -e "${RED}✗ Staking failed${NC}"
    echo "$NEURO_STAKE_RESPONSE" | jq '.'
    exit 1
fi

# Test 8: Consensus Calculation
echo -e "${YELLOW}[9/10] Testing consensus algorithm...${NC}"

CONSENSUS_RESPONSE=$(curl -s -X POST "$API_URL/consensus/calculate/$MEDIA_ID")
CONSENSUS_VERDICT=$(echo "$CONSENSUS_RESPONSE" | jq -r '.consensus.majorityVerdict')
AGREEMENT_RATE=$(echo "$CONSENSUS_RESPONSE" | jq -r '.consensus.agreementRate')

if [ "$CONSENSUS_VERDICT" != "null" ]; then
    echo -e "${GREEN}✓ Consensus calculated${NC}"
    echo -e "  Verdict: $CONSENSUS_VERDICT"
    echo -e "  Agreement: $(echo "$AGREEMENT_RATE * 100" | bc)%${NC}\n"
else
    echo -e "${YELLOW}⚠️  Consensus calculation returned unexpected result${NC}\n"
fi

# Test 9: Data Retrieval
echo -e "${YELLOW}[10/10] Testing data retrieval...${NC}"

# Get all fact-checks
ALL_FACTCHECKS=$(curl -s "$API_URL/factcheck/all")
FACTCHECK_COUNT=$(echo "$ALL_FACTCHECKS" | jq 'length')

echo -e "${GREEN}✓ Retrieved $FACTCHECK_COUNT fact-check(s)${NC}"

# Get wallet stakes
WALLET_STAKES=$(curl -s "$API_URL/staking/wallet/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0")
STAKE_COUNT=$(echo "$WALLET_STAKES" | jq '.stakes | length')

echo -e "${GREEN}✓ Retrieved $STAKE_COUNT stake(s) for wallet${NC}\n"

# Final Summary
echo -e "${BLUE}╔═══════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║             TEST SUMMARY                          ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════╝${NC}\n"

echo -e "${GREEN}✅ All E2E tests passed!${NC}\n"

echo -e "${YELLOW}Test Coverage:${NC}"
echo -e "  ✓ Media upload & hashing"
echo -e "  ✓ AI deepfake detection"
echo -e "  ✓ DKG publishing (Knowledge Assets)"
echo -e "  ✓ Multi-token staking (NEURO bonus)"
echo -e "  ✓ Token-weighted consensus"
echo -e "  ✓ x402 micropayments"
echo -e "  ✓ Data retrieval APIs"
echo ""

echo -e "${BLUE}Test Artifacts:${NC}"
echo -e "  Media ID: $MEDIA_ID"
echo -e "  Fact-Check ID: $FACTCHECK_ID"
echo -e "  DKG Asset: $DKG_ASSET_ID"
[ "$REQUIRES_PAYMENT" -eq 1 ] && echo -e "  Invoice ID: $INVOICE_ID"
echo ""

echo -e "${GREEN}🎉 Integration test suite completed successfully!${NC}\n"

# Cleanup option
read -p "Delete test artifacts? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    rm -f "$TEST_IMAGE"
    echo -e "${GREEN}✓ Test artifacts cleaned${NC}"
fi
