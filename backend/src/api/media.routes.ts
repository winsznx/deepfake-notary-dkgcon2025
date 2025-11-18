/**
 * Media upload and retrieval routes
 */
import express from 'express';
import multer from 'multer';
import { PrismaClient } from '@prisma/client';
import { deepfakeAnalysisService } from '../services/deepfake-analysis.service';

const router = express.Router();
const prisma = new PrismaClient();

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ['video/mp4', 'video/webm', 'image/jpeg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

/**
 * POST /api/media/upload
 * Upload media file and get hash
 */
router.post('/upload', upload.single('media'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Hash the media
    const sha256Hash = deepfakeAnalysisService.hashMedia(req.file.path);

    // Check if media already exists
    let media = await prisma.media.findUnique({
      where: { sha256Hash }
    });

    if (!media) {
      // Create new media record
      media = await prisma.media.create({
        data: {
          sha256Hash,
          contentUrl: req.file.path,
          mediaType: req.file.mimetype.startsWith('video') ? 'video' : 'image'
        }
      });
    }

    return res.json({
      id: media.id,
      sha256Hash: media.sha256Hash,
      mediaType: media.mediaType,
      uploadedAt: media.uploadedAt
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: 'Upload failed' });
  }
});

/**
 * GET /api/media/:id
 * Get media by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const media = await prisma.media.findUnique({
      where: { id: req.params.id },
      include: { factChecks: true }
    });

    if (!media) {
      return res.status(404).json({ error: 'Media not found' });
    }

    return res.json(media);
  } catch (error) {
    console.error('Get media error:', error);
    return res.status(500).json({ error: 'Failed to retrieve media' });
  }
});

export default router;
