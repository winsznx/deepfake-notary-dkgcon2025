/**
 * Polkadot Wallet Context
 * Multi-wallet support with @polkadot/extension-dapp
 * Supports: Polkadot.js extension, Talisman, SubWallet
 */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { web3Accounts, web3Enable, web3FromAddress } from '@polkadot/extension-dapp';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { formatBalance } from '@polkadot/util';

const PolkadotWalletContext = createContext();

export const usePolkadotWallet = () => {
  const context = useContext(PolkadotWalletContext);
  if (!context) {
    throw new Error('usePolkadotWallet must be used within PolkadotWalletProvider');
  }
  return context;
};

// Network configurations
const NETWORKS = {
  neuroweb: {
    name: 'NeuroWeb Testnet',
    rpc: 'wss://lofar-testnet.origin-trail.network',
    symbol: 'NEURO',
    decimals: 12,
    explorer: 'https://neuroweb-testnet.subscan.io',
    chainId: 20430,
  },
  polkadot: {
    name: 'Polkadot',
    rpc: 'wss://rpc.polkadot.io',
    symbol: 'DOT',
    decimals: 10,
  },
  assetHub: {
    name: 'Asset Hub',
    rpc: 'wss://polkadot-asset-hub-rpc.polkadot.io',
    symbol: 'DOT',
    decimals: 10,
  },
};

export const PolkadotWalletProvider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [extensions, setExtensions] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [balance, setBalance] = useState('0');
  const [api, setApi] = useState(null);
  const [currentNetwork, setCurrentNetwork] = useState('neuroweb');
  const [error, setError] = useState(null);

  // Initialize API connection
  useEffect(() => {
    const initApi = async () => {
      try {
        const network = NETWORKS[currentNetwork];
        const provider = new WsProvider(network.rpc, false); // false = don't auto-connect

        // Add connection timeout and retry logic
        let retries = 0;
        const maxRetries = 3;

        const connect = async () => {
          try {
            const apiInstance = await ApiPromise.create({
              provider,
              throwOnConnect: false, // Don't throw on connection failure
            });

            // Set format for balance display
            formatBalance.setDefaults({
              decimals: network.decimals,
              unit: network.symbol,
            });

            setApi(apiInstance);
            console.log(`✅ Connected to ${network.name}`);
          } catch (err) {
            retries++;
            if (retries < maxRetries) {
              console.log(`Retrying connection (${retries}/${maxRetries})...`);
              setTimeout(connect, 2000);
            } else {
              console.error('Failed to connect to network after retries:', err);
              setError(`Could not connect to ${NETWORKS[currentNetwork].name}. Please check your internet connection.`);
            }
          }
        };

        connect();
      } catch (err) {
        console.error('Failed to initialize network:', err);
        setError(`Failed to initialize ${NETWORKS[currentNetwork].name}`);
      }
    };

    initApi();

    return () => {
      if (api) {
        api.disconnect();
      }
    };
  }, [currentNetwork]);

  // Fetch balance when account changes
  useEffect(() => {
    if (!api || !account) return;

    const fetchBalance = async () => {
      try {
        const { data: { free } } = await api.query.system.account(account.address);
        const formattedBalance = formatBalance(free, {
          withSi: true,
          forceUnit: '-'
        });
        setBalance(formattedBalance);
      } catch (err) {
        console.error('Failed to fetch balance:', err);
        setBalance('0');
      }
    };

    fetchBalance();

    // Subscribe to balance updates
    const unsubscribe = api.query.system.account(account.address, ({ data: { free } }) => {
      const formattedBalance = formatBalance(free, {
        withSi: true,
        forceUnit: '-'
      });
      setBalance(formattedBalance);
    }).then(unsub => unsub);

    return () => {
      unsubscribe.then(unsub => unsub?.());
    };
  }, [api, account]);

  // Enable and list wallet extensions
  const enableExtensions = useCallback(async () => {
    try {
      setError(null);

      // Enable access to wallet extensions
      const allExtensions = await web3Enable('Deepfake Notary');

      if (allExtensions.length === 0) {
        throw new Error('No Polkadot wallet extensions found. Please install Polkadot.js extension, Talisman, or SubWallet.');
      }

      setExtensions(allExtensions);
      console.log(`✅ Found ${allExtensions.length} wallet extension(s)`);

      return allExtensions;
    } catch (err) {
      console.error('Failed to enable extensions:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  // Connect to wallet
  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      // Enable extensions first
      await enableExtensions();

      // Get all accounts
      const allAccounts = await web3Accounts();

      if (allAccounts.length === 0) {
        throw new Error('No accounts found. Please create an account in your Polkadot wallet.');
      }

      setAccounts(allAccounts);

      // Connect to first account by default
      setAccount(allAccounts[0]);
      setIsConnected(true);

      console.log(`✅ Connected to ${allAccounts[0].meta.name} (${allAccounts[0].address})`);

      return allAccounts[0];
    } catch (err) {
      console.error('Connection failed:', err);
      setError(err.message);
      setIsConnected(false);
    } finally {
      setIsConnecting(false);
    }
  }, [enableExtensions]);

  // Switch account
  const switchAccount = useCallback(async (accountAddress) => {
    const selectedAccount = accounts.find(acc => acc.address === accountAddress);
    if (selectedAccount) {
      setAccount(selectedAccount);
      console.log(`✅ Switched to ${selectedAccount.meta.name} (${selectedAccount.address})`);
    }
  }, [accounts]);

  // Disconnect wallet
  const disconnect = useCallback(() => {
    setAccount(null);
    setIsConnected(false);
    setBalance('0');
    console.log('🔌 Wallet disconnected');
  }, []);

  // Switch network
  const switchNetwork = useCallback(async (networkKey) => {
    if (NETWORKS[networkKey]) {
      setCurrentNetwork(networkKey);
      console.log(`🌐 Switching to ${NETWORKS[networkKey].name}...`);
    }
  }, []);

  // Sign and send transaction
  const signAndSend = useCallback(async (transaction) => {
    if (!account || !api) {
      throw new Error('Wallet not connected');
    }

    try {
      // Get injector for signing
      const injector = await web3FromAddress(account.address);

      // Sign and send transaction
      const hash = await transaction.signAndSend(
        account.address,
        { signer: injector.signer }
      );

      console.log(`✅ Transaction sent: ${hash.toHex()}`);
      return hash;
    } catch (err) {
      console.error('Transaction failed:', err);
      throw err;
    }
  }, [account, api]);

  const value = {
    // Account info
    account: account?.address,
    accountName: account?.meta.name,
    accounts,

    // Connection state
    isConnected,
    isConnecting,
    extensions,

    // Balance
    balance,
    balanceSymbol: NETWORKS[currentNetwork].symbol,

    // Network info
    currentNetwork,
    networkName: NETWORKS[currentNetwork].name,
    networks: Object.keys(NETWORKS),

    // API instance
    api,

    // Error state
    error,

    // Methods
    connect,
    disconnect,
    switchAccount,
    switchNetwork,
    signAndSend,
  };

  return (
    <PolkadotWalletContext.Provider value={value}>
      {children}
    </PolkadotWalletContext.Provider>
  );
};

// Export for backward compatibility
export const useWallet = usePolkadotWallet;
export const WalletProvider = PolkadotWalletProvider;
