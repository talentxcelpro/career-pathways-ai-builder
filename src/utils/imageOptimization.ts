import { supabase } from '@/integrations/supabase/client';
import { getCustomStorageUrl } from '@/utils/storage';
import { optimizedStorage } from '@/utils/optimizedStorage';

interface ImageConfig {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
  fit?: 'cover' | 'contain' | 'fill';
}

/**
 * Instagram/LinkedIn-grade image optimization utilities
 * Handles CDN delivery, thumbnails, and mobile optimization
 */
export class ImageOptimizer {
  private static readonly SUPABASE_URL = 'https://dthlgsnakhoftinssokm.supabase.co';
  private static readonly BUCKET = 'post-media';
  
  /**
   * Get optimized Supabase Storage URL with transformations
   */
  static getOptimizedUrl(
    originalUrl: string, 
    config: ImageConfig = {}
  ): string {
    if (!originalUrl) return '/placeholder.svg';

    // Always normalize through our custom/proxy storage URL when possible
    let base = originalUrl;
    if (originalUrl.startsWith('http')) {
      base = getCustomStorageUrl(originalUrl);
    }

    // Build URL with query params safely (works for both absolute and relative URLs)
    const params = new URLSearchParams();
    if (config.width) params.set('width', String(config.width));
    if (config.height) params.set('height', String(config.height));
    if (config.quality) params.set('quality', String(config.quality));
    if (config.format) params.set('format', config.format);
    if (config.fit) params.set('resize', config.fit);

    try {
      const urlObj = new URL(base, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
      // Preserve existing params but override with our optimization ones
      params.forEach((value, key) => urlObj.searchParams.set(key, value));
      return urlObj.toString();
    } catch {
      // Fallback for cases where base isn't a valid URL in this context
      const separator = base.includes('?') ? '&' : '?';
      const query = params.toString();
      return query ? `${base}${separator}${query}` : base;
    }
  }
  /**
   * Generate thumbnail URL (like Instagram feed previews)
   */
  static getThumbnailUrl(originalUrl: string): string {
    return this.getOptimizedUrl(originalUrl, {
      width: 400,
      height: 400,
      quality: 80,
      format: 'webp',
      fit: 'cover'
    });
  }
  
  /**
   * Generate high-res URL for full-screen viewing
   */
  static getHighResUrl(originalUrl: string): string {
    return this.getOptimizedUrl(originalUrl, {
      width: 1200,
      quality: 90,
      format: 'webp'
    });
  }
  
  /**
   * Generate responsive srcSet for different screen sizes
   */
  static generateSrcSet(originalUrl: string): string {
    const sizes = [400, 800, 1200];
    return sizes.map(size => {
      const url = this.getOptimizedUrl(originalUrl, {
        width: size,
        quality: 85,
        format: 'webp'
      });
      return `${url} ${size}w`;
    }).join(', ');
  }
  
  /**
   * Upload file with automatic thumbnail generation (Instagram-style)
   */
  static async uploadFile(
    file: File, 
    userId: string,
    folder: string = 'uploads'
  ): Promise<{ fullUrl: string; thumbnailUrl: string; blurHash?: string }> {
    const fileExt = file.name.split('.').pop();
    const timestamp = Date.now();
    const baseName = `${userId}/${folder}/${timestamp}`;
    
    // Create canvas for resizing
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    return new Promise((resolve, reject) => {
      img.onload = async () => {
        try {
          // Generate thumbnail (300px wide, Instagram-style)
          const thumbnailCanvas = document.createElement('canvas');
          const thumbnailCtx = thumbnailCanvas.getContext('2d');
          const thumbnailWidth = 300;
          const thumbnailHeight = (img.height / img.width) * thumbnailWidth;
          
          thumbnailCanvas.width = thumbnailWidth;
          thumbnailCanvas.height = thumbnailHeight;
          thumbnailCtx?.drawImage(img, 0, 0, thumbnailWidth, thumbnailHeight);
          
          // Generate full-size optimized (1080px max width)
          const fullCanvas = document.createElement('canvas');
          const fullCtx = fullCanvas.getContext('2d');
          const maxWidth = 1080;
          const fullWidth = img.width > maxWidth ? maxWidth : img.width;
          const fullHeight = (img.height / img.width) * fullWidth;
          
          fullCanvas.width = fullWidth;
          fullCanvas.height = fullHeight;
          fullCtx?.drawImage(img, 0, 0, fullWidth, fullHeight);
          
          // Generate tiny blur placeholder (32px)
          const blurCanvas = document.createElement('canvas');
          const blurCtx = blurCanvas.getContext('2d');
          blurCanvas.width = 32;
          blurCanvas.height = (img.height / img.width) * 32;
          blurCtx?.drawImage(img, 0, 0, 32, blurCanvas.height);
          
          // Convert to blobs
          const thumbnailBlob = await new Promise<Blob>((resolve) => {
            thumbnailCanvas.toBlob(resolve as BlobCallback, 'image/jpeg', 0.85);
          });
          
          const fullBlob = await new Promise<Blob>((resolve) => {
            fullCanvas.toBlob(resolve as BlobCallback, 'image/jpeg', 0.90);
          });
          
          const blurDataUrl = blurCanvas.toDataURL('image/jpeg', 0.1);
          
          // Upload both versions
          const thumbnailFile = new File([thumbnailBlob!], `thumb_${timestamp}.jpg`, { type: 'image/jpeg' });
          const fullFile = new File([fullBlob!], `full_${timestamp}.jpg`, { type: 'image/jpeg' });
          
          const [thumbnailUpload, fullUpload] = await Promise.all([
            optimizedStorage.uploadFile(this.BUCKET, `${baseName}_thumb.jpg`, thumbnailFile, {
              cacheControl: '31536000',
              upsert: true
            }),
            optimizedStorage.uploadFile(this.BUCKET, `${baseName}_full.jpg`, fullFile, {
              cacheControl: '31536000', 
              upsert: true
            })
          ]);
          
          if (thumbnailUpload.error) throw thumbnailUpload.error;
          if (fullUpload.error) throw fullUpload.error;
          
          resolve({
            thumbnailUrl: `${this.SUPABASE_URL}/storage/v1/object/public/${this.BUCKET}/${thumbnailUpload.data.path}`,
            fullUrl: `${this.SUPABASE_URL}/storage/v1/object/public/${this.BUCKET}/${fullUpload.data.path}`,
            blurHash: blurDataUrl
          });
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }
  
  /**
   * Preload images for smooth scrolling (like Instagram)
   */
  static preloadImage(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = url;
    });
  }
  
  /**
   * Check if URL is a valid image
   */
  static isValidImageUrl(url: string): boolean {
    if (!url) return false;
    
    const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg)(\?|#|$)/i;
    const isSupabaseStorage = url.includes('supabase.co/storage');
    const hasImageExtension = imageExtensions.test(url);
    
    return isSupabaseStorage || hasImageExtension;
  }
  
  /**
   * Check if URL is a valid video
   */
  static isValidVideoUrl(url: string): boolean {
    if (!url) return false;
    
    const videoExtensions = /\.(mp4|webm|ogg|mov)(\?|#|$)/i;
    const isSupabaseStorage = url.includes('supabase.co/storage');
    const hasVideoExtension = videoExtensions.test(url);
    
    return (isSupabaseStorage && hasVideoExtension) || hasVideoExtension;
  }
}