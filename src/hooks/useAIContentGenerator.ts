import React, { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ContentGenerationRequest {
  contentType: 'job_description' | 'company_page' | 'blog_post' | 'landing_page' | 'custom';
  topic: string;
  targetAudience?: string;
  tone?: 'professional' | 'casual' | 'persuasive' | 'informative' | 'friendly';
  keywords?: string[];
  industry?: string;
  location?: string;
  wordCount?: number;
  includeSchema?: boolean;
}

interface ContentGenerationResponse {
  success: boolean;
  content?: string;
  metadata?: {
    title: string;
    description: string;
    keywords: string[];
  };
  contentId?: string;
  tokensUsed?: number;
  wordCount?: number;
  error?: string;
}

export const useAIContentGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);

  const generateContent = useCallback(async (
    request: ContentGenerationRequest
  ): Promise<ContentGenerationResponse> => {
    setIsGenerating(true);
    setGenerationProgress(10);

    try {
      setGenerationProgress(30);
      
      const { data, error } = await supabase.functions.invoke('ai-content-generator', {
        body: request
      });

      setGenerationProgress(80);

      if (error) {
        throw new Error(error.message);
      }

      if (!data.success) {
        throw new Error(data.error || 'Content generation failed');
      }

      setGenerationProgress(100);
      
      toast.success(`${request.contentType.replace('_', ' ').toUpperCase()} content generated successfully!`);
      
      return data;
    } catch (error) {
      console.error('Content generation error:', error);
      toast.error(`Failed to generate content: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    } finally {
      setIsGenerating(false);
      setTimeout(() => setGenerationProgress(0), 1000);
    }
  }, []);

  const generateBulkContent = useCallback(async (
    requests: ContentGenerationRequest[]
  ): Promise<ContentGenerationResponse[]> => {
    setIsGenerating(true);
    const results: ContentGenerationResponse[] = [];
    
    try {
      for (let i = 0; i < requests.length; i++) {
        setGenerationProgress(((i + 1) / requests.length) * 100);
        const result = await generateContent(requests[i]);
        results.push(result);
        
        // Small delay between requests to avoid rate limits
        if (i < requests.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      const successful = results.filter(r => r.success).length;
      toast.success(`Generated ${successful}/${requests.length} pieces of content successfully!`);
      
      return results;
    } catch (error) {
      console.error('Bulk content generation error:', error);
      toast.error('Bulk content generation failed');
      return results;
    } finally {
      setIsGenerating(false);
      setTimeout(() => setGenerationProgress(0), 1000);
    }
  }, [generateContent]);

  return {
    generateContent,
    generateBulkContent,
    isGenerating,
    generationProgress
  };
};