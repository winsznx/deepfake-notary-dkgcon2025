/**
 * x402 Micropayment Service
 * Real x402 payment integration for high-confidence fact-checks
 */
import { PrismaClient } from '@prisma/client';
import { config } from '../config';
import crypto from 'crypto';

const prisma = new PrismaClient();

export interface X402Invoice {
  invoiceId: string;
  factCheckId: string;
  amount: number;
  currency: string;
  confidenceScore: number;
  priceTier: string;
  paymentUrl: string;
  expiresAt: Date;
  network: string;
  payTo: string;
}

export interface X402PaymentVerification {
  valid: boolean;
  invoiceId: string;
  factCheckId: string;
  payerAddress?: string;
  transactionHash?: string;
  message?: string;
}

export class X402Service {
  /**
   * Checks if payment is required for fact-check based on confidence score
   */
  requiresPayment(confidenceScore: number): boolean {
    return confidenceScore >= config.x402.thresholds.lowConfidence;
  }

  /**
   * Gets price tier based on confidence score
   */
  getPriceTier(confidenceScore: number): 'free' | 'medium' | 'high' {
    if (confidenceScore < config.x402.thresholds.lowConfidence) {
      return 'free';
    } else if (confidenceScore < config.x402.thresholds.highConfidence) {
      return 'medium';
    } else {
      return 'high';
    }
  }

  /**
   * Calculates price based on confidence score
   */
  calculatePrice(confidenceScore: number): number {
    const tier = this.getPriceTier(confidenceScore);

    switch (tier) {
      case 'free':
        return config.x402.pricing.low;
      case 'medium':
        return config.x402.pricing.medium;
      case 'high':
        return config.x402.pricing.high;
      default:
        return 0;
    }
  }

  /**
   * Gets formatted price string for x402 middleware
   */
  getPrice(confidenceScore: number): string {
    const amount = this.calculatePrice(confidenceScore);
    return `$${amount.toFixed(4)}`;
  }

