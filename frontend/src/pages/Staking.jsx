/**
 * Staking & Consensus Page
 * Multi-token staking with Polkadot ecosystem bonuses
 */
import { useState, useEffect } from 'react';
import { Coins, TrendingUp, AlertCircle, CheckCircle, Target, Wallet as WalletIcon, Sparkles, Award, Circle } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../config/api';
import { useWallet } from '../contexts/WalletContext';

// Token color mapping
const TOKEN_COLORS = {
  TRAC: 'bg-blue-500',
  NEURO: 'bg-purple-500',
  DOT: 'bg-pink-500'
};

const Staking = () => {
  const { account, isConnected, connect, balance, balanceSymbol } = useWallet();
  const [activeTab, setActiveTab] = useState('overview');
  const [stakes, setStakes] = useState([]);
  const [stats, setStats] = useState({
    totalStaked: 0,
    activeStakes: 0,
    winRate: 0,
    totalRewards: 0,
    totalSlashed: 0
  });
  const [consensusResults, setConsensusResults] = useState([]);
  const [supportedTokens, setSupportedTokens] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch user stakes and stats
  useEffect(() => {
    if (isConnected && account) {
      fetchStakesAndStats();
    }
  }, [isConnected, account]);

  // Fetch supported tokens
  useEffect(() => {
    fetchSupportedTokens();
  }, []);

  // Fetch consensus results
  useEffect(() => {
    if (activeTab === 'consensus') {
      fetchConsensusResults();
    }
  }, [activeTab]);

  const fetchStakesAndStats = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:3001/api/staking/wallet/${account}`);
      setStakes(response.data.stakes || []);
      setStats(response.data.stats || stats);
    } catch (error) {
      console.error('Failed to fetch stakes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchConsensusResults = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/consensus/recent/all`);
      setConsensusResults(response.data || []);
    } catch (error) {
      console.error('Failed to fetch consensus results:', error);
    }
  };

  const fetchSupportedTokens = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/staking/tokens`);
      setSupportedTokens(response.data.tokens || []);
    } catch (error) {
      console.error('Failed to fetch supported tokens:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-2">
          Staking & Consensus
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your stakes and participate in consensus validation
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <TabButton
          active={activeTab === 'overview'}
          onClick={() => setActiveTab('overview')}
          label="Overview"
        />
        <TabButton
          active={activeTab === 'mystakes'}
          onClick={() => setActiveTab('mystakes')}
          label="My Stakes"
        />
        <TabButton
          active={activeTab === 'consensus'}
          onClick={() => setActiveTab('consensus')}
          label="Consensus Results"
        />
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && <OverviewTab stats={stats} supportedTokens={supportedTokens} isConnected={isConnected} connect={connect} balance={balance} balanceSymbol={balanceSymbol} account={account} />}
      {activeTab === 'mystakes' && <MyStakesTab stakes={stakes} loading={loading} isConnected={isConnected} />}
      {activeTab === 'consensus' && <ConsensusTab consensusResults={consensusResults} />}
    </div>
  );
};

const TabButton = ({ active, onClick, label }) => (
  <button
    onClick={onClick}
    className={`
      px-4 py-2 font-medium transition-colors border-b-2
      ${active
        ? 'border-primary text-primary'
        : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-primary'
      }
    `}
  >
    {label}
  </button>
);

const OverviewTab = ({ stats, supportedTokens, isConnected, connect, balance, balanceSymbol, account }) => (
  <div className="space-y-6">
    {/* Wallet Balance Display */}
    {isConnected && account && (
      <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900 border border-blue-200 dark:border-blue-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Connected Wallet</h3>
            <p className="text-xs font-mono text-gray-500 dark:text-gray-400">{account}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Balance</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {balance ? `${parseFloat(balance).toFixed(4)} ${balanceSymbol}` : 'Loading...'}
            </p>
          </div>
        </div>
        <div className="mt-3 p-2 bg-blue-100 dark:bg-blue-800 rounded text-xs text-blue-800 dark:text-blue-200">
          <CheckCircle className="w-3 h-3 inline mr-1" />
          All staking transactions will use this connected wallet
        </div>
      </div>
    )}

    {/* Polkadot Ecosystem Bonus Banner */}
    <div className="card bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <Sparkles className="w-12 h-12" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-2xl font-display font-bold">Polkadot Ecosystem Bonus!</h3>
            <Award className="w-6 h-6" />
          </div>
          <p className="text-white text-opacity-90 mb-4">
            Stake with Polkadot ecosystem tokens for reputation multiplier bonuses:
          </p>
          <div className="grid md:grid-cols-3 gap-3">
            {supportedTokens.map((token) => (
              <div key={token.symbol} className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-6 h-6 ${TOKEN_COLORS[token.symbol]} rounded-full flex items-center justify-center text-white text-xs font-bold`}>
                    {token.symbol.charAt(0)}
                  </div>
                  <span className="font-bold">{token.symbol}</span>
                  {token.multiplier > 1.0 && (
                    <span className="px-2 py-0.5 bg-amber-400 text-amber-900 text-xs rounded-full font-bold">
                      +{((token.multiplier - 1) * 100).toFixed(0)}%
                    </span>
                  )}
                </div>
                <div className="text-sm text-white text-opacity-80">{token.name}</div>
                <div className="text-xs text-white text-opacity-70 mt-1">
                  {token.minStake}-{token.maxStake} {token.symbol}
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-white text-opacity-75 mt-3 flex items-start gap-1">
            <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>Higher multipliers mean more weight in consensus decisions and increased reputation gains</span>
          </p>
        </div>
      </div>
    </div>

    {/* Wallet Connection */}
    {!isConnected && (
      <div className="card bg-amber-50 dark:bg-amber-900 dark:bg-opacity-20 border border-amber-200 dark:border-amber-800">
        <div className="flex items-center gap-3 mb-3">
          <WalletIcon className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          <div>
            <h3 className="font-bold text-amber-900 dark:text-amber-200">Connect Wallet</h3>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Connect your wallet to view your staking stats and participate in consensus
            </p>
          </div>
        </div>
        <button
          onClick={connect}
          className="btn-primary w-full"
        >
          <WalletIcon className="w-4 h-4 inline mr-2" />
          Connect Wallet
        </button>
      </div>
    )}

    {/* Stats */}
    <div className="grid md:grid-cols-3 gap-4">
      <StatCard
        icon={Coins}
        label="Total Staked"
        value={`${stats.totalStaked.toFixed(1)} TRAC`}
      />
      <StatCard
        icon={TrendingUp}
        label="Active Stakes"
        value={stats.activeStakes.toString()}
      />
      <StatCard
        icon={Target}
        label="Win Rate"
        value={`${stats.winRate.toFixed(1)}%`}
      />
    </div>

    {/* How Staking Works */}
    <div className="card">
      <h2 className="text-2xl font-display font-bold mb-4">How Staking Works</h2>
      <div className="space-y-4">
        <InfoCard
          icon={Coins}
          title="Stake on Verifications"
          description="Stake 10-500 TRAC on fact-checks you believe are accurate. Your reputation affects stake weight."
        />
        <InfoCard
          icon={CheckCircle}
          title="Earn Rewards"
          description="If consensus aligns with your stake, earn +15% rewards. Higher reputation = higher weight."
        />
        <InfoCard
          icon={AlertCircle}
          title="Risk of Slashing"
          description="If consensus contradicts your stake, lose -10%. Incentivizes honest verification."
        />
        <InfoCard
          icon={TrendingUp}
          title="Build Reputation"
          description="Accurate stakes increase your reputation score, giving you more influence in future consensus."
        />
      </div>
    </div>

    {/* Consensus Formula */}
    <div className="card bg-surface dark:bg-gray-800">
      <h2 className="text-2xl font-display font-bold mb-4">Consensus Formula</h2>
      <div className="bg-white dark:bg-gray-700 p-4 rounded-lg font-mono text-sm overflow-x-auto">
        <div className="mb-3">
          <div className="text-gray-600 dark:text-gray-400">Effective Stake:</div>
          <code>stake × sqrt(reputationScore)</code>
        </div>
        <div>
          <div className="text-gray-600 dark:text-gray-400">Confidence Score:</div>
          <code>
            0.40 × weightedStakeAgreement<br/>
            + 0.30 × guardianReputationAvg<br/>
            + 0.20 × modelConfidenceAvg<br/>
            + 0.10 × verificationCountWeight
          </code>
        </div>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
        Consensus is reached when agreement rate exceeds 70% (configurable).
      </p>
    </div>
  </div>
);

