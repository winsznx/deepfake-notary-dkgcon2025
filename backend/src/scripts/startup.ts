#!/usr/bin/env tsx
/**
 * Pre-flight Startup Script
 * Runs health checks before starting the server
 */
import { HealthChecker } from '../utils/health-check';

async function startup() {
  console.log('\n🚀 Starting Deepfake Notary Backend...\n');

  const checker = new HealthChecker();

  try {
    const result = await checker.runAll();
    checker.printResults(result);

    if (result.status === 'error') {
      console.error('\n❌ Critical errors detected. Cannot start server.');
      console.error('Please fix the errors above before starting.\n');

      console.log('💡 Common fixes:');
      console.log('  1. Run database migrations: pnpm db:push');
      console.log('  2. Check DKG node configuration in .env');
      console.log('  3. Ensure wallet has TRAC tokens: ../setup-dkg-wallet.sh\n');

      process.exit(1);
    }

    if (result.status === 'warning') {
      console.log('⚠️  Starting with warnings. Some features may not work correctly.\n');
      await countdown(3);
    }

    console.log('✅ Pre-flight checks complete. Starting server...\n');
    await checker.close();

    // Import and start the actual server
    require('../index');
  } catch (error) {
    console.error('❌ Startup failed:', error);
    await checker.close();
    process.exit(1);
  }
}

/**
 * Countdown before proceeding
 */
async function countdown(seconds: number): Promise<void> {
  for (let i = seconds; i > 0; i--) {
    process.stdout.write(`Starting in ${i}...`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    process.stdout.write('\r\x1b[K'); // Clear line
  }
}

// Run startup
startup();
