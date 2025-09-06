import { supabase } from '@/integrations/supabase/client';

// Custom domain configuration
const CUSTOM_STORAGE_DOMAIN = 'talentxcel.in';
const SUPABASE_PROJECT_REF = 'dthlgsnakhoftinssokm';

/**
 * Converts a Supabase storage URL to use custom domain
 */
export const getCustomStorageUrl = (originalUrl: string): string => {
  if (!originalUrl) return originalUrl;
  
  // Replace Supabase domain with custom domain
  const supabaseStoragePattern = new RegExp(`https://${SUPABASE_PROJECT_REF}\\.supabase\\.co/storage/v1/object/public/`, 'g');
  return originalUrl.replace(supabaseStoragePattern, `https://cdn.${CUSTOM_STORAGE_DOMAIN}/`);
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
  
  const customDomainPattern = new RegExp(`https://cdn\\.${CUSTOM_STORAGE_DOMAIN.replace('.', '\\.')}/`, 'g');
  return customUrl.replace(customDomainPattern, `https://${SUPABASE_PROJECT_REF}.supabase.co/storage/v1/object/public/`);
};