#!/bin/bash
# Master Setup Script - Complete Project Initialization
# Runs all setup steps in correct order

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

clear

echo -e "${CYAN}"
cat << "EOF"
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║     ██████╗ ███████╗███████╗██████╗ ███████╗ █████╗ ██╗  ██╗║
║     ██╔══██╗██╔════╝██╔════╝██╔══██╗██╔════╝██╔══██╗██║ ██╔╝║
║     ██║  ██║█████╗  █████╗  ██████╔╝█████╗  ███████║█████╔╝ ║
║     ██║  ██║██╔══╝  ██╔══╝  ██╔═══╝ ██╔══╝  ██╔══██║██╔═██╗ ║
║     ██████╔╝███████╗███████╗██║     ██║     ██║  ██║██║  ██╗║
║     ╚═════╝ ╚══════╝╚══════╝╚═╝     ╚═╝     ╚═╝  ╚═╝╚═╝  ╚═╝║
║                                                              ║
║         NOTARY - Complete Setup & Initialization            ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}\n"

echo -e "${BLUE}This script will set up your complete hackathon project.${NC}"
echo -e "${BLUE}Estimated time: 5-10 minutes${NC}\n"

read -p "Press Enter to begin setup..."
echo ""

# Step 1: Check prerequisites
echo -e "${PURPLE}═══════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}[Step 1/8] Checking prerequisites...${NC}"
echo -e "${PURPLE}═══════════════════════════════════════════════════${NC}\n"

MISSING=0

# Check Node.js
if ! command -v node >/dev/null 2>&1; then
    echo -e "${RED}✗ Node.js not found. Install from https://nodejs.org${NC}"
    MISSING=1
else
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✓ Node.js installed: $NODE_VERSION${NC}"
fi

# Check pnpm
if ! command -v pnpm >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  pnpm not found. Installing...${NC}"
    npm install -g pnpm
    echo -e "${GREEN}✓ pnpm installed${NC}"
else
    PNPM_VERSION=$(pnpm -v)
    echo -e "${GREEN}✓ pnpm installed: $PNPM_VERSION${NC}"
fi

# Check Foundry (optional but recommended)
if ! command -v cast >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Foundry (cast) not found - wallet automation will be limited${NC}"
    echo -e "${YELLOW}   Install from: https://getfoundry.sh${NC}"
else
    echo -e "${GREEN}✓ Foundry (cast) installed${NC}"
fi

# Check jq (optional but recommended)
if ! command -v jq >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  jq not found - JSON parsing will be limited${NC}"
    echo -e "${YELLOW}   Install: brew install jq (macOS) or apt-get install jq (Linux)${NC}"
else
    echo -e "${GREEN}✓ jq installed${NC}"
fi

if [ $MISSING -eq 1 ]; then
    echo -e "\n${RED}Please install missing prerequisites and run again.${NC}\n"
    exit 1
fi

echo ""

# Step 2: Install dependencies
echo -e "${PURPLE}═══════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}[Step 2/8] Installing dependencies...${NC}"
echo -e "${PURPLE}═══════════════════════════════════════════════════${NC}\n"

echo -e "${BLUE}Installing root dependencies...${NC}"
pnpm install

echo -e "\n${BLUE}Installing backend dependencies...${NC}"
cd backend && pnpm install && cd ..

echo -e "\n${BLUE}Installing frontend dependencies...${NC}"
cd frontend && pnpm install && cd ..

echo -e "${GREEN}✓ All dependencies installed${NC}\n"

# Step 3: Setup backend configuration
echo -e "${PURPLE}═══════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}[Step 3/8] Setting up backend configuration...${NC}"
echo -e "${PURPLE}═══════════════════════════════════════════════════${NC}\n"

if [ ! -f backend/.env ]; then
    if [ -f backend/.env.example ]; then
        cp backend/.env.example backend/.env
        echo -e "${GREEN}✓ Created backend/.env from template${NC}"
    else
        echo -e "${YELLOW}⚠️  No .env.example found. You'll need to create backend/.env manually.${NC}"
    fi
else
    echo -e "${GREEN}✓ backend/.env already exists${NC}"
fi

echo -e "\n${BLUE}Important: Edit backend/.env with your configuration!${NC}"
echo -e "${YELLOW}Required variables:${NC}"
echo -e "  - DKG_PRIVATE_KEY (your NeuroWeb testnet wallet)"
echo -e "  - DKG_NODE_ENDPOINT (use public node or your own)"
echo -e "  - X402_WALLET_ADDRESS (for payments)"
echo ""

# Step 4: Initialize database
echo -e "${PURPLE}═══════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}[Step 4/8] Initializing database...${NC}"
echo -e "${PURPLE}═══════════════════════════════════════════════════${NC}\n"

cd backend
pnpm db:push
echo -e "${GREEN}✓ Database schema created${NC}"

echo -e "\n${BLUE}Seeding database with initial data...${NC}"
pnpm db:seed || echo -e "${YELLOW}⚠️  Seeding failed (optional)${NC}"

cd ..
echo ""

