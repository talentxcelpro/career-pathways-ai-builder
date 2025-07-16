import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AIRequest {
  module: string;
  task: string;
  input?: any;
  prompt?: string;
}

interface AIResponse {
  success: boolean;
  response?: string;
  data?: any;
  error?: string;
  requestId?: string;
  tokens_used?: number;
}

export const useSimpleAI = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const callAI = useCallback(async (request: AIRequest): Promise<AIResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🚀 Simple AI Request:', request);

      const { data, error: supabaseError } = await supabase.functions.invoke('ai-agent', {
        body: {
          module: request.module,
          task: request.task,
          input: request.input || {},
          prompt: request.prompt
        }
      });

      if (supabaseError) {
        throw new Error(`AI service error: ${supabaseError.message}`);
      }

      if (!data) {
        throw new Error('No response received from AI service');
      }

      console.log('✅ Simple AI Response:', data);

      if (data.success) {
        return {
          success: true,
          response: data.response,
          data: data.data,
          requestId: data.requestId,
          tokens_used: data.tokens_used
        };
      } else {
        throw new Error(data.error || 'AI processing failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('❌ Simple AI Error:', errorMessage);
      
      setError(errorMessage);
      toast.error(`AI Error: ${errorMessage}`);
      
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    callAI,
    isLoading,
    error,
    clearError
  };
};