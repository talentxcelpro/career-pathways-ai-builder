import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useJoiningBonus = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const awardJoiningBonuses = async () => {
    setIsProcessing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('award-joining-bonus');
      
      if (error) {
        toast({
          title: "Error",
          description: "Failed to award joining bonuses",
          variant: "destructive"
        });
        return false;
      }

      if (data?.success) {
        toast({
          title: "Success! 🎉",
          description: `Awarded joining bonuses to ${data.users_awarded} users (${data.total_awarded} TXC total). ${data.already_received} users already had bonuses.`,
          variant: "default"
        });
        return true;
      } else {
        toast({
          title: "Error",
          description: data?.error || "Failed to award joining bonuses",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error('Error awarding joining bonuses:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    awardJoiningBonuses,
    isProcessing
  };
};