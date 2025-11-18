/**
 * Main App Component
 */
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout';
import LandingStandalone from './pages/LandingStandalone';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import FactCheckDetail from './pages/FactCheckDetail';
import Staking from './pages/Staking';
import HighConfidence from './pages/HighConfidence';

const App = () => {
  return (
    <ThemeProvider>
      <Routes>
        {/* Standalone landing page without layout */}
        <Route path="/" element={<LandingStandalone />} />

        {/* App routes with layout */}
        <Route path="/" element={<Layout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="upload" element={<Upload />} />
          <Route path="factcheck/:id" element={<FactCheckDetail />} />
          <Route path="staking" element={<Staking />} />
          <Route path="high-confidence" element={<HighConfidence />} />
        </Route>
      </Routes>
    </ThemeProvider>
  );
};

export default App;
