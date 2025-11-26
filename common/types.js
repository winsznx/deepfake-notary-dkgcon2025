/**
 * Shared type definitions and interfaces
 * Used across frontend and backend
 */

export const MediaType = {
  VIDEO: 'video',
  IMAGE: 'image'
};

export const FactCheckStatus = {
  PENDING: 'pending',
  ANALYZED: 'analyzed',
  CONSENSUS_REACHED: 'consensus_reached'
};

export const ConsensusVerdict = {
  DEEPFAKE: 'deepfake',
  REAL: 'real'
};
