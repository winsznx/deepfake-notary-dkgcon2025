/**
 * High-Confidence Note Access Page
 * x402 micropayment-gated premium fact-checks
 */
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Star, Lock, CreditCard, CheckCircle, AlertCircle, ExternalLink, Wallet } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../config/api';
import { useWallet } from '../contexts/WalletContext';

const HighConfidence = () => {
  const { account, isConnected, connect } = useWallet();
  const [searchParams] = useSearchParams();
  const [factCheckId, setFactCheckId] = useState(searchParams.get('id') || '');
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paying, setPaying] = useState(false);
  const [factCheck, setFactCheck] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Auto-populate factCheckId from URL
    const id = searchParams.get('id');
    if (id) {
      setFactCheckId(id);
    }
  }, [searchParams]);

  const handleRequestAccess = async () => {
    if (!factCheckId) {
      setError('Please enter a Fact-Check ID');
      return;
    }

    if (!isConnected) {
      setError('Please connect your wallet first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Step 1: Generate invoice
      console.log('📄 Generating invoice for fact-check:', factCheckId);

      const invoiceResponse = await axios.post(`${API_URL}/api/x402/generate-invoice`, {
        factCheckId
      });

      if (!invoiceResponse.data.success) {
        throw new Error('Failed to generate invoice');
      }

      const invoice = invoiceResponse.data.invoice;
      console.log('✅ Invoice generated:', invoice);

      setPaymentInfo({
        invoiceId: invoice.invoiceId,
        amount: invoice.amount,
        currency: invoice.currency,
        expiresAt: invoice.expiresAt,
        payTo: invoice.payTo,
        network: invoice.network,
        priceTier: invoice.priceTier,
        confidenceScore: invoice.confidenceScore
      });

      setLoading(false);
    } catch (err) {
      console.error('❌ Invoice generation error:', err.response?.data || err);

      // Check if payment not required (low confidence)
      if (err.response?.status === 400 &&
          err.response?.data?.error?.includes('not required')) {
        // Try to access directly (free tier)
        try {
          const response = await axios.get(
            `http://localhost:3001/api/x402/high-confidence/${factCheckId}`
          );

          if (response.data.success) {
            setFactCheck(response.data.factCheck);
            setLoading(false);
            return;
          }
        } catch (accessErr) {
          console.error('❌ Free access error:', accessErr);
        }
      }

      setError(err.response?.data?.error || 'Failed to generate invoice');
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!isConnected) {
      setError('Please connect your wallet first');
      return;
    }

    if (!paymentInfo) {
      setError('No payment information available');
      return;
    }

    setPaying(true);
    setError(null);

    try {
      console.log('💳 Processing payment for invoice:', paymentInfo.invoiceId);

      // Step 2: Pay invoice
      const payResponse = await axios.post(
        `http://localhost:3001/api/x402/pay/${paymentInfo.invoiceId}`,
        {
          payerAddress: account,
          paymentProof: {
            // In production, this would be a real signed transaction
            // For demo/testnet, we simulate the payment
            transactionHash: `0xdemo${Date.now()}`,
            signature: `sig_${account}_${Date.now()}`,
            timestamp: Date.now()
          }
        }
      );

      console.log('✅ Payment response:', payResponse.data);

      if (!payResponse.data.success) {
        throw new Error(payResponse.data.error || 'Payment verification failed');
      }

      // Step 3: Access content with paid invoice
      console.log('🔓 Accessing content with paid invoice...');

      const contentResponse = await axios.get(
        `http://localhost:3001/api/x402/high-confidence/${factCheckId}?invoiceId=${paymentInfo.invoiceId}`
      );

      console.log('✅ Content accessed:', contentResponse.data);

      if (!contentResponse.data.success) {
        throw new Error('Failed to access content');
      }

      setFactCheck(contentResponse.data.factCheck);
      setPaymentInfo(null);
      setPaying(false);
    } catch (err) {
      console.error('❌ Payment error:', err.response?.data || err);
      setError(err.response?.data?.error || err.message || 'Payment failed');
      setPaying(false);
    }
  };

  const handleReset = () => {
    setFactCheckId('');
    setPaymentInfo(null);
    setFactCheck(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Star className="w-8 h-8 text-eggplant" />
          <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white">
            Premium Fact-Checks
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Access high-confidence verifications via x402 micropayments
        </p>
      </div>

      {/* Pricing Info */}
      <div className="grid md:grid-cols-3 gap-4">
        <PricingTier
          title="Low Confidence"
          price="Free"
          range="< 70%"
          features={['Basic detection results', 'Media hash', 'Guardian info']}
        />
        <PricingTier
          title="Medium Confidence"
          price="$0.0001"
          range="70-85%"
          features={['Full analysis', 'Provenance data', 'Consensus results']}
          highlighted
        />
        <PricingTier
          title="High Confidence"
          price="$0.0003"
          range="> 85%"
          features={['Premium verification', 'Complete metadata', 'DKG asset access']}
        />
      </div>

      {!factCheck ? (
        <div className="space-y-6">
          {/* Wallet Connection Prompt */}
          {!isConnected && (
            <div className="card bg-amber-50 dark:bg-amber-900 dark:bg-opacity-20 border border-amber-200 dark:border-amber-800">
              <div className="flex items-center gap-3">
                <Wallet className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                <div>
                  <h3 className="font-bold text-amber-900 dark:text-amber-200">Wallet Required</h3>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    Connect your wallet to access premium fact-checks
                  </p>
                </div>
              </div>
              <button
                onClick={connect}
                className="mt-3 btn-primary w-full"
              >
                <Wallet className="w-4 h-4 inline mr-2" />
                Connect Wallet
              </button>
            </div>
          )}

          {/* Request Form */}
          <div className="card">
            <h2 className="text-2xl font-display font-bold mb-4">Request Access</h2>

            <div className="space-y-4">
              {isConnected && (
                <div className="p-3 bg-green-50 dark:bg-green-900 dark:bg-opacity-20 rounded-lg">
                  <div className="flex items-center gap-2 text-green-700 dark:text-green-300 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    <span>Connected: {account.slice(0, 6)}...{account.slice(-4)}</span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">
                  Fact-Check ID
                </label>
                <input
                  type="text"
                  value={factCheckId}
                  onChange={(e) => setFactCheckId(e.target.value)}
                  placeholder="Enter fact-check UUID"
                  className="input-field"
                  disabled={loading || !isConnected}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Get this from the Dashboard or fact-check detail page
                </p>
              </div>

              {!paymentInfo ? (
                <button
                  onClick={handleRequestAccess}
                  disabled={loading || !factCheckId || !isConnected}
                  className="btn-primary w-full disabled:opacity-50"
                >
                  {loading ? 'Checking Access...' : 'Request Access'}
                </button>
              ) : (
                <div className="p-4 bg-surface dark:bg-gray-700 rounded-lg space-y-3">
                  <div className="flex items-center gap-2 text-primary dark:text-blue-400">
                    <Lock className="w-5 h-5" />
                    <span className="font-bold">Payment Required</span>
                  </div>

                  <div className="p-3 bg-white dark:bg-gray-800 rounded-lg space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Confidence Score:</span>
                      <span className="font-bold">
                        {(paymentInfo.confidenceScore * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Price Tier:</span>
                      <span className="font-bold capitalize">{paymentInfo.priceTier}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-gray-600 dark:text-gray-400">Amount</div>
                      <div className="font-bold">${paymentInfo.amount} {paymentInfo.currency}</div>
                    </div>
                    <div>
                      <div className="text-gray-600 dark:text-gray-400">Network</div>
                      <div className="font-bold">{paymentInfo.network}</div>
                    </div>
                  </div>

                  <div className="p-3 bg-white dark:bg-gray-800 rounded text-xs">
                    <div className="text-gray-600 dark:text-gray-400 mb-1">Invoice ID</div>
                    <div className="font-mono break-all">{paymentInfo.invoiceId}</div>
                  </div>

                  <div className="p-3 bg-white dark:bg-gray-800 rounded text-xs">
                    <div className="text-gray-600 dark:text-gray-400 mb-1">Pay To</div>
                    <div className="font-mono break-all">{paymentInfo.payTo}</div>
                  </div>

                  <div className="p-3 bg-white dark:bg-gray-800 rounded text-xs">
                    <div className="text-gray-600 dark:text-gray-400 mb-1">Your Wallet</div>
                    <div className="font-mono break-all">{account}</div>
                  </div>

                  <button
                    onClick={handlePayment}
                    disabled={paying}
                    className="btn-primary w-full disabled:opacity-50"
                  >
                    <CreditCard className="w-4 h-4 inline mr-2" />
                    {paying ? 'Processing Payment...' : `Pay $${paymentInfo.amount} & Access`}
                  </button>

                  <p className="text-xs text-gray-500 text-center">
                    x402 micropayment via {paymentInfo.network}
                  </p>

                  <p className="text-xs text-amber-600 dark:text-amber-400 text-center">
                    Invoice expires in 15 minutes
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* How It Works */}
          <div className="card bg-surface dark:bg-gray-800">
            <h2 className="text-2xl font-display font-bold mb-4">How x402 Works</h2>
            <div className="space-y-3 text-sm">
              <Step
                number="1"
                title="Connect Wallet"
                description="Connect your Web3 wallet (MetaMask, etc.)"
              />
              <Step
                number="2"
                title="Request Access"
                description="Enter the fact-check ID you want to access"
              />
              <Step
                number="3"
                title="Review & Pay"
                description="Price based on confidence tier, pay with USDC on Base Sepolia"
              />
              <Step
                number="4"
                title="Access Granted"
                description="Receive full fact-check data including DKG provenance"
              />
            </div>

            <div className="mt-4 p-3 bg-white dark:bg-gray-700 rounded-lg">
              <h3 className="font-bold text-sm mb-2">Revenue Distribution</h3>
              <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                <div className="flex justify-between">
                  <span>Verifiers (weighted by stake):</span>
                  <span className="font-bold">60%</span>
                </div>
                <div className="flex justify-between">
                  <span>Platform maintenance:</span>
                  <span className="font-bold">25%</span>
                </div>
                <div className="flex justify-between">
                  <span>Guardian reputation rewards:</span>
                  <span className="font-bold">15%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Success View
        <div className="space-y-6">
          <div className="card bg-green-50 dark:bg-green-900 dark:bg-opacity-20 border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              <div>
                <h2 className="text-2xl font-display font-bold text-green-800 dark:text-green-200">
                  Access Granted
                </h2>
                <p className="text-green-700 dark:text-green-300">
                  Payment verified. Full fact-check data unlocked.
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-2xl font-display font-bold mb-4">Fact-Check Data</h2>

            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <InfoRow label="Fact-Check ID" value={factCheck.id} />
                <InfoRow
                  label="Deepfake Score"
                  value={`${(factCheck.deepfakeScore * 100).toFixed(1)}%`}
                />
                <InfoRow
                  label="Confidence"
                  value={`${(factCheck.confidenceScore * 100).toFixed(1)}%`}
                />
                <InfoRow label="Model" value={factCheck.modelUsed} />
                {factCheck.processingTime && (
                  <InfoRow
                    label="Processing Time"
                    value={`${factCheck.processingTime.toFixed(2)}s`}
                  />
                )}
                <InfoRow
                  label="Claim Reviewed"
                  value={factCheck.claimReviewed}
                />
              </div>

              {factCheck.artifactsDetected && (
                <div className="p-4 bg-amber-50 dark:bg-amber-900 dark:bg-opacity-20 rounded-lg">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Artifacts Detected:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {JSON.parse(factCheck.artifactsDetected).map((artifact, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-white dark:bg-gray-800 rounded text-xs font-mono"
                      >
                        {artifact}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {factCheck.dkgAssetId && (
                <div className="p-4 bg-primary bg-opacity-10 rounded-lg">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    DKG Knowledge Asset:
                  </div>
                  <code className="text-xs block break-all bg-white dark:bg-gray-800 p-2 rounded">
                    {factCheck.dkgAssetId}
                  </code>
                  <a
                    href={`https://dkg.origintrail.io/explore?ual=${factCheck.dkgAssetId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    View on DKG Explorer
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              {factCheck.guardian && (
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Verified By:
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Guardian:</span>
                      <span className="font-mono">{factCheck.guardian.guardianId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Reputation:</span>
                      <span className="font-bold">
                        {(factCheck.guardian.reputationScore * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Verifications:</span>
                      <span>{factCheck.guardian.verificationCount}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <button onClick={handleReset} className="btn-secondary w-full">
            Request Another
          </button>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="card bg-red-50 dark:bg-red-900 dark:bg-opacity-20 border border-red-200 dark:border-red-800">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
};

const PricingTier = ({ title, price, range, features, highlighted }) => (
  <div className={`card ${highlighted ? 'border-2 border-primary' : ''}`}>
    {highlighted && (
      <div className="text-xs font-bold text-primary mb-2">MOST POPULAR</div>
    )}
    <h3 className="font-display font-bold text-lg mb-1">{title}</h3>
    <div className="text-2xl font-display font-bold mb-1">{price}</div>
    <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
      Confidence {range}
    </div>
    <ul className="space-y-2">
      {features.map((feature, idx) => (
        <li key={idx} className="flex items-start gap-2 text-sm">
          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
          <span>{feature}</span>
        </li>
      ))}
    </ul>
  </div>
);

const Step = ({ number, title, description }) => (
  <div className="flex gap-3">
    <div className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
      {number}
    </div>
    <div>
      <div className="font-bold">{title}</div>
      <div className="text-gray-600 dark:text-gray-400">{description}</div>
    </div>
  </div>
);

const InfoRow = ({ label, value }) => (
  <div>
    <div className="text-sm text-gray-600 dark:text-gray-400">{label}</div>
    <div className="font-bold break-all">{value}</div>
  </div>
);

export default HighConfidence;
