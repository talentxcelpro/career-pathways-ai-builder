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
      const maxAttempts = 2; // Reduced from 3 for faster feedback
      
      while (attemptCount < maxAttempts) {
        try {
          console.log(`Attempt ${attemptCount + 1}/${maxAttempts} for endpoint: ${endpoint}`);
          
          // Add timeout to prevent hanging requests
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Request timeout')), 10000)
          );
          
          const requestPromise = supabase.functions.invoke(endpoint, {
            body: requestBody,
            headers: {
              'Content-Type': 'application/json',
              'User-Agent': 'TalentXcel-Web-Client',
              'X-Request-ID': `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
            }
          });
          
          const response = await Promise.race([requestPromise, timeoutPromise]) as any;
          console.log('Raw response:', response);
          data = response.data;
          error = response.error;
          
          if (!error && data?.success) {
            console.log('Success on attempt', attemptCount + 1);
            break; // Success, exit retry loop
          }
          
          if (error) {
            console.error(`Attempt ${attemptCount + 1} failed with error:`, error);
            // If it's a network error, try again, otherwise break
            if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
              console.log('Network error detected, will retry...');
            } else {
              console.log('Non-network error, breaking retry loop');
              break;
            }
          }
          
        } catch (invokeError: any) {
          console.error(`Attempt ${attemptCount + 1} invoke failed:`, invokeError);
          
          // Handle timeout and network errors
          if (invokeError.message?.includes('Request timeout')) {
            console.log('Request timed out');
            error = { message: 'Request timed out. Please try again.' };
          } else if (invokeError.message?.includes('Failed to fetch')) {
            console.log('Network connectivity issue detected');
            error = { message: 'Network connectivity issue. Please check your connection and try again.' };
          } else {
            error = invokeError;
          }
        }
        
        attemptCount++;
        
        if (attemptCount < maxAttempts) {
          console.log(`Waiting 2s before retry attempt ${attemptCount + 1}`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
      
      // If all attempts failed, try fallback approach using direct database operations
      if (error || !data?.success) {
        console.log('All primary attempts failed, trying direct database approach...');
        
        try {
          // Direct subscription creation using database functions
          const subscriptionData = {
            user_id: user.id,
            email: user.email || '',
            subscribed: true,
            subscription_plan: options.metadata?.packageType || options.description,
            subscription_tier: options.metadata?.packageType || options.description,
            status: 'active',
            subscription_start: new Date().toISOString(),
            subscription_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            last_payment_date: new Date().toISOString(),
            amount: options.cost,
            currency: 'TXC',
            updated_at: new Date().toISOString(),
          };

          // Try to create subscription directly
          const { error: subscriptionError } = await supabase
            .from('subscribers')
            .upsert(subscriptionData, { onConflict: 'user_id' });

          if (subscriptionError) {
            throw new Error(`Database subscription creation failed: ${subscriptionError.message}`);
          }

          // Try to update TXC balance directly
          const { data: balanceData, error: balanceError } = await supabase
            .from('user_txc_balances')
            .select('balance')
            .eq('user_id', user.id)
            .single();

          if (balanceError || !balanceData) {
            throw new Error('Unable to access TXC balance for direct update');
          }

          if (balanceData.balance < options.cost) {
            throw new Error(`Insufficient TXC balance: ${balanceData.balance} available, ${options.cost} required`);
          }

          const newBalance = balanceData.balance - options.cost;
          const { error: updateError } = await supabase
            .from('user_txc_balances')
            .update({ 
              balance: newBalance,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', user.id);

          if (updateError) {
            throw new Error(`TXC balance update failed: ${updateError.message}`);
          }

          // Record transaction
          const { error: txError } = await supabase
            .from('txc_transactions')
            .insert({
              user_id: user.id,
              amount: -options.cost,
              transaction_type: 'purchase',
              description: `Fallback: ${options.description}`
            });

          if (txError) {
            console.warn('Transaction logging failed:', txError);
          }

          console.log('Direct database fallback successful');
          data = { success: true, message: 'Subscription activated via fallback method', newBalance };
          error = null;

        } catch (fallbackError) {
          console.error('Direct database fallback also failed:', fallbackError);
          throw new Error(`Edge Function unavailable and database fallback failed. Error: ${fallbackError instanceof Error ? fallbackError.message : 'Unknown error'}. Please try again later or contact support.`);
        }
      }

      if (error) {
        console.error('Final error:', error);
        throw new Error(`Transaction failed: ${error.message || 'Unknown error'}`);
      }

      if (data?.success) {
        console.log('Purchase completed successfully:', data);
        toast.success(`Purchase successful! ${options.cost} TXC spent.`);
        refreshBalance();
        return true;
      } else {
        console.error('Purchase failed - no success response:', data);
        throw new Error(data?.error || data?.message || 'Purchase failed - please try again or contact support');
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