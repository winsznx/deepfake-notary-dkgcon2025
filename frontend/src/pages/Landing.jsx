/**
 * Landing Page
 */
import { Link } from 'react-router-dom';
import { Upload, Shield, Network, Coins } from 'lucide-react';

const Landing = () => {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-12">
        <h1 className="text-5xl font-display font-bold text-gray-900 dark:text-white mb-4">
          Verifiable Deepfake Notary
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
          Decentralized community notes for multimedia truth verification powered by AI,
          blockchain, and guardian consensus.
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/upload" className="btn-primary text-lg">
            Upload Media
          </Link>
          <Link to="/dashboard" className="btn-secondary text-lg">
            View Dashboard
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <FeatureCard
          icon={Shield}
          title="AI Detection"
          description="Advanced deepfake detection using XceptionNet model"
        />
        <FeatureCard
          icon={Network}
          title="DKG Integration"
          description="Knowledge assets published to OriginTrail DKG"
        />
        <FeatureCard
          icon={Coins}
          title="Token Staking"
          description="Stake tokens on fact-checks with rewards and slashing"
        />
        <FeatureCard
          icon={Shield}
          title="Guardian Consensus"
          description="Reputation-weighted consensus from verified guardians"
        />
      </section>

      {/* How It Works */}
      <section className="card">
        <h2 className="text-3xl font-display font-bold mb-6">How It Works</h2>
        <div className="space-y-4">
          <Step number="1" title="Upload Media" description="Submit suspicious video or image content" />
          <Step number="2" title="AI Analysis" description="Deepfake detection agent analyzes the media" />
          <Step number="3" title="Stake & Verify" description="Guardians stake tokens on their verification" />
          <Step number="4" title="Consensus" description="System calculates consensus from weighted votes" />
          <Step number="5" title="DKG Publication" description="Fact-check published as Knowledge Asset" />
          <Step number="6" title="Monetization" description="Access high-confidence notes via x402 micropayments" />
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ icon: Icon, title, description }) => (
  <div className="card text-center">
    <Icon className="w-12 h-12 mx-auto mb-4 text-primary" />
    <h3 className="text-lg font-display font-bold mb-2">{title}</h3>
    <p className="text-gray-600 dark:text-gray-400 text-sm">{description}</p>
  </div>
);

const Step = ({ number, title, description }) => (
  <div className="flex gap-4 items-start">
    <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">
      {number}
    </div>
    <div>
      <h4 className="font-display font-bold text-lg">{title}</h4>
      <p className="text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  </div>
);

export default Landing;
