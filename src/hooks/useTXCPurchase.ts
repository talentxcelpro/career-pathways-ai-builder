import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTokenBalance } from './useTokenBalance';
import { toast } from 'sonner';

interface PurchaseOptions {
  featureId: string;
  cost: number;
  description: string;
  metadata?: Record<string, any>;
}

// Legacy function signature for backward compatibility
interface LegacyPurchaseFunction {
  (featureId: string, description: string, metadata?: Record<string, any>): Promise<boolean>;
}

export const useTXCPurchase = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { availableBalance, refreshBalance } = useTokenBalance();

  const canAfford = (cost: number) => {
    return availableBalance >= cost;
  };

  const purchaseWithTXC = async (options: PurchaseOptions): Promise<boolean> => {
    if (!canAfford(options.cost)) {
      toast.error(`Insufficient TXC balance. You need ${options.cost} TXC but only have ${availableBalance} TXC.`);
      return false;
    }

    setIsLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please log in to continue');
        return false;
      }

      // Enhanced routing logic for subscriptions
      const isSubscription = options.featureId === 'pro_subscription' || 
                           options.metadata?.packageType || 
                           ['Pro Starter', 'Pro Business', 'Pro Elite'].some(plan => 
                             options.featureId.includes(plan) || options.description.includes(plan)
                           );

      const endpoint = isSubscription ? 'txc-unified-purchase' : 'txc-feature-purchase';
      
      console.log(`TXC Purchase: ${endpoint}`, {
        featureId: options.featureId,
        cost: options.cost,
        isSubscription,
        metadata: options.metadata,
        requestBody: 'will be logged next'
      });

      // Prepare request body based on endpoint with proper validation
      const requestBody = isSubscription ? {
        purchaseType: 'subscription',
        planName: options.metadata?.packageType || options.description,
        cost: options.cost,
        description: options.description,
        metadata: {
          userId: user.id,
          userEmail: user.email,
          timestamp: new Date().toISOString(),
          ...(options.metadata || {})
        }
      } : {
        featureId: options.featureId,
        customCost: options.cost,
        customDescription: options.description,
        metadata: {
          userId: user.id,
          userEmail: user.email,
          timestamp: new Date().toISOString(),
          ...(options.metadata || {})
        }
      };

      console.log('Request body:', requestBody);

      let data, error;
      let attemptCount = 0;
      const maxAttempts = 3;
      
      while (attemptCount < maxAttempts) {
        try {
          console.log(`Attempt ${attemptCount + 1}/${maxAttempts} for endpoint: ${endpoint}`);
          
          const response = await supabase.functions.invoke(endpoint, {
            body: requestBody,
            headers: {
              'Content-Type': 'application/json',
              'User-Agent': 'TalentXcel-Web-Client'
            }
          });
          
          console.log('Raw response:', response);
          data = response.data;
          error = response.error;
          
          if (!error && data) {
            break; // Success, exit retry loop
          }
          
          if (error) {
            console.error(`Attempt ${attemptCount + 1} failed with error:`, error);
          }
          
        } catch (invokeError) {
          console.error(`Attempt ${attemptCount + 1} invoke failed:`, invokeError);
          error = invokeError;
        }
        
        attemptCount++;
        
        if (attemptCount < maxAttempts) {
          console.log(`Waiting 1s before retry attempt ${attemptCount + 1}`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      // If all attempts failed, try fallback endpoint
      if (error || !data) {
        console.log('All primary attempts failed, trying fallback...');
        
        const fallbackEndpoint = isSubscription ? 'process-txc-purchase' : 'txc-unified-purchase';
        console.log(`Trying fallback endpoint: ${fallbackEndpoint}`);
        
        try {
          const fallbackBody = isSubscription ? {
            userId: user.id,
            featureId: 'pro_subscription',
            cost: options.cost,
            description: options.description,
            planName: options.metadata?.packageType || options.description,
            metadata: {
              userId: user.id,
              userEmail: user.email,
              timestamp: new Date().toISOString(),
              fallbackAttempt: true,
              ...(options.metadata || {})
            }
          } : {
            purchaseType: 'feature',
            featureId: options.featureId,
            cost: options.cost,
            description: options.description,
            metadata: {
              userId: user.id,
              userEmail: user.email,
              timestamp: new Date().toISOString(),
              fallbackAttempt: true,
              ...(options.metadata || {})
            }
          };
          
          console.log('Fallback request body:', fallbackBody);
          
          const fallbackResponse = await supabase.functions.invoke(fallbackEndpoint, {
            body: fallbackBody,
            headers: {
              'Content-Type': 'application/json',
              'User-Agent': 'TalentXcel-Web-Client-Fallback'
            }
          });
          
          console.log('Fallback response:', fallbackResponse);
          data = fallbackResponse.data;
          error = fallbackResponse.error;
        } catch (fallbackError) {
          console.error('Fallback also failed:', fallbackError);
          throw new Error(`Both primary and fallback endpoints failed. Primary error: ${error?.message || 'Unknown'}, Fallback error: ${fallbackError}`);
        }
      }

      if (error) {
        console.error('Edge Function error:', error);
        throw new Error(`Edge Function error: ${error.message}`);
      }

      if (data?.success) {
        toast.success(`Purchase successful! ${options.cost} TXC spent.`);
        refreshBalance();
        return true;
      } else {
        console.error('Purchase failed:', data);
        throw new Error(data?.error || 'Purchase failed - no success response');
      }
    } catch (error) {
      console.error('TXC purchase error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Purchase failed. Please try again.';
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Legacy wrapper function for backward compatibility
  const purchaseFeature: LegacyPurchaseFunction = async (featureId: string, description: string, metadata?: Record<string, any>) => {
    return purchaseWithTXC({
      featureId,
      cost: 0, // Cost will be determined by the backend based on featureId
      description,
      metadata
    });
  };

  return {
    canAfford,
    purchaseWithTXC,
    purchaseFeature,
    isLoading,
    isProcessing: isLoading, // Alias for backward compatibility
    availableBalance
  };
};