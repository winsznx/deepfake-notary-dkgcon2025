# Getting Testnet Tokens for DKG Publishing

This guide explains how to get testnet TRAC tokens on NeuroWeb to publish Knowledge Assets to the OriginTrail DKG.

## Quick Start

To publish Knowledge Assets to the OriginTrail DKG, you need TRAC tokens on the NeuroWeb testnet.

## Option 1: Use Provided Test Wallet (Demo Only)

⚠️ **WARNING: The private key in `.env` is for TESTNET ONLY and is publicly visible. Never use it for mainnet or real value!**

The repository includes a test wallet with limited testnet tokens for demo purposes:
- **Network**: NeuroWeb Testnet (OTP:20430)
- **Wallet**: See `DKG_PRIVATE_KEY` in `.env`
- **Balance**: May have small amount of testnet TRAC

### Test DKG Publishing

```bash
cd backend
pnpm dkg:publish-test
```

This will:
1. Create a test Knowledge Asset
2. Publish it to OriginTrail DKG testnet
3. Return a Universal Asset Locator (UAL)
4. Verify the asset is queryable via SPARQL

## Option 2: Get Your Own Testnet Tokens

### Step 1: Create a Wallet

```bash
# Generate a new Ethereum-compatible wallet
# You can use MetaMask, Trust Wallet, or any Web3 wallet
```

### Step 2: Get NeuroWeb Testnet TRAC

**Option A: OriginTrail Discord Faucet**
1. Join OriginTrail Discord: https://discord.gg/origintrail
2. Go to #testnet-faucet channel
3. Request testnet TRAC tokens with your wallet address

**Option B: Community Faucet (if available)**
1. Visit: https://faucet.neuroweb.ai/ (if operational)
2. Enter your wallet address
3. Request testnet tokens

**Option C: Ask in Community**
- Discord: https://discord.gg/origintrail
- Telegram: https://t.me/origintrail
- Request small amount for testing

### Step 3: Configure Your Wallet

```bash
# Edit backend/.env
DKG_PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE
```

⚠️ **Security Warning**:
- **NEVER** commit your private key to git
- **NEVER** use your mainnet wallet for testing
- **ALWAYS** use a dedicated testnet wallet
- Add `.env` to `.gitignore` (already done)

## Option 3: Use Mainnet (Production)

For production deployments with real value:

### Step 1: Get Mainnet TRAC

Purchase TRAC tokens from exchanges:
- Coinbase
- Uniswap
- KuCoin

### Step 2: Bridge to NeuroWeb Mainnet

Use the official OriginTrail bridge:
https://parachain.origintrail.io/

### Step 3: Configure for Mainnet

```bash
# Edit backend/.env
DKG_BLOCKCHAIN=otp:2043
DKG_NODE_ENDPOINT=https://v6-neuroweb-node-01.origin-trail.network
DKG_PRIVATE_KEY=0xYOUR_SECURE_MAINNET_KEY
```

⚠️ **CRITICAL SECURITY**:
- Use hardware wallet (Ledger/Trezor)
- Never share private keys
- Use environment variables, not hardcoded values
- Rotate keys regularly
- Monitor wallet activity

## Verifying Your Setup

### Check Wallet Balance

```bash
# Using Polkadot.js or blockchain explorer
# NeuroWeb Testnet Explorer: https://neuroweb-testnet.subscan.io/
# Search for your wallet address
```

### Test DKG Publishing

```bash
cd backend
pnpm dkg:publish-test
```

Expected output:
```
✅ SUCCESS! Knowledge Asset published to DKG
🔗 Universal Asset Locator (UAL):
did:dkg:otp:20430/0x123abc.../456

🌐 View on OriginTrail DKG Explorer:
https://dkg.origintrail.io/explore?ual=did:dkg:otp:20430/0x123abc.../456
```

## Troubleshooting

### Error: "Insufficient funds"

**Cause**: Not enough TRAC tokens in wallet

**Solution**:
1. Check balance on explorer
2. Request testnet tokens (see Option 2 above)
3. Wait for tokens to arrive (may take few minutes)

### Error: "DKG node timeout"

**Cause**: DKG node is offline or congested

**Solution**:
1. Check node status: https://v6-pegasus-node-02.origin-trail.network
2. Try again later
3. Use different node endpoint (see `.env` examples)

### Error: "Transaction failed"

**Cause**: Network congestion or configuration issue

**Solution**:
1. Verify `DKG_BLOCKCHAIN` is correct
2. Check RPC endpoint is reachable
3. Ensure wallet has some NEURO for gas (testnet faucet provides this)

## Understanding Costs

### Testnet
- **TRAC**: Free from faucet
- **NEURO (gas)**: Free from faucet
- **Publishing Cost**: ~5-10 TRAC per Knowledge Asset

### Mainnet
- **TRAC**: ~$0.05-0.50 per token (varies)
- **NEURO (gas)**: ~$0.01-0.05 per transaction
- **Publishing Cost**: ~5-10 TRAC + gas = ~$0.30-5.00 per asset

## Best Practices

### Development
- ✅ Use testnet for development
- ✅ Use separate wallet for testing
- ✅ Commit `.env.example` with dummy values
- ✅ Never commit actual `.env` file
- ✅ Use `.env.local` for local overrides

### Production
- ✅ Use environment variables (not files)
- ✅ Use secrets management (AWS Secrets Manager, Vault, etc.)
- ✅ Enable wallet monitoring/alerts
- ✅ Use multi-sig for high-value wallets
- ✅ Regular security audits

### CI/CD
- ✅ Use GitHub Secrets or similar
- ✅ Rotate credentials regularly
- ✅ Limit access to production keys
- ✅ Log all DKG operations
- ✅ Set spending limits

## Resources

- **OriginTrail Docs**: https://docs.origintrail.io
- **DKG.js SDK**: https://github.com/OriginTrail/dkg.js
- **NeuroWeb Explorer**: https://neuroweb.subscan.io/
- **Testnet Faucet**: Discord #testnet-faucet
- **Community Support**: https://discord.gg/origintrail

## Quick Reference

```bash
# Test publishing
pnpm dkg:publish-test

# Check health
pnpm health-check

# Run tests
pnpm test

# Start dev server
pnpm dev
```

## Example: Publishing from Code

```typescript
import { dkgService } from './services/dkg.service';

const asset = {
  '@context': 'https://schema.org',
  '@type': 'MediaReview',
  // ... your Knowledge Asset
};

const ual = await dkgService.publish(asset);
console.log('Published:', ual);
```

## Need Help?

1. Check this guide first
2. Review error messages carefully
3. Search OriginTrail Discord #testnet-support
4. Ask in community channels
5. Open GitHub issue if bug found

---

**Last Updated**: 2025-01-28
**For Hackathon**: DKGCon 2025
