import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface GenerationStats {
  totalGenerated: number;
  totalErrors: number;
  isRunning: boolean;
  progress: number;
  startTime?: Date;
  endTime?: Date;
}

interface CacheEntry {
  key: string;
  content: any;
  timestamp: number;
  expiresAt: number;
}

export const useClientSideGeneration = () => {
  const [stats, setStats] = useState<GenerationStats>({
    totalGenerated: 0,
    totalErrors: 0,
    isRunning: false,
    progress: 0
  });

  const [cache] = useState<Map<string, CacheEntry>>(new Map());
  const { toast } = useToast();

  // Cache management
  const getCacheKey = (pageType: string, primarySlug: string, secondarySlug?: string, tertiarySlug?: string) => {
    return `${pageType}:${primarySlug}:${secondarySlug || ''}:${tertiarySlug || ''}`;
  };

  const getFromCache = (key: string): any | null => {
    const entry = cache.get(key);
    if (entry && entry.expiresAt > Date.now()) {
      return entry.content;
    }
    if (entry) {
      cache.delete(key); // Remove expired entry
    }
    return null;
  };

  const setToCache = (key: string, content: any, ttlMinutes: number = 60) => {
    const entry: CacheEntry = {
      key,
      content,
      timestamp: Date.now(),
      expiresAt: Date.now() + (ttlMinutes * 60 * 1000)
    };
    cache.set(key, entry);
  };

  // Database operations
  const saveToDatabase = async (pageData: any) => {
    try {
      const { error } = await supabase
        .from('seo_generated_content')
        .upsert({
          page_type: pageData.pageType,
          primary_slug: pageData.primarySlug,
          secondary_slug: pageData.secondarySlug || null,
          tertiary_slug: pageData.tertiarySlug || null,
          meta_title: pageData.content.metaTitle,
          meta_description: pageData.content.metaDescription,
          h1_title: pageData.content.h1Title,
          intro_content: pageData.content.introContent,
          faqs: pageData.content.faqs || [],
          structured_data: pageData.content.structuredData || {},
          content_blocks: pageData.content.contentBlocks || [],
          keywords: pageData.content.keywords || [],
          quality_score: pageData.content.qualityScore || 75,
          last_generated_at: new Date().toISOString(),
          is_active: true
        }, {
          onConflict: 'page_type,primary_slug,secondary_slug,tertiary_slug'
        });

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Database save error:', error);
      return false;
    }
  };

  const checkExistence = async (pageType: string, primarySlug: string, secondarySlug?: string, tertiarySlug?: string) => {
    try {
      const { data, error } = await supabase
        .from('seo_generated_content')
        .select('id, last_generated_at')
        .eq('page_type', pageType)
        .eq('primary_slug', primarySlug)
        .eq('secondary_slug', secondarySlug || null)
        .eq('tertiary_slug', tertiarySlug || null)
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data ? {
        exists: true,
        lastGenerated: new Date(data.last_generated_at),
        isStale: Date.now() - new Date(data.last_generated_at).getTime() > 7 * 24 * 60 * 60 * 1000 // 7 days
      } : { exists: false, isStale: false };
    } catch (error) {
      console.error('Existence check error:', error);
      return { exists: false, isStale: false };
    }
  };

  // Batch processing
  const processBatch = useCallback(async (
    batch: any[],
    generator: (request: any) => Promise<any>,
    options: { forceRegenerate?: boolean; cacheResults?: boolean } = {}
  ) => {
    const results = [];
    let successful = 0;
    let errors = 0;

    for (const request of batch) {
      try {
        const cacheKey = getCacheKey(request.pageType, request.primarySlug, request.secondarySlug, request.tertiarySlug);
        
        // Check cache first
        if (options.cacheResults && !options.forceRegenerate) {
          const cached = getFromCache(cacheKey);
          if (cached) {
            results.push({ success: true, cached: true, content: cached });
            successful++;
            continue;
          }
        }

        // Check if exists in database
        if (!options.forceRegenerate) {
          const existence = await checkExistence(
            request.pageType,
            request.primarySlug,
            request.secondarySlug,
            request.tertiarySlug
          );

          if (existence.exists && !existence.isStale) {
            results.push({ success: true, skipped: true, reason: 'already_exists' });
            successful++;
            continue;
          }
        }

        // Generate content
        const content = await generator(request);
        
        if (content) {
          // Save to database
          const saved = await saveToDatabase({
            pageType: request.pageType,
            primarySlug: request.primarySlug,
            secondarySlug: request.secondarySlug,
            tertiarySlug: request.tertiarySlug,
            content
          });

          if (saved) {
            // Cache the result
            if (options.cacheResults) {
              setToCache(cacheKey, content);
            }

            results.push({ success: true, content });
            successful++;
          } else {
            results.push({ success: false, error: 'Failed to save to database' });
            errors++;
          }
        } else {
          results.push({ success: false, error: 'Failed to generate content' });
          errors++;
        }
      } catch (error: any) {
        console.error('Batch processing error:', error);
        results.push({ success: false, error: error.message });
        errors++;
      }
    }

    return { results, successful, errors };
  }, []);

  // Statistics and monitoring
  const updateStats = (successful: number, errors: number, progress: number) => {
    setStats(prev => ({
      ...prev,
      totalGenerated: prev.totalGenerated + successful,
      totalErrors: prev.totalErrors + errors,
      progress
    }));
  };

  const startGeneration = () => {
    setStats(prev => ({
      ...prev,
      isRunning: true,
      startTime: new Date(),
      totalGenerated: 0,
      totalErrors: 0,
      progress: 0
    }));
  };

  const stopGeneration = () => {
    setStats(prev => ({
      ...prev,
      isRunning: false,
      endTime: new Date()
    }));
  };

  // Performance monitoring
  const getGenerationSpeed = (): number => {
    if (!stats.startTime || stats.totalGenerated === 0) return 0;
    
    const elapsed = stats.endTime ? 
      stats.endTime.getTime() - stats.startTime.getTime() :
      Date.now() - stats.startTime.getTime();
    
    return Math.round((stats.totalGenerated / (elapsed / 1000)) * 60); // pages per minute
  };

  const getSuccessRate = (): number => {
    const total = stats.totalGenerated + stats.totalErrors;
    return total > 0 ? Math.round((stats.totalGenerated / total) * 100) : 0;
  };

  const clearCache = () => {
    cache.clear();
    toast({
      title: "Cache Cleared",
      description: "All cached SEO content has been cleared"
    });
  };

  const getCacheStats = () => {
    return {
      size: cache.size,
      memoryUsage: Array.from(cache.values()).reduce((acc, entry) => {
        return acc + JSON.stringify(entry).length;
      }, 0)
    };
  };

  return {
    stats,
    processBatch,
    updateStats,
    startGeneration,
    stopGeneration,
    getGenerationSpeed,
    getSuccessRate,
    clearCache,
    getCacheStats,
    checkExistence,
    saveToDatabase
  };
};