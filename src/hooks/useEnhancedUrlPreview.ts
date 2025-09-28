import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface EnhancedUrlMetadata {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  domain?: string;
  favicon?: string;
  siteName?: string;
  type?: 'article' | 'video' | 'image' | 'website';
  publishedTime?: string;
  author?: string;
}

export interface UseEnhancedUrlPreviewReturn {
  metadata: EnhancedUrlMetadata | null;
  loading: boolean;
  error: string | null;
  retry: () => void;
}

const extractDomain = (url: string): string => {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return '';
  }
};

const getFaviconUrl = (domain: string): string => {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
};

// Enhanced metadata extraction using multiple fallback methods
const fetchEnhancedMetadata = async (url: string): Promise<EnhancedUrlMetadata> => {
  const domain = extractDomain(url);
  
  // Try multiple metadata extraction methods
  const methods = [
    // Method 1: Try JSONLink API (free tier)
    async () => {
      const response = await fetch(`https://jsonlink.io/api/extract?url=${encodeURIComponent(url)}`);
      if (response.ok) {
        const data = await response.json();
        return {
          url,
          title: data.title,
          description: data.description,
          image: data.images?.[0],
          domain,
          favicon: getFaviconUrl(domain),
          siteName: data.site_name,
          type: data.type || 'website'
        };
      }
      throw new Error('JSONLink failed');
    },
    
    // Method 2: Try LinkPreview API
    async () => {
      const response = await fetch(`https://api.linkpreview.net/?key=YOUR_KEY&q=${encodeURIComponent(url)}`);
      if (response.ok) {
        const data = await response.json();
        return {
          url,
          title: data.title,
          description: data.description,
          image: data.image,
          domain,
          favicon: getFaviconUrl(domain),
          siteName: data.site_name,
          type: 'website'
        };
      }
      throw new Error('LinkPreview failed');
    },
    
    // Method 3: Basic fallback
    async () => {
      return {
        url,
        title: domain,
        description: `Link to ${domain}`,
        domain,
        favicon: getFaviconUrl(domain),
        type: 'website' as const
      };
    }
  ];
  
  // Try methods in sequence
  for (const method of methods) {
    try {
      const result = await method();
      if (result) return result;
    } catch (error) {
      console.log('Metadata extraction method failed:', error);
      continue;
    }
  }
  
  // Final fallback
  return {
    url,
    title: domain || 'External Link',
    description: `Link to ${domain || 'external website'}`,
    domain: domain || '',
    favicon: getFaviconUrl(domain),
    type: 'website'
  };
};

export const useEnhancedUrlPreview = (url: string | null): UseEnhancedUrlPreviewReturn => {
  const [metadata, setMetadata] = useState<EnhancedUrlMetadata | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMetadata = async (targetUrl: string) => {
    if (!targetUrl) return;

    console.log('🔍 Fetching enhanced metadata for:', targetUrl);
    setLoading(true);
    setError(null);

    try {
      // Check cache first
      const { data: cached } = await supabase
        .from('url_metadata_cache')
        .select('*')
        .eq('url', targetUrl)
        .single();

      if (cached && new Date(cached.expires_at) > new Date()) {
        console.log('✅ Using cached metadata');
        setMetadata(cached.metadata);
        setLoading(false);
        return;
      }

      // Fetch fresh metadata
      const freshMetadata = await fetchEnhancedMetadata(targetUrl);
      
      // Cache the result
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // Cache for 24 hours

      await supabase
        .from('url_metadata_cache')
        .upsert({
          url: targetUrl,
          metadata: freshMetadata,
          expires_at: expiresAt.toISOString()
        });

      setMetadata(freshMetadata);
      console.log('✅ Enhanced metadata fetched:', freshMetadata);
    } catch (err) {
      console.log('💥 Failed to fetch enhanced metadata:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch metadata');
      
      // Use basic fallback
      const domain = extractDomain(targetUrl);
      setMetadata({
        url: targetUrl,
        title: domain || 'External Link',
        description: `Link to ${domain || 'external website'}`,
        domain: domain || '',
        favicon: getFaviconUrl(domain),
        type: 'website'
      });
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
      // Debounce the API call
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