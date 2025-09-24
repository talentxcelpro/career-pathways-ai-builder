import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useRetroactiveTXC = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const awardRetroactiveTXC = async () => {
    if (isProcessing) return;

    setIsProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke('retroactive-txc-rewards', {
        body: {}
      });

      if (error) {
        throw error;
      }

      if (data?.success) {
        toast({
          title: "Retroactive Rewards Awarded! 🎉",
          description: `Successfully awarded TXC to ${data.users_rewarded} users (${data.total_rewards} total TXC)`,
          variant: "default"
        });
        return data;
      } else {
        throw new Error(data?.error || 'Failed to award retroactive rewards');
      }
    } catch (error) {
      console.error('Retroactive TXC error:', error);
      toast({
        title: "Error",
        description: "Failed to award retroactive rewards. Please try again.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    awardRetroactiveTXC,
    isProcessing
  };
};