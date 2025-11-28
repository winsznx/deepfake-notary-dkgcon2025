/**
 * Test Script: Publish Knowledge Asset to DKG
 * Generates a real UAL on NeuroWeb testnet
 */
import { dkgService, KnowledgeAsset } from '../services/dkg.service';
import dotenv from 'dotenv';

dotenv.config();

async function publishTestAsset() {
  console.log('🚀 Publishing Test Knowledge Asset to OriginTrail DKG');
  console.log('=' .repeat(60));
  console.log('');

  // Create a test Knowledge Asset following Schema.org MediaReview
  const testAsset: KnowledgeAsset = {
    '@context': 'https://schema.org',
    '@type': 'MediaReview',
    identifier: 'test-deepfake-' + Date.now(),
    mediaItem: {
      '@type': 'VideoObject',
      contentUrl: 'https://example.com/test-video.mp4',
      sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      uploadedAt: new Date().toISOString(),
    },
    claimReviewed: 'Test media exhibits deepfake characteristics for demonstration purposes',
    reviewRating: {
      '@type': 'Rating',
      ratingValue: 0.85,
      bestRating: 1,
      worstRating: 0,
      confidenceScore: 0.92,
      consensusWeight: 250,
    },
    provenance: {
      detectionModel: 'XceptionNet-v2.1',
      modelVersion: '2024.11',
      analyzedAt: new Date().toISOString(),
      processingTime: '5.2',
      artifactsDetected: [
        'facial_warping',
        'lighting_inconsistency',
        'blending_artifacts',
      ],
    },
    author: {
      '@type': 'Person',
      identifier: 'guardian:test:hackathon',
      reputationScore: 0.85,
      verificationCount: 1,
      accuracyRate: 0.9,
    },
    stake: {
      amount: '100',
      currency: 'TRAC',
      locked: true,
      unlockCondition: 'consensus_resolution',
    },
  };

  console.log('📋 Test Knowledge Asset:');
  console.log(JSON.stringify(testAsset, null, 2));
  console.log('');

  try {
    console.log('⏳ Publishing to DKG (this may take 1-2 minutes)...');
    console.log('💡 Note: This requires TRAC tokens on NeuroWeb testnet');
    console.log('');

    const ual = await dkgService.publish(testAsset);

    console.log('');
    console.log('✅ SUCCESS! Knowledge Asset published to DKG');
    console.log('=' .repeat(60));
    console.log('');
    console.log('🔗 Universal Asset Locator (UAL):');
    console.log(ual);
    console.log('');
    console.log('🌐 View on OriginTrail DKG Explorer:');
    console.log(`https://dkg.origintrail.io/explore?ual=${ual}`);
    console.log('');
    console.log('🔍 Query with SPARQL:');
    console.log('PREFIX schema: <https://schema.org/>');
    console.log('SELECT * WHERE {');
    console.log(`  <${ual}> ?predicate ?object .`);
    console.log('}');
    console.log('');

    // Try to query the asset
    console.log('⏳ Querying published asset...');
    const queryResult = await dkgService.query(`
      PREFIX schema: <https://schema.org/>
      SELECT ?score ?confidence
      WHERE {
        <${ual}> schema:reviewRating ?rating .
        ?rating schema:ratingValue ?score ;
                schema:confidenceScore ?confidence .
      }
    `);

    if (queryResult && queryResult.length > 0) {
      console.log('✅ Query successful! Asset is retrievable from DKG');
      console.log('📊 Results:', JSON.stringify(queryResult, null, 2));
    } else {
      console.log('⏳ Asset published but not yet indexed (normal, try again in 1-2 minutes)');
    }

    console.log('');
    console.log('🎉 Test Complete!');
    console.log('');
    console.log('💾 Save this UAL for your hackathon demo:');
    console.log(ual);

    process.exit(0);
  } catch (error: any) {
    console.error('');
    console.error('❌ Failed to publish Knowledge Asset');
    console.error('');

    if (error.message.includes('insufficient funds')) {
      console.error('💰 Insufficient TRAC tokens in wallet');
      console.error('');
      console.error('📝 To fix:');
      console.error('1. Get testnet TRAC tokens from NeuroWeb faucet');
      console.error('2. Or update DKG_PRIVATE_KEY in .env with a funded wallet');
      console.error('');
      console.error('🔗 NeuroWeb Faucet (if available):');
      console.error('   https://faucet.neuroweb.ai/');
      console.error('');
      console.error('💡 Alternative: Use mocked DKG mode for demo');
      console.error('   Set DKG_MOCK=true in .env');
    } else if (error.message.includes('timeout')) {
      console.error('⏱️  DKG node timeout');
      console.error('');
      console.error('📝 To fix:');
      console.error('1. Check DKG node is online: ' + process.env.DKG_NODE_ENDPOINT);
      console.error('2. Try again (network may be congested)');
      console.error('3. Or use local DKG node');
    } else {
      console.error('Error details:', error.message);
      console.error('');
      console.error('Full error:');
      console.error(error);
    }

    console.error('');
    console.error('📚 For more info, see:');
    console.error('   - OriginTrail Docs: https://docs.origintrail.io');
    console.error('   - DKG SDK: https://github.com/OriginTrail/dkg.js');
    console.error('');

    process.exit(1);
  }
}

// Run the script
publishTestAsset();
