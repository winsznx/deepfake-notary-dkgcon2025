/**
 * Reown AppKit Configuration
 * Multi-chain Web3 wallet connection
 */
import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { QueryClient } from '@tanstack/react-query';
import { baseSepolia, sepolia, base, mainnet, polygon, arbitrum } from 'viem/chains';

// WalletConnect Project ID
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'bbc8477ecca18b43c77984906ea60695';

console.log('🔑 Reown Project ID:', projectId);

// Supported networks (using viem chains directly)
export const networks = [baseSepolia, sepolia, base, mainnet, polygon, arbitrum];

// Metadata
export const metadata = {
  name: 'Deepfake Notary',
  description: 'Verifiable AI-Generated Content Detection with OriginTrail DKG',
  url: 'https://deepfake-notary.com',
  icons: ['https://deepfake-notary.com/icon.png']
};

// Query client
export const queryClient = new QueryClient();

// Wagmi Adapter
export const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId
});

// Export wagmi config
export const wagmiConfig = wagmiAdapter.wagmiConfig;

// Create modal - wrapped in try-catch to prevent app crashes
try {
  createAppKit({
    adapters: [wagmiAdapter],
    networks,
    metadata,
    projectId,
    features: {
      analytics: true
    }
  });
  console.log('✅ Reown AppKit initialized successfully');
} catch (error) {
  console.error('❌ Failed to initialize Reown AppKit:', error);
  console.error('Project ID:', projectId);
}
