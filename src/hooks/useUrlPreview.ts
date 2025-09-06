import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface UrlMetadata {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  domain?: string;
  favicon?: string;
}

export interface UseUrlPreviewReturn {
  metadata: UrlMetadata | null;
  loading: boolean;
  error: string | null;
  retry: () => void;
}

export const useUrlPreview = (url: string | null): UseUrlPreviewReturn => {
  const [metadata, setMetadata] = useState<UrlMetadata | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMetadata = async (targetUrl: string) => {
    if (!targetUrl) return;

    console.log('🔍 Fetching URL metadata for:', targetUrl);
    setLoading(true);
    setError(null);

    try {
      console.log('📡 Calling supabase function: url-metadata');
      const { data, error: functionError } = await supabase.functions.invoke('url-metadata', {
        body: { url: targetUrl }
      });

      console.log('📊 Function response:', { data, error: functionError });

      if (functionError) {
        console.error('❌ Function error:', functionError);
        throw new Error(functionError.message);
      }

      if (data) {
        console.log('✅ Successfully fetched metadata:', data);
        setMetadata({
          url: targetUrl,
          title: data.title,
          description: data.description,
          image: data.image_url || data.image, // Handle both field names
          domain: data.domain,
          favicon: data.favicon_url || data.favicon // Handle both field names
        });
      } else {
        console.warn('⚠️ No data returned from function');
      }
    } catch (err) {
      console.error('💥 Failed to fetch URL metadata:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch URL preview');
      setMetadata(null);
    } finally {
      setLoading(false);
    }
  };

  const retry = () => {
    if (url) {
      fetchMetadata(url);
    }
  };

  useEffect(() => {
    if (url && url.trim()) {
      // Debounce the API call to avoid too many requests
      const timeoutId = setTimeout(() => {
        fetchMetadata(url);
      }, 500);

      return () => clearTimeout(timeoutId);
    } else {
      setMetadata(null);
      setError(null);
      setLoading(false);
    }
  }, [url]);

  return {
    metadata,
    loading,
    error,
    retry
  };
};