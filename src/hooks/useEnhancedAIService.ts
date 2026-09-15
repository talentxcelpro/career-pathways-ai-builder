
import { useState, useCallback } from 'react';
import { useAIService } from './useAIService';
import { toast } from 'sonner';

export interface AIServiceWithFeedback {
  invokeWithFeedback: (options: any, onSuccess?: (result: any) => void, onError?: (error: string) => void) => Promise<any>;
  submitFeedback: (operationId: string, rating: number, feedback?: string) => Promise<void>;
  getRecommendations: (userProfile: any, context: string) => Promise<any>;
  isProcessing: boolean;
}

export const useEnhancedAIService = (): AIServiceWithFeedback => {
  const { invokeAITool, isProcessing } = useAIService();
  const [operationHistory, setOperationHistory] = useState<Map<string, any>>(new Map());

  const invokeWithFeedback = useCallback(async (
    options: any, 
    onSuccess?: (result: any) => void,
    onError?: (error: string) => void
  ) => {
    const operationId = Date.now().toString();
    
    try {
      console.log(`🚀 Enhanced AI operation ${operationId} starting:`, options);
      
      const result = await invokeAITool(options);
      
      // Store operation for feedback collection
      setOperationHistory(prev => new Map(prev).set(operationId, {
        ...options,
        result,
        timestamp: new Date().toISOString()
      }));
      
      if (result.success) {
        console.log(`✅ Enhanced AI operation ${operationId} succeeded`);
        onSuccess?.(result);
        
        // Show feedback prompt after a delay
        setTimeout(() => {
          toast('How was this AI result?', {
            action: {
              label: 'Rate',
              onClick: () => {
                // Show rating dialog (implement as needed)
                console.log('Show rating dialog for operation:', operationId);
              }
            }
          });
        }, 2000);
      } else {
        console.error(`❌ Enhanced AI operation ${operationId} failed:`, result.error);
        onError?.(result.error || 'Operation failed');
      }
      
      return result;
    } catch (error: any) {
      console.error(`💥 Enhanced AI operation ${operationId} crashed:`, error);
      onError?.(error.message);
      return { success: false, error: error.message };
    }
  }, [invokeAITool]);

  const submitFeedback = useCallback(async (
    operationId: string, 
    rating: number, 
    feedback?: string
  ) => {
    try {
      console.log(`📝 Submitting feedback for operation ${operationId}:`, { rating, feedback });
      
      // Here you would submit to your feedback system
      // For now, just log and show success
      toast.success('Thank you for your feedback!');
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      toast.error('Failed to submit feedback');
    }
  }, []);

  const getRecommendations = useCallback(async (userProfile: any, context: string) => {
    const options = {
      toolSlug: 'career-advisor',
      inputData: {
        userProfile,
        context,
        requestType: 'recommendations'
      },
      category: 'recommendations'
    };

    return invokeWithFeedback(options);
  }, [invokeWithFeedback]);

  return {
    invokeWithFeedback,
    submitFeedback,
    getRecommendations,
    isProcessing
  };
};
