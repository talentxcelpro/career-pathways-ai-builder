import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ScrapedContent {
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

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function extractTwitterId(url: string): string | null {
  const match = url.match(/twitter\.com\/\w+\/status\/(\d+)|x\.com\/\w+\/status\/(\d+)/);
  return match ? (match[1] || match[2]) : null;
}

function extractInstagramId(url: string): string | null {
  const match = url.match(/instagram\.com\/p\/([A-Za-z0-9_-]+)/);
  return match ? match[1] : null;
}

function detectPlatform(url: string): string {
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  if (url.includes('twitter.com') || url.includes('x.com')) return 'twitter';
  if (url.includes('instagram.com')) return 'instagram';
  if (url.includes('facebook.com')) return 'facebook';
  if (url.includes('linkedin.com')) return 'linkedin';
  return 'article';
}

async function scrapeYouTube(url: string): Promise<ScrapedContent | null> {
  const videoId = extractYouTubeId(url);
  if (!videoId) return null;

  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const response = await fetch(oembedUrl);
    
    if (!response.ok) return null;
    
    const data = await response.json();
    
    return {
      type: 'video',
      title: data.title || 'YouTube Video',
      description: `By ${data.author_name}`,
      image: data.thumbnail_url,
      favicon: 'https://www.youtube.com/favicon.ico',
      source: 'YouTube',
      sourceUrl: url,
      embedHtml: data.html,
      videoUrl: url,
      platform: 'youtube'
    };
  } catch (error) {
    console.error('YouTube scraping error:', error);
    return null;
  }
}

async function scrapeTwitter(url: string): Promise<ScrapedContent | null> {
  const tweetId = extractTwitterId(url);
  if (!tweetId) return null;

  try {
    // For now, return a basic preview since Twitter API requires auth
    return {
      type: 'social',
      title: 'Twitter/X Post',
      description: 'Click to view the full post on Twitter/X',
      image: 'https://abs.twimg.com/favicons/twitter.3.ico',
      favicon: 'https://abs.twimg.com/favicons/twitter.3.ico',
      source: 'Twitter/X',
      sourceUrl: url,
      platform: 'twitter'
    };
  } catch (error) {
    console.error('Twitter scraping error:', error);
    return null;
  }
}

async function scrapeInstagram(url: string): Promise<ScrapedContent | null> {
  const postId = extractInstagramId(url);
  if (!postId) return null;

  try {
    // Instagram blocks most scraping, return basic preview
    return {
      type: 'social',
      title: 'Instagram Post',
      description: 'Click to view the full post on Instagram',
      image: 'https://www.instagram.com/static/images/ico/favicon-192.png/68d99ba29cc8.png',
      favicon: 'https://www.instagram.com/static/images/ico/favicon.ico/36b3ee2d91ed.ico',
      source: 'Instagram',
      sourceUrl: url,
      platform: 'instagram'
    };
  } catch (error) {
    console.error('Instagram scraping error:', error);
    return null;
  }
}

async function scrapeGeneric(url: string): Promise<ScrapedContent | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) return null;

    const html = await response.text();
    const domain = new URL(url).hostname;

    // Basic meta tag extraction
    const titleMatch = html.match(/<meta[^>]*property=['"](og:title|twitter:title)['"][^>]*content=['"]([^'"]*)['"]/i) ||
                      html.match(/<title[^>]*>([^<]*)<\/title>/i);
    const descMatch = html.match(/<meta[^>]*property=['"](og:description|twitter:description)['"][^>]*content=['"]([^'"]*)['"]/i) ||
                     html.match(/<meta[^>]*name=['"]description['"][^>]*content=['"]([^'"]*)['"]/i);
    const imageMatch = html.match(/<meta[^>]*property=['"](og:image|twitter:image)['"][^>]*content=['"]([^'"]*)['"]/i);
    const faviconMatch = html.match(/<link[^>]*rel=['"](?:icon|shortcut icon)['"][^>]*href=['"]([^'"]*)['"]/i);

    const title = titleMatch ? (titleMatch[2] || titleMatch[1]) : domain;
    const description = descMatch ? (descMatch[2] || descMatch[1]) : '';
    const image = imageMatch ? imageMatch[2] : '';
    const favicon = faviconMatch ? 
      (faviconMatch[1].startsWith('http') ? faviconMatch[1] : `https://${domain}${faviconMatch[1]}`) : 
      `https://${domain}/favicon.ico`;

    return {
      type: 'article',
      title: title.trim(),
      description: description.trim(),
      image: image,
      favicon: favicon,
      source: domain,
      sourceUrl: url,
      platform: 'article'
    };
  } catch (error) {
    console.error('Generic scraping error:', error);
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    
    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Scraping URL:', url);
    
    const platform = detectPlatform(url);
    let content: ScrapedContent | null = null;

    switch (platform) {
      case 'youtube':
        content = await scrapeYouTube(url);
        break;
      case 'twitter':
        content = await scrapeTwitter(url);
        break;
      case 'instagram':
        content = await scrapeInstagram(url);
        break;
      default:
        content = await scrapeGeneric(url);
        break;
    }

    if (!content) {
      // Fallback to basic URL preview
      content = {
        type: 'article',
        title: url,
        description: 'Click to visit link',
        sourceUrl: url,
        source: new URL(url).hostname,
        platform: 'article'
      };
    }

    console.log('Scraped content:', content);

    return new Response(
      JSON.stringify(content),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Cache-Control': 'max-age=300' // Cache for 5 minutes
        } 
      }
    );
  } catch (error) {
    console.error('Error in scrape-content function:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to scrape content' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});