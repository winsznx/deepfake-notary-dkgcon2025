#!/bin/bash
# DKG Wallet Setup & TRAC Transfer Automation
# Ensures backend wallet has sufficient NEURO and TRAC tokens

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Load environment variables
if [ -f backend/.env ]; then
    export $(grep -v '^#' backend/.env | xargs)
fi

# Configuration
BACKEND_WALLET="${DKG_PRIVATE_KEY#0x}"
BACKEND_ADDRESS=$(cat backend/.env | grep DKG_PRIVATE_KEY | cut -d'=' -f2 | xargs -I {} cast wallet address {})
RPC_URL="https://lofar-testnet.origin-trail.network"
TRAC_CONTRACT="0xEddd2B9A8aFE1115Eaa485e38EE7a6a3e9D09323"
NEURO_MIN_BALANCE=5   # Minimum NEURO for gas
TRAC_MIN_BALANCE=100  # Minimum TRAC for publishing

echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
echo -e "${BLUE}    DKG Wallet Setup & Health Check${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════${NC}\n"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check for required tools
echo -e "${YELLOW}[1/7] Checking required tools...${NC}"
MISSING_TOOLS=0

if ! command_exists cast; then
    echo -e "${RED}✗ 'cast' not found. Install Foundry: https://getfoundry.sh${NC}"
    MISSING_TOOLS=1
fi

if ! command_exists jq; then
    echo -e "${RED}✗ 'jq' not found. Install: brew install jq (macOS) or apt-get install jq (Linux)${NC}"
    MISSING_TOOLS=1
fi

if [ $MISSING_TOOLS -eq 1 ]; then
    echo -e "\n${RED}Please install missing tools and try again.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ All required tools installed${NC}\n"

# Display wallet info
echo -e "${YELLOW}[2/7] Backend Wallet Information${NC}"
echo -e "Address: ${GREEN}$BACKEND_ADDRESS${NC}"
echo -e "Network: NeuroWeb Testnet (otp:20430)\n"

# Check NEURO balance
echo -e "${YELLOW}[3/7] Checking NEURO balance (gas token)...${NC}"
NEURO_BALANCE=$(cast balance $BACKEND_ADDRESS --rpc-url $RPC_URL | awk '{print $1/1e18}')
echo -e "NEURO Balance: ${GREEN}$NEURO_BALANCE${NC}"

if (( $(echo "$NEURO_BALANCE < $NEURO_MIN_BALANCE" | bc -l) )); then
    echo -e "${RED}⚠️  Low NEURO balance! Need at least $NEURO_MIN_BALANCE NEURO for gas.${NC}"
    echo -e "${YELLOW}Request from Discord: https://discord.gg/origintrail${NC}"
    echo -e "${YELLOW}Command: !fundme_neuroweb $BACKEND_ADDRESS${NC}\n"
else
    echo -e "${GREEN}✓ Sufficient NEURO for gas fees${NC}\n"
fi

# Check TRAC balance
echo -e "${YELLOW}[4/7] Checking TRAC balance (DKG publishing token)...${NC}"

# Call balanceOf function on TRAC contract
TRAC_BALANCE_HEX=$(cast call $TRAC_CONTRACT "balanceOf(address)" $BACKEND_ADDRESS --rpc-url $RPC_URL)
TRAC_BALANCE=$(echo "scale=2; ibase=16; ${TRAC_BALANCE_HEX#0x}" | bc | awk '{printf "%.2f", $1/1e18}')

echo -e "TRAC Balance: ${GREEN}$TRAC_BALANCE${NC}"

