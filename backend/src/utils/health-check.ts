/**
 * System Health Check & Configuration Validator
 * Validates all critical configurations before startup
 */
import { PrismaClient } from '@prisma/client';
import { dkgService } from '../services/dkg.service';
import { config } from '../config';
import axios from 'axios';

export interface HealthCheckResult {
  status: 'healthy' | 'warning' | 'error';
  checks: {
    database: CheckResult;
    dkg: CheckResult;
    blockchain: CheckResult;
    x402: CheckResult;
    tokens: CheckResult;
  };
  summary: string;
  errors: string[];
  warnings: string[];
}

interface CheckResult {
  status: 'pass' | 'warn' | 'fail';
  message: string;
  details?: any;
}

export class HealthChecker {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Run all health checks
   */
  async runAll(): Promise<HealthCheckResult> {
    console.log('\n🏥 Running system health checks...\n');

    const checks = {
      database: await this.checkDatabase(),
      dkg: await this.checkDKG(),
      blockchain: await this.checkBlockchain(),
      x402: await this.checkX402(),
      tokens: await this.checkTokens()
    };

    const errors: string[] = [];
    const warnings: string[] = [];

    // Collect errors and warnings
    Object.entries(checks).forEach(([name, check]) => {
      if (check.status === 'fail') {
        errors.push(`${name}: ${check.message}`);
      } else if (check.status === 'warn') {
        warnings.push(`${name}: ${check.message}`);
      }
    });

    // Determine overall status
    let status: 'healthy' | 'warning' | 'error' = 'healthy';
    if (errors.length > 0) {
      status = 'error';
    } else if (warnings.length > 0) {
      status = 'warning';
    }

    const summary = this.generateSummary(status, errors, warnings);

    return {
      status,
      checks,
      summary,
      errors,
      warnings
    };
  }

  /**
   * Check database connection and schema
   */
  private async checkDatabase(): Promise<CheckResult> {
    try {
      // Test connection
      await this.prisma.$connect();

      // Check if tables exist
      const guardianCount = await this.prisma.guardian.count();

      return {
        status: 'pass',
        message: 'Database connected and operational',
        details: {
          guardians: guardianCount,
          provider: 'sqlite'
        }
      };
    } catch (error: any) {
      return {
        status: 'fail',
        message: 'Database connection failed',
        details: error.message
      };
    }
  }

  /**
   * Check DKG node connectivity and configuration
   */
  private async checkDKG(): Promise<CheckResult> {
    try {
      const nodeInfo = await dkgService.getNodeInfo();

      if (!nodeInfo) {
        return {
          status: 'fail',
          message: 'Cannot retrieve DKG node info'
        };
      }

      return {
        status: 'pass',
        message: 'DKG node connected',
        details: {
          version: nodeInfo.version,
          blockchain: config.dkg.blockchain
        }
      };
    } catch (error: any) {
      if (error.message?.includes('ECONNREFUSED')) {
        return {
          status: 'fail',
          message: 'DKG node unreachable',
          details: `Check ${config.dkg.nodeUrl}`
        };
      }

      return {
        status: 'warn',
        message: 'DKG node check inconclusive',
        details: error.message
      };
    }
  }

  /**
   * Check blockchain RPC and wallet balances
   */
  private async checkBlockchain(): Promise<CheckResult> {
    try {
      // For NeuroWeb testnet
      if (config.dkg.blockchain === 'otp:20430') {
        const rpcUrl = 'https://lofar-testnet.origin-trail.network';

        // Check RPC connectivity
        const response = await axios.post(rpcUrl, {
          jsonrpc: '2.0',
          method: 'eth_blockNumber',
          params: [],
          id: 1
        }, { timeout: 5000 });

        if (!response.data.result) {
          return {
            status: 'fail',
            message: 'Blockchain RPC not responding'
          };
        }

        // TODO: Check wallet balances (NEURO and TRAC)
        // This requires parsing the wallet address from private key

        return {
          status: 'pass',
          message: 'Blockchain RPC connected',
          details: {
            network: 'NeuroWeb Testnet',
            rpc: rpcUrl
          }
        };
      }

      return {
        status: 'warn',
        message: 'Blockchain check skipped (not testnet)',
        details: config.dkg.blockchain
      };
    } catch (error: any) {
      return {
        status: 'fail',
        message: 'Blockchain connectivity failed',
        details: error.message
      };
    }
  }

