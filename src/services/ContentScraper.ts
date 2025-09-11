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
    const origin = typeof window !== 'undefined' ? `&origin=${encodeURIComponent(window.location.origin)}` : '';
    const embedSrc = `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1${origin}`;
    
    return {
      type: 'video',
      title: 'YouTube Video',
      videoUrl: embedSrc,
      embedHtml: `<iframe width="100%" height="400" src="${embedSrc}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen loading="lazy"></iframe>`,
      source: 'YouTube',
      sourceUrl: url,
      favicon: 'https://www.youtube.com/favicon.ico'
    };
  }

  private static extractYouTubeId(url: string): string {
    try {
      const u = new URL(url);
      const host = u.hostname.toLowerCase();
      // youtu.be/<id>
      if (host.includes('youtu.be')) {
        const id = u.pathname.split('/').filter(Boolean)[0];
        return id ? id.substring(0, 11) : '';
      }
      // watch?v=<id>
      const v = u.searchParams.get('v');
      if (v && v.length >= 11) return v.substring(0, 11);
      // /embed/<id>, /v/<id>, /shorts/<id>, /live/<id>
      const parts = u.pathname.split('/').filter(Boolean);
      const markerIndex = parts.findIndex(p => ['embed', 'v', 'shorts', 'live'].includes(p));
      if (markerIndex !== -1 && parts[markerIndex + 1]) {
        return parts[markerIndex + 1].substring(0, 11);
      }
      // fallback: any path segment that looks like an id
      const candidate = parts.find(p => p.length >= 11);
      if (candidate) return candidate.substring(0, 11);
    } catch (e) {
      // ignore parse errors
    }
    const match = url.match(/(?:v=|\/embed\/|\/shorts\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
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
      console.log('🌐 Generic scrape start:', url);
      // Use a CORS proxy for fetching external content
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl);
      
      if (!response.ok) {
        throw new Error('Failed to fetch content');
      }
      
      const data = await response.json();
      const html: string = data.contents;
      
      if (!html) {
        throw new Error('No content received');
      }
      
      // Helpers to extract meta tags
      const getMeta = (regex: RegExp) => {
        const m = html.match(regex);
        return m && m[1] ? m[1].trim() : '';
      };
      
      // Try multiple strategies for title/description/image
      const rawTitle =
        getMeta(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i) ||
        getMeta(/<meta[^>]*name=["']twitter:title["'][^>]*content=["']([^"']+)["']/i) ||
        getMeta(/<title[^>]*>([^<]+)<\/title>/i);
      
      const rawDesc =
        getMeta(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i) ||
        getMeta(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i) ||
        getMeta(/<meta[^>]*name=["']twitter:description["'][^>]*content=["']([^"']+)["']/i);
      
      const rawImg =
        getMeta(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ||
        getMeta(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i);
      
      const u = new URL(url);
      const hostname = u.hostname;
      
      // Resolve relative image URLs
      let image = rawImg;
      try {
        if (image) {
          image = new URL(image, u.origin).toString();
        }
      } catch {}

      const title = rawTitle || hostname;
      const description = rawDesc || '';
      
      const result: ScrapedContent = {
        type: 'article',
        title,
        description,
        image: image || '',
        source: hostname,
        sourceUrl: url,
        // Use Google s2 favicons for better reliability
        favicon: `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`
      };

      console.log('🌐 Generic scrape result:', result);
      return result;
    } catch (error) {
      console.warn('🌐 Generic scrape fallback due to error:', error);
      const hostname = new URL(url).hostname;
      return {
        type: 'article',
        title: hostname,
        source: hostname,
        sourceUrl: url,
        favicon: `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`
      };
    }
  }
}

export type { ScrapedContent };