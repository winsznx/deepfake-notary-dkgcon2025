/**
 * Standalone Landing Page (Marketing)
 * Full-width landing page before entering the app
 */
import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import {
  Shield, Network, Coins, Users, CheckCircle,
  ArrowRight, Github, ExternalLink, Upload,
  Zap, Lock, TrendingUp, Award, Target, Trophy,
  Moon, Sun, X
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { usePolkadotWallet } from '../contexts/PolkadotWalletContext';
import TargetCursor from '../components/TargetCursor';

const LandingStandalone = () => {
  const { theme, toggleTheme } = useTheme();
  const { isConnected, connect } = usePolkadotWallet();
  const navigate = useNavigate();

  // Auto-navigate to dashboard if wallet is already connected
  useEffect(() => {
    if (isConnected) {
      navigate('/dashboard');
    }
  }, [isConnected, navigate]);

  const handleLaunchApp = async (e) => {
    e.preventDefault();
    if (!isConnected) {
      // Open wallet connection modal
      await connect();
      // Navigation will happen automatically via useEffect when wallet connects
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <>
      <TargetCursor hideDefaultCursor={false} />
      <div className="min-h-screen bg-gradient-to-b from-background to-white dark:from-gray-900 dark:to-gray-800">
        {/* Header */}
        <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Deepfake Notary" className="w-8 h-8 object-contain" />
            <span className="text-2xl font-display font-bold text-gray-900 dark:text-white">
              Verifiable Deepfake Notary
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/docs"
              className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-brand dark:hover:text-brand transition-colors font-medium"
            >
              Documentation
              <ExternalLink className="w-4 h-4" />
            </Link>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
            <button onClick={handleLaunchApp} className="btn-primary">
              {isConnected ? 'Launch App' : 'Connect & Launch'}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary bg-opacity-10 rounded-full text-primary font-medium mb-6">
          <Trophy className="w-5 h-5" />
          <span>DKGcon 2025 Hackathon Project</span>
        </div>
        <h1 className="text-6xl font-display font-bold text-gray-900 dark:text-white mb-6">
          Combat Deepfakes with
          <br />
          <span className="text-accent">Decentralized Truth</span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-3xl mx-auto leading-relaxed">
          A complete Agent → Knowledge → Trust pipeline for multimedia verification.
          Powered by AI detection, blockchain immutability, and guardian consensus.
        </p>
        <div className="flex gap-4 justify-center">
          <button onClick={handleLaunchApp} className="btn-primary text-lg px-8 py-4 flex items-center gap-2">
            {isConnected ? 'Get Started' : 'Connect Wallet to Start'}
            <ArrowRight className="w-5 h-5" />
          </button>
          <a
            href="https://github.com/yourusername/deepfake-notary"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary text-lg px-8 py-4 flex items-center gap-2"
          >
            <Github className="w-5 h-5" />
            View Source
          </a>
        </div>

        {/* Hero Visual */}
        <div className="mt-16 relative">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <StatCard
                icon={Shield}
                value="95%"
                label="Detection Accuracy"
                color="text-green-500"
              />
              <StatCard
                icon={Users}
                value="500+"
                label="Active Guardians"
                color="text-primary"
              />
              <StatCard
                icon={CheckCircle}
                value="12K+"
                label="Verified Media"
                color="text-accent"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="bg-white dark:bg-gray-900 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold text-gray-900 dark:text-white mb-4">
              The Deepfake Crisis
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Synthetic media is eroding trust in digital content. We need decentralized,
              verifiable solutions to combat misinformation at scale.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <ProblemCard
              title="Centralized Fact-Checking"
              description="Current platforms rely on single authorities, creating bottlenecks and bias."
              impact="Slow, opaque, unscalable"
            />
            <ProblemCard
              title="No Provenance Trail"
              description="Verified content lacks immutable proof of verification history."
              impact="No accountability"
            />
            <ProblemCard
              title="Zero Incentives"
              description="Verifiers have no economic stake in accuracy."
              impact="Low quality control"
            />
          </div>
        </div>
      </section>

      {/* Solution: Agent → Knowledge → Trust */}
      <section className="py-20 bg-gradient-to-br from-primary to-accent text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold mb-4">
              Our Solution: A → K → T Pipeline
            </h2>
            <p className="text-xl opacity-90 max-w-3xl mx-auto">
              Three integrated layers working together to create verifiable, incentivized truth.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <LayerCard
              icon={Zap}
              title="Agent Layer"
              subtitle="AI-Powered Analysis"
              features={[
                'Deepfake Detection Agent (XceptionNet)',
                'Consensus Validation Agent',
                'Monetization Agent (x402)'
              ]}
            />
            <LayerCard
              icon={Network}
              title="Knowledge Layer"
              subtitle="Blockchain Immutability"
              features={[
                'Publish to OriginTrail DKG',
                'JSON-LD Knowledge Assets',
                'Permanent provenance trail'
              ]}
            />
            <LayerCard
              icon={Shield}
              title="Trust Layer"
              subtitle="Guardian Consensus"
              features={[
                'Token staking (10-500 TRAC)',
                'Reputation-weighted voting',
                'Rewards & slashing mechanism'
              ]}
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold text-gray-900 dark:text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              From upload to verified consensus in 6 steps
            </p>
          </div>

          <div className="space-y-8">
            <WorkflowStep
              number="1"
              title="Upload Media"
              description="User submits suspicious video/image content with Guardian identifier"
              icon={Upload}
            />
            <WorkflowStep
              number="2"
              title="AI Analysis"
              description="Deepfake Detection Agent runs XceptionNet model, generates score & confidence"
              icon={Zap}
            />
            <WorkflowStep
              number="3"
              title="DKG Publication"
              description="Fact-check published as JSON-LD Knowledge Asset to OriginTrail DKG"
              icon={Network}
            />
            <WorkflowStep
              number="4"
              title="Guardian Staking"
              description="Guardians stake 10-500 TRAC on verifications they believe are accurate"
              icon={Coins}
            />
            <WorkflowStep
              number="5"
              title="Consensus Calculation"
              description="System aggregates reputation-weighted votes to determine majority verdict"
              icon={Users}
            />
            <WorkflowStep
              number="6"
              title="Rewards & Access"
              description="Accurate stakes earn +15%, incorrect stakes lose -10%. High-confidence notes gated via x402"
              icon={Award}
            />
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-20 bg-background dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold text-gray-900 dark:text-white mb-4">
              Key Features
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={Target}
              title="Deepfake Detection"
              description="XceptionNet-v2.1 model analyzes facial artifacts, temporal inconsistencies, and compression patterns"
            />
            <FeatureCard
              icon={Lock}
              title="Immutable Provenance"
              description="Every fact-check published to OriginTrail DKG with complete verification history"
            />
            <FeatureCard
              icon={Coins}
              title="Token Economics"
              description="Stake 10-500 TRAC. Win = +15% reward. Lose = -10% slash. Incentivizes accuracy."
            />
            <FeatureCard
              icon={TrendingUp}
              title="Reputation System"
              description="Guardian scores weighted by accuracy rate. Higher reputation = more influence."
            />
            <FeatureCard
              icon={Users}
              title="Consensus Formula"
              description="40% stake agreement + 30% reputation + 20% model confidence + 10% verification count"
            />
            <FeatureCard
              icon={ExternalLink}
              title="x402 Micropayments"
              description="Tiered access: Free (<70%), $0.0001 (70-85%), $0.0003 (>85% confidence)"
            />
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold text-gray-900 dark:text-white mb-4">
              Built With
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <TechCard name="React + Vite" category="Frontend" />
            <TechCard name="Express + TypeScript" category="Backend" />
            <TechCard name="OriginTrail DKG" category="Blockchain" />
            <TechCard name="Prisma + SQLite" category="Database" />
            <TechCard name="XceptionNet" category="AI Model" />
            <TechCard name="Guardian API" category="Identity" />
            <TechCard name="x402 Protocol" category="Payments" />
            <TechCard name="Tailwind CSS" category="Styling" />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-accent text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-display font-bold mb-6">
            Ready to Verify Media?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join the decentralized network of truth guardians. Start verifying deepfakes today.
          </p>
          <div className="flex gap-4 justify-center">
            <button onClick={handleLaunchApp} className="inline-flex items-center gap-3 bg-white text-primary px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors">
              {isConnected ? 'Launch Application' : 'Connect Wallet & Launch'}
              <ArrowRight className="w-5 h-5" />
            </button>
            <Link to="/docs" className="inline-flex items-center gap-3 bg-white bg-opacity-20 border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-opacity-30 transition-colors backdrop-blur-sm">
              Read Documentation
              <ExternalLink className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src="/logo.png" alt="Deepfake Notary" className="w-6 h-6 object-contain" />
                <span className="text-white font-display font-bold">Deepfake Notary</span>
              </div>
              <p className="text-sm">
                Decentralized multimedia truth verification for DKGcon 2025.
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/docs" className="hover:text-white">Documentation</Link></li>
                <li><Link to="/docs" className="hover:text-white">API Reference</Link></li>
                <li><a href="https://github.com/yourusername/deepfake-notary" target="_blank" rel="noopener noreferrer" className="hover:text-white">GitHub</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Project</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">DKGcon 2025</a></li>
                <li><a href="#" className="hover:text-white">OriginTrail</a></li>
                <li><a href="#" className="hover:text-white">Guardian</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>DKGcon 2025 Hackathon • Agent → Knowledge → Trust</p>
          </div>
        </div>
      </footer>
    </div>
    </>
  );
};

const StatCard = ({ icon: Icon, value, label, color }) => (
  <div className="flex items-center gap-4">
    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <Icon className={`w-8 h-8 ${color}`} />
    </div>
    <div>
      <div className={`text-3xl font-display font-bold ${color}`}>{value}</div>
      <div className="text-sm text-gray-600 dark:text-gray-400">{label}</div>
    </div>
  </div>
);

const ProblemCard = ({ title, description, impact }) => (
  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
    <h3 className="text-xl font-display font-bold text-gray-900 dark:text-white mb-3">
      {title}
    </h3>
    <p className="text-gray-600 dark:text-gray-400 mb-4">
      {description}
    </p>
    <div className="flex items-center gap-2 text-sm font-medium text-red-600 dark:text-red-400">
      <X className="w-4 h-4" />
      <span>{impact}</span>
    </div>
  </div>
);

const LayerCard = ({ icon: Icon, title, subtitle, features }) => (
  <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-8 border border-white border-opacity-20">
    <Icon className="w-12 h-12 mb-4" />
    <h3 className="text-2xl font-display font-bold mb-2">{title}</h3>
    <p className="text-lg opacity-90 mb-6">{subtitle}</p>
    <ul className="space-y-3">
      {features.map((feature, idx) => (
        <li key={idx} className="flex items-start gap-2">
          <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span className="text-sm">{feature}</span>
        </li>
      ))}
    </ul>
  </div>
);

const WorkflowStep = ({ number, title, description, icon: Icon }) => (
  <div className="flex items-start gap-6 bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
    <div className="flex-shrink-0 w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center text-xl font-bold">
      {number}
    </div>
    <div className="flex-1">
      <div className="flex items-center gap-3 mb-2">
        <Icon className="w-6 h-6 text-primary" />
        <h3 className="text-xl font-display font-bold text-gray-900 dark:text-white">
          {title}
        </h3>
      </div>
      <p className="text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  </div>
);

const FeatureCard = ({ icon: Icon, title, description }) => (
  <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
    <Icon className="w-10 h-10 text-primary mb-4" />
    <h3 className="text-lg font-display font-bold text-gray-900 dark:text-white mb-2">
      {title}
    </h3>
    <p className="text-sm text-gray-600 dark:text-gray-400">
      {description}
    </p>
  </div>
);

const TechCard = ({ name, category }) => (
  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center border border-gray-200 dark:border-gray-700">
    <div className="text-lg font-bold text-gray-900 dark:text-white mb-1">{name}</div>
    <div className="text-sm text-gray-600 dark:text-gray-400">{category}</div>
  </div>
);

export default LandingStandalone;
