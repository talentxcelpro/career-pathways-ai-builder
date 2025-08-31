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

    setLoading(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('url-metadata', {
        body: { url: targetUrl }
      });

      if (functionError) {
        throw new Error(functionError.message);
      }

      if (data) {
        setMetadata({
          url: targetUrl,
          title: data.title,
          description: data.description,
          image: data.image,
          domain: data.domain,
          favicon: data.favicon
        });
      }
    } catch (err) {
      console.error('Failed to fetch URL metadata:', err);
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