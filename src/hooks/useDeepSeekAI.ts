import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface DeepSeekOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

interface DeepSeekResponse {
  success: boolean;
  data?: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model?: string;
  error?: string;
}

export const useDeepSeekAI = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const invokeDeepSeek = useCallback(async (
    messages: DeepSeekMessage[],
    options: DeepSeekOptions = {}
  ): Promise<DeepSeekResponse> => {
    setIsProcessing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('deepseek-ai', {
        body: {
          messages,
          model: options.model || 'deepseek-chat',
          temperature: options.temperature || 0.7,
          max_tokens: options.max_tokens || 2048
        }
      });

      if (error) {
        console.error('DeepSeek AI Error:', error);
        toast.error('Failed to process request with DeepSeek AI');
        return { success: false, error: error.message };
      }

      if (!data.success) {
        console.error('DeepSeek API Error:', data.error);
        toast.error(data.error || 'DeepSeek AI request failed');
        return { success: false, error: data.error };
      }

      return {
        success: true,
        data: data.data,
        usage: data.usage,
        model: data.model
      };
    } catch (error) {
      console.error('DeepSeek request failed:', error);
      toast.error('Failed to connect to DeepSeek AI');
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const chatWithDeepSeek = useCallback(async (
    prompt: string,
    systemMessage?: string,
    options?: DeepSeekOptions
  ): Promise<string | null> => {
    const messages: DeepSeekMessage[] = [];
    
    if (systemMessage) {
      messages.push({ role: 'system', content: systemMessage });
    }
    
    messages.push({ role: 'user', content: prompt });

    const response = await invokeDeepSeek(messages, options);
    return response.success ? response.data || null : null;
  }, [invokeDeepSeek]);

  return {
    isProcessing,
    invokeDeepSeek,
    chatWithDeepSeek
  };
};