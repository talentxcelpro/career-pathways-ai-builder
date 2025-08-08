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
    const { error } = await supabase.functions.invoke('record-resume-download', {
      body: { resumeId }
    });
    if (error) throw error;
  }, []);

  const purchaseOneOff = useCallback(async (resumeId: string) => {
    // If price is zero, skip purchase and just record download
    if (oneOffPriceInr <= 0) {
      await recordFirstDownload(resumeId);
      return true;
    }

    const { data: orderData, error: orderError } = await supabase.functions.invoke('razorpay-create-oneoff', {
      body: { amount: oneOffPriceInr, currency: 'INR', resumeId }
    });
    if (orderError) throw orderError;

    // Demo mode
    if (orderData?.demo) {
      const { error: verifyError } = await supabase.functions.invoke('razorpay-verify-oneoff', {
        body: {
          razorpay_order_id: orderData.orderId,
          razorpay_payment_id: `pay_demo_${Date.now()}`,
          razorpay_signature: 'demo_signature',
          resumeId
        }
      });
      if (verifyError) throw verifyError;
      return true;
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
        description: 'Resume download',
        order_id: orderData.orderId,
        handler: async (response: any) => {
          try {
            const { error: verifyError } = await supabase.functions.invoke('razorpay-verify-oneoff', {
              body: {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                resumeId
              }
            });
            if (verifyError) throw verifyError;
            resolve(true);
          } catch (e) {
            console.error(e);
            toast({ title: 'Verification Failed', description: 'Please try again.', variant: 'destructive' });
            resolve(false);
          }
        },
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