  /**
   * Check x402 payment configuration
   */
  private async checkX402(): Promise<CheckResult> {
    if (!config.x402.enabled) {
      return {
        status: 'warn',
        message: 'x402 payments disabled',
        details: 'Enable in .env with X402_ENABLED=true'
      };
    }

    // Validate wallet address
    if (!config.x402.walletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      return {
        status: 'fail',
        message: 'Invalid x402 wallet address',
        details: config.x402.walletAddress
      };
    }

    // Check pricing configuration
    const { low, medium, high } = config.x402.pricing;
    if (medium <= low || high <= medium) {
      return {
        status: 'fail',
        message: 'Invalid x402 pricing tiers',
        details: { low, medium, high }
      };
    }

    return {
      status: 'pass',
      message: 'x402 configuration valid',
      details: {
        network: config.x402.network,
        pricing: config.x402.pricing
      }
    };
  }

  /**
   * Check multi-token staking configuration
   */
  private async checkTokens(): Promise<CheckResult> {
    try {
      const axios = (await import('axios')).default;

      // Test token configuration endpoint
      const response = await axios.get('http://localhost:3001/api/staking/tokens', {
        timeout: 2000,
        validateStatus: () => true
      });

      if (response.status === 200 && response.data.tokens?.length === 3) {
        const tokens = response.data.tokens;
        const hasNEURO = tokens.find((t: any) => t.symbol === 'NEURO' && t.multiplier === 1.15);
        const hasDOT = tokens.find((t: any) => t.symbol === 'DOT' && t.multiplier === 1.10);
        const hasTRAC = tokens.find((t: any) => t.symbol === 'TRAC' && t.multiplier === 1.0);

        if (hasNEURO && hasDOT && hasTRAC) {
          return {
            status: 'pass',
            message: 'Multi-token staking configured correctly',
            details: {
              tokens: ['NEURO (+15%)', 'DOT (+10%)', 'TRAC (baseline)']
            }
          };
        }
      }

      return {
        status: 'warn',
        message: 'Token configuration endpoint not ready',
        details: 'Server may not be running'
      };
    } catch (error) {
      return {
        status: 'warn',
        message: 'Token check skipped (server not running)',
        details: 'This is normal during initial startup'
      };
    }
  }

  /**
   * Generate human-readable summary
   */
  private generateSummary(
    status: 'healthy' | 'warning' | 'error',
    errors: string[],
    warnings: string[]
  ): string {
    if (status === 'healthy') {
      return '✅ All systems operational';
    }

    if (status === 'warning') {
      return `⚠️  System operational with ${warnings.length} warning(s)`;
    }

    return `❌ System has ${errors.length} error(s) - manual intervention required`;
  }

  /**
   * Print health check results to console
   */
  printResults(result: HealthCheckResult): void {
    console.log('\n╔═══════════════════════════════════════════════════╗');
    console.log('║         SYSTEM HEALTH CHECK RESULTS               ║');
    console.log('╚═══════════════════════════════════════════════════╝\n');

    // Print each check
    Object.entries(result.checks).forEach(([name, check]) => {
      const icon = check.status === 'pass' ? '✅' : check.status === 'warn' ? '⚠️ ' : '❌';
      const nameCapitalized = name.charAt(0).toUpperCase() + name.slice(1);

      console.log(`${icon} ${nameCapitalized}: ${check.message}`);
      if (check.details) {
        console.log(`   ${JSON.stringify(check.details)}`);
      }
    });

    console.log('\n' + '─'.repeat(50));
    console.log(`\n${result.summary}\n`);

    if (result.errors.length > 0) {
      console.log('❌ ERRORS:');
      result.errors.forEach(err => console.log(`   • ${err}`));
      console.log('');
    }

    if (result.warnings.length > 0) {
      console.log('⚠️  WARNINGS:');
      result.warnings.forEach(warn => console.log(`   • ${warn}`));
      console.log('');
    }

    console.log('═'.repeat(50) + '\n');
  }

  /**
   * Cleanup
   */
  async close(): Promise<void> {
    await this.prisma.$disconnect();
  }
}

/**
 * Standalone health check execution
 */
export async function runHealthCheck(): Promise<void> {
  const checker = new HealthChecker();

  try {
    const result = await checker.runAll();
    checker.printResults(result);

    if (result.status === 'error') {
      console.error('🚨 Critical errors detected. Please resolve before starting the server.\n');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Health check failed:', error);
    process.exit(1);
  } finally {
    await checker.close();
  }
}

// Allow running as standalone script
if (require.main === module) {
  runHealthCheck();
}
