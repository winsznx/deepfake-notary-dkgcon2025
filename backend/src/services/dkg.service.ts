/**
 * DKG Service
 * Real integration with OriginTrail Decentralized Knowledge Graph
 * Using dkg.js SDK v8.2.0
 */
// @ts-ignore - dkg.js doesn't have TypeScript types yet
import DKG from 'dkg.js';

export interface KnowledgeAsset {
  '@context': string;
  '@type': string;
  identifier?: string;
  mediaItem: {
    '@type': string;
    contentUrl?: string;
    sha256: string;
    uploadedAt: string;
  };
  claimReviewed: string;
  reviewRating: {
    '@type': string;
    ratingValue: number;
    bestRating: number;
    worstRating: number;
    confidenceScore: number;
    consensusWeight?: number;
  };
  provenance: {
    detectionModel: string;
    modelVersion: string;
    analyzedAt: string;
    processingTime: string;
    artifactsDetected?: string[];
  };
  author: {
    '@type': string;
    identifier: string;
    reputationScore: number;
    verificationCount: number;
    accuracyRate: number;
  };
  stake?: {
    amount: string;
    currency: string;
    locked: boolean;
    unlockCondition: string;
  };
}

export class DKGService {
  private dkgClient: any;

  constructor() {
    try {
      const blockchain = process.env.DKG_BLOCKCHAIN || 'hardhat1:31337';

      // Configure blockchain config based on network
      const privateKey = process.env.DKG_PRIVATE_KEY || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';

      const blockchainConfig: any = {
        name: blockchain,
        privateKey: privateKey,
      };

      // Add RPC and hub contract for each network
      if (blockchain === 'otp:20430') {
        // NeuroWeb Testnet - Using HTTP instead of WSS for reliability
        blockchainConfig.rpc = 'https://lofar-tm-rpc.origin-trail.network';
        blockchainConfig.hubContract = '0xBbfF7Ea6b2Addc1f38A0798329e12C08f03750A6';
      } else if (blockchain === 'otp:2043') {
        // NeuroWeb Mainnet
        blockchainConfig.rpc = 'https://astrosat-parachain-rpc.origin-trail.network';
        blockchainConfig.hubContract = '0x0957e25BD33034948abc28204ddA54b6E1142D6F';
      } else if (blockchain === 'hardhat1:31337') {
        // Local Hardhat
        blockchainConfig.rpc = 'http://127.0.0.1:8545';
        blockchainConfig.hubContract = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
      }

      // Initialize DKG client
      this.dkgClient = new DKG({
        endpoint: process.env.DKG_NODE_ENDPOINT || 'http://localhost',
        port: process.env.DKG_NODE_PORT || '8900',
        blockchain: blockchainConfig,
        maxNumberOfRetries: 300,
        frequency: 2,
        contentType: 'all',
        environment: blockchain.startsWith('otp:2043') ? 'mainnet' : 'testnet',
      });

      console.log('✅ DKG Client initialized');
      console.log(`📡 Endpoint: ${process.env.DKG_NODE_ENDPOINT || 'http://localhost'}:${process.env.DKG_NODE_PORT || '8900'}`);
      console.log(`⛓️  Blockchain: ${blockchain}`);
      console.log(`🔗 RPC: ${blockchainConfig.rpc || 'not configured'}`);
    } catch (error) {
      console.error('❌ Failed to initialize DKG client:', error);
      throw error;
    }
  }

