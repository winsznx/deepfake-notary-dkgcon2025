/**
 * RDF Triple Generation Service
 * Converts JSON-LD Knowledge Assets to RDF formats
 * Supports: N-Triples, Turtle, N-Quads, RDF/XML
 */
import jsonld from 'jsonld';
import { Writer as N3Writer, Parser as N3Parser } from 'n3';
import { KnowledgeAsset } from './dkg.service';

export type RDFFormat = 'n-triples' | 'turtle' | 'n-quads' | 'application/ld+json';

export interface RDFTriple {
  subject: string;
  predicate: string;
  object: string;
  graph?: string;
}

export class RDFService {
  /**
   * Convert JSON-LD Knowledge Asset to RDF triples
   * @param knowledgeAsset - JSON-LD document
   * @returns Array of RDF triples
   */
  async toTriples(knowledgeAsset: KnowledgeAsset): Promise<RDFTriple[]> {
    try {
      // Convert JSON-LD to N-Quads (canonical RDF format)
      const nquads = await jsonld.toRDF(knowledgeAsset, { format: 'application/n-quads' });

      // Parse N-Quads to extract triples
      const parser = new N3Parser({ format: 'N-Quads' });
      const triples: RDFTriple[] = [];

      return new Promise((resolve, reject) => {
        parser.parse(nquads as string, (error: Error | null, quad: any) => {
          if (error) {
            reject(error);
          } else if (quad) {
            triples.push({
              subject: quad.subject.value,
              predicate: quad.predicate.value,
              object: quad.object.value,
              graph: quad.graph.value !== '' ? quad.graph.value : undefined,
            });
          } else {
            // Parsing complete
            resolve(triples);
          }
        });
      });
    } catch (error) {
      throw new Error(`Failed to convert to RDF triples: ${error}`);
    }
  }

  /**
   * Serialize Knowledge Asset to specific RDF format
   * @param knowledgeAsset - JSON-LD document
   * @param format - Target RDF format
   * @returns Serialized RDF string
   */
  async serialize(knowledgeAsset: KnowledgeAsset, format: RDFFormat = 'turtle'): Promise<string> {
    try {
      if (format === 'application/ld+json') {
        // Return as-is (JSON-LD)
        return JSON.stringify(knowledgeAsset, null, 2);
      }

      // Convert to N-Quads first
      const nquads = await jsonld.toRDF(knowledgeAsset, { format: 'application/n-quads' });

      if (format === 'n-quads') {
        return nquads as string;
      }

      // Parse and re-serialize to target format
      const parser = new N3Parser({ format: 'N-Quads' });
      const quads: any[] = [];

      await new Promise((resolve, reject) => {
        parser.parse(nquads as string, (error: Error | null, quad: any) => {
          if (error) reject(error);
          else if (quad) quads.push(quad);
          else resolve(null);
        });
      });

      // Write to target format
      const writer = new N3Writer({ format: this.getN3Format(format) });
      quads.forEach((quad) => writer.addQuad(quad));

      return new Promise<string>((resolve, reject) => {
        writer.end((error: Error | null, result: string) => {
          if (error) reject(error);
          else resolve(result);
        });
      });
    } catch (error) {
      throw new Error(`Failed to serialize to ${format}: ${error}`);
    }
  }

  /**
   * Generate SPARQL-ready RDF representation
   * @param knowledgeAsset - JSON-LD document
   * @returns Turtle format (commonly used in SPARQL)
   */
  async toSPARQL(knowledgeAsset: KnowledgeAsset): Promise<string> {
    return this.serialize(knowledgeAsset, 'turtle');
  }

  /**
   * Validate JSON-LD structure
   * @param jsonldDoc - JSON-LD document
   * @returns true if valid, throws error otherwise
   */
  async validate(jsonldDoc: any): Promise<boolean> {
    try {
      // Expand JSON-LD to check for errors
      await jsonld.expand(jsonldDoc);

      // Check required Schema.org fields for MediaReview
      if (jsonldDoc['@type'] === 'MediaReview') {
        if (!jsonldDoc.reviewRating) {
          throw new Error('MediaReview requires reviewRating property');
        }
        if (!jsonldDoc.claimReviewed) {
          throw new Error('MediaReview requires claimReviewed property');
        }
      }

      return true;
    } catch (error) {
      throw new Error(`Invalid JSON-LD: ${error}`);
    }
  }

  /**
   * Extract specific triples by predicate
   * @param knowledgeAsset - JSON-LD document
   * @param predicate - RDF predicate URI
   * @returns Matching triples
   */
  async findTriples(knowledgeAsset: KnowledgeAsset, predicate: string): Promise<RDFTriple[]> {
    const allTriples = await this.toTriples(knowledgeAsset);
    return allTriples.filter((triple) => triple.predicate === predicate);
  }

  /**
   * Generate human-readable summary from Knowledge Asset
   * @param knowledgeAsset - JSON-LD document
   * @returns Markdown summary
   */
  generateSummary(knowledgeAsset: KnowledgeAsset): string {
    const { reviewRating, claimReviewed, provenance, author, mediaItem } = knowledgeAsset;

    return `
# Deepfake Fact-Check Report

## Claim
${claimReviewed}

## Analysis Result
- **Deepfake Score**: ${reviewRating.ratingValue} (${reviewRating.ratingValue > 0.5 ? 'Likely Deepfake' : 'Likely Authentic'})
- **Confidence**: ${reviewRating.confidenceScore}

## Media Details
- **Type**: ${mediaItem['@type']}
- **Hash**: ${mediaItem.sha256}
- **Uploaded**: ${mediaItem.uploadedAt}

## Detection Metadata
- **Model**: ${provenance.detectionModel} v${provenance.modelVersion}
- **Analyzed**: ${provenance.analyzedAt}
- **Processing Time**: ${provenance.processingTime}s
${provenance.artifactsDetected ? `- **Artifacts**: ${provenance.artifactsDetected.join(', ')}` : ''}

## Guardian
- **ID**: ${author.identifier}
- **Reputation**: ${author.reputationScore}
- **Verification Count**: ${author.verificationCount}
- **Accuracy Rate**: ${author.accuracyRate}
`.trim();
  }

  /**
   * Map our format names to N3 library format names
   */
  private getN3Format(format: RDFFormat): string {
    const formatMap: Record<RDFFormat, string> = {
      'n-triples': 'N-Triples',
      'turtle': 'Turtle',
      'n-quads': 'N-Quads',
      'application/ld+json': 'application/ld+json',
    };
    return formatMap[format] || 'Turtle';
  }
}

// Export singleton instance
export const rdfService = new RDFService();
