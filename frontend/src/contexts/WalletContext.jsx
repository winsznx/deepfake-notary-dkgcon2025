/**
 * Wallet Context with Reown AppKit
 * Multi-wallet support with wagmi hooks
 */
import { createContext, useContext } from 'react';
import { useAccount, useDisconnect, useBalance, useChainId, useSwitchChain } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import { baseSepolia } from 'viem/chains';

const WalletContext = createContext();

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return context;
};

export const WalletProvider = ({ children }) => {
  const { address, isConnected, isConnecting } = useAccount();
  const { disconnect } = useDisconnect();
  const { open } = useAppKit();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  // Get balance
  const { data: balanceData } = useBalance({
    address: address,
    enabled: !!address
  });

  const connect = async () => {
    // Opens Reown AppKit modal
    await open();
  };

  const switchToBaseSepolia = async () => {
    try {
      await switchChain({ chainId: baseSepolia.id });
    } catch (error) {
      console.error('Error switching to Base Sepolia:', error);
    }
  };

  const value = {
    account: address,
    isConnected,
    isConnecting,
    chainId,
    balance: balanceData?.formatted,
    balanceSymbol: balanceData?.symbol,
    connect,
    disconnect,
    switchToBaseSepolia,
    openModal: open
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};
