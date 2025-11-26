#!/bin/bash
# Transfer TRAC from personal wallet to backend wallet

FROM_WALLET="0xEfd50EC809f87393b87513f207DaddEb80C0491F"
TO_WALLET="0x10Cd8De4017fF6213d93ffF440c8c7e310117D1f"
TRAC_CONTRACT="0xEddd2B9A8aFE1115Eaa485e38EE7a6a3e9D09323"
RPC="https://lofar-testnet.origin-trail.network"
AMOUNT_TRAC="1000"  # Transfer 1000 TRAC

echo "🔄 Preparing TRAC transfer..."
echo "📤 From: $FROM_WALLET"
echo "📥 To: $TO_WALLET"
echo "💰 Amount: $AMOUNT_TRAC TRAC"
echo ""

# You'll need to sign this transaction with your personal wallet
# Using cast (foundry) or web3.js

echo "⚠️  To transfer TRAC, you need the private key for wallet $FROM_WALLET"
echo ""
echo "Option 1: Use MetaMask"
echo "  1. Open MetaMask and connect to NeuroWeb Testnet"
echo "  2. Add TRAC token: $TRAC_CONTRACT"
echo "  3. Send $AMOUNT_TRAC TRAC to: $TO_WALLET"
echo ""
echo "Option 2: Use cast command (if you have private key)"
echo "  cast send $TRAC_CONTRACT \\"
echo "    'transfer(address,uint256)' \\"
echo "    $TO_WALLET \\"
echo "    \$(cast to-wei $AMOUNT_TRAC ether) \\"
echo "    --rpc-url $RPC \\"
echo "    --private-key YOUR_PERSONAL_PRIVATE_KEY"
echo ""
echo "Network: NeuroWeb Testnet"
echo "RPC: $RPC"
echo "Chain ID: 20430"
