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

    console.log('🔍 Creating basic URL metadata for:', targetUrl);
    setLoading(true);
    setError(null);

    try {
      // Create basic metadata from URL to avoid edge function errors
      const urlObj = new URL(targetUrl);
      const basicMetadata: UrlMetadata = {
        url: targetUrl,
        title: urlObj.hostname.replace('www.', ''),
        description: `Link to ${urlObj.hostname}`,
        domain: urlObj.hostname,
        favicon: `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=32`
      };
      
      setMetadata(basicMetadata);
      console.log('✅ Basic metadata created:', basicMetadata);
    } catch (err) {
      console.log('💥 Failed to create URL metadata:', err);
      setError(err instanceof Error ? err.message : 'Failed to create URL metadata');
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