/**
 * Model Context Protocol (MCP) Server
 * Exposes Deepfake Notary capabilities as tools for AI agents
 *
 * This server implements the MCP specification to allow AI agents to:
 * - Analyze media for deepfakes
 * - Query the DKG for fact-checks
 * - Publish new fact-checks
 * - Participate in consensus mechanisms
 * - Stake on verifications
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { deepfakeAnalysisService } from './services/deepfake-analysis.service';
import { dkgService } from './services/dkg.service';
import { consensusService } from './services/consensus.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Tool Schemas using Zod for validation
 */
const AnalyzeDeepfakeSchema = z.object({
  mediaPath: z.string().describe('Path to the media file to analyze'),
  mediaType: z.enum(['image', 'video']).describe('Type of media'),
});

const QueryDKGSchema = z.object({
  sparql: z.string().describe('SPARQL query to execute'),
  queryType: z.enum(['SELECT', 'CONSTRUCT']).optional().describe('Type of SPARQL query'),
});

const PublishFactCheckSchema = z.object({
  mediaId: z.string().uuid().describe('UUID of the media item'),
  guardianId: z.string().optional().describe('Guardian identifier (optional, defaults to system)'),
});

const VerifyConsensusSchema = z.object({
  factCheckId: z.string().uuid().describe('UUID of the fact-check to verify'),
});

const StakeOnFactCheckSchema = z.object({
  factCheckId: z.string().uuid().describe('UUID of the fact-check'),
  guardianIdentifier: z.string().describe('Guardian wallet address or ID'),
  amount: z.number().positive().describe('Amount to stake'),
  tokenType: z.enum(['TRAC', 'NEURO', 'DOT']).describe('Token type to stake'),
  prediction: z.enum(['deepfake', 'authentic']).describe('Prediction: deepfake or authentic'),
});

const GetFactCheckSchema = z.object({
  factCheckId: z.string().uuid().describe('UUID of the fact-check to retrieve'),
});

const SearchGuardiansSchema = z.object({
  minReputation: z.number().min(0).max(1).optional().describe('Minimum reputation score'),
  minAccuracy: z.number().min(0).max(1).optional().describe('Minimum accuracy rate'),
  limit: z.number().int().positive().max(100).default(10).describe('Maximum results to return'),
});

const GetMediaHashSchema = z.object({
  mediaId: z.string().uuid().describe('UUID of the media item'),
});

/**
 * MCP Server Class
 */
class DeepfakeNotaryMCPServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'deepfake-notary-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    this.setupErrorHandling();
  }

  /**
   * Setup all tool handlers
   */
  private setupToolHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: this.getTools(),
    }));

    // Handle tool execution
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'analyze_deepfake':
            return await this.handleAnalyzeDeepfake(args);

          case 'query_dkg':
            return await this.handleQueryDKG(args);

          case 'publish_factcheck':
            return await this.handlePublishFactCheck(args);

          case 'verify_consensus':
            return await this.handleVerifyConsensus(args);

          case 'stake_on_factcheck':
            return await this.handleStakeOnFactCheck(args);

          case 'get_factcheck':
            return await this.handleGetFactCheck(args);

          case 'search_guardians':
            return await this.handleSearchGuardians(args);

          case 'get_media_hash':
            return await this.handleGetMediaHash(args);

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [
            {
              type: 'text',
              text: `Error executing tool ${name}: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  /**
   * Define available tools
   */
  private getTools(): Tool[] {
    return [
      {
        name: 'analyze_deepfake',
        description: 'Analyzes media (image or video) for deepfake artifacts using AI detection models. Returns deepfake score, confidence, and detected artifacts.',
        inputSchema: {
          type: 'object',
          properties: {
            mediaPath: {
              type: 'string',
              description: 'Path to the media file to analyze',
            },
            mediaType: {
              type: 'string',
              enum: ['image', 'video'],
              description: 'Type of media: image or video',
            },
          },
          required: ['mediaPath', 'mediaType'],
        },
      },
      {
        name: 'query_dkg',
        description: 'Queries the OriginTrail Decentralized Knowledge Graph using SPARQL. Returns knowledge assets matching the query criteria.',
        inputSchema: {
          type: 'object',
          properties: {
            sparql: {
              type: 'string',
              description: 'SPARQL query string (e.g., "SELECT ?s ?p ?o WHERE { ?s ?p ?o } LIMIT 10")',
            },
            queryType: {
              type: 'string',
              enum: ['SELECT', 'CONSTRUCT'],
              description: 'Type of SPARQL query (default: SELECT)',
            },
          },
          required: ['sparql'],
        },
      },
      {
        name: 'publish_factcheck',
        description: 'Publishes a new fact-check to the DKG as a verifiable Knowledge Asset. Automatically runs deepfake analysis and creates RDF triples.',
        inputSchema: {
          type: 'object',
          properties: {
            mediaId: {
              type: 'string',
              format: 'uuid',
              description: 'UUID of the uploaded media item',
            },
            guardianId: {
              type: 'string',
              description: 'Guardian identifier (optional, defaults to system verifier)',
            },
          },
          required: ['mediaId'],
        },
      },
      {
        name: 'verify_consensus',
        description: 'Calculates consensus results for a fact-check based on guardian stakes and reputation. Returns weighted confidence score.',
        inputSchema: {
          type: 'object',
          properties: {
            factCheckId: {
              type: 'string',
              format: 'uuid',
              description: 'UUID of the fact-check to verify',
            },
          },
          required: ['factCheckId'],
        },
      },
      {
        name: 'stake_on_factcheck',
        description: 'Allows a guardian to stake tokens (TRAC, NEURO, or DOT) on a fact-check prediction. Supports multi-token economics with Polkadot bonuses.',
        inputSchema: {
          type: 'object',
          properties: {
            factCheckId: {
              type: 'string',
              format: 'uuid',
              description: 'UUID of the fact-check',
            },
            guardianIdentifier: {
              type: 'string',
              description: 'Guardian wallet address or ID',
            },
            amount: {
              type: 'number',
              minimum: 0.01,
              description: 'Amount to stake (must be within token limits)',
            },
            tokenType: {
              type: 'string',
              enum: ['TRAC', 'NEURO', 'DOT'],
              description: 'Token to stake (NEURO +15%, DOT +10% Polkadot bonus)',
            },
            prediction: {
              type: 'string',
              enum: ['deepfake', 'authentic'],
              description: 'Prediction: "deepfake" or "authentic"',
            },
          },
          required: ['factCheckId', 'guardianIdentifier', 'amount', 'tokenType', 'prediction'],
        },
      },
      {
        name: 'get_factcheck',
        description: 'Retrieves detailed information about a specific fact-check including DKG asset ID, provenance, and consensus data.',
        inputSchema: {
          type: 'object',
          properties: {
            factCheckId: {
              type: 'string',
              format: 'uuid',
              description: 'UUID of the fact-check',
            },
          },
          required: ['factCheckId'],
        },
      },
      {
        name: 'search_guardians',
        description: 'Searches for guardians (verifiers) based on reputation score and accuracy rate. Returns top-rated guardians.',
        inputSchema: {
          type: 'object',
          properties: {
            minReputation: {
              type: 'number',
              minimum: 0,
              maximum: 1,
              description: 'Minimum reputation score (0-1)',
            },
            minAccuracy: {
              type: 'number',
              minimum: 0,
              maximum: 1,
              description: 'Minimum accuracy rate (0-1)',
            },
            limit: {
              type: 'number',
              minimum: 1,
              maximum: 100,
              default: 10,
              description: 'Maximum results to return',
            },
          },
        },
      },
      {
        name: 'get_media_hash',
        description: 'Gets the SHA-256 hash of a media item for content verification and integrity checking.',
        inputSchema: {
          type: 'object',
          properties: {
            mediaId: {
              type: 'string',
              format: 'uuid',
              description: 'UUID of the media item',
            },
          },
          required: ['mediaId'],
        },
      },
    ];
  }

  /**
   * Tool Handler: Analyze Deepfake
   */
  private async handleAnalyzeDeepfake(args: unknown) {
    const validated = AnalyzeDeepfakeSchema.parse(args);

    const result = await deepfakeAnalysisService.analyze(validated.mediaPath);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            analysis: {
              deepfakeScore: result.deepfakeScore,
              confidence: result.confidence,
              artifactsDetected: result.artifactsDetected,
              modelUsed: result.modelUsed,
              processingTime: result.processingTime,
            },
            interpretation: result.deepfakeScore > 0.7
              ? 'High likelihood of deepfake manipulation detected'
              : result.deepfakeScore > 0.4
              ? 'Moderate indicators of manipulation'
              : 'Content appears authentic',
          }, null, 2),
        },
      ],
    };
  }

  /**
   * Tool Handler: Query DKG
   */
  private async handleQueryDKG(args: unknown) {
    const validated = QueryDKGSchema.parse(args);

    const results = await dkgService.query(
      validated.sparql,
      validated.queryType || 'SELECT'
    );

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            query: validated.sparql,
            resultCount: Array.isArray(results) ? results.length : 0,
            results,
          }, null, 2),
        },
      ],
    };
  }

  /**
   * Tool Handler: Publish Fact-Check
   */
  private async handlePublishFactCheck(args: unknown) {
    const validated = PublishFactCheckSchema.parse(args);

    // Get media
    const media = await prisma.media.findUnique({
      where: { id: validated.mediaId },
    });

    if (!media) {
      throw new Error(`Media not found: ${validated.mediaId}`);
    }

    if (!media.contentUrl) {
      throw new Error(`Media has no content URL: ${validated.mediaId}`);
    }

    // Run deepfake analysis
    const analysis = await deepfakeAnalysisService.analyze(media.contentUrl);

    // Get or create guardian
    let guardian = validated.guardianId
      ? await prisma.guardian.findFirst({ where: { guardianId: validated.guardianId } })
      : await prisma.guardian.findFirst({ where: { guardianId: 'system:auto-verifier:001' } });

    if (!guardian) {
      guardian = await prisma.guardian.create({
        data: {
          guardianId: validated.guardianId || 'system:auto-verifier:001',
          username: validated.guardianId || 'AutoVerifier',
          reputationScore: 0.85,
        },
      });
    }

    // Create fact-check
    const factCheck = await prisma.factCheck.create({
      data: {
        mediaId: media.id,
        guardianId: guardian.id,
        claimReviewed: `Media exhibits ${analysis.deepfakeScore > 0.5 ? 'deepfake' : 'authentic'} characteristics`,
        deepfakeScore: analysis.deepfakeScore,
        confidenceScore: analysis.confidence,
        modelUsed: analysis.modelUsed,
        artifactsDetected: JSON.stringify(analysis.artifactsDetected),
        processingTime: analysis.processingTime,
      },
      include: {
        media: true,
        guardian: true,
      },
    });

    // Build Knowledge Asset
    const knowledgeAsset = {
      '@context': 'https://schema.org',
      '@type': 'MediaReview',
      mediaItem: {
        '@type': media.mediaType === 'image' ? 'ImageObject' : 'VideoObject',
        sha256: media.sha256Hash,
        uploadedAt: media.uploadedAt.toISOString(),
      },
      claimReviewed: factCheck.claimReviewed,
      reviewRating: {
        '@type': 'Rating',
        ratingValue: factCheck.deepfakeScore,
        bestRating: 1,
        worstRating: 0,
        confidenceScore: factCheck.confidenceScore,
      },
      provenance: {
        detectionModel: factCheck.modelUsed,
        modelVersion: '2024.11',
        analyzedAt: factCheck.createdAt.toISOString(),
        processingTime: factCheck.processingTime?.toString() || 'N/A',
        artifactsDetected: factCheck.artifactsDetected ? JSON.parse(factCheck.artifactsDetected) : [],
      },
      author: {
        '@type': 'Person',
        identifier: guardian.guardianId,
        reputationScore: guardian.reputationScore,
        verificationCount: guardian.verificationCount || 0,
        accuracyRate: guardian.accuracyRate || 0.5,
      },
    };

    // Publish to DKG
    const ual = await dkgService.publish(knowledgeAsset);

    // Update fact-check with UAL
    await prisma.factCheck.update({
      where: { id: factCheck.id },
      data: {
        dkgAssetId: ual,
        publishedToDkg: true,
      },
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            factCheck: {
              id: factCheck.id,
              dkgAssetId: ual,
              deepfakeScore: factCheck.deepfakeScore,
              confidenceScore: factCheck.confidenceScore,
              claimReviewed: factCheck.claimReviewed,
              publishedAt: factCheck.createdAt.toISOString(),
            },
            knowledgeAsset,
          }, null, 2),
        },
      ],
    };
  }

  /**
   * Tool Handler: Verify Consensus
   */
  private async handleVerifyConsensus(args: unknown) {
    const validated = VerifyConsensusSchema.parse(args);

    const consensus = await consensusService.calculateConsensus(validated.factCheckId);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            consensus: {
              factCheckId: validated.factCheckId,
              confidenceScore: consensus.confidenceScore,
              totalStake: consensus.totalStake,
              participantCount: consensus.participantCount,
              agreementRate: consensus.agreementRate,
              majorityVerdict: consensus.majorityVerdict,
            },
          }, null, 2),
        },
      ],
    };
  }

  /**
   * Tool Handler: Stake on Fact-Check
   */
  private async handleStakeOnFactCheck(args: unknown) {
    const validated = StakeOnFactCheckSchema.parse(args);

    // Get or create guardian
    let guardian = await prisma.guardian.findFirst({
      where: {
        OR: [
          { guardianId: validated.guardianIdentifier },
          { address: validated.guardianIdentifier },
        ],
      },
    });

    if (!guardian) {
      guardian = await prisma.guardian.create({
        data: {
          guardianId: validated.guardianIdentifier,
          address: validated.guardianIdentifier,
          username: `Guardian-${validated.guardianIdentifier.slice(0, 8)}`,
          reputationScore: 0.5, // Starting reputation
        },
      });
    }

    // Create stake
    const stake = await prisma.stake.create({
      data: {
        factCheckId: validated.factCheckId,
        guardianId: guardian.id,
        amount: validated.amount,
        tokenType: validated.tokenType,
        prediction: validated.prediction,
      },
      include: {
        guardian: true,
        factCheck: {
          include: {
            media: true,
          },
        },
      },
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            stake: {
              id: stake.id,
              amount: stake.amount,
              tokenType: stake.tokenType,
              prediction: stake.prediction,
              guardian: {
                id: guardian.guardianId,
                reputation: guardian.reputationScore,
              },
              factCheck: {
                id: stake.factCheckId,
                deepfakeScore: stake.factCheck.deepfakeScore,
              },
              stakedAt: stake.createdAt.toISOString(),
            },
          }, null, 2),
        },
      ],
    };
  }

  /**
   * Tool Handler: Get Fact-Check
   */
  private async handleGetFactCheck(args: unknown) {
    const validated = GetFactCheckSchema.parse(args);

    const factCheck = await prisma.factCheck.findUnique({
      where: { id: validated.factCheckId },
      include: {
        media: true,
        guardian: true,
        stakes: {
          include: {
            guardian: true,
          },
        },
        consensus: true,
      },
    });

    if (!factCheck) {
      throw new Error(`Fact-check not found: ${validated.factCheckId}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            factCheck: {
              id: factCheck.id,
              dkgAssetId: factCheck.dkgAssetId,
              deepfakeScore: factCheck.deepfakeScore,
              confidenceScore: factCheck.confidenceScore,
              claimReviewed: factCheck.claimReviewed,
              modelUsed: factCheck.modelUsed,
              artifactsDetected: factCheck.artifactsDetected ? JSON.parse(factCheck.artifactsDetected) : [],
              publishedToDkg: factCheck.publishedToDkg,
              createdAt: factCheck.createdAt.toISOString(),
              media: {
                type: factCheck.media.mediaType,
                hash: factCheck.media.sha256Hash,
              },
              guardian: {
                id: factCheck.guardian.guardianId,
                reputation: factCheck.guardian.reputationScore,
              },
              stakes: factCheck.stakes.map((s: any) => ({
                amount: s.amount,
                token: s.tokenType,
                prediction: s.prediction,
                guardian: s.guardian.guardianId,
              })),
              consensus: factCheck.consensus ? {
                majorityVerdict: factCheck.consensus.majorityVerdict,
                resolved: factCheck.consensus.resolved,
                agreementRate: factCheck.consensus.agreementRate,
                participantCount: factCheck.consensus.participantCount,
              } : null,
            },
          }, null, 2),
        },
      ],
    };
  }

  /**
   * Tool Handler: Search Guardians
   */
  private async handleSearchGuardians(args: unknown) {
    const validated = SearchGuardiansSchema.parse(args);

    const guardians = await prisma.guardian.findMany({
      where: {
        ...(validated.minReputation && { reputationScore: { gte: validated.minReputation } }),
        ...(validated.minAccuracy && { accuracyRate: { gte: validated.minAccuracy } }),
      },
      orderBy: [
        { reputationScore: 'desc' },
        { accuracyRate: 'desc' },
      ],
      take: validated.limit,
      include: {
        _count: {
          select: {
            stakes: true,
            factChecks: true,
          },
        },
      },
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            guardians: guardians.map((g) => ({
              id: g.guardianId,
              username: g.username,
              address: g.address,
              reputation: g.reputationScore,
              accuracy: g.accuracyRate,
              totalStake: g.totalStake,
              verifications: g._count.factChecks,
              stakesPlaced: g._count.stakes,
            })),
          }, null, 2),
        },
      ],
    };
  }

  /**
   * Tool Handler: Get Media Hash
   */
  private async handleGetMediaHash(args: unknown) {
    const validated = GetMediaHashSchema.parse(args);

    const media = await prisma.media.findUnique({
      where: { id: validated.mediaId },
    });

    if (!media) {
      throw new Error(`Media not found: ${validated.mediaId}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            media: {
              id: media.id,
              sha256Hash: media.sha256Hash,
              mediaType: media.mediaType,
              uploadedAt: media.uploadedAt.toISOString(),
              ipfsHash: media.ipfsHash,
            },
          }, null, 2),
        },
      ],
    };
  }

  /**
   * Setup error handling
   */
  private setupErrorHandling() {
    this.server.onerror = (error) => {
      console.error('[MCP Server Error]:', error);
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  /**
   * Start the MCP server
   */
  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('🚀 Deepfake Notary MCP Server running on stdio');
  }
}

/**
 * Start server if run directly
 */
if (require.main === module) {
  const server = new DeepfakeNotaryMCPServer();
  server.run().catch((error) => {
    console.error('Failed to start MCP server:', error);
    process.exit(1);
  });
}

export { DeepfakeNotaryMCPServer };
