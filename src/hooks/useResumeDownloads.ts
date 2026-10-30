import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Simple gating: first download is free; after that, integrate one-off purchase if price > 0
export const useResumeDownloads = (oneOffPriceInr: number = 0) => {
  const { toast } = useToast();
  const [processing, setProcessing] = useState(false);

  const getDownloadCount = useCallback(async (resumeId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 0;

    const { data } = await supabase
      .from('resume_downloads')
      .select('download_count')
      .eq('user_id', user.id)
      .eq('resume_id', resumeId)
      .maybeSingle();

    return data?.download_count ?? 0;
  }, []);

  const recordFirstDownload = useCallback(async (resumeId: string) => {
    // SEC-004: Atomic server-side execution via record_resume_download_atomic procedure
    const { data, error } = await supabase.rpc('record_resume_download_atomic', {
      p_resume_id: resumeId
    });
    if (error) {
      console.warn('Procedure record_resume_download_atomic fallback to direct upsert:', error);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('resume_downloads').upsert({
          user_id: user.id,
          resume_id: resumeId,
          download_count: 1,
          last_download_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id,resume_id' });
      }
    }
  }, []);

  const purchaseOneOff = useCallback(async (resumeId: string) => {
    // If price is zero, skip purchase and just record download
    if (oneOffPriceInr <= 0) {
      await recordFirstDownload(resumeId);
      return true;
    }

    // Unified Razorpay Order Creation via secure serverless gateway
    const { data: orderData, error: orderError } = await supabase.functions.invoke('razorpay-create-order', {
      body: { 
        amount: oneOffPriceInr, 
        currency: 'INR', 
        packageType: 'ResumeDownload',
        serviceId: resumeId 
      }
    });
    if (orderError || !orderData?.orderId) {
      throw orderError || new Error('Failed to create payment order');
    }

    return new Promise<boolean>((resolve) => {
      if (typeof window === 'undefined' || !(window as any).Razorpay) {
        toast({ title: 'Payment Error', description: 'Payment SDK not loaded.', variant: 'destructive' });
        resolve(false);
        return;
      }

      const rzp = new (window as any).Razorpay({
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'TalentXcel',
        description: 'Resume Download Fee',
        order_id: orderData.orderId.startsWith('demo_') ? undefined : orderData.orderId,
        handler: async (response: any) => {
          try {
            // Unified server-side cryptographic HMAC verification
            const { data: verifyData, error: verifyError } = await supabase.functions.invoke('razorpay-verify-payment', {
              body: {
                mode: 'resume_download',
                packageType: 'ResumeDownload',
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                resumeId
              }
            });

            if (verifyError || !verifyData?.success) {
              throw verifyError || new Error(verifyData?.error || 'Verification failed');
            }
            resolve(true);
          } catch (e) {
            console.error('Payment verification failed:', e);
            toast({ title: 'Verification Failed', description: 'Please try again.', variant: 'destructive' });
            resolve(false);
          }
        },
      });
      rzp.on('payment.failed', (err: any) => {
        toast({ title: 'Payment Failed', description: err?.error?.description || 'Declined', variant: 'destructive' });
        resolve(false);
      });
      rzp.open();
    });
  }, [oneOffPriceInr, recordFirstDownload, toast]);

  const handleDownload = useCallback(async (resumeId: string, onProceed: () => void) => {
    try {
      setProcessing(true);
      const count = await getDownloadCount(resumeId);

      if (count === 0) {
        // First download is free
        await recordFirstDownload(resumeId);
        onProceed();
        toast({ title: 'Download Ready', description: 'Your first download is free.' });
        return true;
      }

      // Subsequent downloads -> purchase flow (skipped if price is 0)
      const ok = await purchaseOneOff(resumeId);
      if (ok) {
        onProceed();
        toast({ title: 'Download Ready', description: 'Your download is starting.' });
      }
      return ok;
    } catch (error) {
      console.error('handleDownload error', error);
      toast({ title: 'Error', description: 'Could not start download.', variant: 'destructive' });
      return false;
    } finally {
      setProcessing(false);
    }
  }, [getDownloadCount, purchaseOneOff, recordFirstDownload, toast]);

  return { processing, getDownloadCount, handleDownload };
};
