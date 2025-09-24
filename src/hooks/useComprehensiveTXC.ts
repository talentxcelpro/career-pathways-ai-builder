import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DistributionSummary {
  phase1_users: number;
  phase2_users: number;
  phase3_users: number;
  total_users_processed: number;
  total_txc_awarded: number;
  distribution_date: string;
}

interface UserResult {
  user_id: string;
  name: string | null;
  email: string | null;
  awarded: number;
  phase: string;
  rewards?: string[];
  error?: string;
}

interface DistributionResponse {
  success: boolean;
  message: string;
  summary: DistributionSummary;
  phase1_results: UserResult[];
  phase2_results: UserResult[];
  phase3_results: UserResult[];
  total_awarded: number;
}

export const useComprehensiveTXC = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResults, setLastResults] = useState<DistributionResponse | null>(null);
  const { toast } = useToast();

  const executeDistribution = async () => {
    if (isProcessing) return;

    setIsProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke('comprehensive-txc-distribution', {
        body: {}
      });

      if (error) {
        throw error;
      }

      if (data?.success) {
        setLastResults(data);
        toast({
          title: "TXC Distribution Complete! 🎉",
          description: `Successfully awarded ${data.total_awarded.toLocaleString()} TXC to ${data.summary.total_users_processed} users across 3 phases`,
          variant: "default"
        });
        return data;
      } else {
        throw new Error(data?.error || 'Failed to execute TXC distribution');
      }
    } catch (error) {
      console.error('Comprehensive TXC distribution error:', error);
      toast({
        title: "Error",
        description: "Failed to execute TXC distribution. Please try again.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    executeDistribution,
    isProcessing,
    lastResults
  };
};