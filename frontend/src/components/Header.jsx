/**
 * Header Component
 */
import { Moon, Sun, Shield, Wallet, LogOut } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useWallet } from '../contexts/WalletContext';

const Header = () => {
  const { isDark, toggleTheme } = useTheme();
  const { account, isConnected, isConnecting, connect, disconnect } = useWallet();

  return (
    <header className="bg-white dark:bg-surface-dark shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-accent" />
            <div>
              <h1 className="text-xl font-display font-bold text-gray-900 dark:text-white">
                Verifiable Deepfake Notary
              </h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Decentralized Community Notes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {isConnected ? (
              <>
                <div className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 rounded-lg">
                  <Wallet className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {account.slice(0, 6)}...{account.slice(-4)}
                  </span>
                </div>
                <button
                  onClick={disconnect}
                  className="flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                  title="Disconnect Wallet"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-medium">Disconnect</span>
                </button>
              </>
            ) : (
              <button
                onClick={connect}
                disabled={isConnecting}
                className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Wallet className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                </span>
              </button>
            )}

            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-background dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-primary" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