if (( $(echo "$TRAC_BALANCE < $TRAC_MIN_BALANCE" | bc -l) )); then
    echo -e "${RED}⚠️  Insufficient TRAC! Need at least $TRAC_MIN_BALANCE TRAC for DKG publishing.${NC}\n"

    # Check if personal wallet is configured
    if [ -z "$PERSONAL_WALLET_PRIVATE_KEY" ]; then
        echo -e "${YELLOW}No personal wallet configured for automatic transfer.${NC}"
        echo -e "${YELLOW}To enable auto-transfer, add to backend/.env:${NC}"
        echo -e "${BLUE}PERSONAL_WALLET_PRIVATE_KEY=0xyour_key_here${NC}\n"
        echo -e "${YELLOW}Manual transfer options:${NC}"
        echo -e "1. Request from Discord faucet: !fundme_neuroweb $BACKEND_ADDRESS"
        echo -e "2. Transfer from personal wallet using MetaMask"
        echo -e "3. Use the transfer-trac.sh script\n"
    else
        # Automated transfer
        echo -e "${YELLOW}[5/7] Attempting automatic TRAC transfer...${NC}"

        PERSONAL_ADDRESS=$(cast wallet address $PERSONAL_WALLET_PRIVATE_KEY)
        PERSONAL_TRAC_HEX=$(cast call $TRAC_CONTRACT "balanceOf(address)" $PERSONAL_ADDRESS --rpc-url $RPC_URL)
        PERSONAL_TRAC=$(echo "scale=2; ibase=16; ${PERSONAL_TRAC_HEX#0x}" | bc | awk '{printf "%.2f", $1/1e18}')

        echo -e "Personal wallet TRAC balance: ${GREEN}$PERSONAL_TRAC${NC}"

        if (( $(echo "$PERSONAL_TRAC > 1000" | bc -l) )); then
            TRANSFER_AMOUNT="1000"
            echo -e "${YELLOW}Transferring ${TRANSFER_AMOUNT} TRAC to backend wallet...${NC}"

            # Convert to wei (TRAC has 18 decimals)
            AMOUNT_WEI=$(echo "scale=0; $TRANSFER_AMOUNT * 1000000000000000000" | bc)

            # Execute transfer
            TX_HASH=$(cast send $TRAC_CONTRACT \
                "transfer(address,uint256)" \
                $BACKEND_ADDRESS \
                $AMOUNT_WEI \
                --private-key $PERSONAL_WALLET_PRIVATE_KEY \
                --rpc-url $RPC_URL \
                --json | jq -r '.transactionHash')

            echo -e "${GREEN}✓ Transfer initiated!${NC}"
            echo -e "Transaction: ${BLUE}$TX_HASH${NC}"
            echo -e "${YELLOW}Waiting for confirmation...${NC}"
            sleep 10

            # Re-check balance
            TRAC_BALANCE_HEX=$(cast call $TRAC_CONTRACT "balanceOf(address)" $BACKEND_ADDRESS --rpc-url $RPC_URL)
            TRAC_BALANCE=$(echo "scale=2; ibase=16; ${TRAC_BALANCE_HEX#0x}" | bc | awk '{printf "%.2f", $1/1e18}')
            echo -e "${GREEN}✓ New TRAC balance: $TRAC_BALANCE${NC}\n"
        else
            echo -e "${RED}Insufficient TRAC in personal wallet for transfer.${NC}"
            echo -e "${YELLOW}Request from Discord: !fundme_neuroweb $PERSONAL_ADDRESS${NC}\n"
        fi
    fi
else
    echo -e "${GREEN}✓ Sufficient TRAC for DKG publishing${NC}\n"
fi

# Test DKG connection
echo -e "${YELLOW}[6/7] Testing DKG node connection...${NC}"
DKG_NODE="${DKG_NODE_ENDPOINT:-https://v6-pegasus-node-02.origin-trail.network}:${DKG_NODE_PORT:-8900}"
DKG_VERSION=$(curl -s "$DKG_NODE/info" | jq -r '.version' 2>/dev/null || echo "unreachable")

if [ "$DKG_VERSION" != "unreachable" ]; then
    echo -e "${GREEN}✓ DKG node reachable${NC}"
    echo -e "Node: $DKG_NODE"
    echo -e "Version: $DKG_VERSION\n"
else
    echo -e "${RED}✗ Cannot reach DKG node at $DKG_NODE${NC}\n"
fi

# Final summary
echo -e "${YELLOW}[7/7] Summary & Recommendations${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"

READY=true

if (( $(echo "$NEURO_BALANCE < $NEURO_MIN_BALANCE" | bc -l) )); then
    echo -e "${RED}✗ Need more NEURO (gas token)${NC}"
    READY=false
fi

if (( $(echo "$TRAC_BALANCE < $TRAC_MIN_BALANCE" | bc -l) )); then
    echo -e "${RED}✗ Need more TRAC (publishing token)${NC}"
    READY=false
fi

if [ "$DKG_VERSION" == "unreachable" ]; then
    echo -e "${RED}✗ DKG node unreachable${NC}"
    READY=false
fi

if [ "$READY" = true ]; then
    echo -e "${GREEN}✓ Wallet is ready for DKG publishing!${NC}"
    echo -e "\n${GREEN}You can now run: cd backend && pnpm dev${NC}\n"
else
    echo -e "\n${YELLOW}Action Items:${NC}"
    [ $(echo "$NEURO_BALANCE < $NEURO_MIN_BALANCE" | bc -l) -eq 1 ] && echo -e "  1. Get NEURO from Discord: !fundme_neuroweb $BACKEND_ADDRESS"
    [ $(echo "$TRAC_BALANCE < $TRAC_MIN_BALANCE" | bc -l) -eq 1 ] && echo -e "  2. Get TRAC from Discord: !fundme_neuroweb $BACKEND_ADDRESS"
    [ "$DKG_VERSION" == "unreachable" ] && echo -e "  3. Check DKG node configuration in backend/.env"
    echo ""
fi

echo -e "${BLUE}═══════════════════════════════════════════════════${NC}\n"

# Explorer links
echo -e "${BLUE}Useful Links:${NC}"
echo -e "Explorer: ${BLUE}https://neuroweb-testnet.subscan.io/account/$BACKEND_ADDRESS${NC}"
echo -e "Discord: ${BLUE}https://discord.gg/origintrail${NC}"
echo -e "DKG Docs: ${BLUE}https://docs.origintrail.io${NC}\n"
