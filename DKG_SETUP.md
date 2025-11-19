# DKG Edge Node Setup Guide

This guide explains how to set up and run a local DKG (Decentralized Knowledge Graph) Edge Node for development and testing.

## Prerequisites

- Docker Desktop installed and running
- Node.js 20+ and npm 10+
- dkg.js SDK v8.2.0 (already installed in backend)

## Quick Start

### Option 1: Using Docker (Recommended)

1. **Start Docker Desktop**

   Make sure Docker Desktop is running on your machine.

2. **Navigate to ot-node directory**

   ```bash
   cd /Users/macbook/Documents/ot-node
   ```

3. **Start the DKG node using Docker Compose**

   ```bash
   cd docker
   docker compose -f docker-compose-alpine-graphdb.yaml up -d
   ```

4. **Verify the node is running**

   ```bash
   curl http://localhost:8900/info
   ```

   You should see node information in the response.

5. **Check logs (optional)**

   ```bash
   docker compose -f docker-compose-alpine-graphdb.yaml logs -f
   ```

6. **Stop the node when done**

   ```bash
   docker compose -f docker-compose-alpine-graphdb.yaml down
   ```

### Option 2: Running Locally

1. **Navigate to ot-node directory**

   ```bash
   cd /Users/macbook/Documents/ot-node
   ```

2. **Install dependencies** (already done)

   ```bash
   npm install
   ```

3. **Start a local Hardhat blockchain**

   In a separate terminal:
   ```bash
   npx hardhat node
   ```

4. **Run the OT node**

   ```bash
   npm start
   ```

   The node will be available at http://localhost:8900

## Configuration

The DKG node configuration is in `/Users/macbook/Documents/ot-node/.origintrail_noderc`:

```json
{
  "modules": {
    "httpClient": {
      "enabled": true,
      "port": 8900
    },
    "blockchain": {
      "enabled": true,
      "implementation": {
        "hardhat1:31337": {
          "enabled": true,
          "rpcEndpoints": ["http://127.0.0.1:8545"],
          "publicKey": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
          "privateKey": "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
        }
      }
    }
  }
}
```

## Backend Integration

The backend is configured to connect to the local DKG node in `backend/.env`:

```bash
DKG_NODE_ENDPOINT=http://localhost
DKG_NODE_PORT=8900
DKG_BLOCKCHAIN=hardhat1:31337
DKG_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

## Testing the Integration

1. **Start the DKG node** (using Docker or locally)

2. **Start the backend**

   ```bash
   cd backend
   pnpm dev
   ```

3. **Upload a media file** via the frontend

4. **Check backend logs** to see DKG operations:

   ```
   ✅ DKG Client initialized
   📝 Publishing Knowledge Asset to DKG...
   ✅ Published to DKG successfully
   🔗 UAL: did:dkg:hardhat1:31337/0x.../123
   ```

## Testnet Configuration (For Production Demo)

To use the NeuroWeb Testnet instead of local development:

Update `backend/.env`:

```bash
DKG_NODE_ENDPOINT=https://v6-pegasus-node-02.origin-trail.network
DKG_NODE_PORT=8900
DKG_BLOCKCHAIN=otp:20430
# Get testnet tokens and private key from NeuroWeb faucet
DKG_PRIVATE_KEY=your_testnet_private_key_here
```

## Troubleshooting

### Docker daemon not running

**Error**: `Cannot connect to the Docker daemon`

**Solution**: Start Docker Desktop application

### Port 8900 already in use

**Error**: `Port 8900 is already allocated`

**Solution**: Stop any existing DKG node or change the port in both `.origintrail_noderc` and `backend/.env`

### Connection refused

**Error**: `ECONNREFUSED localhost:8900`

**Solution**: Make sure the DKG node is running. Check with:
```bash
curl http://localhost:8900/info
```

### Node not syncing

**Solution**: Check logs and ensure blockchain RPC is accessible:
```bash
curl http://localhost:8545
```

## Architecture

The integration follows the OriginTrail three-layer architecture:

1. **Agent Layer** - Frontend and backend application
2. **Knowledge Layer** - DKG Edge Node (Knowledge Asset storage and querying)
3. **Trust Layer** - Blockchain consensus (Hardhat local / NeuroWeb Testnet)

```
Frontend → Backend (dkg.js) → DKG Node (localhost:8900) → Blockchain (Hardhat/NeuroWeb)
```

## Resources

- [OriginTrail DKG Docs](https://docs.origintrail.io/)
- [dkg.js GitHub](https://github.com/OriginTrail/dkg.js)
- [ot-node GitHub](https://github.com/OriginTrail/ot-node)
- [DKG Explorer](https://dkg.origintrail.io/)