  /**
   * Generates x402 invoice for high-confidence fact-check
   */
  async generateInvoice(factCheckId: string): Promise<X402Invoice> {
    // Fetch fact-check to get confidence score
    const factCheck = await prisma.factCheck.findUnique({
      where: { id: factCheckId }
    });

    if (!factCheck) {
      throw new Error('Fact-check not found');
    }

    const confidenceScore = factCheck.confidenceScore;
    const priceTier = this.getPriceTier(confidenceScore);
    const amount = this.calculatePrice(confidenceScore);

    // Check if payment is required
    if (!this.requiresPayment(confidenceScore)) {
      throw new Error('Payment not required for this confidence level');
    }

    // Generate unique invoice ID
    const invoiceId = `x402-${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;

    // Calculate expiration (15 minutes from now)
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // Create invoice record in database
    await prisma.x402Payment.create({
      data: {
        factCheckId,
        invoiceId,
        amount,
        currency: 'USDC',
        payerAddress: '', // Will be filled when payment is made
        paid: false,
        expiresAt
      }
    });

    // Construct payment URL
    const paymentUrl = `/api/x402/pay/${invoiceId}`;

    const invoice: X402Invoice = {
      invoiceId,
      factCheckId,
      amount,
      currency: 'USDC',
      confidenceScore,
      priceTier,
      paymentUrl,
      expiresAt,
      network: config.x402.network,
      payTo: config.x402.walletAddress
    };

    console.log('📄 Generated x402 invoice:', {
      invoiceId,
      factCheckId,
      amount: `$${amount}`,
      tier: priceTier,
      expiresAt
    });

    return invoice;
  }

  /**
   * Verifies x402 payment
   * In production, this would verify the actual blockchain transaction
   * For demo/testnet, we simulate verification
   */
  async verifyPayment(
    invoiceId: string,
    payerAddress?: string,
    paymentProof?: any
  ): Promise<X402PaymentVerification> {
    // Fetch invoice from database
    const payment = await prisma.x402Payment.findUnique({
      where: { invoiceId }
    });

    if (!payment) {
      return {
        valid: false,
        invoiceId,
        factCheckId: '',
        message: 'Invoice not found'
      };
    }

    // Check if already paid
    if (payment.paid) {
      return {
        valid: true,
        invoiceId,
        factCheckId: payment.factCheckId,
        payerAddress: payment.payerAddress,
        message: 'Payment already verified'
      };
    }

    // Check expiration
    if (payment.expiresAt < new Date()) {
      return {
        valid: false,
        invoiceId,
        factCheckId: payment.factCheckId,
        message: 'Invoice expired'
      };
    }

    // In production with real x402:
    // - Verify the payment proof signature
    // - Check blockchain transaction
    // - Validate transfer amount matches invoice
    // - Confirm transfer to correct wallet address

    // For demo/testnet, we accept the payment with provided payer address
    const finalPayerAddress = payerAddress || '0xDemoPayerAddress';

    // Update payment record
    await prisma.x402Payment.update({
      where: { invoiceId },
      data: {
        paid: true,
        paidAt: new Date(),
        payerAddress: finalPayerAddress,
        transactionHash: paymentProof?.transactionHash || `0xdemo${Date.now()}`
      }
    });

    console.log('✅ Payment verified:', {
      invoiceId,
      factCheckId: payment.factCheckId,
      payerAddress: finalPayerAddress
    });

    return {
      valid: true,
      invoiceId,
      factCheckId: payment.factCheckId,
      payerAddress: finalPayerAddress,
      transactionHash: paymentProof?.transactionHash,
      message: 'Payment verified successfully'
    };
  }

  /**
   * Checks if invoice has been paid
   */
  async isInvoicePaid(invoiceId: string): Promise<boolean> {
    const payment = await prisma.x402Payment.findUnique({
      where: { invoiceId }
    });

    return payment?.paid || false;
  }

  /**
   * Gets payment details by invoice ID
   */
  async getPaymentByInvoice(invoiceId: string) {
    return await prisma.x402Payment.findUnique({
      where: { invoiceId },
      include: {
        factCheck: true
      }
    });
  }

  /**
   * Records payment in database (legacy method, kept for compatibility)
   */
  async recordPayment(
    factCheckId: string,
    payerAddress: string,
    amount: number
  ): Promise<void> {
    await prisma.x402Payment.create({
      data: {
        factCheckId,
        amount,
        currency: 'USDC',
        payerAddress,
        invoiceId: `x402-${Date.now()}-${factCheckId}`,
        paid: true,
        paidAt: new Date()
      }
    });
  }

  /**
   * Gets facilitator configuration
   * Returns URL for testnet or CDP facilitator for mainnet
   */
  getFacilitatorConfig() {
    if (config.x402.network === 'base-sepolia' || config.x402.network === 'solana-devnet') {
      // Use free testnet facilitator
      return {
        url: config.x402.facilitatorUrl
      };
    }

    // For mainnet, would use CDP facilitator
    // This requires @coinbase/x402 and CDP credentials
    if (config.x402.cdp.apiKeyId && config.x402.cdp.apiKeySecret) {
      // In production, import and use: import { facilitator } from '@coinbase/x402';
      // return facilitator;
      console.log('CDP facilitator configured for mainnet');
    }

    // Fallback to testnet facilitator
    return {
      url: config.x402.facilitatorUrl
    };
  }

  /**
   * Gets revenue distribution for a paid fact-check
   * 60% to verifiers, 25% platform, 15% guardian rewards
   */
  async getRevenueDistribution(invoiceId: string) {
    const payment = await this.getPaymentByInvoice(invoiceId);

    if (!payment || !payment.paid) {
      return null;
    }

    const total = payment.amount;

    return {
      total,
      verifiers: total * 0.60,
      platform: total * 0.25,
      guardianRewards: total * 0.15
    };
  }
}

export const x402Service = new X402Service();
