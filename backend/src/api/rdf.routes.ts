/**
 * RDF Export API Routes
 * Provides endpoints for exporting Knowledge Assets in various RDF formats
 */
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { rdfService, RDFFormat } from '../services/rdf.service';
import { KnowledgeAsset } from '../services/dkg.service';

const router = Router();
const prisma = new PrismaClient();

/**
 * GET /api/rdf/factcheck/:id/export
 * Export fact-check as RDF in specified format
 */
router.get('/factcheck/:id/export', async (req, res) => {
  try {
    const { id } = req.params;
    const format = (req.query.format as RDFFormat) || 'turtle';

    // Validate format
    const validFormats: RDFFormat[] = ['n-triples', 'turtle', 'n-quads', 'application/ld+json'];
    if (!validFormats.includes(format)) {
      return res.status(400).json({
        error: `Invalid format. Must be one of: ${validFormats.join(', ')}`,
      });
    }

    // Get fact-check
    const factCheck = await prisma.factCheck.findUnique({
      where: { id },
      include: {
        media: true,
        guardian: true,
      },
    });

    if (!factCheck) {
      return res.status(404).json({ error: 'Fact-check not found' });
    }

    // Build Knowledge Asset
    const knowledgeAsset: KnowledgeAsset = {
      '@context': 'https://schema.org',
      '@type': 'MediaReview',
      identifier: factCheck.id,
      mediaItem: {
        '@type': 'VideoObject',
        contentUrl: factCheck.media.contentUrl || undefined,
        sha256: factCheck.media.sha256Hash,
        uploadedAt: factCheck.media.uploadedAt.toISOString(),
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
        identifier: factCheck.guardian.guardianId,
        reputationScore: factCheck.guardian.reputationScore,
        verificationCount: factCheck.guardian.verificationCount,
        accuracyRate: factCheck.guardian.accuracyRate,
      },
    };

    // Serialize to requested format
    const serialized = await rdfService.serialize(knowledgeAsset, format);

    // Set appropriate content type
    const contentTypes: Record<RDFFormat, string> = {
      'n-triples': 'application/n-triples',
      'turtle': 'text/turtle',
      'n-quads': 'application/n-quads',
      'application/ld+json': 'application/ld+json',
    };

    res.set('Content-Type', contentTypes[format]);
    return res.send(serialized);
  } catch (error: any) {
    console.error('RDF export error:', error);
    return res.status(500).json({ error: error.message || 'Failed to export RDF' });
  }
});

/**
 * GET /api/rdf/factcheck/:id/triples
 * Get fact-check as array of RDF triples
 */
router.get('/factcheck/:id/triples', async (req, res) => {
  try {
    const { id } = req.params;

    // Get fact-check
    const factCheck = await prisma.factCheck.findUnique({
      where: { id },
      include: {
        media: true,
        guardian: true,
      },
    });

    if (!factCheck) {
      return res.status(404).json({ error: 'Fact-check not found' });
    }

    // Build Knowledge Asset
    const knowledgeAsset: KnowledgeAsset = {
      '@context': 'https://schema.org',
      '@type': 'MediaReview',
      identifier: factCheck.id,
      mediaItem: {
        '@type': 'VideoObject',
        contentUrl: factCheck.media.contentUrl || undefined,
        sha256: factCheck.media.sha256Hash,
        uploadedAt: factCheck.media.uploadedAt.toISOString(),
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
        identifier: factCheck.guardian.guardianId,
        reputationScore: factCheck.guardian.reputationScore,
        verificationCount: factCheck.guardian.verificationCount,
        accuracyRate: factCheck.guardian.accuracyRate,
      },
    };

    // Convert to triples
    const triples = await rdfService.toTriples(knowledgeAsset);

    return res.json({
      factCheckId: id,
      tripleCount: triples.length,
      triples,
    });
  } catch (error: any) {
    console.error('Triple generation error:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate triples' });
  }
});

/**
 * GET /api/rdf/factcheck/:id/summary
 * Get human-readable summary
 */
router.get('/factcheck/:id/summary', async (req, res) => {
  try {
    const { id } = req.params;

    // Get fact-check
    const factCheck = await prisma.factCheck.findUnique({
      where: { id },
      include: {
        media: true,
        guardian: true,
      },
    });

    if (!factCheck) {
      return res.status(404).json({ error: 'Fact-check not found' });
    }

    // Build Knowledge Asset
    const knowledgeAsset: KnowledgeAsset = {
      '@context': 'https://schema.org',
      '@type': 'MediaReview',
      identifier: factCheck.id,
      mediaItem: {
        '@type': 'VideoObject',
        contentUrl: factCheck.media.contentUrl || undefined,
        sha256: factCheck.media.sha256Hash,
        uploadedAt: factCheck.media.uploadedAt.toISOString(),
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
        identifier: factCheck.guardian.guardianId,
        reputationScore: factCheck.guardian.reputationScore,
        verificationCount: factCheck.guardian.verificationCount,
        accuracyRate: factCheck.guardian.accuracyRate,
      },
    };

    // Generate markdown summary
    const summary = rdfService.generateSummary(knowledgeAsset);

    res.set('Content-Type', 'text/markdown');
    return res.send(summary);
  } catch (error: any) {
    console.error('Summary generation error:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate summary' });
  }
});

export default router;
