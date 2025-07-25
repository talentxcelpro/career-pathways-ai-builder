import { supabase } from "@/integrations/supabase/client";

// Media URL base - will be updated to your domain after deployment
const MEDIA_BASE_URL = 'https://dthlgsnakhoftinssokm.supabase.co/functions/v1/media-handler';

// Clean media paths for different content types
export const MEDIA_PATHS = {
  USER_MEDIA: 'user-media',
  POST_MEDIA: 'post-media', 
  DOCUMENTS: 'documents',
  RESUMES: 'resumes',
  COMPANY_ASSETS: 'company-assets',
  PORTFOLIO: 'portfolio',
  TOOLS_UPLOADS: 'tools-uploads',
  ARTICLES: 'articles',
  COVER_LETTERS: 'cover-letters',
  PREFERENCES: 'preferences'
} as const;

// Generate clean media URL
export function getMediaUrl(bucketKey: string, filePath: string): string {
  return `${MEDIA_BASE_URL}/${bucketKey}/${filePath}`;
}

// Generate user-specific file path
export function generateFilePath(userId: string, category: string, fileName: string): string {
  const timestamp = Date.now();
  const extension = fileName.split('.').pop();
  const cleanName = fileName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9-_]/g, '-');
  return `${userId}/${category}/${cleanName}-${timestamp}.${extension}`;
}

// Convert existing Supabase URL to clean media URL
export function convertToMediaUrl(supabaseUrl: string): string {
  try {
    const url = new URL(supabaseUrl);
    const pathParts = url.pathname.split('/');
    
    // Extract bucket and file path from Supabase URL
    // Format: /storage/v1/object/public/{bucket}/{path}
    if (pathParts.includes('public')) {
      const publicIndex = pathParts.indexOf('public');
      const bucket = pathParts[publicIndex + 1];
      const filePath = pathParts.slice(publicIndex + 2).join('/');
      
      // Map old bucket names to new clean paths
      const bucketMapping: Record<string, string> = {
        'avatars': MEDIA_PATHS.USER_MEDIA,
        'post-media': MEDIA_PATHS.POST_MEDIA,
        'documents': MEDIA_PATHS.DOCUMENTS,
        'resumes': MEDIA_PATHS.RESUMES,
        'company-logos': MEDIA_PATHS.COMPANY_ASSETS,
        'portfolio': MEDIA_PATHS.PORTFOLIO,
        'tool-uploads': MEDIA_PATHS.TOOLS_UPLOADS,
        'article-images': MEDIA_PATHS.ARTICLES,
        'cover-letters': MEDIA_PATHS.COVER_LETTERS,
        'preferences': MEDIA_PATHS.PREFERENCES
      };
      
      const cleanBucketKey = bucketMapping[bucket] || bucket;
      return getMediaUrl(cleanBucketKey, filePath);
    }
  } catch (error) {
    console.error('Error converting URL:', error);
  }
  
  return supabaseUrl; // Return original if conversion fails
}

// File type detection
export function getFileType(fileName: string): 'image' | 'video' | 'document' | 'audio' | 'other' {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'];
  const videoExts = ['mp4', 'webm', 'ogg', 'avi', 'mov'];
  const documentExts = ['pdf', 'doc', 'docx', 'txt', 'rtf', 'xls', 'xlsx', 'csv'];
  const audioExts = ['mp3', 'wav', 'ogg', 'aac'];
  
  if (imageExts.includes(extension || '')) return 'image';
  if (videoExts.includes(extension || '')) return 'video';
  if (documentExts.includes(extension || '')) return 'document';
  if (audioExts.includes(extension || '')) return 'audio';
  
  return 'other';
}

// Check if file can be previewed
export function canPreview(fileName: string): boolean {
  const fileType = getFileType(fileName);
  return ['image', 'video', 'document'].includes(fileType);
}

// Enhanced upload function with metadata
export async function uploadFileWithMetadata(
  file: File,
  bucketKey: string,
  metadata?: {
    userId?: string;
    module?: string;
    category?: string;
    description?: string;
    tags?: string[];
  }
): Promise<string> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const userId = metadata?.userId || user.id;
    const category = metadata?.category || 'general';
    const filePath = generateFilePath(userId, category, file.name);
    
    // Map clean bucket key to actual Supabase bucket
    const bucketMapping: Record<string, string> = {
      [MEDIA_PATHS.USER_MEDIA]: 'avatars',
      [MEDIA_PATHS.POST_MEDIA]: 'post-media',
      [MEDIA_PATHS.DOCUMENTS]: 'documents',
      [MEDIA_PATHS.RESUMES]: 'resumes',
      [MEDIA_PATHS.COMPANY_ASSETS]: 'company-logos',
      [MEDIA_PATHS.PORTFOLIO]: 'portfolio',
      [MEDIA_PATHS.TOOLS_UPLOADS]: 'tool-uploads',
      [MEDIA_PATHS.ARTICLES]: 'article-images',
      [MEDIA_PATHS.COVER_LETTERS]: 'cover-letters',
      [MEDIA_PATHS.PREFERENCES]: 'preferences'
    };
    
    const actualBucket = bucketMapping[bucketKey] || bucketKey;
    
    // Upload with metadata
    const { error } = await supabase.storage
      .from(actualBucket)
      .upload(filePath, file, {
        upsert: true,
        metadata: {
          userId,
          module: metadata?.module || 'unknown',
          category,
          description: metadata?.description || '',
          tags: metadata?.tags?.join(',') || '',
          uploadedAt: new Date().toISOString(),
          fileSize: file.size.toString(),
          mimeType: file.type
        }
      });

    if (error) throw error;
    
    // Return clean media URL
    return getMediaUrl(bucketKey, filePath);
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
}