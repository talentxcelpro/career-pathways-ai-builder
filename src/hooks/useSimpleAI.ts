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

// Helper function for network diagnostics
const checkNetworkConnectivity = async (): Promise<boolean> => {
  try {
    const response = await fetch('https://dthlgsnakhofinssokm.supabase.co/rest/v1/', {
      method: 'HEAD',
      mode: 'no-cors',
      cache: 'no-cache'
    });
    return true;
  } catch {
    return false;
  }
};

// Direct HTTP fallback function
const callAIDirectly = async (request: AIRequest): Promise<AIResponse> => {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('Authentication required');
  }

  const functionUrl = 'https://dthlgsnakhofinssokm.supabase.co/functions/v1/ai-agent';
  
  const response = await fetch(functionUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      module: request.module,
      task: request.task,
      input: request.input || {},
      prompt: request.prompt
    })
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
};

export const useSimpleAI = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const callAI = useCallback(async (request: AIRequest): Promise<AIResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🚀 Simple AI Request:', request);

      // First, try the Supabase client
      let result;
      try {
        const { data, error: supabaseError } = await supabase.functions.invoke('ai-agent', {
          body: {
            module: request.module,
            task: request.task,
            input: request.input || {},
            prompt: request.prompt
          }
        });

        if (supabaseError) {
          throw new Error(`Supabase client error: ${supabaseError.message}`);
        }

        if (!data) {
          throw new Error('No response received from Supabase client');
        }

        result = data;
        console.log('✅ Supabase Client Success:', result);
      } catch (clientError) {
        console.warn('⚠️ Supabase client failed, trying direct HTTP:', clientError);
        
        // Check network connectivity
        const isConnected = await checkNetworkConnectivity();
        if (!isConnected) {
          throw new Error('Network connectivity issue. Please check your internet connection.');
        }

        // Try direct HTTP fallback
        try {
          result = await callAIDirectly(request);
          console.log('✅ Direct HTTP Success:', result);
        } catch (directError) {
          console.error('❌ Direct HTTP failed:', directError);
          throw new Error(`Both Supabase client and direct HTTP failed. ${directError instanceof Error ? directError.message : 'Unknown error'}`);
        }
      }

      // Process the result
      if (result.success) {
        return {
          success: true,
          response: result.response,
          data: result.data,
          requestId: result.requestId,
          tokens_used: result.tokens_used
        };
      } else {
        throw new Error(result.error || 'AI processing failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('❌ Simple AI Error:', errorMessage);
      
      setError(errorMessage);
      
      // Provide user-friendly error messages
      let userMessage = errorMessage;
      if (errorMessage.includes('Failed to send a request')) {
        userMessage = 'Connection issue. Please try again.';
      } else if (errorMessage.includes('Network connectivity')) {
        userMessage = 'Please check your internet connection and try again.';
      } else if (errorMessage.includes('Authentication')) {
        userMessage = 'Please log in again to continue.';
      }
      
      toast.error(`AI Error: ${userMessage}`);
      
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