  /**
   * Publishes a Knowledge Asset to DKG
   * @param asset - JSON-LD Knowledge Asset
   * @returns DKG Asset ID (UAL - Universal Asset Locator)
   */
  async publish(asset: KnowledgeAsset): Promise<string> {
    try {
      console.log('📝 Publishing Knowledge Asset to DKG...');
      console.log('📋 Asset:', JSON.stringify(asset, null, 2));

      // Publish to DKG (no timeout - let SDK handle retries)
      console.log('⏳ Waiting for DKG transaction (this may take 1-2 minutes)...');
      const result = await this.dkgClient.asset.create(
        { public: asset },
        {
          epochsNum: 2,
          minimumNumberOfFinalizationConfirmations: 3,
          minimumNumberOfNodeReplications: 1,
        }
      );

      const ual = (result as any).UAL;
      console.log('✅ Published to DKG successfully');
      console.log('🔗 UAL:', ual);
      console.log('🌐 View on explorer: https://dkg.origintrail.io/explore?ual=' + ual);

      // Wait for finality (non-blocking)
      this.dkgClient.graph.publishFinality(ual)
        .then((finalityResult: any) => {
          console.log('✅ Asset finalized on blockchain:', finalityResult);
        })
        .catch((finalityError: any) => {
          console.warn('⚠️  Finality check failed (non-critical):', finalityError);
        });

      return ual;
    } catch (error: any) {
      console.error('❌ DKG publish error:', error);
      console.error('📋 Error details:', JSON.stringify(error, null, 2));
      console.error('📋 Error stack:', error.stack);

      // Provide clear error messages for common issues
      if (error.message?.includes('insufficient funds') || error.message?.includes('insufficient balance')) {
        throw new Error(`Insufficient tokens. Check wallet has both NEURO (gas) and TRAC (publishing fee). Request from Discord #faucet-bot: !fundme_neuroweb 0x10Cd8De4017fF6213d93ffF440c8c7e310117D1f`);
      }

      if (error.message?.includes('ECONNREFUSED') || error.code === 'ECONNREFUSED') {
        throw new Error(`Cannot connect to DKG node at ${process.env.DKG_NODE_ENDPOINT}:${process.env.DKG_NODE_PORT}`);
      }

      if (error.message?.includes('nonce') || error.message?.includes('replacement')) {
        throw new Error(`Blockchain nonce issue. Wait 1 minute and try again.`);
      }

      throw new Error(`DKG publishing failed: ${error.message || error}`);
    }
  }

  /**
   * Queries DKG for Knowledge Assets using SPARQL
   * @param query - SPARQL query
   * @param queryType - 'SELECT' or 'CONSTRUCT'
   * @returns Query results
   */
  async query(query: string, queryType: 'SELECT' | 'CONSTRUCT' = 'SELECT'): Promise<any[]> {
    try {
      console.log('🔍 Querying DKG...');
      console.log('📋 SPARQL Query:', query);

      const result = await this.dkgClient.graph.query(query, queryType);

      console.log('✅ Query completed');
      console.log('📊 Results:', JSON.stringify(result, null, 2));

      return result;
    } catch (error: any) {
      console.error('❌ DKG query error:', error);

      if (error.message?.includes('ECONNREFUSED') || error.code === 'ECONNREFUSED') {
        throw new Error('DKG node is not running. Please start the local DKG node or configure testnet endpoint.');
      }

      throw new Error(`Failed to query DKG: ${error.message}`);
    }
  }

  /**
   * Retrieves a Knowledge Asset by UAL
   * @param ual - Universal Asset Locator (e.g., did:dkg:otp/0x.../123)
   * @returns Knowledge Asset
   */
  async get(ual: string): Promise<KnowledgeAsset | null> {
    try {
      console.log('📥 Retrieving Knowledge Asset from DKG...');
      console.log('🔗 UAL:', ual);

      const result = await this.dkgClient.asset.get(ual, {
        contentType: 'all',
      });

      console.log('✅ Asset retrieved successfully');
      console.log('📋 Asset data:', JSON.stringify(result, null, 2));

      // Extract public assertion from result
      if (result && result.public) {
        return result.public as KnowledgeAsset;
      }

      return result as KnowledgeAsset;
    } catch (error: any) {
      console.error('❌ DKG get error:', error);

      if (error.message?.includes('ECONNREFUSED') || error.code === 'ECONNREFUSED') {
        throw new Error('DKG node is not running. Please start the local DKG node or configure testnet endpoint.');
      }

      console.warn(`Failed to retrieve asset ${ual}: ${error.message}`);
      return null;
    }
  }

  /**
   * Gets info about the connected DKG node
   * @returns Node information
   */
  async getNodeInfo(): Promise<any> {
    try {
      const nodeInfo = await this.dkgClient.node.info();
      console.log('ℹ️  DKG Node Info:', nodeInfo);
      return nodeInfo;
    } catch (error: any) {
      console.error('❌ Failed to get node info:', error);

      if (error.message?.includes('ECONNREFUSED') || error.code === 'ECONNREFUSED') {
        throw new Error('DKG node is not running. Please start the local DKG node or configure testnet endpoint.');
      }

      throw error;
    }
  }
}

export const dkgService = new DKGService();
