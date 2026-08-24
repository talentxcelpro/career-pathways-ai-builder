// src/services/payment/types.ts
// Provider-Agnostic Payment Abstraction Layer for TalentXcel Claim #1

export type PaymentProviderType = 'razorpay' | 'stripe' | 'manual';

export interface PaymentOrderParams {
  listingId: string;
  entityId: string;
  bidAmount: number;
  currency: string;
  idempotencyKey: string;
  entityName?: string;
  userEmail?: string;
}

export interface PaymentOrderResult {
  orderId: string;
  amount: number;
  currency: string;
  keyId?: string;
  provider: PaymentProviderType;
  metadata?: Record<string, any>;
}

export interface PaymentVerificationParams {
  idempotencyKey: string;
  listingId: string;
  userId: string;
  bidAmount: number;
  currency: string;
  provider: PaymentProviderType;
  provider_order_id?: string;
  provider_payment_id?: string;
  provider_signature?: string;
  metadata?: Record<string, any>;
}

export interface VerifiedBidResult {
  success: boolean;
  payment_id?: string;
  bid_id?: string;
  new_rank?: number;
  old_rank?: number | null;
  bid_amount?: number;
  platform_fee?: number;
  total_charged?: number;
  currency?: string;
  is_founding_100?: boolean;
  founding_100_slot?: number | null;
  idempotent_replay?: boolean;
  error?: string;
  minimum_required?: number;
}

export interface IPaymentProvider {
  createOrder(params: PaymentOrderParams): Promise<PaymentOrderResult>;
  openCheckout(
    order: PaymentOrderResult,
    onSuccess: (paymentData: any) => Promise<void>,
    onDismiss?: () => void
  ): Promise<void>;
  verifyAndCommitBid(params: PaymentVerificationParams): Promise<VerifiedBidResult>;
}
