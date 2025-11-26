/**
 * Shared constants
 */

export const API_BASE_URL = import.meta.env?.VITE_API_URL || 'http://localhost:3001';

export const COLORS = {
  PALE_BLUE: '#EFFAFD',
  ROYAL_BLUE: '#4A8BDF',
  EGGPLANT: '#A0006D'
};

export const DEEPFAKE_THRESHOLDS = {
  LOW: 0.3,
  MEDIUM: 0.5,
  HIGH: 0.7
};

export const CONFIDENCE_TIERS = {
  LOW: { min: 0, max: 0.7, label: 'Low', price: 0 },
  MEDIUM: { min: 0.7, max: 0.85, label: 'Medium', price: 0.0001 },
  HIGH: { min: 0.85, max: 1.0, label: 'High', price: 0.0003 }
};
