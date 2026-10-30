// src/services/payment/razorpayProvider.ts
// Razorpay implementation of IPaymentProvider for TalentXcel Claim #1
// Remediated per Task 002: Server-side cryptographic HMAC-SHA256 verification (SEC-002).

import { supabase } from '@/integrations/supabase/client';
import type {
  IPaymentProvider,
  PaymentOrderParams,
  PaymentOrderResult,
  PaymentVerificationParams,
  VerifiedBidResult,
} from './types';

declare global {
  interface Window {
    Razorpay?: any;
  }
}

/** Dynamically loads the Razorpay checkout script if not present */
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false);
    if (window.Razorpay) return resolve(true);

    let finished = false;
    const timeout = setTimeout(() => {
      if (!finished) {
        finished = true;
        resolve(false);
      }
    }, 6000);

    const onDone = (ok: boolean) => {
      if (!finished) {
        finished = true;
        clearTimeout(timeout);
        resolve(ok);
      }
    };

    const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => onDone(true));
      existingScript.addEventListener('error', () => onDone(false));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => onDone(true);
    script.onerror = () => onDone(false);
    document.body.appendChild(script);
  });
}

export class RazorpayPaymentProvider implements IPaymentProvider {
  async createOrder(params: PaymentOrderParams): Promise<PaymentOrderResult> {
    try {
      // Call Supabase Razorpay create order edge function
      const { data, error } = await supabase.functions.invoke('razorpay-create-order', {
        body: {
          amount: params.bidAmount,
          currency: params.currency || 'INR',
          serviceId: params.listingId,
          packageType: 'Claim1Bid',
          planId: 'claim1_bid',
        },
      });

      if (error) {
        console.warn('Edge function order creation fallback to local checkout order:', error);
      }

      const orderId = data?.orderId || `order_${params.idempotencyKey.slice(0, 16)}`;
      const keyId = data?.keyId || (import.meta as any).env?.VITE_RAZORPAY_KEY_ID || 'rzp_live_default';

      return {
        orderId,
        amount: params.bidAmount,
        currency: params.currency || 'INR',
        keyId,
        provider: 'razorpay',
        metadata: {
          listingId: params.listingId,
          entityId: params.entityId,
          entityName: params.entityName,
          userEmail: params.userEmail,
        },
      };
    } catch (err: any) {
      console.error('Failed to create Razorpay order:', err);
      return {
        orderId: `order_${params.idempotencyKey.slice(0, 16)}`,
        amount: params.bidAmount,
        currency: params.currency || 'INR',
        keyId: (import.meta as any).env?.VITE_RAZORPAY_KEY_ID || 'rzp_live_default',
        provider: 'razorpay',
      };
    }
  }

  async openCheckout(
    order: PaymentOrderResult,
    onSuccess: (paymentData: any) => Promise<void>,
    onDismiss?: () => void
  ): Promise<void> {
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded || !window.Razorpay) {
      throw new Error('Razorpay SDK failed to load. Please check your network connection.');
    }

    return new Promise((resolve, reject) => {
      const options = {
        key: order.keyId,
        amount: Math.round(order.amount * 100), // in paise
        currency: order.currency || 'INR',
        name: 'TalentXcel Claim #1',
        description: `Bid for ${order.metadata?.entityName || 'Position'} Leaderboard Ranking`,
        order_id: order.orderId.startsWith('demo_') ? undefined : order.orderId,
        prefill: {
          email: order.metadata?.userEmail || '',
        },
        theme: {
          color: '#007AFF', // TalentXcel Primary Apple Blue
        },
        modal: {
          ondismiss: () => {
            if (onDismiss) onDismiss();
            resolve();
          },
        },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id?: string;
          razorpay_signature?: string;
        }) => {
          try {
            await onSuccess(response);
            resolve();
          } catch (err) {
            reject(err);
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response: any) => {
        reject(new Error(response?.error?.description || 'Payment was declined.'));
      });
      rzp.open();
    });
  }

  async verifyAndCommitBid(params: PaymentVerificationParams): Promise<VerifiedBidResult> {
    // SEC-002: Direct client execution of claim1_process_verified_bid is revoked.
    // Payment is cryptographically verified on server via razorpay-verify-payment Edge Function.
    const { data, error } = await supabase.functions.invoke('razorpay-verify-payment', {
      body: {
        mode: 'claim1_bid',
        packageType: 'Claim1Bid',
        razorpay_order_id: params.provider_order_id,
        razorpay_payment_id: params.provider_payment_id,
        razorpay_signature: params.provider_signature,
        listingId: params.listingId,
        idempotencyKey: params.idempotencyKey,
        bidAmount: params.bidAmount,
        currency: params.currency || 'INR',
        metadata: params.metadata || {},
      },
    });

    if (error || !data?.success) {
      throw new Error(data?.error || error?.message || 'Server payment verification failed.');
    }

    return data.data as VerifiedBidResult;
  }
}

export const razorpayProvider = new RazorpayPaymentProvider();
