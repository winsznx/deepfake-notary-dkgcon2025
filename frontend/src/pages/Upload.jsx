/**
 * Upload Page
 * Allows users to upload media and run deepfake analysis
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload as UploadIcon, FileVideo, Image, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import axios from 'axios';

const Upload = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [guardianIdentifier, setGuardianIdentifier] = useState('');
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

    if (!guardianIdentifier) {
      setError('Please enter your Guardian identifier');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // Step 1: Upload media
      const formData = new FormData();
      formData.append('media', file);

      const uploadResponse = await axios.post('/api/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setUploadedMedia(uploadResponse.data);
      setUploading(false);
      setAnalyzing(true);

      // Step 2: Create fact-check (runs deepfake analysis)
      const factCheckResponse = await axios.post('/api/factcheck/create', {
        mediaId: uploadResponse.data.id,
        guardianIdentifier
      });

      setFactCheck(factCheckResponse.data);
      setAnalyzing(false);

    } catch (err) {
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
    setGuardianIdentifier('');
  };

  const handleViewDetails = () => {
    if (factCheck?.factCheck?.id) {
      navigate(`/factcheck/${factCheck.factCheck.id}`);
    }
  };

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
        <div className="grid md:grid-cols-2 gap-6">
          {/* Upload Section */}
          <div className="card">
            <h2 className="text-xl font-display font-bold mb-4">1. Select Media</h2>

            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className={`
                border-2 border-dashed rounded-lg p-8 text-center
                transition-colors cursor-pointer
                ${file
                  ? 'border-royal-blue bg-pale-blue dark:bg-gray-700'
                  : 'border-gray-300 dark:border-gray-600 hover:border-royal-blue'
                }
              `}
              onClick={() => document.getElementById('file-input').click()}
            >
              {file ? (
                <div className="space-y-3">
                  {file.type.startsWith('video') ? (
                    <FileVideo className="w-16 h-16 mx-auto text-royal-blue" />
                  ) : (
                    <Image className="w-16 h-16 mx-auto text-royal-blue" />
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
                    className="text-sm text-eggplant hover:underline"
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
          </div>

          {/* Guardian Info Section */}
          <div className="card">
            <h2 className="text-xl font-display font-bold mb-4">2. Guardian Info</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Guardian Identifier
                </label>
                <input
                  type="text"
                  value={guardianIdentifier}
                  onChange={(e) => setGuardianIdentifier(e.target.value)}
                  placeholder="0x... or username"
                  className="input-field"
                  disabled={uploading || analyzing}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Your wallet address or Guardian username
                </p>
              </div>

              <div className="bg-pale-blue dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="font-medium text-sm mb-2">What happens next?</h3>
                <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-decimal list-inside">
                  <li>Media will be hashed (SHA-256)</li>
                  <li>AI deepfake detection runs</li>
                  <li>Fact-check note is generated</li>
                  <li>Published to DKG as Knowledge Asset</li>
                </ol>
              </div>

              <button
                onClick={handleUpload}
                disabled={!file || !guardianIdentifier || uploading || analyzing}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
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

            {/* DKG Info */}
            <div className="mt-6 p-4 bg-royal-blue bg-opacity-10 rounded-lg border border-royal-blue">
              <h3 className="font-display font-bold mb-2 text-royal-blue dark:text-blue-400">
                Published to DKG
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Knowledge Asset ID (UAL):
              </p>
              <code className="text-xs bg-white dark:bg-gray-800 px-2 py-1 rounded block break-all">
                {factCheck.dkgAssetId}
              </code>
            </div>

            {/* Actions */}
            <div className="mt-6 flex gap-3">
              <button onClick={handleViewDetails} className="btn-primary flex-1">
                View Full Details
              </button>
              <button onClick={handleReset} className="btn-secondary flex-1">
                Upload Another
              </button>
            </div>
          </div>
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
