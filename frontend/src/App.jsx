/**
 * Main App Component with Polkadot Wallet Integration
 */
import { Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './contexts/ThemeContext';
import { PolkadotWalletProvider } from './contexts/PolkadotWalletContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LandingStandalone from './pages/LandingStandalone';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import FactCheckDetail from './pages/FactCheckDetail';
import Staking from './pages/Staking';
import HighConfidence from './pages/HighConfidence';
import Documentation from './pages/Documentation';

// Create QueryClient for async data management
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5000,
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <PolkadotWalletProvider>
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
        </PolkadotWalletProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
