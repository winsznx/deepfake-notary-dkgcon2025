/**
 * Upload Page
 * Allows users to upload media and run deepfake analysis
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload as UploadIcon, FileVideo, Image, AlertCircle, CheckCircle, Loader, Lock, Star } from 'lucide-react';
import axios from 'axios';

const Upload = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [uploadedMedia, setUploadedMedia] = useState(null);
  const [factCheck, setFactCheck] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      setError(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // Step 1: Upload media
      console.log('📤 Uploading media...');
      const formData = new FormData();
      formData.append('media', file);

      const uploadResponse = await axios.post('http://localhost:3001/api/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      console.log('✅ Media uploaded:', uploadResponse.data);
      setUploadedMedia(uploadResponse.data);
      setUploading(false);
      setAnalyzing(true);

      // Step 2: Create fact-check (runs deepfake analysis)
      // Guardian is auto-assigned by backend
      console.log('🔍 Creating fact-check...');
      const factCheckResponse = await axios.post('http://localhost:3001/api/factcheck/create', {
        mediaId: uploadResponse.data.id
        // No guardianIdentifier needed - backend auto-assigns
      });

      console.log('✅ Fact-check created:', factCheckResponse.data);
      setFactCheck(factCheckResponse.data);
      setAnalyzing(false);

    } catch (err) {
      console.error('❌ Upload error:', err.response?.data || err);
      setError(err.response?.data?.error || 'Upload failed');
      setUploading(false);
      setAnalyzing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setUploadedMedia(null);
    setFactCheck(null);
    setError(null);
  };

  const handleViewDetails = () => {
    if (factCheck?.factCheck?.id) {
      navigate(`/factcheck/${factCheck.factCheck.id}`);
    }
  };

  const handleUnlockPremium = () => {
    if (factCheck?.factCheck?.id) {
      navigate(`/high-confidence?id=${factCheck.factCheck.id}`);
    }
  };

  const requiresPayment = factCheck?.factCheck?.confidenceScore >= 0.7;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-2">
          Upload Media
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Submit suspicious media for deepfake analysis and verification
        </p>
      </div>

      {!factCheck ? (
        <div className="space-y-6">
          {/* Upload Section */}
          <div className="card">
            <h2 className="text-xl font-display font-bold mb-4">Select Media</h2>

            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className={`
                border-2 border-dashed rounded-lg p-8 text-center
                transition-colors cursor-pointer
                ${file
                  ? 'border-primary bg-background dark:bg-gray-700'
                  : 'border-gray-300 dark:border-gray-600 hover:border-primary'
                }
              `}
              onClick={() => document.getElementById('file-input').click()}
            >
              {file ? (
                <div className="space-y-3">
                  {file.type.startsWith('video') ? (
                    <FileVideo className="w-16 h-16 mx-auto text-primary" />
                  ) : (
                    <Image className="w-16 h-16 mx-auto text-primary" />
                  )}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{file.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                    }}
                    className="text-sm text-accent hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <UploadIcon className="w-16 h-16 mx-auto text-gray-400" />
                  <div>
                    <p className="text-gray-900 dark:text-white font-medium">
                      Drop file here or click to browse
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Supports MP4, WebM, JPEG, PNG (max 100MB)
                    </p>
                  </div>
                </div>
              )}
            </div>

            <input
              id="file-input"
              type="file"
              accept="video/mp4,video/webm,image/jpeg,image/png"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="mt-6 bg-background dark:bg-gray-700 p-4 rounded-lg">
              <h3 className="font-medium text-sm mb-2">What happens next?</h3>
              <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-decimal list-inside">
                <li>Media will be hashed (SHA-256)</li>
                <li>AI deepfake detection runs automatically</li>
                <li>Fact-check note is generated</li>
                <li>Published to DKG as Knowledge Asset</li>
                <li>Access based on confidence score</li>
              </ol>
            </div>

            <button
              onClick={handleUpload}
              disabled={!file || uploading || analyzing}
              className="btn-primary w-full mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader className="w-4 h-4 animate-spin" />
                  Uploading...
                </span>
              ) : analyzing ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader className="w-4 h-4 animate-spin" />
                  Analyzing...
                </span>
              ) : (
                'Upload & Analyze'
              )}
            </button>
          </div>

          {/* Info Card */}
          <div className="card bg-pale-blue dark:bg-gray-800">
            <h3 className="font-bold mb-3">How Pricing Works</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span>Low Confidence (&lt;70%)</span>
                <span className="font-bold text-green-600 dark:text-green-400">Free</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Medium Confidence (70-85%)</span>
                <span className="font-bold">$0.0001 USDC</span>
              </div>
              <div className="flex items-center justify-between">
                <span>High Confidence (&gt;85%)</span>
                <span className="font-bold">$0.0003 USDC</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
              High-confidence results require payment via x402 micropayments on Base Sepolia
            </p>
          </div>
        </div>
      ) : (
        // Results Section
        <div className="space-y-6">
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <div>
                <h2 className="text-2xl font-display font-bold">Analysis Complete</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Deepfake analysis finished and published to DKG
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Media Info */}
              <div>
                <h3 className="font-display font-bold mb-3">Media Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Hash:</span>
                    <span className="font-mono text-xs">{uploadedMedia?.sha256Hash?.substring(0, 16)}...</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Type:</span>
                    <span>{uploadedMedia?.mediaType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Uploaded:</span>
                    <span>{new Date(uploadedMedia?.uploadedAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Analysis Results */}
              <div>
                <h3 className="font-display font-bold mb-3">Detection Results</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Deepfake Score:</span>
                    <span className="font-bold">
                      {(factCheck.factCheck.deepfakeScore * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Confidence:</span>
                    <span className="font-bold">
                      {(factCheck.factCheck.confidenceScore * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Model:</span>
                    <span>{factCheck.factCheck.modelUsed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Processing:</span>
                    <span>{factCheck.factCheck.processingTime?.toFixed(2)}s</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Prompt for High Confidence */}
            {requiresPayment && (
              <div className="mt-6 p-4 bg-royal-blue bg-opacity-10 border-2 border-royal-blue rounded-lg">
                <div className="flex items-start gap-3 mb-3">
                  <Lock className="w-6 h-6 text-royal-blue flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
                      High-Confidence Result
                      <Star className="w-5 h-5 text-amber-500" />
                    </h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                      This analysis has a confidence score of{' '}
                      <span className="font-bold">
                        {(factCheck.factCheck.confidenceScore * 100).toFixed(1)}%
                      </span>
                      . Full results including DKG provenance, consensus data, and artifact details
                      require payment.
                    </p>
                    <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded mb-3">
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Price</div>
                        <div className="font-bold text-xl">
                          ${factCheck.factCheck.confidenceScore >= 0.85 ? '0.0003' : '0.0001'} USDC
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600 dark:text-gray-400">Network</div>
                        <div className="font-bold">Base Sepolia</div>
                      </div>
                    </div>
                    <button
                      onClick={handleUnlockPremium}
                      className="btn-primary w-full"
                    >
                      <Lock className="w-4 h-4 inline mr-2" />
                      Unlock Premium Results
                    </button>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                      Powered by x402 micropayments • 60% revenue to verifiers
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* DKG Info */}
            <div className="mt-6 p-4 bg-primary bg-opacity-10 rounded-lg border border-primary">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-display font-bold text-primary dark:text-blue-400">
                  Published to DKG
                </h3>
                {factCheck.dkgAssetId && factCheck.dkgAssetId.split('/')[1]?.length < 42 && (
                  <span className="text-xs px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded">
                    Demo Mode
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Knowledge Asset ID (UAL):
              </p>
              <code className="text-xs bg-white dark:bg-gray-800 px-2 py-1 rounded block break-all mb-3">
                {factCheck.dkgAssetId}
              </code>
              <a
                href={`https://dkg.origintrail.io/explore?ual=${factCheck.dkgAssetId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:text-primary-dark underline flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Open in DKG Explorer
              </a>
              {factCheck.dkgAssetId && factCheck.dkgAssetId.split('/')[1]?.length < 42 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  💡 Testnet wallet needs TRAC tokens. Join{' '}
                  <a href="https://discord.gg/cCRPzzmnNT" target="_blank" rel="noopener noreferrer" className="underline">
                    Discord
                  </a>{' '}
                  for faucet.
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="mt-6 flex gap-3">
              {!requiresPayment && (
                <button onClick={handleViewDetails} className="btn-primary flex-1">
                  View Full Details
                </button>
              )}
              <button onClick={handleReset} className={`btn-secondary ${requiresPayment ? 'flex-1' : 'flex-1'}`}>
                Upload Another
              </button>
            </div>
          </div>

          {/* Free Access Info */}
          {!requiresPayment && (
            <div className="card bg-green-50 dark:bg-green-900 dark:bg-opacity-20">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                <CheckCircle className="w-5 h-5" />
                <div>
                  <h3 className="font-bold">Free Access</h3>
                  <p className="text-sm">
                    This result has confidence below 70% and is available for free. No payment required.
                  </p>
                </div>
              </div>
            </div>
          )}
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

export default Upload;
