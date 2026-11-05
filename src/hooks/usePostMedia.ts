import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to securely resolve media URLs for posts.
 * - Public media (post-media bucket or external CDN): returned immediately.
 * - Private media (post-media-private bucket): generates a fresh short-lived signed URL for authorized viewers.
 */
export function useResolvedMediaUrl(rawUrl?: string | null): { url: string | null; isLoading: boolean; error: boolean } {
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(rawUrl || null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    if (!rawUrl) {
      setResolvedUrl(null);
      setIsLoading(false);
      return;
    }

    // Genuinely public media: direct return
    if (!rawUrl.includes('post-media-private')) {
      setResolvedUrl(rawUrl);
      setIsLoading(false);
      return;
    }

    // Private media: extract path and generate authorized signed URL
    let isMounted = true;
    setIsLoading(true);
    setError(false);

    const resolvePrivateUrl = async () => {
      try {
        // Extract relative path inside post-media-private
        const match = rawUrl.match(/post-media-private\/(.*?)(?:\?|$)/);
        const path = match ? decodeURIComponent(match[1]) : rawUrl.replace(/^post-media-private:\/\//, '');

        if (!path) {
          throw new Error('Invalid private media path');
        }

        const { data, error: signError } = await supabase.storage
          .from('post-media-private')
          .createSignedUrl(path, 3600); // 1 hour token

        if (signError || !data?.signedUrl) {
          console.warn('Failed to resolve signed URL for private post media:', signError);
          if (isMounted) {
            setError(true);
            setIsLoading(false);
          }
          return;
        }

        if (isMounted) {
          setResolvedUrl(data.signedUrl);
          setIsLoading(false);
        }
      } catch (err) {
        console.warn('Error resolving private media URL:', err);
        if (isMounted) {
          setError(true);
          setIsLoading(false);
        }
      }
    };

    resolvePrivateUrl();

    return () => {
      isMounted = false;
    };
  }, [rawUrl]);

  return { url: resolvedUrl, isLoading, error };
}
