/**
 * x402 micropayment routes
 */
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { x402Service } from '../services/x402.service';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * POST /api/x402/generate-invoice
 * Generate x402 invoice for high-confidence fact-check
 */
router.post('/generate-invoice', async (req, res) => {
  try {
    const { factCheckId } = req.body;

    if (!factCheckId) {
      return res.status(400).json({ error: 'Missing factCheckId' });
    }

    const factCheck = await prisma.factCheck.findUnique({
      where: { id: factCheckId },
      include: { consensus: true }
    });

    if (!factCheck) {
      return res.status(404).json({ error: 'Fact-check not found' });
    }

    const confidenceScore = factCheck.consensus?.agreementRate || factCheck.confidenceScore;

    const invoice = await x402Service.generateInvoice(factCheckId, confidenceScore);

    return res.json(invoice);
  } catch (error) {
    console.error('Invoice generation error:', error);
    return res.status(500).json({ error: 'Failed to generate invoice' });
  }
});

/**
 * POST /api/x402/pay/:invoiceId
 * Mock payment for invoice
 */
router.post('/pay/:invoiceId', async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const { payerAddress } = req.body;

    if (!payerAddress) {
      return res.status(400).json({ error: 'Missing payerAddress' });
    }

    const verified = await x402Service.verifyPayment(invoiceId, payerAddress);

    if (!verified) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    return res.json({ success: true, message: 'Payment verified' });
  } catch (error) {
    console.error('Payment error:', error);
    return res.status(500).json({ error: 'Payment failed' });
  }
});

/**
 * GET /api/x402/high-confidence/:factCheckId
 * Get high-confidence fact-check (requires payment)
 */
router.get('/high-confidence/:factCheckId', async (req, res) => {
  try {
    const { factCheckId } = req.params;
    const { invoiceId } = req.query;

    if (!invoiceId) {
      return res.status(402).json({ error: 'Payment required' });
    }

    // Verify payment
    const payment = await prisma.x402Payment.findUnique({
      where: { invoiceId: invoiceId as string }
    });

    if (!payment || !payment.paid) {
      return res.status(402).json({ error: 'Payment not verified' });
    }

    // Get fact-check with all details
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
      return res.status(404).json({ error: 'Fact-check not found' });
    }

    return res.json(factCheck);
  } catch (error) {
    console.error('High-confidence retrieval error:', error);
    return res.status(500).json({ error: 'Failed to retrieve fact-check' });
  }
});

export default router;
