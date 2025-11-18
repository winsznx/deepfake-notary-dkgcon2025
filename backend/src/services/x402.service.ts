/**
 * x402 Micropayment Service (Mocked)
 * Handles payment gating for high-confidence fact-checks
 */
import { PrismaClient } from '@prisma/client';
import { config } from '../config';
import crypto from 'crypto';

const prisma = new PrismaClient();

export interface X402Invoice {
  invoiceId: string;
  amount: number;
  currency: string;
  factCheckId: string;
  paymentUrl: string;
  expiresAt: string;
}

export class X402Service {
  /**
   * Generates x402 invoice for fact-check access
   * @param factCheckId - Fact check ID
   * @param confidenceScore - Confidence score to determine pricing
   * @returns X402Invoice
   */
  async generateInvoice(factCheckId: string, confidenceScore: number): Promise<X402Invoice> {
    const amount = this.calculatePrice(confidenceScore);
    const invoiceId = `x402-${crypto.randomBytes(16).toString('hex')}`;

    await prisma.x402Payment.create({
      data: {
        factCheckId,
        amount,
        currency: 'USDC',
        payerAddress: 'pending',
        invoiceId,
        paid: false
      }
    });

    return {
      invoiceId,
      amount,
      currency: 'USDC',
      factCheckId,
      paymentUrl: `/api/x402/pay/${invoiceId}`,
      expiresAt: new Date(Date.now() + 3600000).toISOString() // 1 hour
    };
  }

  /**
   * Verifies payment (mocked)
   * @param invoiceId - Invoice ID
   * @param payerAddress - Payer's address
   * @returns Payment verified boolean
   */
  async verifyPayment(invoiceId: string, payerAddress: string): Promise<boolean> {
    const _payment = await prisma.x402Payment.findUnique({
      where: { invoiceId }
    });

    if (!_payment) {
      return false;
    }

    // Mock payment verification - always succeeds for demo
    await prisma.x402Payment.update({
      where: { invoiceId },
      data: {
        paid: true,
        payerAddress,
        paidAt: new Date()
      }
    });

    return true;
  }

  /**
   * Checks if payment is required for fact-check
   * @param confidenceScore - Confidence score
   * @returns Boolean indicating if payment required
   */
  requiresPayment(confidenceScore: number): boolean {
    return confidenceScore > 0.7;
  }

  /**
   * Calculates price based on confidence tier
   */
  private calculatePrice(confidenceScore: number): number {
    if (confidenceScore < 0.7) {
      return config.x402.pricing.low;
    } else if (confidenceScore < 0.85) {
      return config.x402.pricing.medium;
    } else {
      return config.x402.pricing.high;
    }
  }
}

export const x402Service = new X402Service();
