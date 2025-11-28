/**
 * Protected Route Component
 * Requires wallet connection to access
 */
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePolkadotWallet } from '../contexts/PolkadotWalletContext';
import { Wallet, Shield } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
  const { isConnected, isConnecting, connect } = usePolkadotWallet();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isConnected && !isConnecting) {
      // Redirect to landing page after a short delay
      const timer = setTimeout(() => {
        navigate('/');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isConnected, isConnecting, navigate]);

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background dark:bg-gray-900">
        <div className="max-w-md w-full mx-4">
          <div className="card text-center p-8">
            <Shield className="w-16 h-16 text-accent mx-auto mb-4" />
            <h1 className="text-2xl font-display font-bold mb-4 text-gray-900 dark:text-white">
              Wallet Connection Required
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Please connect your wallet to access the Deepfake Notary dashboard.
            </p>
            <button
              onClick={connect}
              disabled={isConnecting}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <Wallet className="w-5 h-5" />
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </button>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
              Redirecting to home page in 3 seconds...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
