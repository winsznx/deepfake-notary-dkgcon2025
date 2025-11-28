// API Configuration
// Reads from environment variables

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

console.log('🔧 API Configuration:', {
  API_URL,
  env: import.meta.env.MODE
});
