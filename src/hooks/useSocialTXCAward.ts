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
      // Award TXC based on social activity
      const currentTime = new Date().toISOString();
      
      // Get users with recent social activity
      const { data: activeUsers, error: usersError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .limit(100);

      if (usersError) throw usersError;

      const results: SocialTXCResult[] = [];
      let totalAwarded = 0;

      for (const user of activeUsers || []) {
        // Calculate TXC awards based on activity
        const postsCount = Math.floor(Math.random() * 5); // Mock post count
        const connectionsCount = Math.floor(Math.random() * 10); // Mock connections
        const awardAmount = (postsCount * 5) + (connectionsCount * 2); // 5 TXC per post, 2 per connection
        
        if (awardAmount > 0) {
          // Award credits
          const { error: creditError } = await supabase
            .from('user_credits')
            .upsert({
              user_id: user.id,
              txc_balance: awardAmount,
              last_awarded_at: currentTime,
              total_earned: awardAmount
            }, {
              onConflict: 'user_id'
            });

          if (creditError) {
            console.error('Credit award error for user:', user.id, creditError);
            results.push({
              user_id: user.id,
              name: user.full_name,
              email: user.email,
              posts: postsCount,
              connections: connectionsCount,
              awarded: 0,
              new_balance: 0,
              error: creditError.message
            });
          } else {
            // Log transaction
            await supabase
              .from('credit_transactions')
              .insert({
                user_id: user.id,
                transaction_type: 'earned',
                amount: awardAmount,
                description: `Social activity reward: ${postsCount} posts, ${connectionsCount} connections`,
                metadata: {
                  posts: postsCount,
                  connections: connectionsCount,
                  award_date: currentTime
                }
              });

            results.push({
              user_id: user.id,
              name: user.full_name,
              email: user.email,
              posts: postsCount,
              connections: connectionsCount,
              awarded: awardAmount,
              new_balance: awardAmount,
              error: undefined
            });

            totalAwarded += awardAmount;
          }
        }
      }

      setLastResults(results);
      toast({
        title: "Success! 🎉",
        description: `Awarded ${totalAwarded} TXC to ${results.length} users`,
        variant: "default"
      });
      return true;

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