const MyStakesTab = ({ stakes, loading, isConnected }) => (
  <div className="space-y-6">
    <div className="card">
      <h2 className="text-2xl font-display font-bold mb-4">Your Stakes</h2>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-4">Loading stakes...</p>
        </div>
      ) : !isConnected ? (
        <div className="text-center py-12">
          <WalletIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Connect your wallet to view your stakes
          </p>
        </div>
      ) : stakes.length === 0 ? (
        <div className="text-center py-12">
          <Coins className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            No stakes yet
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Stake on fact-checks to participate in consensus validation
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {stakes.map((stake) => (
            <StakeCard
              key={stake.id}
              mediaHash={stake.factCheck.media.sha256Hash}
              amount={stake.amount}
              status={stake.locked ? 'active' : stake.rewardAmount > 0 ? 'rewarded' : 'slashed'}
              verdict={stake.factCheck.consensus?.majorityVerdict || 'pending'}
              reward={stake.rewardAmount}
              slash={stake.slashAmount}
              createdAt={new Date(stake.createdAt).toLocaleDateString()}
            />
          ))}
        </div>
      )}
    </div>
  </div>
);

const ConsensusTab = ({ consensusResults }) => (
  <div className="space-y-6">
    <div className="card">
      <h2 className="text-2xl font-display font-bold mb-4">Recent Consensus Results</h2>

      {consensusResults.length === 0 ? (
        <div className="text-center py-12">
          <Target className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            No consensus results yet
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {consensusResults.map((result) => (
            <ConsensusCard
              key={result.id}
              mediaHash={result.mediaHash}
              totalStake={result.totalStake}
              participants={result.participantCount}
              agreementRate={result.agreementRate}
              verdict={result.verdict}
              confidence={result.confidenceScore}
            />
          ))}
        </div>
      )}
    </div>
  </div>
);

