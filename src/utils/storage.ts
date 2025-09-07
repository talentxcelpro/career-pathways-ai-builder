import { supabase } from '@/integrations/supabase/client';

// Storage URL config
const CUSTOM_CDN_HOST = 'cdn.talentxcel.in';
const SUPABASE_PROJECT_REF = 'dthlgsnakhoftinssokm';
const FUNCTION_PROXY_BASE = `https://${SUPABASE_PROJECT_REF}.functions.supabase.co/storage-proxy/`;
const IMAGE_PROXY_BASE = `https://${SUPABASE_PROJECT_REF}.functions.supabase.co/image-proxy/`;
const CUSTOM_IMAGE_BASE = `https://talentxcel.in/api/images/`; // For future custom domain

/**
 * Converts a Supabase storage URL to use custom domain
 */
export const getCustomStorageUrl = (originalUrl: string): string => {
  if (!originalUrl) return originalUrl;
  
  // If it's a Supabase public storage URL, convert to our image proxy for SEO
  const publicBaseRegex = /https:\/\/[a-z0-9-]+\.supabase\.co\/storage\/v1\/object\/public\//i;
  if (publicBaseRegex.test(originalUrl)) {
    const path = originalUrl.replace(publicBaseRegex, '');
    
    // Use image proxy for SEO-friendly URLs served from talentxcel.in infrastructure
    return `${IMAGE_PROXY_BASE}${path}`;
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
 * Upload file and return custom domain URL
 */
export const uploadFileWithCustomUrl = async (
  bucket: string, 
  path: string, 
  file: File | Blob,
  options?: any
): Promise<{ data: any; error: any; customUrl?: string }> => {
  const result = await supabase.storage.from(bucket).upload(path, file, options);
  
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