import { supabase } from '@/integrations/supabase/client';

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
    
    // If it's already a full URL, check if it's Supabase
    if (originalUrl.startsWith('http')) {
      if (!originalUrl.includes('supabase.co')) {
        return originalUrl; // External URL, return as-is
      }
      
      // It's a Supabase URL, apply transformations
      const url = new URL(originalUrl);
      const params = new URLSearchParams();
      
      if (config.width) params.set('width', config.width.toString());
      if (config.height) params.set('height', config.height.toString());
      if (config.quality) params.set('quality', config.quality.toString());
      if (config.format) params.set('format', config.format);
      if (config.fit) params.set('resize', config.fit);
      
      // Add cache busting for mobile browsers
      params.set('t', Date.now().toString().slice(-6));
      
      url.search = params.toString();
      return url.toString();
    }
    
    // Relative path - convert to full Supabase URL
    const cleanPath = originalUrl.startsWith('/') ? originalUrl.slice(1) : originalUrl;
    const baseUrl = `${this.SUPABASE_URL}/storage/v1/object/public/${this.BUCKET}/${cleanPath}`;
    
    const url = new URL(baseUrl);
    const params = new URLSearchParams();
    
    if (config.width) params.set('width', config.width.toString());
    if (config.height) params.set('height', config.height.toString());
    if (config.quality) params.set('quality', config.quality.toString());
    if (config.format) params.set('format', config.format);
    if (config.fit) params.set('resize', config.fit);
    
    // Mobile optimization
    params.set('t', Date.now().toString().slice(-6));
    
    url.search = params.toString();
    return url.toString();
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
   * Upload file to Supabase Storage with proper naming
   */
  static async uploadFile(
    file: File, 
    userId: string,
    folder: string = 'uploads'
  ): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${folder}/${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from(this.BUCKET)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) throw error;
    
    // Return full public URL
    return `${this.SUPABASE_URL}/storage/v1/object/public/${this.BUCKET}/${data.path}`;
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