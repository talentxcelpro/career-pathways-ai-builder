import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SEOCacheData {
  content: any;
  meta_data: any;
  structured_data: any;
  last_generated: string;
  is_fresh: boolean;
}

interface SEOCacheOptions {
  ttl?: number; // Time to live in minutes
  forceRefresh?: boolean;
  pageType: string;
  pageId?: string;
}

export const useSEOCache = (cacheKey: string, options: SEOCacheOptions) => {
  const [cacheData, setCacheData] = useState<SEOCacheData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getCachedContent = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check cache first
      if (!options.forceRefresh) {
        const { data: cached, error: cacheError } = await supabase
          .from('seo_cache')
          .select('*')
          .eq('cache_key', cacheKey)
          .gt('expires_at', new Date().toISOString())
          .eq('is_fresh', true)
          .single();

        if (cached && !cacheError) {
          setCacheData(cached);
          
          // Update hit count
          await supabase
            .from('seo_cache')
            .update({ hit_count: cached.hit_count + 1 })
            .eq('id', cached.id);
            
          setIsLoading(false);
          return cached;
        }
      }

      // Generate new content if cache miss or force refresh
      const newContent = await generateSEOContent(options);
      
      // Store in cache
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + (options.ttl || 60));

      // Safe upsert without ON CONFLICT: select -> update or insert
      const { data: existing, error: existsErr } = await supabase
        .from('seo_cache')
        .select('id, hit_count')
        .eq('cache_key', cacheKey)
        .maybeSingle();

      if (existsErr) {
        console.error('SEO cache existence check error:', existsErr);
      }

      let savedCache: any = null;
      if (existing?.id) {
        const { data: updated, error: updateErr } = await supabase
          .from('seo_cache')
          .update({
            content: newContent.content,
            meta_data: newContent.meta_data,
            structured_data: newContent.structured_data,
            page_type: options.pageType,
            page_id: options.pageId,
            expires_at: expiresAt.toISOString(),
            is_fresh: true,
            hit_count: (existing.hit_count || 0) + 1
          })
          .eq('id', existing.id)
          .select()
          .single();
        if (!updateErr) savedCache = updated;
      } else {
        const { data: inserted, error: insertErr } = await supabase
          .from('seo_cache')
          .insert({
            cache_key: cacheKey,
            content: newContent.content,
            meta_data: newContent.meta_data,
            structured_data: newContent.structured_data,
            page_type: options.pageType,
            page_id: options.pageId,
            expires_at: expiresAt.toISOString(),
            is_fresh: true,
            hit_count: 1
          })
          .select()
          .single();
        if (!insertErr) savedCache = inserted;
      }


      setCacheData(savedCache || newContent);
      setIsLoading(false);
      return savedCache || newContent;
    } catch (err) {
      console.error('SEO Cache error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setIsLoading(false);
    }
  };

  const invalidateCache = async () => {
    await supabase
      .from('seo_cache')
      .update({ is_fresh: false })
      .eq('cache_key', cacheKey);
  };

  const generateSEOContent = async (options: SEOCacheOptions) => {
    // This would integrate with your existing SEO generation logic
    return {
      content: {},
      meta_data: {},
      structured_data: {},
      last_generated: new Date().toISOString(),
      is_fresh: true
    };
  };

  useEffect(() => {
    getCachedContent();
  }, [cacheKey, options.forceRefresh]);

  return {
    cacheData,
    isLoading,
    error,
    refresh: () => getCachedContent(),
    invalidate: invalidateCache
  };
};