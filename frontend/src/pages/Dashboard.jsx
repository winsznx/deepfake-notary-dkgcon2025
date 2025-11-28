/**
 * Dashboard Page
 * Shows all fact-checks and media items with analytics
 */
import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FileCheck, AlertTriangle, CheckCircle, Clock, TrendingUp, Lock, Star } from 'lucide-react';
import axios from 'axios';
import { LineChart, BarChart, DonutChart } from '../components/Charts';
import { API_URL } from '../config/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    total: 0,
    deepfakes: 0,
    authentic: 0,
    pending: 0
  });
  const [recentFactChecks, setRecentFactChecks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch all fact-checks
      const response = await axios.get(`${API_URL}/api/factcheck/all`);
      const factChecks = response.data;

      // Calculate stats from real data
      const total = factChecks.length;
      const deepfakes = factChecks.filter(fc => fc.deepfakeScore >= 0.7).length;
      const authentic = factChecks.filter(fc => fc.deepfakeScore < 0.3).length;
      const pending = 0; // No pending state in current implementation

      setStats({
        total,
        deepfakes,
        authentic,
        pending
      });

      // Set recent fact-checks
      setRecentFactChecks(factChecks);

      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      // If API fails, show empty state instead of crashing
      setRecentFactChecks([]);
      setLoading(false);
    }
  };

  const getScoreBadge = (score) => {
    if (score < 0.3) {
      return (
        <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded-full flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          Authentic
        </span>
      );
    } else if (score < 0.7) {
      return (
        <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs rounded-full flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Suspicious
        </span>
      );
    } else {
      return (
        <span className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-xs rounded-full flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          Deepfake
        </span>
      );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-2">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Overview of all fact-checks and verification activity
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          icon={FileCheck}
          label="Total Verified"
          value={stats.total}
          color="primary"
        />
        <StatCard
          icon={AlertTriangle}
          label="Deepfakes Detected"
          value={stats.deepfakes}
          color="red-500"
        />
        <StatCard
          icon={CheckCircle}
          label="Authentic Media"
          value={stats.authentic}
          color="green-500"
        />
        <StatCard
          icon={Clock}
          label="Pending Analysis"
          value={stats.pending}
          color="yellow-500"
        />
      </div>

      {/* Recent Fact-Checks */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-display font-bold">Recent Fact-Checks</h2>
          <Link to="/upload" className="btn-primary text-sm">
            New Analysis
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-400 mt-4">Loading...</p>
          </div>
        ) : recentFactChecks.length === 0 ? (
          <div className="text-center py-12">
            <FileCheck className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              No fact-checks yet
            </p>
            <Link to="/upload" className="btn-primary inline-block">
              Upload Your First Media
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {recentFactChecks.map((factCheck) => (
              <FactCheckCard key={factCheck.id} factCheck={factCheck} getScoreBadge={getScoreBadge} />
            ))}
          </div>
        )}
      </div>

      {/* Activity Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Verification Timeline */}
        <div className="card">
          <h2 className="text-2xl font-display font-bold mb-4">Verification Timeline</h2>
          <VerificationTimeline factChecks={recentFactChecks} />
        </div>

        {/* Detection Distribution */}
        <div className="card">
          <h2 className="text-2xl font-display font-bold mb-4">Detection Distribution</h2>
          <DetectionDistribution factChecks={recentFactChecks} />
        </div>
      </div>

      {/* Confidence Analysis */}
      <div className="card">
        <h2 className="text-2xl font-display font-bold mb-4">Confidence Score Analysis</h2>
        <ConfidenceAnalysis factChecks={recentFactChecks} />
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="card">
    <div className="flex items-center gap-4">
      <div className={`p-3 bg-${color} bg-opacity-10 rounded-lg`}>
        <Icon className={`w-6 h-6 text-${color}`} />
      </div>
      <div>
        <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
        <p className="text-2xl font-display font-bold">{value}</p>
      </div>
    </div>
  </div>
);

