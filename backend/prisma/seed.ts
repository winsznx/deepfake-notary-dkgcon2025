/**
 * Database Seed Script
 * Populates the database with sample data for demo purposes
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  console.log('Clearing existing data...');
  await prisma.consensusVote.deleteMany();
  await prisma.consensus.deleteMany();
  await prisma.stake.deleteMany();
  await prisma.x402Payment.deleteMany();
  await prisma.factCheck.deleteMany();
  await prisma.media.deleteMany();
  await prisma.guardian.deleteMany();

  // Create Guardians
  console.log('Creating Guardians...');
  const guardians = await Promise.all([
    prisma.guardian.create({
      data: {
        guardianId: 'guardian:actor:alice',
        reputationScore: 0.92,
        totalStake: 450.0,
        verificationCount: 47,
        accuracyRate: 0.94,
      },
    }),
    prisma.guardian.create({
      data: {
        guardianId: 'guardian:actor:bob',
        reputationScore: 0.78,
        totalStake: 280.0,
        verificationCount: 23,
        accuracyRate: 0.82,
      },
    }),
    prisma.guardian.create({
      data: {
        guardianId: 'guardian:actor:charlie',
        reputationScore: 0.85,
        totalStake: 375.0,
        verificationCount: 31,
        accuracyRate: 0.89,
      },
    }),
    prisma.guardian.create({
      data: {
        guardianId: 'guardian:actor:diana',
        reputationScore: 0.91,
        totalStake: 520.0,
        verificationCount: 52,
        accuracyRate: 0.93,
      },
    }),
    prisma.guardian.create({
      data: {
        guardianId: 'guardian:actor:eve',
        reputationScore: 0.65,
        totalStake: 125.0,
        verificationCount: 12,
        accuracyRate: 0.71,
      },
    }),
  ]);

  console.log(`✓ Created ${guardians.length} guardians`);

  // Create Media items
  console.log('Creating Media items...');
  const mediaItems = await Promise.all([
    prisma.media.create({
      data: {
        sha256Hash: '0xa7f5d8c2b1e4f9a8c3d6e7b2f1a9c8d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0',
        contentUrl: '/uploads/video_political_speech.mp4',
        mediaType: 'video',
      },
    }),
    prisma.media.create({
      data: {
        sha256Hash: '0xb8e6c9d3a2f5e0b9d4c7f8e3b2a0d9e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1',
        contentUrl: '/uploads/image_celebrity_photo.jpg',
        mediaType: 'image',
      },
    }),
    prisma.media.create({
      data: {
        sha256Hash: '0xc9f7d0e4b3a6f1c0e5d8f9b4c3a1e0f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2',
        contentUrl: '/uploads/video_news_report.mp4',
        mediaType: 'video',
      },
    }),
    prisma.media.create({
      data: {
        sha256Hash: '0xd0e8f1c5b4a7f2d1e6f9c0b5d4a2f1e7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3',
        contentUrl: '/uploads/image_social_media_post.png',
        mediaType: 'image',
      },
    }),
  ]);

  console.log(`✓ Created ${mediaItems.length} media items`);

  // Create FactChecks
  console.log('Creating FactChecks...');
  const factChecks = await Promise.all([
    // Media 1: Political Speech - Multiple fact-checks (high confidence, authentic)
    prisma.factCheck.create({
      data: {
        mediaId: mediaItems[0].id,
        guardianId: guardians[0].id,
        dkgAssetId: 'did:dkg:otp/2043:31337/0xa7f5d8c2b1e4f9a8c3d6e7b2f1a9c8d4e5f6a7b8/123456789',
        claimReviewed: 'Video exhibits authentic characteristics with no manipulation artifacts detected',
        deepfakeScore: 0.08,
        confidenceScore: 0.94,
        consensusWeight: 0.0,
        modelUsed: 'XceptionNet-v2.1',
        artifactsDetected: '[]',
        processingTime: 3.7,
        publishedToDkg: true,
      },
    }),
    prisma.factCheck.create({
      data: {
        mediaId: mediaItems[0].id,
        guardianId: guardians[2].id,
        dkgAssetId: 'did:dkg:otp/2043:31337/0xa7f5d8c2b1e4f9a8c3d6e7b2f1a9c8d4e5f6a7b8/123456790',
        claimReviewed: 'Video appears authentic based on temporal and spatial consistency analysis',
        deepfakeScore: 0.11,
        confidenceScore: 0.89,
        consensusWeight: 0.0,
        modelUsed: 'EfficientNet-B4',
        artifactsDetected: '[]',
        processingTime: 4.2,
        publishedToDkg: true,
      },
    }),
    prisma.factCheck.create({
      data: {
        mediaId: mediaItems[0].id,
        guardianId: guardians[3].id,
        dkgAssetId: 'did:dkg:otp/2043:31337/0xa7f5d8c2b1e4f9a8c3d6e7b2f1a9c8d4e5f6a7b8/123456791',
        claimReviewed: 'No deepfake indicators found in facial movements or audio synchronization',
        deepfakeScore: 0.06,
        confidenceScore: 0.96,
        consensusWeight: 0.0,
        modelUsed: 'XceptionNet-v2.1',
        artifactsDetected: '[]',
        processingTime: 3.9,
        publishedToDkg: true,
      },
    }),

    // Media 2: Celebrity Photo - Deepfake detected (high confidence)
    prisma.factCheck.create({
      data: {
        mediaId: mediaItems[1].id,
        guardianId: guardians[1].id,
        dkgAssetId: 'did:dkg:otp/2043:31337/0xb8e6c9d3a2f5e0b9d4c7f8e3b2a0d9e5f6a7b8c9/123456792',
        claimReviewed: 'Image shows clear signs of deepfake manipulation with facial artifacts',
        deepfakeScore: 0.87,
        confidenceScore: 0.91,
        consensusWeight: 0.0,
        modelUsed: 'XceptionNet-v2.1',
        artifactsDetected: '["facial_boundary_inconsistency", "lighting_anomaly", "pixel_artifacts"]',
        processingTime: 2.1,
        publishedToDkg: true,
      },
    }),
    prisma.factCheck.create({
      data: {
        mediaId: mediaItems[1].id,
        guardianId: guardians[3].id,
        dkgAssetId: 'did:dkg:otp/2043:31337/0xb8e6c9d3a2f5e0b9d4c7f8e3b2a0d9e5f6a7b8c9/123456793',
        claimReviewed: 'Detected face-swap manipulation with GAN-based synthesis artifacts',
        deepfakeScore: 0.92,
        confidenceScore: 0.93,
        consensusWeight: 0.0,
        modelUsed: 'EfficientNet-B4',
        artifactsDetected: '["facial_boundary_inconsistency", "compression_artifacts", "color_profile_mismatch"]',
        processingTime: 2.4,
        publishedToDkg: true,
      },
    }),

    // Media 3: News Report - Medium confidence (borderline)
    prisma.factCheck.create({
      data: {
        mediaId: mediaItems[2].id,
        guardianId: guardians[0].id,
        dkgAssetId: 'did:dkg:otp/2043:31337/0xc9f7d0e4b3a6f1c0e5d8f9b4c3a1e0f6a7b8c9d0/123456794',
        claimReviewed: 'Video exhibits some compression artifacts but likely authentic',
        deepfakeScore: 0.32,
        confidenceScore: 0.76,
        consensusWeight: 0.0,
        modelUsed: 'XceptionNet-v2.1',
        artifactsDetected: '["compression_artifacts"]',
        processingTime: 5.1,
        publishedToDkg: true,
      },
    }),
    prisma.factCheck.create({
      data: {
        mediaId: mediaItems[2].id,
        guardianId: guardians[4].id,
        dkgAssetId: 'did:dkg:otp/2043:31337/0xc9f7d0e4b3a6f1c0e5d8f9b4c3a1e0f6a7b8c9d0/123456795',
        claimReviewed: 'Borderline case with minor inconsistencies detected',
        deepfakeScore: 0.48,
        confidenceScore: 0.72,
        consensusWeight: 0.0,
        modelUsed: 'XceptionNet-v2.1',
        artifactsDetected: '["compression_artifacts", "minor_temporal_inconsistency"]',
        processingTime: 4.8,
        publishedToDkg: true,
      },
    }),

    // Media 4: Social Media Post - Low confidence (authentic but poor quality)
    prisma.factCheck.create({
      data: {
        mediaId: mediaItems[3].id,
        guardianId: guardians[2].id,
        dkgAssetId: 'did:dkg:otp/2043:31337/0xd0e8f1c5b4a7f2d1e6f9c0b5d4a2f1e7a8b9c0d1/123456796',
        claimReviewed: 'Image appears authentic despite low resolution',
        deepfakeScore: 0.15,
        confidenceScore: 0.68,
        consensusWeight: 0.0,
        modelUsed: 'EfficientNet-B4',
        artifactsDetected: '[]',
        processingTime: 1.6,
        publishedToDkg: true,
      },
    }),
  ]);

  console.log(`✓ Created ${factChecks.length} fact-checks`);

  // Create Stakes
  console.log('Creating Stakes...');
  const stakes = await Promise.all([
    // Stakes on Media 1 (political speech - authentic)
    prisma.stake.create({
      data: {
        factCheckId: factChecks[0].id,
        guardianId: guardians[0].id,
        amount: 100.0,
        locked: true,
      },
    }),
    prisma.stake.create({
      data: {
        factCheckId: factChecks[1].id,
        guardianId: guardians[2].id,
        amount: 75.0,
        locked: true,
      },
    }),
    prisma.stake.create({
      data: {
        factCheckId: factChecks[2].id,
        guardianId: guardians[3].id,
        amount: 150.0,
        locked: true,
      },
    }),

    // Stakes on Media 2 (celebrity photo - deepfake)
    prisma.stake.create({
      data: {
        factCheckId: factChecks[3].id,
        guardianId: guardians[1].id,
        amount: 80.0,
        locked: true,
      },
    }),
    prisma.stake.create({
      data: {
        factCheckId: factChecks[4].id,
        guardianId: guardians[3].id,
        amount: 120.0,
        locked: true,
      },
    }),

    // Stakes on Media 3 (news report - borderline)
    prisma.stake.create({
      data: {
        factCheckId: factChecks[5].id,
        guardianId: guardians[0].id,
        amount: 50.0,
        locked: true,
      },
    }),
    prisma.stake.create({
      data: {
        factCheckId: factChecks[6].id,
        guardianId: guardians[4].id,
        amount: 25.0,
        locked: true,
      },
    }),
  ]);

  console.log(`✓ Created ${stakes.length} stakes`);

  // Create Consensus for Media 1 (resolved - authentic)
  console.log('Creating Consensus results...');
  const consensus1 = await prisma.consensus.create({
    data: {
      factCheckId: factChecks[0].id,
      totalStake: 325.0,
      participantCount: 3,
      agreementRate: 0.97,
      majorityVerdict: 'real',
      resolved: true,
    },
  });

  // Create Consensus votes for Media 1
  await Promise.all([
    prisma.consensusVote.create({
      data: {
        consensusId: consensus1.id,
        guardianId: guardians[0].id,
        vote: 'real',
        confidence: 0.94,
        weight: 100.0 * Math.sqrt(0.92),
      },
    }),
    prisma.consensusVote.create({
      data: {
        consensusId: consensus1.id,
        guardianId: guardians[2].id,
        vote: 'real',
        confidence: 0.89,
        weight: 75.0 * Math.sqrt(0.85),
      },
    }),
    prisma.consensusVote.create({
      data: {
        consensusId: consensus1.id,
        guardianId: guardians[3].id,
        vote: 'real',
        confidence: 0.96,
        weight: 150.0 * Math.sqrt(0.91),
      },
    }),
  ]);

  // Create Consensus for Media 2 (resolved - deepfake)
  const consensus2 = await prisma.consensus.create({
    data: {
      factCheckId: factChecks[3].id,
      totalStake: 200.0,
      participantCount: 2,
      agreementRate: 1.0,
      majorityVerdict: 'fake',
      resolved: true,
    },
  });

  // Create Consensus votes for Media 2
  await Promise.all([
    prisma.consensusVote.create({
      data: {
        consensusId: consensus2.id,
        guardianId: guardians[1].id,
        vote: 'deepfake',
        confidence: 0.91,
        weight: 80.0 * Math.sqrt(0.78),
      },
    }),
    prisma.consensusVote.create({
      data: {
        consensusId: consensus2.id,
        guardianId: guardians[3].id,
        vote: 'deepfake',
        confidence: 0.93,
        weight: 120.0 * Math.sqrt(0.91),
      },
    }),
  ]);

  console.log('✓ Created consensus results with votes');

  // Create x402 Payments
  console.log('Creating x402 payment records...');
  const payments = await Promise.all([
    prisma.x402Payment.create({
      data: {
        invoiceId: 'x402-inv-2025-001',
        factCheckId: factChecks[0].id,
        amount: 0.0003,
        currency: 'USDC',
        payerAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1',
        paid: true,
      },
    }),
    prisma.x402Payment.create({
      data: {
        invoiceId: 'x402-inv-2025-002',
        factCheckId: factChecks[4].id,
        amount: 0.0003,
        currency: 'USDC',
        payerAddress: '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
        paid: true,
      },
    }),
    prisma.x402Payment.create({
      data: {
        invoiceId: 'x402-inv-2025-003',
        factCheckId: factChecks[5].id,
        amount: 0.0001,
        currency: 'USDC',
        payerAddress: '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed',
        paid: true,
      },
    }),
  ]);

  console.log(`✓ Created ${payments.length} x402 payment records`);

  // Summary
  console.log('\n✅ Database seed completed successfully!');
  console.log('\nSummary:');
  console.log(`  - Guardians: ${guardians.length}`);
  console.log(`  - Media items: ${mediaItems.length}`);
  console.log(`  - Fact-checks: ${factChecks.length}`);
  console.log(`  - Stakes: ${stakes.length}`);
  console.log(`  - Consensus results: 2`);
  console.log(`  - Consensus votes: 5`);
  console.log(`  - x402 Payments: ${payments.length}`);
  console.log('\n🎉 Ready to demo!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
