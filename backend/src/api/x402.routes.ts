/**
 * x402 Micropayment API Routes
 * Handles invoice generation, payment verification, and gated content access
 */
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { x402Service } from '../services/x402.service';
import { config } from '../config';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * POST /api/x402/generate-invoice
 * Generate x402 invoice for high-confidence fact-check
 *
 * Request body:
 * {
 *   "factCheckId": "uuid"
 * }
 */
router.post('/generate-invoice', async (req, res) => {
  try {
    const { factCheckId } = req.body;

    if (!factCheckId) {
      return res.status(400).json({
        error: 'Missing factCheckId',
        success: false
      });
    }

    // Generate invoice using service
    const invoice = await x402Service.generateInvoice(factCheckId);

    return res.json({
      success: true,
      invoice
    });
  } catch (error: any) {
    console.error('❌ Invoice generation error:', error);

    if (error.message === 'Fact-check not found') {
      return res.status(404).json({
        error: error.message,
        success: false
      });
    }

    if (error.message === 'Payment not required for this confidence level') {
      return res.status(400).json({
        error: error.message,
        success: false
      });
    }

    return res.status(500).json({
      error: 'Failed to generate invoice',
      success: false
    });
  }
});

/**
 * POST /api/x402/pay/:invoiceId
 * Process payment for invoice
 *
 * Request body:
 * {
 *   "payerAddress": "0x...",
 *   "paymentProof": { ... } (optional for demo)
 * }
 */
router.post('/pay/:invoiceId', async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const { payerAddress, paymentProof } = req.body;

    if (!invoiceId) {
      return res.status(400).json({
        error: 'Missing invoiceId',
        success: false
      });
    }

    // Verify payment
    const verification = await x402Service.verifyPayment(
      invoiceId,
      payerAddress,
      paymentProof
    );

    if (!verification.valid) {
      return res.status(400).json({
        error: verification.message || 'Payment verification failed',
        success: false,
        verification
      });
    }

    return res.json({
      success: true,
      message: verification.message,
      verification
    });
  } catch (error) {
    console.error('❌ Payment error:', error);
    return res.status(500).json({
      error: 'Payment processing failed',
      success: false
    });
  }
});

/**
 * GET /api/x402/invoice/:invoiceId
 * Get invoice details
 */
router.get('/invoice/:invoiceId', async (req, res) => {
  try {
    const { invoiceId } = req.params;

    const payment = await x402Service.getPaymentByInvoice(invoiceId);

    if (!payment) {
      return res.status(404).json({
        error: 'Invoice not found',
        success: false
      });
    }

    return res.json({
      success: true,
      invoice: {
        invoiceId: payment.invoiceId,
        factCheckId: payment.factCheckId,
        amount: payment.amount,
        currency: payment.currency,
        paid: payment.paid,
        paidAt: payment.paidAt,
        expiresAt: payment.expiresAt,
        payTo: config.x402.walletAddress,
        network: config.x402.network
      }
    });
  } catch (error) {
    console.error('❌ Invoice retrieval error:', error);
    return res.status(500).json({
      error: 'Failed to retrieve invoice',
      success: false
    });
  }
});

/**
 * GET /api/x402/high-confidence/:factCheckId
 * Get high-confidence fact-check (requires paid invoice)
 *
 * Query params:
 * ?invoiceId=x402-...
 */
router.get('/high-confidence/:factCheckId', async (req, res) => {
  try {
    const { factCheckId } = req.params;
    const { invoiceId } = req.query;

    // Check if x402 is enabled
    if (!config.x402.enabled) {
      // If x402 is disabled, allow free access
      const factCheck = await prisma.factCheck.findUnique({
        where: { id: factCheckId },
        include: {
          guardian: true,
          media: true,
          stakes: true,
          consensus: true
        }
      });

      if (!factCheck) {
        return res.status(404).json({
          error: 'Fact-check not found',
          success: false
        });
      }

      return res.json({
        success: true,
        factCheck
      });
    }

    // x402 is enabled - require payment
    if (!invoiceId) {
      return res.status(402).json({
        error: 'Payment required',
        message: 'This high-confidence fact-check requires payment. Please generate an invoice first.',
        success: false
      });
    }

    // Verify invoice is paid
    const isPaid = await x402Service.isInvoicePaid(invoiceId as string);

    if (!isPaid) {
      return res.status(402).json({
        error: 'Payment not verified',
        message: 'Please complete payment before accessing this content.',
        success: false
      });
    }

    // Verify invoice is for this fact-check
    const payment = await x402Service.getPaymentByInvoice(invoiceId as string);

    if (!payment || payment.factCheckId !== factCheckId) {
      return res.status(403).json({
        error: 'Invoice mismatch',
        message: 'This invoice is not valid for the requested fact-check.',
        success: false
      });
    }

    // Get fact-check with all details
    const factCheck = await prisma.factCheck.findUnique({
      where: { id: factCheckId },
      include: {
        guardian: true,
        media: true,
        stakes: true,
        consensus: {
          include: {
            votes: {
              include: {
                guardian: true
              }
            }
          }
        }
      }
    });

    if (!factCheck) {
      return res.status(404).json({
        error: 'Fact-check not found',
        success: false
      });
    }

    // Log access for revenue distribution
    console.log('💰 High-confidence fact-check accessed:', {
      factCheckId,
      invoiceId,
      payerAddress: payment.payerAddress,
      amount: payment.amount
    });

    return res.json({
      success: true,
      factCheck,
      payment: {
        invoiceId: payment.invoiceId,
        amount: payment.amount,
        paidAt: payment.paidAt
      }
    });
  } catch (error) {
    console.error('❌ High-confidence retrieval error:', error);
    return res.status(500).json({
      error: 'Failed to retrieve fact-check',
      success: false
    });
  }
});

/**
 * GET /api/x402/revenue/:invoiceId
 * Get revenue distribution for a paid invoice
 */
router.get('/revenue/:invoiceId', async (req, res) => {
  try {
    const { invoiceId } = req.params;

    const distribution = await x402Service.getRevenueDistribution(invoiceId);

    if (!distribution) {
      return res.status(404).json({
        error: 'No revenue data found for this invoice',
        success: false
      });
    }

    return res.json({
      success: true,
      distribution
    });
  } catch (error) {
    console.error('❌ Revenue distribution error:', error);
    return res.status(500).json({
      error: 'Failed to retrieve revenue distribution',
      success: false
    });
  }
});

/**
 * GET /api/x402/config
 * Get x402 configuration (for frontend)
 */
router.get('/config', (_req, res) => {
  return res.json({
    success: true,
    config: {
      enabled: config.x402.enabled,
      network: config.x402.network,
      walletAddress: config.x402.walletAddress,
      pricing: config.x402.pricing,
      thresholds: config.x402.thresholds
    }
  });
});

export default router;
