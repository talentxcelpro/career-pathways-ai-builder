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
      // Detect platform
      const platform = this.detectPlatform(url);
      
      if (platform === 'youtube') {
        return this.scrapeYouTube(url);
      } else if (platform === 'facebook') {
        return this.scrapeFacebook(url);
      } else if (platform === 'instagram') {
        return this.scrapeInstagram(url);
      } else if (platform === 'twitter') {
        return this.scrapeTwitter(url);
      } else if (platform === 'linkedin') {
        return this.scrapeLinkedIn(url);
      } else {
        return this.scrapeGeneric(url);
      }
    } catch (error) {
      console.error('Error scraping URL:', error);
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
      videoUrl: `https://www.youtube.com/embed/${videoId}`,
      embedHtml: `<iframe width="100%" height="400" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>`,
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
    return {
      type: 'social',
      title: 'Facebook Post',
      description: 'Check out this Facebook content',
      source: 'Facebook',
      sourceUrl: url,
      favicon: 'https://www.facebook.com/favicon.ico'
    };
  }

  private static async scrapeInstagram(url: string): Promise<ScrapedContent> {
    return {
      type: 'social',
      title: 'Instagram Post',
      description: 'Check out this Instagram content',
      source: 'Instagram',
      sourceUrl: url,
      favicon: 'https://www.instagram.com/favicon.ico'
    };
  }

  private static async scrapeTwitter(url: string): Promise<ScrapedContent> {
    return {
      type: 'social',
      title: 'X Post',
      description: 'Check out this X (Twitter) content',
      source: 'X',
      sourceUrl: url,
      favicon: 'https://abs.twimg.com/favicons/twitter.3.ico'
    };
  }

  private static async scrapeLinkedIn(url: string): Promise<ScrapedContent> {
    return {
      type: 'social',
      title: 'LinkedIn Post',
      description: 'Check out this LinkedIn content',
      source: 'LinkedIn',
      sourceUrl: url,
      favicon: 'https://www.linkedin.com/favicon.ico'
    };
  }

  private static async scrapeGeneric(url: string): Promise<ScrapedContent> {
    try {
      const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
      const data = await response.json();
      const html = data.contents;
      
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