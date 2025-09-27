import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface MetaTagsResult {
  title: string;
  description: string;
  type: string;
  generated_at: string;
}

interface BulkMetaTagsResult {
  results: MetaTagsResult[];
  total_processed: number;
  total_requested: number;
  success_rate: string;
}

export const useAIMetaGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateMetaTags = async (
    type: 'job' | 'company' | 'course' | 'profile' | 'tool',
    data: any
  ): Promise<MetaTagsResult | null> => {
    setIsGenerating(true);
    setError(null);

    try {
      const { data: result, error: functionError } = await supabase.functions.invoke(
        'ai-meta-generator',
        {
          body: {
            type,
            data,
            bulk: false
          }
        }
      );

      if (functionError) throw functionError;
      if (!result.success) throw new Error(result.error);

      return result as MetaTagsResult;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate meta tags';
      setError(errorMessage);
      console.error('Meta tag generation error:', err);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const generateBulkMetaTags = async (
    type: 'job' | 'company' | 'course' | 'profile' | 'tool',
    items: any[]
  ): Promise<BulkMetaTagsResult | null> => {
    setIsGenerating(true);
    setError(null);

    try {
      const { data: result, error: functionError } = await supabase.functions.invoke(
        'ai-meta-generator',
        {
          body: {
            type,
            data: items,
            bulk: true
          }
        }
      );

      if (functionError) throw functionError;
      if (!result.success) throw new Error(result.error);

      return result as BulkMetaTagsResult;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate bulk meta tags';
      setError(errorMessage);
      console.error('Bulk meta tag generation error:', err);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  // Convenience methods for specific content types
  const generateJobMetaTags = (job: any) => generateMetaTags('job', job);
  const generateCompanyMetaTags = (company: any) => generateMetaTags('company', company);
  const generateCourseMetaTags = (course: any) => generateMetaTags('course', course);
  const generateProfileMetaTags = (profile: any) => generateMetaTags('profile', profile);
  const generateToolMetaTags = (tool: any) => generateMetaTags('tool', tool);

  // Bulk generation methods
  const generateBulkJobMetaTags = (jobs: any[]) => generateBulkMetaTags('job', jobs);
  const generateBulkCompanyMetaTags = (companies: any[]) => generateBulkMetaTags('company', companies);
  const generateBulkCourseMetaTags = (courses: any[]) => generateBulkMetaTags('course', courses);

  return {
    // Core methods
    generateMetaTags,
    generateBulkMetaTags,
    
    // Convenience methods
    generateJobMetaTags,
    generateCompanyMetaTags,
    generateCourseMetaTags,
    generateProfileMetaTags,
    generateToolMetaTags,
    
    // Bulk methods
    generateBulkJobMetaTags,
    generateBulkCompanyMetaTags,
    generateBulkCourseMetaTags,
    
    // State
    isGenerating,
    error
  };
};