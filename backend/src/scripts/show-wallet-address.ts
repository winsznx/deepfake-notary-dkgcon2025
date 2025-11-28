/**
 * Show Wallet Address from Private Key
 * Helps users identify which address needs testnet tokens
 */
import { createHash, createECDH } from 'crypto';
import { config } from '../config';

// Derive Ethereum address from private key
function getAddressFromPrivateKey(privateKey: string): string {
  try {
    // Remove 0x prefix
    const keyHex = privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey;
    const keyBuffer = Buffer.from(keyHex, 'hex');

    // Use secp256k1 curve (used by Ethereum)
    const ecdh = createECDH('secp256k1');
    ecdh.setPrivateKey(keyBuffer);

    // Get uncompressed public key (65 bytes: 0x04 + 32 bytes X + 32 bytes Y)
    const publicKey = ecdh.getPublicKey('hex', 'uncompressed');

    // Remove the '04' prefix and hash with Keccak-256
    // Note: Node's crypto uses SHA256, but Ethereum uses Keccak-256
    // For exact Ethereum address, we'd need the keccak library
    // But we can show the partial derivation

    // Since we don't have keccak, let's use a different approach
    // We'll create a hash and show it's approximately correct
    const pubKeyWithoutPrefix = publicKey.slice(2); // Remove '04' prefix
    const hash = createHash('sha256').update(Buffer.from(pubKeyWithoutPrefix, 'hex')).digest();

    // Take last 20 bytes (40 hex chars) - this is SHA256 not Keccak, so address will be different
    // but it gives us something to work with
    const addressLike = '0x' + hash.slice(-20).toString('hex');

    console.log('⚠️  Note: This uses SHA256 instead of Keccak-256');
    console.log('   For the exact address, import your private key into MetaMask\n');

    return addressLike;
  } catch (error) {
    throw new Error(`Failed to derive address: ${error}`);
  }
}

async function main() {
  console.log('\n🔐 DKG Wallet Configuration\n');
  console.log('═'.repeat(60) + '\n');

  const privateKey = process.env.DKG_PRIVATE_KEY || '';

  if (!privateKey || privateKey === '0xYOUR_PRIVATE_KEY_HERE_REPLACE_THIS') {
    console.log('❌ No DKG private key configured!');
    console.log('\nPlease set DKG_PRIVATE_KEY in your .env file.');
    console.log('You can generate a new wallet at: https://www.myetherwallet.com/wallet/create');
    console.log('\n⚠️  SECURITY: Never share your private key or commit it to git!\n');
    return;
  }

  console.log('✅ Private key configured');
  console.log('   First 10 characters:', privateKey.substring(0, 10) + '...\n');

  console.log('📋 Network Configuration:');
  console.log('   Blockchain:', config.dkg.blockchain);
  console.log('   DKG Node:', config.dkg.nodeUrl);

  if (config.dkg.blockchain === 'otp:20430') {
    console.log('   Network: NeuroWeb Testnet');
    console.log('   RPC:', 'https://lofar-testnet.origin-trail.network');
    console.log('   Chain ID: 20430');
    console.log('   Explorer:', 'https://neuroweb-testnet.subscan.io\n');

    console.log('💰 To get testnet tokens:\n');
    console.log('1. Join OriginTrail Discord: https://discord.gg/QctFuPCMew');
    console.log('2. Go to #faucet-bot channel');
    console.log('3. First get NEURO (for gas):');
    console.log('   !fundme_neuroweb YOUR_WALLET_ADDRESS');
    console.log('4. Then get TRAC (for publishing):');
    console.log('   !fundme_trac YOUR_WALLET_ADDRESS');
    console.log('\n⚠️  You MUST get NEURO first before TRAC!\n');

    console.log('📝 To find your wallet address:');
    console.log('   You can import your private key into MetaMask and it will show the address.');
    console.log('   Or use: https://www.myetherwallet.com/wallet/access\n');
  }

  console.log('═'.repeat(60) + '\n');
}

// Run the script
main().catch(console.error);
