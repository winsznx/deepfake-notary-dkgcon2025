#!/bin/bash
# Check NeuroWeb testnet wallet balance

WALLET="0x10Cd8De4017fF6213d93ffF440c8c7e310117D1f"
RPC="https://lofar-testnet.origin-trail.network"

echo "🔍 Checking wallet balance..."
echo "📍 Wallet: $WALLET"
echo ""

# Check NEURO balance
BALANCE_HEX=$(curl -s "$RPC" -X POST -H "Content-Type: application/json" \
  -d "{\"jsonrpc\":\"2.0\",\"method\":\"eth_getBalance\",\"params\":[\"$WALLET\",\"latest\"],\"id\":1}" \
  | grep -o '"result":"0x[0-9a-f]*"' | cut -d'"' -f4)

if [ -n "$BALANCE_HEX" ]; then
  BALANCE_WEI=$(printf "%d" "$BALANCE_HEX" 2>/dev/null)
  BALANCE=$(echo "scale=6; $BALANCE_WEI / 1000000000000000000" | bc)
  echo "💰 NEURO Balance: $BALANCE NEURO"

  if (( $(echo "$BALANCE > 5" | bc -l) )); then
    echo "✅ Sufficient NEURO for gas!"
  else
    echo "⚠️  Low NEURO - need at least 5 for DKG operations"
  fi
else
  echo "❌ Could not fetch balance"
fi

echo ""
echo "🌐 View on explorer: https://neuroweb-testnet.subscan.io/account/$WALLET"
