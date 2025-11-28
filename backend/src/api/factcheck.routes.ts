/**
 * Fact-check routes
 */
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { deepfakeAnalysisService } from '../services/deepfake-analysis.service';
import { guardianService } from '../services/guardian.service';
import { dkgService } from '../services/dkg.service';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * POST /api/factcheck/create
 * Create a new fact-check for media
 * Guardian is auto-assigned if not provided
 */
router.post('/create', async (req, res) => {
  try {
    const { mediaId, guardianIdentifier } = req.body;

    if (!mediaId) {
      return res.status(400).json({ error: 'Missing mediaId' });
    }

    // Get media
    const media = await prisma.media.findUnique({ where: { id: mediaId } });
    if (!media) {
      return res.status(404).json({ error: 'Media not found' });
    }

    // Auto-assign system Guardian if not provided
    let guardian;
    if (guardianIdentifier) {
      guardian = await guardianService.getOrCreateGuardian(guardianIdentifier);
    } else {
      // Get or create auto-verifier Guardian
      guardian = await prisma.guardian.findUnique({
        where: { guardianId: 'system:auto-verifier:001' }
      });

      if (!guardian) {
        guardian = await prisma.guardian.create({
          data: {
            guardianId: 'system:auto-verifier:001',
            username: 'AutoVerifier',
            reputationScore: 0.85,
            verificationCount: 0,
            accuracyRate: 0.85,
            totalStake: 0
          }
        });
        console.log('✨ Created auto-verifier Guardian');
      }
    }

    // Run deepfake analysis
    const analysis = await deepfakeAnalysisService.analyze(media.contentUrl!);

    // Create fact-check
    const factCheck = await prisma.factCheck.create({
      data: {
        mediaId: media.id,
        guardianId: guardian.id,
        claimReviewed: `Video exhibits ${analysis.deepfakeScore > 0.5 ? 'deepfake' : 'authentic'} characteristics`,
        deepfakeScore: analysis.deepfakeScore,
        confidenceScore: analysis.confidence,
        modelUsed: analysis.modelUsed,
        artifactsDetected: JSON.stringify(analysis.artifactsDetected),
        processingTime: analysis.processingTime
      },
      include: { guardian: true, media: true }
    });

    // Generate Knowledge Asset JSON-LD
    const knowledgeAsset = {
      '@context': 'https://schema.org',
      '@type': 'MediaReview',
      mediaItem: {
        '@type': media.mediaType === 'video' ? 'VideoObject' : 'ImageObject',
        sha256: media.sha256Hash,
        uploadedAt: media.uploadedAt.toISOString()
      },
      claimReviewed: factCheck.claimReviewed,
      reviewRating: {
        '@type': 'Rating',
        ratingValue: analysis.deepfakeScore,
        bestRating: 1.0,
        worstRating: 0.0,
        confidenceScore: analysis.confidence
      },
      provenance: {
        detectionModel: analysis.modelUsed,
        modelVersion: '2024.11',
        analyzedAt: new Date().toISOString(),
        processingTime: `${analysis.processingTime}s`,
        artifactsDetected: analysis.artifactsDetected
      },
      author: {
        '@type': 'Person',
        identifier: guardian.guardianId,
        reputationScore: guardian.reputationScore,
        verificationCount: guardian.verificationCount,
        accuracyRate: guardian.accuracyRate
      }
    };

    // Publish to DKG
    const dkgAssetId = await dkgService.publish(knowledgeAsset);

    // Update fact-check with DKG asset ID
    await prisma.factCheck.update({
      where: { id: factCheck.id },
      data: {
        dkgAssetId,
        publishedToDkg: true
      }
    });

    return res.json({
      factCheck,
      knowledgeAsset,
      dkgAssetId
    });
  } catch (error: any) {
    console.error('❌ Fact-check creation error:', error);
    console.error('📋 Error message:', error.message);
    console.error('📋 Error stack:', error.stack);
    return res.status(500).json({
      error: 'Failed to create fact-check',
      details: error.message
    });
  }
});

/**
 * GET /api/factcheck/all
 * Get all fact-checks (for dashboard)
 * NOTE: This must come BEFORE /:id route to avoid "all" being treated as an ID
 */
router.get('/all', async (_req, res) => {
  try {
    const factChecks = await prisma.factCheck.findMany({
      include: {
        guardian: true,
        media: true,
        stakes: true,
        consensus: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50 // Limit to most recent 50
    });

    return res.json(factChecks);
  } catch (error) {
    console.error('Get all fact-checks error:', error);
    return res.status(500).json({ error: 'Failed to retrieve fact-checks' });
  }
});

/**
 * GET /api/factcheck/:id
 * Get fact-check by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const factCheck = await prisma.factCheck.findUnique({
      where: { id: req.params.id },
      include: {
        guardian: true,
        media: true,
        stakes: true,
        consensus: true
      }
    });

    if (!factCheck) {
      return res.status(404).json({ error: 'Fact-check not found' });
    }

    return res.json(factCheck);
  } catch (error) {
    console.error('Get fact-check error:', error);
    return res.status(500).json({ error: 'Failed to retrieve fact-check' });
  }
});

/**
 * GET /api/factcheck/media/:mediaId
 * Get all fact-checks for a media item
 */
router.get('/media/:mediaId', async (req, res) => {
  try {
    const factChecks = await prisma.factCheck.findMany({
      where: { mediaId: req.params.mediaId },
      include: { guardian: true, stakes: true }
    });

    return res.json(factChecks);
  } catch (error) {
    console.error('Get fact-checks error:', error);
    return res.status(500).json({ error: 'Failed to retrieve fact-checks' });
  }
});

export default router;