const StatCard = ({ icon: Icon, label, value }) => (
  <div className="card">
    <div className="flex items-center gap-3 mb-2">
      <div className="p-2 bg-primary bg-opacity-10 rounded-lg">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
    </div>
    <p className="text-2xl font-display font-bold">{value}</p>
  </div>
);

const InfoCard = ({ icon: Icon, title, description }) => (
  <div className="flex gap-4 p-4 bg-surface dark:bg-gray-700 rounded-lg">
    <div className="flex-shrink-0">
      <div className="p-2 bg-primary bg-opacity-10 rounded-lg">
        <Icon className="w-5 h-5 text-primary" />
      </div>
    </div>
    <div>
      <h3 className="font-bold mb-1">{title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  </div>
);

const StakeCard = ({ mediaHash, amount, status, verdict, reward, slash, createdAt }) => (
  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
    <div className="flex items-start justify-between mb-3">
      <div>
        <div className="font-mono text-xs text-gray-500 mb-1">{mediaHash}</div>
        <div className="font-bold">{amount} TRAC</div>
      </div>
      {status === 'active' && (
        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
          Active
        </span>
      )}
      {status === 'rewarded' && (
        <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded-full">
          +{reward} TRAC
        </span>
      )}
      {status === 'slashed' && (
        <span className="px-3 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-xs rounded-full">
          -{slash} TRAC
        </span>
      )}
    </div>
    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
      <span>Verdict: <span className="capitalize">{verdict}</span></span>
      <span>{createdAt}</span>
    </div>
  </div>
);

const ConsensusCard = ({ mediaHash, totalStake, participants, agreementRate, verdict, confidence }) => (
  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
    <div className="flex items-start justify-between mb-4">
      <div className="font-mono text-xs text-gray-500">{mediaHash}</div>
      <span className={`px-3 py-1 text-xs rounded-full ${
        verdict === 'deepfake'
          ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
          : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
      }`}>
        {verdict === 'deepfake' ? 'Deepfake' : 'Authentic'}
      </span>
    </div>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
      <div>
        <div className="text-gray-600 dark:text-gray-400">Total Stake</div>
        <div className="font-bold">{totalStake} TRAC</div>
      </div>
      <div>
        <div className="text-gray-600 dark:text-gray-400">Participants</div>
        <div className="font-bold">{participants}</div>
      </div>
      <div>
        <div className="text-gray-600 dark:text-gray-400">Agreement</div>
        <div className="font-bold">{(agreementRate * 100).toFixed(0)}%</div>
      </div>
      <div>
        <div className="text-gray-600 dark:text-gray-400">Confidence</div>
        <div className="font-bold">{(confidence * 100).toFixed(0)}%</div>
      </div>
    </div>
  </div>
);

export default Staking;
