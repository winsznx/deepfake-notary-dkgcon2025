/**
 * Comprehensive Documentation Page
 * Complete guide to understanding and testing the Deepfake Notary
 */
import { useState } from 'react';
import {
  Book,
  Rocket,
  Code,
  GitBranch,
  Zap,
  Shield,
  Coins,
  TrendingUp,
  Lock,
  CheckCircle,
  ChevronRight,
  ExternalLink,
  Terminal,
  FileCode,
  Play
} from 'lucide-react';

const Documentation = () => {
  const [activeSection, setActiveSection] = useState('overview');

  const sections = [
    { id: 'overview', title: 'Overview', icon: Book },
    { id: 'quick-start', title: 'Quick Start', icon: Rocket },
    { id: 'architecture', title: 'Architecture', icon: Code },
    { id: 'features', title: 'Features', icon: Zap },
    { id: 'testing', title: 'Testing', icon: Terminal },
    { id: 'api', title: 'API Reference', icon: FileCode },
    { id: 'deployment', title: 'Deployment', icon: GitBranch }
  ];

  return (
    <div className="min-h-screen bg-background dark:bg-background-dark">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 dark:text-white mb-4">
            Documentation
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Complete guide to the Deepfake Notary platform - from setup to advanced usage
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="card sticky top-4">
              <h3 className="font-bold text-lg mb-4">Contents</h3>
              <nav className="space-y-2">
                {sections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${
                        activeSection === section.id
                          ? 'bg-brand text-white'
                          : 'hover:bg-surface dark:hover:bg-surface-dark text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm">{section.title}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {activeSection === 'overview' && <OverviewSection />}
            {activeSection === 'quick-start' && <QuickStartSection />}
            {activeSection === 'architecture' && <ArchitectureSection />}
            {activeSection === 'features' && <FeaturesSection />}
            {activeSection === 'testing' && <TestingSection />}
            {activeSection === 'api' && <APISection />}
            {activeSection === 'deployment' && <DeploymentSection />}
          </div>
        </div>
      </div>
    </div>
  );
};

// Section Components
const OverviewSection = () => (
  <div className="space-y-6">
    <div className="card">
      <h2 className="text-3xl font-display font-bold mb-4">Project Overview</h2>

      <div className="prose prose-lg max-w-none dark:prose-invert">
        <p className="text-lg">
          <strong>Deepfake Notary</strong> is a production-grade multi-agent DKG application that combines
          AI-powered media verification, decentralized consensus validation, and a sustainable micropayment economy.
        </p>

        <h3 className="text-xl font-bold mt-6 mb-3">What Makes This Unique?</h3>
        <ul className="space-y-2">
          <li className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
            <span><strong>Multi-Token Staking:</strong> First DKG app with Polkadot ecosystem bonuses (NEURO +15%, DOT +10%)</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
            <span><strong>Real DKG Integration:</strong> Actual NeuroWeb Testnet transactions, not mocked</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
            <span><strong>x402 Micropayments:</strong> Dynamic pricing based on AI confidence scores</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
            <span><strong>Token-Weighted Consensus:</strong> Advanced reputation and stake-based validation</span>
          </li>
        </ul>

        <h3 className="text-xl font-bold mt-6 mb-3">Use Case</h3>
        <p>
          Combat the deepfake crisis by providing verifiable, on-chain provenance for media authenticity.
          Users upload images/videos, receive AI-powered detection results, and get immutable verification
          records stored on the Decentralized Knowledge Graph.
        </p>
      </div>
    </div>

    <div className="grid md:grid-cols-3 gap-4">
      <div className="card bg-gradient-to-br from-brand/10 to-brand/5">
        <Shield className="w-8 h-8 text-brand mb-3" />
        <h3 className="font-bold mb-2">Trust Layer</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Multi-token staking with reputation-weighted consensus
        </p>
      </div>
      <div className="card bg-gradient-to-br from-green-500/10 to-green-500/5">
        <Zap className="w-8 h-8 text-green-500 mb-3" />
        <h3 className="font-bold mb-2">Knowledge Layer</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          OriginTrail DKG with Schema.org JSON-LD
        </p>
      </div>
      <div className="card bg-gradient-to-br from-blue-500/10 to-blue-500/5">
        <Coins className="w-8 h-8 text-blue-500 mb-3" />
        <h3 className="font-bold mb-2">Agent Layer</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          AI detection, consensus validation, monetization
        </p>
      </div>
    </div>
  </div>
);

const QuickStartSection = () => (
  <div className="space-y-6">
    <div className="card">
      <h2 className="text-3xl font-display font-bold mb-6">Quick Start Guide</h2>

      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 bg-brand text-white rounded-full text-sm">1</span>
            Prerequisites
          </h3>
          <CodeBlock>
{`# Required tools
- Node.js 18+
- pnpm
- Foundry (cast): https://getfoundry.sh
- jq: brew install jq (macOS)`}
          </CodeBlock>
        </div>

        <div>
          <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 bg-brand text-white rounded-full text-sm">2</span>
            One-Command Setup
          </h3>
          <CodeBlock>
{`# Complete automated setup
./setup-all.sh

# This script will:
# ✓ Install all dependencies
# ✓ Setup database
# ✓ Check DKG wallet balances
# ✓ Run health checks`}
          </CodeBlock>
        </div>

        <div>
          <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 bg-brand text-white rounded-full text-sm">3</span>
            Fund Your Wallet
          </h3>
          <CodeBlock>
{`# Automated wallet setup
./setup-dkg-wallet.sh

# Or request manually from Discord:
# Join: https://discord.gg/origintrail
# Command: !fundme_neuroweb YOUR_ADDRESS`}
          </CodeBlock>
        </div>

        <div>
          <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 bg-brand text-white rounded-full text-sm">4</span>
            Start Services
          </h3>
          <CodeBlock>
{`# Terminal 1: Backend (with health checks)
cd backend && pnpm dev:safe

# Terminal 2: Frontend
cd frontend && pnpm dev

# Open: http://localhost:5173`}
          </CodeBlock>
        </div>

        <div>
          <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 bg-brand text-white rounded-full text-sm">5</span>
            Run Tests
          </h3>
          <CodeBlock>
{`# End-to-end integration tests
./test-e2e-flow.sh

# Tests complete flow:
# Upload → Analysis → DKG → Payment → Staking`}
          </CodeBlock>
        </div>
      </div>
    </div>

    <div className="card bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800">
      <div className="flex items-start gap-3">
        <Play className="w-6 h-6 text-amber-600 dark:text-amber-400 mt-1 flex-shrink-0" />
        <div>
          <h3 className="font-bold text-amber-900 dark:text-amber-200 mb-2">
            Total Setup Time: ~5 minutes
          </h3>
          <p className="text-sm text-amber-800 dark:text-amber-300">
            The automated scripts handle everything - from dependency installation to wallet funding checks.
          </p>
        </div>
      </div>
    </div>
  </div>
);

const ArchitectureSection = () => (
  <div className="space-y-6">
    <div className="card">
      <h2 className="text-3xl font-display font-bold mb-6">System Architecture</h2>

      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-bold mb-4">Three-Layer Architecture</h3>
          <div className="bg-surface dark:bg-surface-dark rounded-lg p-6 font-mono text-sm overflow-x-auto">
            <pre className="whitespace-pre">
{`┌─────────────────────────────────────────────────────────┐
│                      USER LAYER                         │
│              (Web3 Wallet Connection)                   │
└────────────────────┬────────────────────────────────────┘
                     │
         ┌───────────▼──────────┐
         │   FRONTEND (React)   │
         │  • Reown AppKit      │
         │  • Multi-wallet      │
         │  • Payment UI        │
         └───────────┬──────────┘
                     │
         ┌───────────▼──────────┐
         │   BACKEND (Express)  │
         │  ┌─────────────────┐ │
         │  │  AGENT LAYER    │ │
         │  │ • Deepfake AI   │ │
         │  │ • Consensus     │ │
         │  │ • Monetization  │ │
         │  └─────────────────┘ │
         └─────┬──────────┬─────┘
               │          │
    ┌──────────▼─┐   ┌───▼──────────┐
    │ DKG (v8.2) │   │  Blockchain  │
    │  NeuroWeb  │   │ Base Sepolia │
    │  Testnet   │   │   (x402)     │
    └────────────┘   └──────────────┘`}
            </pre>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold mb-4">Technology Stack</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-bold text-brand">Frontend</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-brand" />
                  React 18.2 + Vite
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-brand" />
                  TailwindCSS 3.3
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-brand" />
                  Reown AppKit v1.8.14
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-brand" />
                  Wagmi v2 + Viem
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-bold text-brand">Backend</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-brand" />
                  Node.js + Express
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-brand" />
                  TypeScript 5.3
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-brand" />
                  Prisma ORM + SQLite
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-brand" />
                  dkg.js v8.2.0
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const FeaturesSection = () => (
  <div className="space-y-6">
    <div className="card">
      <h2 className="text-3xl font-display font-bold mb-6">Core Features</h2>

      <div className="space-y-6">
        {/* Multi-Token Staking */}
        <FeatureCard
          icon={Coins}
          title="Multi-Token Staking with Polkadot Bonuses"
          color="text-purple-500"
          badge="COMPETITIVE EDGE"
        >
          <p className="mb-3">
            Stake with Polkadot ecosystem tokens to earn reputation multiplier bonuses:
          </p>
          <div className="grid md:grid-cols-3 gap-3 mb-3">
            <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg">
              <div className="font-bold text-purple-900 dark:text-purple-200">NEURO</div>
              <div className="text-2xl font-bold text-purple-600">+15%</div>
              <div className="text-xs text-purple-700 dark:text-purple-300">NeuroWeb Parachain</div>
            </div>
            <div className="bg-pink-100 dark:bg-pink-900/30 p-3 rounded-lg">
              <div className="font-bold text-pink-900 dark:text-pink-200">DOT</div>
              <div className="text-2xl font-bold text-pink-600">+10%</div>
              <div className="text-xs text-pink-700 dark:text-pink-300">Polkadot Relay</div>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
              <div className="font-bold text-blue-900 dark:text-blue-200">TRAC</div>
              <div className="text-2xl font-bold text-blue-600">1.0x</div>
              <div className="text-xs text-blue-700 dark:text-blue-300">Baseline</div>
            </div>
          </div>
          <CodeBlock>
{`effectiveWeight = amount × tokenMultiplier × √(reputationScore)

Example:
10 NEURO @ 0.85 reputation
= 10 × 1.15 × √0.85
= 10.60 weight (15% more than TRAC!)`}
          </CodeBlock>
        </FeatureCard>

        {/* DKG Integration */}
        <FeatureCard
          icon={GitBranch}
          title="Real DKG Integration"
          color="text-green-500"
        >
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
              <span>OriginTrail SDK v8.2.0 (latest)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
              <span>NeuroWeb Testnet (otp:20430)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
              <span>Schema.org MediaReview JSON-LD</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
              <span>Real UALs: did:dkg:otp:20430/0x.../...</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
              <span>Verifiable on DKG Explorer</span>
            </li>
          </ul>
        </FeatureCard>

        {/* x402 Payments */}
        <FeatureCard
          icon={Lock}
          title="x402 Micropayments"
          color="text-blue-500"
        >
          <p className="mb-3">Dynamic pricing based on AI confidence:</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between p-2 bg-green-100 dark:bg-green-900/30 rounded">
              <span>&lt; 70% confidence</span>
              <span className="font-bold text-green-600">FREE</span>
            </div>
            <div className="flex justify-between p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded">
              <span>70-85% confidence</span>
              <span className="font-bold">$0.0001 USDC</span>
            </div>
            <div className="flex justify-between p-2 bg-red-100 dark:bg-red-900/30 rounded">
              <span>&gt; 85% confidence</span>
              <span className="font-bold">$0.0003 USDC</span>
            </div>
          </div>
          <div className="mt-3 p-3 bg-surface dark:bg-surface-dark rounded-lg text-xs">
            <strong>Revenue Distribution:</strong> 60% verifiers / 25% platform / 15% rewards
          </div>
        </FeatureCard>
      </div>
    </div>
  </div>
);

const TestingSection = () => (
  <div className="space-y-6">
    <div className="card">
      <h2 className="text-3xl font-display font-bold mb-6">Testing Guide</h2>

      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-bold mb-3">Automated E2E Tests</h3>
          <CodeBlock>
{`# Run complete test suite
./test-e2e-flow.sh

# Tests include:
✓ Server health checks
✓ Multi-token configuration
✓ Media upload & hashing
✓ AI deepfake detection
✓ DKG publishing
✓ x402 invoice generation
✓ Payment verification
✓ Multi-token staking
✓ Consensus calculation
✓ Data retrieval APIs`}
          </CodeBlock>
        </div>

        <div>
          <h3 className="text-xl font-bold mb-3">Manual Testing Flow</h3>
          <ol className="space-y-4">
            <li className="flex gap-4">
              <span className="flex items-center justify-center w-8 h-8 bg-brand text-white rounded-full flex-shrink-0">1</span>
              <div>
                <strong className="block mb-1">Upload Media</strong>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Navigate to Upload page, drop an image/video, click "Upload & Analyze"
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex items-center justify-center w-8 h-8 bg-brand text-white rounded-full flex-shrink-0">2</span>
              <div>
                <strong className="block mb-1">View Analysis</strong>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  See deepfake score, confidence, and DKG UAL (takes 10-30 seconds)
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex items-center justify-center w-8 h-8 bg-brand text-white rounded-full flex-shrink-0">3</span>
              <div>
                <strong className="block mb-1">Payment Flow (if high confidence)</strong>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Generate invoice → Complete payment (demo mode) → Access full results
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex items-center justify-center w-8 h-8 bg-brand text-white rounded-full flex-shrink-0">4</span>
              <div>
                <strong className="block mb-1">Staking</strong>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  View Polkadot bonus banner, see token multipliers, stake on verifications
                </p>
              </div>
            </li>
          </ol>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h4 className="font-bold text-blue-900 dark:text-blue-200 mb-2">
            Health Checks
          </h4>
          <CodeBlock>
{`# Run anytime to validate configuration
cd backend && pnpm health-check

# Checks:
• Database connectivity
• DKG node connection
• Blockchain RPC
• x402 configuration
• Multi-token setup`}
          </CodeBlock>
        </div>
      </div>
    </div>
  </div>
);

const APISection = () => (
  <div className="space-y-6">
    <div className="card">
      <h2 className="text-3xl font-display font-bold mb-6">API Reference</h2>

      <div className="space-y-6">
        {/* Media API */}
        <div>
          <h3 className="text-xl font-bold mb-3">Media API</h3>
          <div className="space-y-3">
            <APIEndpoint method="POST" path="/api/media/upload">
              Upload media file for analysis
              <CodeBlock>
{`curl -X POST http://localhost:3001/api/media/upload \\
  -F "media=@image.jpg"`}
              </CodeBlock>
            </APIEndpoint>
          </div>
        </div>

        {/* Fact-Check API */}
        <div>
          <h3 className="text-xl font-bold mb-3">Fact-Check API</h3>
          <div className="space-y-3">
            <APIEndpoint method="POST" path="/api/factcheck/create">
              Create fact-check (runs AI + publishes to DKG)
              <CodeBlock>
{`curl -X POST http://localhost:3001/api/factcheck/create \\
  -H "Content-Type: application/json" \\
  -d '{"mediaId": "abc-123"}'`}
              </CodeBlock>
            </APIEndpoint>
            <APIEndpoint method="GET" path="/api/factcheck/all">
              Get all fact-checks
            </APIEndpoint>
            <APIEndpoint method="GET" path="/api/factcheck/:id">
              Get fact-check by ID
            </APIEndpoint>
          </div>
        </div>

        {/* Staking API */}
        <div>
          <h3 className="text-xl font-bold mb-3">Staking API</h3>
          <div className="space-y-3">
            <APIEndpoint method="POST" path="/api/staking/stake">
              Create stake with multi-token support
              <CodeBlock>
{`curl -X POST http://localhost:3001/api/staking/stake \\
  -H "Content-Type: application/json" \\
  -d '{
    "factCheckId": "abc-123",
    "guardianIdentifier": "0x...",
    "amount": 10,
    "tokenType": "NEURO"
  }'`}
              </CodeBlock>
            </APIEndpoint>
            <APIEndpoint method="GET" path="/api/staking/tokens">
              Get supported tokens with multipliers
            </APIEndpoint>
          </div>
        </div>

        {/* x402 API */}
        <div>
          <h3 className="text-xl font-bold mb-3">x402 Payment API</h3>
          <div className="space-y-3">
            <APIEndpoint method="POST" path="/api/x402/generate-invoice">
              Generate payment invoice
            </APIEndpoint>
            <APIEndpoint method="POST" path="/api/x402/pay/:invoiceId">
              Process payment
            </APIEndpoint>
            <APIEndpoint method="GET" path="/api/x402/high-confidence/:factCheckId">
              Access gated content (requires payment)
            </APIEndpoint>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const DeploymentSection = () => (
  <div className="space-y-6">
    <div className="card">
      <h2 className="text-3xl font-display font-bold mb-6">Deployment</h2>

      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-bold mb-4">Environment Variables</h3>
          <CodeBlock>
{`# Backend (.env)
DKG_BLOCKCHAIN=otp:20430
DKG_NODE_ENDPOINT=https://v6-pegasus-node-02.origin-trail.network
DKG_NODE_PORT=8900
DKG_PRIVATE_KEY=0x...
X402_ENABLED=true
X402_WALLET_ADDRESS=0x...
X402_NETWORK=base-sepolia`}
          </CodeBlock>
        </div>

        <div>
          <h3 className="text-xl font-bold mb-4">Production Checklist</h3>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <span>Replace deterministic AI with real ML model</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <span>Enable blockchain payment verification (ethers.js)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <span>Switch to NeuroWeb Mainnet (otp:2043)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <span>Add IPFS for media storage</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <span>Implement rate limiting & DDoS protection</span>
            </li>
          </ul>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-lg p-4">
          <h4 className="font-bold text-green-900 dark:text-green-200 mb-2">
            Quick Deploy
          </h4>
          <CodeBlock>
{`# Build for production
cd backend && pnpm build
cd frontend && pnpm build

# Deploy backend (Docker example)
docker build -t deepfake-notary-backend ./backend
docker run -p 3001:3001 deepfake-notary-backend

# Deploy frontend (Vercel/Netlify)
cd frontend && vercel deploy`}
          </CodeBlock>
        </div>
      </div>
    </div>

    <div className="card bg-brand/5">
      <h3 className="font-bold text-xl mb-4">Additional Resources</h3>
      <div className="grid md:grid-cols-2 gap-4">
        <a
          href="https://docs.origintrail.io"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 p-3 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <ExternalLink className="w-4 h-4 text-brand" />
          <span>OriginTrail Docs</span>
        </a>
        <a
          href="https://discord.gg/origintrail"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 p-3 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <ExternalLink className="w-4 h-4 text-brand" />
          <span>Discord Community</span>
        </a>
        <a
          href="https://neuroweb-testnet.subscan.io"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 p-3 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <ExternalLink className="w-4 h-4 text-brand" />
          <span>NeuroWeb Explorer</span>
        </a>
        <a
          href="https://dkg.origintrail.io"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 p-3 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <ExternalLink className="w-4 h-4 text-brand" />
          <span>DKG Explorer</span>
        </a>
      </div>
    </div>
  </div>
);

// Helper Components
const CodeBlock = ({ children }) => (
  <div className="bg-gray-900 dark:bg-black rounded-lg p-4 overflow-x-auto">
    <pre className="text-xs text-green-400 font-mono">{children}</pre>
  </div>
);

const FeatureCard = ({ icon: Icon, title, color, badge, children }) => (
  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-3">
        <Icon className={`w-6 h-6 ${color}`} />
        <h3 className="text-xl font-bold">{title}</h3>
      </div>
      {badge && (
        <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-bold rounded-full">
          {badge}
        </span>
      )}
    </div>
    <div className="text-gray-700 dark:text-gray-300">
      {children}
    </div>
  </div>
);

const APIEndpoint = ({ method, path, children }) => (
  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
    <div className="flex items-center gap-3 mb-2">
      <span className={`px-2 py-1 text-xs font-bold rounded ${
        method === 'GET' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
        method === 'POST' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
        method === 'PUT' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
      }`}>
        {method}
      </span>
      <code className="text-sm font-mono">{path}</code>
    </div>
    {children && <div className="text-sm text-gray-600 dark:text-gray-400 mt-3">{children}</div>}
  </div>
);

export default Documentation;
