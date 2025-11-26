/**
 * Main App Component with Reown AppKit
 */
import { Routes, Route } from 'react-router-dom';
import { WagmiProvider } from 'wagmi';
import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './contexts/ThemeContext';
import { WalletProvider } from './contexts/WalletContext';
import { wagmiConfig, queryClient } from './config/reown';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LandingStandalone from './pages/LandingStandalone';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import FactCheckDetail from './pages/FactCheckDetail';
import Staking from './pages/Staking';
import HighConfidence from './pages/HighConfidence';
import Documentation from './pages/Documentation';

const App = () => {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <WalletProvider>
            <Routes>
              {/* Standalone landing page without layout */}
              <Route path="/" element={<LandingStandalone />} />

              {/* Public documentation page */}
              <Route path="/docs" element={<Documentation />} />

              {/* Protected app routes with layout */}
              <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="upload" element={<Upload />} />
                <Route path="factcheck/:id" element={<FactCheckDetail />} />
                <Route path="staking" element={<Staking />} />
                <Route path="high-confidence" element={<HighConfidence />} />
              </Route>
            </Routes>
          </WalletProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default App;