const FactCheckCard = ({ factCheck, getScoreBadge }) => {
  const requiresPayment = factCheck.confidenceScore >= 0.7;
  const price = factCheck.confidenceScore >= 0.85 ? '0.0003' : '0.0001';

  return (
    <Link
      to={`/factcheck/${factCheck.id}`}
      className={`block p-4 border rounded-lg transition-colors ${
        requiresPayment
          ? 'border-primary dark:border-blue-600 bg-primary bg-opacity-5 hover:border-primary hover:bg-opacity-10'
          : 'border-gray-200 dark:border-gray-700 hover:border-primary'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
            {factCheck.media.sha256Hash.substring(0, 12)}...
          </div>
          <span className="text-xs text-gray-500 capitalize">{factCheck.media.mediaType}</span>
        </div>
        <div className="flex items-center gap-2">
          {requiresPayment && (
            <span className="px-2 py-1 bg-primary text-white text-xs rounded-full flex items-center gap-1">
              <Lock className="w-3 h-3" />
              Premium
            </span>
          )}
          {getScoreBadge(factCheck.deepfakeScore)}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <p className="text-gray-600 dark:text-gray-400">Deepfake Score</p>
          <p className="font-bold">{(factCheck.deepfakeScore * 100).toFixed(1)}%</p>
        </div>
        <div>
          <p className="text-gray-600 dark:text-gray-400">Confidence</p>
          <p className="font-bold flex items-center gap-1">
            {(factCheck.confidenceScore * 100).toFixed(1)}%
            {requiresPayment && <Star className="w-3 h-3 text-amber-500" />}
          </p>
        </div>
        <div>
          <p className="text-gray-600 dark:text-gray-400">Guardian Rep.</p>
          <p className="font-bold">{(factCheck.guardian.reputationScore * 100).toFixed(0)}%</p>
        </div>
        <div>
          <p className="text-gray-600 dark:text-gray-400">Analyzed</p>
          <p className="font-bold">{new Date(factCheck.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {factCheck.publishedToDkg && (
            <div className="flex items-center gap-2 text-xs text-primary dark:text-blue-400">
              <CheckCircle className="w-3 h-3" />
              Published to DKG
            </div>
          )}
        </div>
        {requiresPayment && (
          <div className="text-xs text-primary dark:text-blue-400 font-medium flex items-center gap-1">
            <Lock className="w-3 h-3" />
            ${price} USDC to unlock
          </div>
        )}
      </div>
    </Link>
  );
};

// Chart visualization components
const VerificationTimeline = ({ factChecks }) => {
  const timelineData = useMemo(() => {
    if (!factChecks || factChecks.length === 0) return [];

    // Group by date
    const grouped = factChecks.reduce((acc, fc) => {
      const date = new Date(fc.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    // Get last 7 days
    const dates = [...new Set(factChecks.map(fc =>
      new Date(fc.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    ))].slice(-7);

    return dates.map(date => ({
      label: date,
      value: grouped[date] || 0
    }));
  }, [factChecks]);

  return (
    <div className="flex justify-center">
      <LineChart
        data={timelineData}
        width={500}
        height={250}
        color="#A35E47"
      />
    </div>
  );
};

const DetectionDistribution = ({ factChecks }) => {
  const distributionData = useMemo(() => {
    if (!factChecks || factChecks.length === 0) return [];

    const counts = {
      authentic: 0,
      suspicious: 0,
      deepfake: 0
    };

    factChecks.forEach(fc => {
      if (fc.deepfakeScore < 0.3) counts.authentic++;
      else if (fc.deepfakeScore < 0.7) counts.suspicious++;
      else counts.deepfake++;
    });

    return [
      { label: 'Authentic', value: counts.authentic },
      { label: 'Suspicious', value: counts.suspicious },
      { label: 'Deepfake', value: counts.deepfake }
    ];
  }, [factChecks]);

  return (
    <div className="flex justify-center">
      <DonutChart
        data={distributionData}
        width={300}
        height={300}
        colors={['#4ade80', '#facc15', '#ef4444']}
      />
    </div>
  );
};

const ConfidenceAnalysis = ({ factChecks }) => {
  const confidenceData = useMemo(() => {
    if (!factChecks || factChecks.length === 0) return [];

    // Group by confidence ranges
    const ranges = {
      '0-20%': 0,
      '20-40%': 0,
      '40-60%': 0,
      '60-80%': 0,
      '80-100%': 0
    };

    factChecks.forEach(fc => {
      const score = fc.confidenceScore * 100;
      if (score < 20) ranges['0-20%']++;
      else if (score < 40) ranges['20-40%']++;
      else if (score < 60) ranges['40-60%']++;
      else if (score < 80) ranges['60-80%']++;
      else ranges['80-100%']++;
    });

    return Object.entries(ranges).map(([label, value]) => ({
      label,
      value
    }));
  }, [factChecks]);

  return (
    <div className="flex justify-center">
      <BarChart
        data={confidenceData}
        width={600}
        height={300}
        color="#A35E47"
      />
    </div>
  );
};

export default Dashboard;
