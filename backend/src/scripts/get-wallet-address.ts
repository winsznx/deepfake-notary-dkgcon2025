/**
 * Get Ethereum Address from Private Key
 * Uses ethers.js for proper Keccak-256 hashing
 */

async function main() {
  const privateKey = process.env.DKG_PRIVATE_KEY;

  if (!privateKey || privateKey === '0xYOUR_PRIVATE_KEY_HERE_REPLACE_THIS') {
    console.log('❌ No DKG private key configured!');
    return;
  }

  try {
    // Use ethers.js v6 Wallet to derive address
    const { Wallet } = await import('ethers');
    const wallet = new Wallet(privateKey);

    console.log('\n🔐 DKG Wallet Information\n');
    console.log('═'.repeat(60));
    console.log('\n📍 Wallet Address:', wallet.address);
    console.log('\n💰 To get testnet tokens:\n');
    console.log('1. Join OriginTrail Discord: https://discord.gg/QctFuPCMew');
    console.log('2. Go to #faucet-bot channel');
    console.log('3. Get NEURO (for gas):');
    console.log(`   !fundme_neuroweb ${wallet.address}`);
    console.log('4. Get TRAC (for publishing):');
    console.log(`   !fundme_trac ${wallet.address}`);
    console.log('\n🌐 Network: NeuroWeb Testnet (Chain ID: 20430)');
    console.log('🔗 RPC: https://lofar-testnet.origin-trail.network');
    console.log(`📊 Check balance: https://neuroweb-testnet.subscan.io/account/${wallet.address}`);
    console.log('\n' + '═'.repeat(60) + '\n');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

main().catch(console.error);
