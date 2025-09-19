import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SocialTXCResult {
  user_id: string;
  name: string | null;
  email: string | null;
  posts: number;
  connections: number;
  awarded: number;
  new_balance: number;
  error?: string;
}

interface AwardResponse {
  success: boolean;
  message: string;
  total_awarded: number;
  results: SocialTXCResult[];
}

export const useSocialTXCAward = () => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResults, setLastResults] = useState<SocialTXCResult[]>([]);

  const awardSocialTXC = async (): Promise<boolean> => {
    setIsProcessing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('award-social-txc', {
        body: {}
      });

      if (error) {
        console.error('Social TXC award error:', error);
        toast({
          title: "Error",
          description: "Failed to award social TXC. Please try again.",
          variant: "destructive"
        });
        return false;
      }

      const response = data as AwardResponse;
      
      if (response?.success) {
        setLastResults(response.results || []);
        toast({
          title: "Success! 🎉",
          description: `Awarded ${response.total_awarded} TXC to ${response.results?.length || 0} users`,
          variant: "default"
        });
        return true;
      } else {
        toast({
          title: "Error",
          description: response?.message || "Failed to award social TXC",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error('Social TXC award error:', error);
      toast({
        title: "Error",
        description: "Failed to award social TXC. Please try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    awardSocialTXC,
    isProcessing,
    lastResults
  };
};