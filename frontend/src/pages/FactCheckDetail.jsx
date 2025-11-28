/**
 * Fact-Check Detail Page
 * Shows detailed information about a specific fact-check
 * Integrates x402 payment gating for high-confidence results
 */
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Shield, Hash, Calendar, User, AlertTriangle,
  CheckCircle, ExternalLink, Coins, TrendingUp, Lock, Star
} from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../config/api';
import { useWallet } from '../contexts/WalletContext';

const FactCheckDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { account, isConnected } = useWallet();
  const [factCheck, setFactCheck] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stakeAmount, setStakeAmount] = useState(50);
  const [guardianId, setGuardianId] = useState('');
  const [selectedToken, setSelectedToken] = useState('TRAC');
  const [supportedTokens, setSupportedTokens] = useState([]);
  const [staking, setStaking] = useState(false);

  useEffect(() => {
    fetchFactCheck();
    fetchSupportedTokens();
  }, [id]);

  const fetchFactCheck = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/factcheck/${id}`);
      setFactCheck(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load fact-check');
      setLoading(false);
    }
  };

  const fetchSupportedTokens = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/staking/tokens`);
      setSupportedTokens(response.data.tokens || []);
    } catch (err) {
      console.error('Failed to fetch supported tokens:', err);
    }
  };

  const handleStake = async () => {
    // Auto-use connected wallet address if available, or require Guardian ID
    const identifier = guardianId || account;

    if (!identifier) {
      alert('Please connect wallet or enter your Guardian identifier');
      return;
    }

    setStaking(true);
    try {
      await axios.post(`${API_URL}/api/staking/stake`, {
        factCheckId: id,
        guardianIdentifier: identifier,
        amount: parseFloat(stakeAmount),
        tokenType: selectedToken
      });

      alert(`Stake placed successfully with ${selectedToken}!`);
      fetchFactCheck(); // Refresh data
    } catch (err) {
      alert(err.response?.data?.error || 'Staking failed');
    }
    setStaking(false);
  };

  const handleUnlockPremium = () => {
    navigate(`/high-confidence?id=${id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card bg-red-50 dark:bg-red-900 dark:bg-opacity-20">
        <AlertTriangle className="w-12 h-12 text-red-600 dark:text-red-400 mb-4" />
        <h2 className="text-xl font-bold mb-2">Error Loading Fact-Check</h2>
        <p className="text-gray-600 dark:text-gray-400">{error}</p>
        <Link to="/dashboard" className="btn-primary mt-4 inline-block">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  if (!factCheck) {
    return null;
  }

  const deepfakePercentage = (factCheck.deepfakeScore * 100).toFixed(1);
  const confidencePercentage = (factCheck.confidenceScore * 100).toFixed(1);
  const isDeepfake = factCheck.deepfakeScore > 0.5;
  const requiresPayment = factCheck.confidenceScore >= 0.7;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link to="/dashboard" className="flex items-center gap-2 text-primary hover:underline">
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      {/* Payment Required Banner */}
      {requiresPayment && (
        <div className="card bg-primary bg-opacity-10 border-2 border-primary">
          <div className="flex items-start gap-3">
            <Lock className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-bold text-lg">High-Confidence Result</h3>
                <Star className="w-5 h-5 text-amber-500" />
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                This fact-check has a confidence score of <span className="font-bold">{confidencePercentage}%</span>.
                Full details including artifacts, consensus data, and complete analysis require payment via x402 micropayments.
              </p>
              <div className="flex items-center gap-4 mb-3">
                <div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Price</div>
                  <div className="font-bold text-lg">
                    ${factCheck.confidenceScore >= 0.85 ? '0.0003' : '0.0001'} USDC
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Network</div>
                  <div className="font-bold">Base Sepolia</div>
                </div>
              </div>
              <button
                onClick={handleUnlockPremium}
                className="btn-primary"
              >
                <Lock className="w-4 h-4 inline mr-2" />
                Unlock Premium Details
              </button>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Powered by x402 • 60% revenue goes to verifiers
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="card">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-display font-bold mb-2">Fact-Check Analysis</h1>
            <p className="text-gray-600 dark:text-gray-400">
              {requiresPayment ? 'Basic verification results' : 'Detailed verification results and provenance'}
            </p>
          </div>
          {isDeepfake ? (
            <span className="px-4 py-2 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-full flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Likely Deepfake
            </span>
          ) : (
            <span className="px-4 py-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Likely Authentic
            </span>
          )}
        </div>

        {/* Scores */}
        <div className="grid md:grid-cols-2 gap-6">
          <ScoreDisplay
            label="Deepfake Score"
            value={deepfakePercentage}
            max={100}
            color={isDeepfake ? 'red' : 'green'}
            description="Probability of AI manipulation"
          />
          <ScoreDisplay
            label="Confidence Score"
            value={confidencePercentage}
            max={100}
            color="primary"
            description="Model confidence in prediction"
          />
        </div>
      </div>

      {/* Basic Info (Always Visible) */}
      <div className="card">
        <h2 className="text-2xl font-display font-bold mb-4">Media Information</h2>
        <div className="space-y-3">
          <InfoRow icon={Hash} label="SHA-256 Hash" value={factCheck.media.sha256Hash} mono />
          <InfoRow icon={Calendar} label="Uploaded" value={new Date(factCheck.media.uploadedAt).toLocaleString()} />
          <InfoRow
            icon={Shield}
            label="Media Type"
            value={factCheck.media.mediaType.toUpperCase()}
          />
        </div>
      </div>

      {/* Analysis Details (Limited if payment required) */}
      <div className="card">
        <h2 className="text-2xl font-display font-bold mb-4">Analysis Details</h2>
        <div className="space-y-3">
          <InfoRow label="Model Used" value={factCheck.modelUsed} />
          <InfoRow label="Analyzed At" value={new Date(factCheck.createdAt).toLocaleString()} />

          {!requiresPayment ? (
            <>
              <InfoRow label="Processing Time" value={`${factCheck.processingTime?.toFixed(2)}s`} />
              {factCheck.artifactsDetected && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Artifacts Detected:</p>
                  <div className="flex flex-wrap gap-2">
                    {JSON.parse(factCheck.artifactsDetected).map((artifact, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs rounded-full"
                      >
                        {artifact.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-600">
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <Lock className="w-5 h-5" />
                <p className="text-sm">
                  Processing time and detailed artifacts are available in premium tier
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Guardian Information */}
      <div className="card">
        <h2 className="text-2xl font-display font-bold mb-4">Guardian Information</h2>
        <div className="space-y-3">
          <InfoRow icon={User} label="Guardian ID" value={factCheck.guardian.guardianId} mono />
          <InfoRow
            icon={TrendingUp}
            label="Reputation Score"
            value={`${(factCheck.guardian.reputationScore * 100).toFixed(0)}%`}
          />
          <InfoRow label="Total Verifications" value={factCheck.guardian.verificationCount} />
          <InfoRow
            label="Accuracy Rate"
            value={`${(factCheck.guardian.accuracyRate * 100).toFixed(1)}%`}
          />
        </div>
      </div>

      {/* DKG Publication */}
      {factCheck.publishedToDkg && factCheck.dkgAssetId && (
        <div className="card bg-primary bg-opacity-10 border border-primary">
          <h2 className="text-2xl font-display font-bold mb-4 text-primary dark:text-blue-400">
            Published to DKG
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            This fact-check has been published as a Knowledge Asset on the OriginTrail Decentralized Knowledge Graph.
          </p>
          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Universal Asset Locator (UAL):</p>
            <code className="text-xs break-all">{factCheck.dkgAssetId}</code>
          </div>
          <a
            href={`https://dkg.origintrail.io/explore?ual=${factCheck.dkgAssetId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-2 text-primary hover:underline text-sm"
          >
            View on DKG Explorer
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      )}

      {/* Staking Section */}
      <div className="card bg-surface dark:bg-gray-800">
        <h2 className="text-2xl font-display font-bold mb-4">Stake on This Verification</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Stake tokens to support this fact-check. If consensus aligns with this analysis, you'll earn rewards.
          If not, your stake will be slashed.
        </p>

        <div className="space-y-4">
          {!isConnected && (
            <div className="p-3 bg-amber-50 dark:bg-amber-900 dark:bg-opacity-20 rounded text-sm">
              <p className="text-amber-800 dark:text-amber-200">
                💡 Connect your wallet to stake automatically, or enter your Guardian ID manually
              </p>
            </div>
          )}

          {!isConnected && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Guardian Identifier (Optional if wallet connected)
              </label>
              <input
                type="text"
                value={guardianId}
                onChange={(e) => setGuardianId(e.target.value)}
                placeholder="0x... or username"
                className="input-field"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">
              Select Token
            </label>
            <select
              value={selectedToken}
              onChange={(e) => setSelectedToken(e.target.value)}
              className="input-field mb-4"
            >
              {supportedTokens.map((token) => (
                <option key={token.symbol} value={token.symbol}>
                  {token.symbol} - {token.name}
                  {token.multiplier > 1.0 && ` (+${((token.multiplier - 1) * 100).toFixed(0)}% Polkadot Bonus)`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Stake Amount ({selectedToken})
            </label>
            <div className="flex gap-3">
              <input
                type="number"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                min={supportedTokens.find(t => t.symbol === selectedToken)?.minStake || 10}
                max={supportedTokens.find(t => t.symbol === selectedToken)?.maxStake || 500}
                step={selectedToken === 'DOT' ? '0.1' : '1'}
                className="input-field flex-1"
              />
              <button
                onClick={handleStake}
                disabled={staking || (!guardianId && !isConnected)}
                className="btn-primary px-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Coins className="w-4 h-4 inline mr-2" />
                {staking ? 'Staking...' : 'Stake'}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Min: {supportedTokens.find(t => t.symbol === selectedToken)?.minStake || 10} {selectedToken} | Max: {supportedTokens.find(t => t.symbol === selectedToken)?.maxStake || 500} {selectedToken}
            </p>
          </div>

          {factCheck.stakes && factCheck.stakes.length > 0 && (
            <div className="mt-4 p-4 bg-white dark:bg-gray-700 rounded-lg">
              <p className="text-sm font-medium mb-2">Current Stakes:</p>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total staked: {factCheck.stakes.reduce((sum, s) => sum + s.amount, 0)} TRAC
                by {factCheck.stakes.length} guardian(s)
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Consensus Results (Limited if payment required) */}
      {factCheck.consensus && (
        <div className="card">
          <h2 className="text-2xl font-display font-bold mb-4">Consensus Results</h2>
          {!requiresPayment ? (
            <div className="space-y-3">
              <InfoRow label="Total Stake" value={`${factCheck.consensus.totalStake} TRAC`} />
              <InfoRow label="Participants" value={factCheck.consensus.participantCount} />
              <InfoRow label="Agreement Rate" value={`${(factCheck.consensus.agreementRate * 100).toFixed(1)}%`} />
              <InfoRow
                label="Majority Verdict"
                value={factCheck.consensus.majorityVerdict || 'Pending'}
              />
            </div>
          ) : (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-600">
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <Lock className="w-5 h-5" />
                <p className="text-sm">
                  Detailed consensus results are available in premium tier
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const ScoreDisplay = ({ label, value, max, color, description }) => (
  <div>
    <div className="flex justify-between items-center mb-2">
      <span className="font-medium">{label}</span>
      <span className="text-2xl font-display font-bold">{value}%</span>
    </div>
    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
      <div
        className={`bg-${color}-500 h-3 rounded-full transition-all`}
        style={{ width: `${(value / max) * 100}%` }}
      />
    </div>
    <p className="text-xs text-gray-500 mt-1">{description}</p>
  </div>
);

const InfoRow = ({ icon: Icon, label, value, mono }) => (
  <div className="flex items-start justify-between py-2 border-b border-gray-200 dark:border-gray-700 last:border-0">
    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
      {Icon && <Icon className="w-4 h-4" />}
      <span className="text-sm">{label}:</span>
    </div>
    <span className={`text-sm font-medium text-right ${mono ? 'font-mono text-xs' : ''} max-w-md break-all`}>
      {value}
    </span>
  </div>
);

export default FactCheckDetail;
