import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SEOContent {
  id: string;
  page_type: string;
  primary_slug: string;
  secondary_slug?: string;
  tertiary_slug?: string;
  meta_title: string;
  meta_description: string;
  h1_title: string;
  intro_content: string;
  faqs: any; // JSON type from database
  structured_data: any;
  content_blocks: any;
  keywords: string[];
  last_generated_at: string;
  quality_score: number;
  is_active: boolean;
}

interface SEOCacheOptions {
  pageType: string;
  primarySlug: string;
  secondarySlug?: string;
  tertiarySlug?: string;
  staleTime?: number; // milliseconds
  cacheTime?: number; // milliseconds
  enabled?: boolean;
}

/**
 * Custom hook for cached SEO content with React Query optimization
 */
export const useCachedSEO = ({
  pageType,
  primarySlug,
  secondarySlug,
  tertiarySlug,
  staleTime = 24 * 60 * 60 * 1000, // 24 hours by default
  cacheTime = 7 * 24 * 60 * 60 * 1000, // 7 days by default
  enabled = true,
}: SEOCacheOptions) => {
  
  const queryKey = [
    'seo-content',
    pageType,
    primarySlug,
    secondarySlug,
    tertiarySlug
  ].filter(Boolean);

  const {
    data: seoContent,
    isLoading,
    error,
    refetch,
    isFetching,
    isStale
  } = useQuery({
    queryKey,
    queryFn: async (): Promise<SEOContent | null> => {
      console.log(`Fetching SEO content for: ${pageType}/${primarySlug}/${secondarySlug || ''}/${tertiarySlug || ''}`);
      
      // First try to get existing content from database
      const { data: existingContent, error: fetchError } = await supabase
        .from('seo_generated_content')
        .select('*')
        .eq('page_type', pageType)
        .eq('primary_slug', primarySlug)
        .eq('secondary_slug', secondarySlug || null)
        .eq('tertiary_slug', tertiarySlug || null)
        .eq('is_active', true)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching SEO content:', fetchError);
        throw new Error('Failed to fetch SEO content');
      }

      // If content exists and is fresh (less than 7 days old), return it
      if (existingContent && 
          new Date(existingContent.last_generated_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) {
        console.log('Returning existing fresh content');
        return existingContent;
      }

      // Otherwise, generate new content via edge function
      console.log('Generating new SEO content');
      const { data: generatedData, error: generateError } = await supabase.functions.invoke(
        'ai-seo-content-generator',
        {
          body: {
            pageType,
            primarySlug,
            secondarySlug,
            tertiarySlug,
            forceRegenerate: false
          }
        }
      );

      if (generateError) {
        console.error('Error generating SEO content:', generateError);
        throw new Error('Failed to generate SEO content');
      }

      if (!generatedData?.success) {
        throw new Error(generatedData?.error || 'Failed to generate SEO content');
      }

      return generatedData.content;
    },
    staleTime, // Data considered fresh for this duration
    gcTime: cacheTime, // How long to keep in cache when not in use
    enabled,
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false, // Don't refetch on window focus for SEO content
    refetchOnMount: false, // Don't always refetch on mount
  });

  /**
   * Force regenerate SEO content
   */
  const regenerateContent = async () => {
    console.log('Force regenerating SEO content');
    const { data: generatedData, error } = await supabase.functions.invoke(
      'ai-seo-content-generator',
      {
        body: {
          pageType,
          primarySlug,
          secondarySlug,
          tertiarySlug,
          forceRegenerate: true
        }
      }
    );

    if (error) {
      throw error;
    }

    if (!generatedData?.success) {
      throw new Error(generatedData?.error || 'Failed to regenerate content');
    }

    // Invalidate and refetch the query
    await refetch();
    
    return generatedData.content;
  };

  /**
   * Get cache status information
   */
  const getCacheStatus = () => ({
    isStale,
    isFetching,
    hasContent: !!seoContent,
    lastUpdate: seoContent?.last_generated_at,
    cacheAge: seoContent?.last_generated_at 
      ? Date.now() - new Date(seoContent.last_generated_at).getTime()
      : null
  });

  return {
    seoContent,
    isLoading,
    error,
    refetch,
    regenerateContent,
    getCacheStatus,
    // Convenience getters for common SEO elements
    metaTitle: seoContent?.meta_title,
    metaDescription: seoContent?.meta_description,
    h1Title: seoContent?.h1_title,
    introContent: seoContent?.intro_content,
    faqs: seoContent?.faqs || [],
    keywords: seoContent?.keywords || [],
    structuredData: seoContent?.structured_data,
    contentBlocks: seoContent?.content_blocks
  };
};

/**
 * Preload SEO content for better performance
 */
export const preloadSEOContent = (options: SEOCacheOptions) => {
  // This would integrate with React Query's prefetchQuery
  // Implementation depends on having access to queryClient
  console.log('Preloading SEO content for:', options);
};

/**
 * Hook for bulk SEO operations (for sitemap generation, etc.)
 */
export const useBulkSEO = () => {
  const generateBulkContent = async (requests: SEOCacheOptions[]) => {
    const results = await Promise.allSettled(
      requests.map(request => 
        supabase.functions.invoke('ai-seo-content-generator', {
          body: {
            pageType: request.pageType,
            primarySlug: request.primarySlug,
            secondarySlug: request.secondarySlug,
            tertiarySlug: request.tertiarySlug,
            forceRegenerate: false
          }
        })
      )
    );

    return results.map((result, index) => ({
      request: requests[index],
      success: result.status === 'fulfilled',
      data: result.status === 'fulfilled' ? result.value.data : null,
      error: result.status === 'rejected' ? result.reason : null
    }));
  };

  return { generateBulkContent };
};
