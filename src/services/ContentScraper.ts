import { supabase } from '@/integrations/supabase/client';

export interface ScrapedContent {
  type: 'video' | 'article' | 'social';
  title: string;
  description?: string;
  image?: string;
  favicon?: string;
  source?: string;
  sourceUrl: string;
  embedHtml?: string;
  videoUrl?: string;
  platform?: string;
}

export class ContentScraper {
  static async scrapeUrl(url: string): Promise<ScrapedContent | null> {
    if (!url || !url.trim()) {
      return null;
    }

    console.log('🔍 Scraping URL:', url);

    try {
      // Use Supabase Edge Function for reliable server-side scraping
      const { data, error } = await supabase.functions.invoke('scrape-content', {
        body: { url }
      });

      if (error) {
        console.error('Scraping error:', error);
        return this.createFallbackContent(url);
      }

      console.log('✅ Scraped content:', data);
      return data;
    } catch (error) {
      console.error('Failed to scrape content:', error);
      return this.createFallbackContent(url);
    }
  }

  private static createFallbackContent(url: string): ScrapedContent {
    try {
      const domain = new URL(url).hostname;
      return {
        type: 'article',
        title: domain,
        description: 'Click to visit link',
        sourceUrl: url,
        source: domain,
        favicon: `https://${domain}/favicon.ico`,
        platform: 'article'
      };
    } catch {
      return {
        type: 'article',
        title: 'External Link',
        description: 'Click to visit',
        sourceUrl: url,
        source: 'External',
        platform: 'article'
      };
    }
  }

  static isYouTubeUrl(url: string): boolean {
    return url.includes('youtube.com') || url.includes('youtu.be');
  }

  static isSocialUrl(url: string): boolean {
    return url.includes('twitter.com') || 
           url.includes('x.com') ||
           url.includes('instagram.com') || 
           url.includes('facebook.com') ||
           url.includes('linkedin.com');
  }

  static detectPlatform(url: string): string {
    if (this.isYouTubeUrl(url)) return 'youtube';
    if (url.includes('twitter.com') || url.includes('x.com')) return 'twitter';
    if (url.includes('instagram.com')) return 'instagram';
    if (url.includes('facebook.com')) return 'facebook';
    if (url.includes('linkedin.com')) return 'linkedin';
    return 'article';
  }
}