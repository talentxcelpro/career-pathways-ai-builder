interface ScrapedContent {
  type: 'video' | 'article' | 'image' | 'social';
  title?: string;
  description?: string;
  image?: string;
  videoUrl?: string;
  embedHtml?: string;
  author?: string;
  source: string;
  sourceUrl: string;
  favicon?: string;
}

export class ContentScraper {
  static async scrapeUrl(url: string): Promise<ScrapedContent | null> {
    try {
      console.log('🔍 Scraping URL:', url);
      
      // Detect platform
      const platform = this.detectPlatform(url);
      console.log('📱 Detected platform:', platform);
      
      let result: ScrapedContent | null = null;
      
      if (platform === 'youtube') {
        result = await this.scrapeYouTube(url);
      } else if (platform === 'facebook') {
        result = await this.scrapeFacebook(url);
      } else if (platform === 'instagram') {
        result = await this.scrapeInstagram(url);
      } else if (platform === 'twitter') {
        result = await this.scrapeTwitter(url);
      } else if (platform === 'linkedin') {
        result = await this.scrapeLinkedIn(url);
      } else {
        result = await this.scrapeGeneric(url);
      }
      
      console.log('✅ Scraped result:', result);
      return result;
    } catch (error) {
      console.error('❌ Error scraping URL:', error);
      return null;
    }
  }

  private static detectPlatform(url: string): string {
    const hostname = new URL(url).hostname.toLowerCase();
    
    if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
      return 'youtube';
    } else if (hostname.includes('facebook.com') || hostname.includes('fb.com')) {
      return 'facebook';
    } else if (hostname.includes('instagram.com')) {
      return 'instagram';
    } else if (hostname.includes('twitter.com') || hostname.includes('x.com')) {
      return 'twitter';
    } else if (hostname.includes('linkedin.com')) {
      return 'linkedin';
    }
    
    return 'generic';
  }

  private static async scrapeYouTube(url: string): Promise<ScrapedContent> {
    const videoId = this.extractYouTubeId(url);
    
    return {
      type: 'video',
      title: 'YouTube Video',
      videoUrl: `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`,
      embedHtml: `<iframe width="100%" height="400" src="https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen loading="lazy"></iframe>`,
      source: 'YouTube',
      sourceUrl: url,
      favicon: 'https://www.youtube.com/favicon.ico'
    };
  }

  private static extractYouTubeId(url: string): string {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : '';
  }

  private static async scrapeFacebook(url: string): Promise<ScrapedContent> {
    console.log('🔵 Processing Facebook URL:', url);
    
    // Facebook blocks scraping, so we provide a generic social embed
    const result = {
      type: 'social' as const,
      title: 'Facebook Post',
      description: 'Interesting content shared from Facebook community',
      source: 'Facebook',
      sourceUrl: url,
      favicon: 'https://static.xx.fbcdn.net/rsrc.php/yo/r/iRmz9lCMBD2.ico'
    };
    
    console.log('🔵 Facebook result:', result);
    return result;
  }

  private static async scrapeInstagram(url: string): Promise<ScrapedContent> {
    // Instagram blocks scraping, so we provide a generic social embed
    return {
      type: 'social',
      title: 'Instagram Post',
      description: 'Visual content shared from Instagram community',
      source: 'Instagram',
      sourceUrl: url,
      favicon: 'https://static.cdninstagram.com/rsrc.php/v3/yz/r/VrKyJon-pE1.ico'
    };
  }

  private static async scrapeTwitter(url: string): Promise<ScrapedContent> {
    // Twitter/X blocks scraping, so we provide a generic social embed
    return {
      type: 'social',
      title: 'X Post',
      description: 'Insights and updates shared from X (formerly Twitter)',
      source: 'X',
      sourceUrl: url,
      favicon: 'https://abs.twimg.com/favicons/twitter.3.ico'
    };
  }

  private static async scrapeLinkedIn(url: string): Promise<ScrapedContent> {
    // LinkedIn has strict CORS policies, so we provide a generic embed
    return {
      type: 'social',
      title: 'LinkedIn Post',
      description: 'Professional content shared from LinkedIn network',
      source: 'LinkedIn',
      sourceUrl: url,
      favicon: 'https://static.licdn.com/sc/h/al2o9zrvru7aqj8e1x2rzsrca'
    };
  }

  private static async scrapeGeneric(url: string): Promise<ScrapedContent> {
    try {
      // Use a CORS proxy for fetching external content
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl);
      
      if (!response.ok) {
        throw new Error('Failed to fetch content');
      }
      
      const data = await response.json();
      const html = data.contents;
      
      if (!html) {
        throw new Error('No content received');
      }
      
      // Extract meta tags
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
      const imageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
      
      const hostname = new URL(url).hostname;
      
      return {
        type: 'article',
        title: titleMatch ? titleMatch[1] : hostname,
        description: descMatch ? descMatch[1] : '',
        image: imageMatch ? imageMatch[1] : '',
        source: hostname,
        sourceUrl: url,
        favicon: `https://${hostname}/favicon.ico`
      };
    } catch (error) {
      const hostname = new URL(url).hostname;
      return {
        type: 'article',
        title: hostname,
        source: hostname,
        sourceUrl: url
      };
    }
  }
}

export type { ScrapedContent };