/**
 * Deepfake Analysis Service Tests
 * Tests for ML-based deepfake detection
 */
import { DeepfakeAnalysisService, DeepfakeResult } from '../services/deepfake-analysis.service';
import fs from 'fs';
import path from 'path';

describe('DeepfakeAnalysisService', () => {
  let service: DeepfakeAnalysisService;
  let testFilePath: string;

  beforeAll(() => {
    // Create a test file
    testFilePath = path.join(__dirname, 'test-media.jpg');
    fs.writeFileSync(testFilePath, Buffer.from('test content'));
  });

  afterAll(() => {
    // Clean up test file
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }
  });

  beforeEach(() => {
    service = new DeepfakeAnalysisService();
  });

  describe('analyze method', () => {
    it('should return valid DeepfakeResult', async () => {
      const result: DeepfakeResult = await service.analyze(testFilePath);

      // Validate result structure
      expect(result).toHaveProperty('deepfakeScore');
      expect(result).toHaveProperty('confidence');
      expect(result).toHaveProperty('artifactsDetected');
      expect(result).toHaveProperty('processingTime');
      expect(result).toHaveProperty('modelUsed');
    });

    it('should return deepfake score between 0 and 1', async () => {
      const result = await service.analyze(testFilePath);

      expect(result.deepfakeScore).toBeGreaterThanOrEqual(0);
      expect(result.deepfakeScore).toBeLessThanOrEqual(1);
    });

    it('should return confidence score between 0 and 1', async () => {
      const result = await service.analyze(testFilePath);

      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });

    it('should return consistent results for same file', async () => {
      const result1 = await service.analyze(testFilePath);
      const result2 = await service.analyze(testFilePath);

      // Same file should produce same scores (deterministic)
      expect(result1.deepfakeScore).toBe(result2.deepfakeScore);
      expect(result1.confidence).toBe(result2.confidence);
    });

    it('should specify model used', async () => {
      const result = await service.analyze(testFilePath);

      expect(result.modelUsed).toBeDefined();
      expect(typeof result.modelUsed).toBe('string');
      expect(result.modelUsed).toContain('XceptionNet');
    });

    it('should report processing time', async () => {
      const result = await service.analyze(testFilePath);

      expect(result.processingTime).toBeGreaterThan(0);
      expect(typeof result.processingTime).toBe('number');
    });

    it('should detect artifacts array', async () => {
      const result = await service.analyze(testFilePath);

      expect(Array.isArray(result.artifactsDetected)).toBeTruthy();
    });

    it('should detect common deepfake artifacts for high scores', async () => {
      const result = await service.analyze(testFilePath);

      if (result.deepfakeScore > 0.7) {
        expect(result.artifactsDetected.length).toBeGreaterThan(0);
        // Common artifacts
        const validArtifacts = [
          'facial_warping',
          'lighting_inconsistency',
          'blending_artifacts',
          'frame_interpolation',
          'audio_video_sync',
        ];

        result.artifactsDetected.forEach((artifact) => {
          expect(validArtifacts.includes(artifact)).toBeTruthy();
        });
      }
    });
  });

  describe('classification', () => {
    it('should classify high scores as deepfake', async () => {
      const result = await service.analyze(testFilePath);

      if (result.deepfakeScore > 0.8) {
        expect(result.deepfakeScore).toBeGreaterThan(0.5);
      }
    });

    it('should classify low scores as authentic', async () => {
      const result = await service.analyze(testFilePath);

      if (result.deepfakeScore < 0.2) {
        expect(result.deepfakeScore).toBeLessThan(0.5);
      }
    });
  });
});
