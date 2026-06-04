import { supabase } from '@/integrations/supabase/client';

// Storage URL config
const CUSTOM_CDN_HOST = 'cdn.talentxcel.in';
const SUPABASE_PROJECT_REF = 'dthlgsnakhoftinssokm';
const FUNCTION_PROXY_BASE = `https://${SUPABASE_PROJECT_REF}.functions.supabase.co/storage-proxy/`;
const IMAGE_PROXY_BASE = `https://${SUPABASE_PROJECT_REF}.functions.supabase.co/image-proxy/`;
const CUSTOM_IMAGE_BASE = `https://images.talentxcel.in/image-proxy/`;

/**
 * Converts a Supabase storage URL to use custom domain
 */
export const getCustomStorageUrl = (originalUrl: string): string => {
  if (!originalUrl) return originalUrl;

  // Image-proxy edge function is currently unreliable — serve the original
  // public storage URL directly (Cloudflare CDN on Supabase handles caching).
  if (originalUrl.startsWith(IMAGE_PROXY_BASE)) {
    return originalUrl.replace(IMAGE_PROXY_BASE, `https://${SUPABASE_PROJECT_REF}.supabase.co/storage/v1/object/public/`);
  }
  if (originalUrl.startsWith(CUSTOM_IMAGE_BASE)) {
    return originalUrl.replace(CUSTOM_IMAGE_BASE, `https://${SUPABASE_PROJECT_REF}.supabase.co/storage/v1/object/public/`);
  }
  return originalUrl;
};

/**
 * Gets public URL for a storage object with custom domain
 */
export const getPublicUrlWithCustomDomain = (bucket: string, path: string): string => {
  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);
  return getCustomStorageUrl(publicUrl);
};

/**
 * Upload file and return custom domain URL with optimizations
 */
export const uploadFileWithCustomUrl = async (
  bucket: string, 
  path: string, 
  file: File | Blob,
  options?: any
): Promise<{ data: any; error: any; customUrl?: string }> => {
  // Add optimized upload options
  const optimizedOptions = {
    cacheControl: '31536000', // 1 year cache
    upsert: true,
    ...options
  };

  const result = await supabase.storage.from(bucket).upload(path, file, optimizedOptions);
  
  if (result.data && !result.error) {
    const customUrl = getPublicUrlWithCustomDomain(bucket, result.data.path);
    return { ...result, customUrl };
  }
  
  return result;
};

/**
 * Check if URL is a Supabase storage URL that should be converted
 */
export const isSupabaseStorageUrl = (url: string): boolean => {
  return url.includes(`${SUPABASE_PROJECT_REF}.supabase.co/storage/v1/object/public/`);
};

/**
 * Convert any Supabase storage URLs in an array to custom domain URLs
 */
export const convertStorageUrls = (urls: string[]): string[] => {
  return urls.map(url => getCustomStorageUrl(url));
};

/**
 * Get the original Supabase URL from a custom domain URL (for internal operations)
 */
export const getOriginalStorageUrl = (customUrl: string): string => {
  if (!customUrl) return customUrl;
  
  const publicBase = `https://${SUPABASE_PROJECT_REF}.supabase.co/storage/v1/object/public/`;
  if (customUrl.startsWith(`https://${CUSTOM_CDN_HOST}/`)) {
    return customUrl.replace(`https://${CUSTOM_CDN_HOST}/`, publicBase);
  }
  if (customUrl.startsWith(FUNCTION_PROXY_BASE)) {
    return customUrl.replace(FUNCTION_PROXY_BASE, publicBase);
  }
  if (customUrl.startsWith(IMAGE_PROXY_BASE)) {
    return customUrl.replace(IMAGE_PROXY_BASE, publicBase);
  }
  if (customUrl.startsWith(CUSTOM_IMAGE_BASE)) {
    return customUrl.replace(CUSTOM_IMAGE_BASE, publicBase);
  }
  return customUrl;
};