# Step 5: Setup DKG wallet
echo -e "${PURPLE}═══════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}[Step 5/8] Setting up DKG wallet...${NC}"
echo -e "${PURPLE}═══════════════════════════════════════════════════${NC}\n"

if command -v cast >/dev/null 2>&1 && command -v jq >/dev/null 2>&1; then
    echo -e "${BLUE}Running wallet setup and balance checks...${NC}\n"
    ./setup-dkg-wallet.sh || echo -e "${YELLOW}⚠️  Wallet setup incomplete - see messages above${NC}"
else
    echo -e "${YELLOW}⚠️  Skipping automated wallet setup (missing cast or jq)${NC}"
    echo -e "${YELLOW}   Manual setup:${NC}"
    echo -e "   1. Join Discord: https://discord.gg/origintrail"
    echo -e "   2. Request tokens: !fundme_neuroweb YOUR_ADDRESS"
fi

echo ""

# Step 6: Run health checks
echo -e "${PURPLE}═══════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}[Step 6/8] Running health checks...${NC}"
echo -e "${PURPLE}═══════════════════════════════════════════════════${NC}\n"

cd backend
pnpm health-check || {
    echo -e "\n${YELLOW}⚠️  Some health checks failed. This is normal if:${NC}"
    echo -e "   - Wallet doesn't have TRAC yet"
    echo -e "   - Server isn't running yet"
    echo -e "   - DKG node is temporarily unreachable"
}
cd ..

echo ""

# Step 7: Make scripts executable
echo -e "${PURPLE}═══════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}[Step 7/8] Preparing scripts...${NC}"
echo -e "${PURPLE}═══════════════════════════════════════════════════${NC}\n"

chmod +x setup-dkg-wallet.sh test-e2e-flow.sh 2>/dev/null || true
echo -e "${GREEN}✓ Scripts are executable${NC}\n"

# Step 8: Final summary
echo -e "${PURPLE}═══════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}[Step 8/8] Setup Complete!${NC}"
echo -e "${PURPLE}═══════════════════════════════════════════════════${NC}\n"

echo -e "${GREEN}✅ Project setup completed successfully!${NC}\n"

echo -e "${CYAN}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║              NEXT STEPS                          ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════╝${NC}\n"

echo -e "${YELLOW}1. Start Backend:${NC}"
echo -e "   ${BLUE}cd backend && pnpm dev:safe${NC}"
echo -e "   (Runs with health checks)\n"

echo -e "${YELLOW}2. Start Frontend (new terminal):${NC}"
echo -e "   ${BLUE}cd frontend && pnpm dev${NC}\n"

echo -e "${YELLOW}3. Open Browser:${NC}"
echo -e "   ${BLUE}http://localhost:5173${NC}\n"

echo -e "${YELLOW}4. Run E2E Tests (optional):${NC}"
echo -e "   ${BLUE}./test-e2e-flow.sh${NC}\n"

echo -e "${CYAN}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║           IMPORTANT REMINDERS                    ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════╝${NC}\n"

echo -e "${YELLOW}📝 Configuration:${NC}"
echo -e "   • Edit ${BLUE}backend/.env${NC} with your wallet private key"
echo -e "   • Make sure DKG_PRIVATE_KEY is set\n"

echo -e "${YELLOW}💰 Wallet Funding:${NC}"
echo -e "   • Your wallet needs ${BLUE}NEURO${NC} (gas) and ${BLUE}TRAC${NC} (publishing)"
echo -e "   • Discord faucet: ${BLUE}https://discord.gg/origintrail${NC}"
echo -e "   • Command: ${BLUE}!fundme_neuroweb YOUR_ADDRESS${NC}\n"

echo -e "${YELLOW}🔍 Testing:${NC}"
echo -e "   • Run ${BLUE}./test-e2e-flow.sh${NC} to test full flow"
echo -e "   • Run ${BLUE}cd backend && pnpm health-check${NC} anytime\n"

echo -e "${YELLOW}📚 Documentation:${NC}"
echo -e "   • Quick Start: ${BLUE}QUICK_START.md${NC}"
echo -e "   • Optimizations: ${BLUE}OPTIMIZATION_COMPLETE.md${NC}"
echo -e "   • README: ${BLUE}README.md${NC}\n"

echo -e "${CYAN}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║            HACKATHON HIGHLIGHTS                  ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════╝${NC}\n"

echo -e "${PURPLE}⭐ Multi-Token Staking:${NC}"
echo -e "   • NEURO: +15% Polkadot bonus"
echo -e "   • DOT: +10% Polkadot bonus"
echo -e "   • TRAC: Baseline\n"

echo -e "${PURPLE}⭐ Real DKG Integration:${NC}"
echo -e "   • NeuroWeb Testnet (otp:20430)"
echo -e "   • Actual blockchain transactions"
echo -e "   • Verifiable on DKG Explorer\n"

echo -e "${PURPLE}⭐ x402 Micropayments:${NC}"
echo -e "   • Dynamic pricing (confidence-based)"
echo -e "   • Revenue distribution model"
echo -e "   • Base Sepolia testnet\n"

echo -e "${GREEN}🎉 You're ready to build!${NC}\n"

echo -e "${BLUE}═══════════════════════════════════════════════════${NC}\n"
