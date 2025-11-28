/**
 * Jest Test Setup
 * Configures environment and mocks for testing
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'file:./test.db';
process.env.DKG_NODE_ENDPOINT = 'http://localhost:8900';
process.env.DKG_BLOCKCHAIN = 'hardhat1:31337';
process.env.DKG_PRIVATE_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';

// Mock console methods for cleaner test output
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  // Keep error for debugging
};

// Clean up after all tests
afterAll(async () => {
  // Close any open connections
  await new Promise((resolve) => setTimeout(resolve, 500));
});
