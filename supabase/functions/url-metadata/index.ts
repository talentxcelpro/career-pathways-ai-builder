import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UrlMetadata {
  url: string;
  title?: string;
  description?: string;
  image_url?: string;
  site_name?: string;
  favicon_url?: string;
  domain?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    
    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Fetching metadata for:', url);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if we have cached metadata
    const { data: cached } = await supabase
      .from('url_previews')
      .select('*')
      .eq('url', url)
      .single();

    // Return cached if valid and not expired
    if (cached && cached.is_valid && (!cached.expires_at || new Date(cached.expires_at) > new Date())) {
      console.log('Returning cached metadata');
      return new Response(JSON.stringify(cached), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Extract domain
    const urlObj = new URL(url);
    const domain = urlObj.hostname.replace('www.', '');
    
    // Fetch the webpage
    console.log('Fetching webpage content...');
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'TalentXcel Bot/1.0 (+https://talentxcel.in)'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const html = await response.text();
    console.log('Webpage fetched, parsing metadata...');

    // Extract metadata from HTML
    const metadata: UrlMetadata = {
      url,
      domain,
    };

    // Helper function to extract content from meta tags
    const getMetaContent = (property: string, attribute: string = 'property'): string | undefined => {
      const regex = new RegExp(`<meta\\s+${attribute}=["']${property}["']\\s+content=["']([^"']*?)["']`, 'i');
      const match = html.match(regex);
      return match ? match[1] : undefined;
    };

    // Helper function to extract content from name meta tags
    const getNameContent = (name: string): string | undefined => {
      return getMetaContent(name, 'name');
    };

    // Extract title
    metadata.title = 
      getMetaContent('og:title') ||
      getNameContent('twitter:title') ||
      html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] ||
      domain;

    // Extract description
    metadata.description = 
      getMetaContent('og:description') ||
      getNameContent('twitter:description') ||
      getNameContent('description') ||
      undefined;

    // Extract image
    metadata.image_url = 
      getMetaContent('og:image') ||
      getMetaContent('twitter:image') ||
      getMetaContent('twitter:image:src') ||
      undefined;

    // Extract site name
    metadata.site_name = 
      getMetaContent('og:site_name') ||
      getNameContent('application-name') ||
      domain;

    // Extract favicon
    const faviconMatch = html.match(/<link[^>]*rel=["'](?:icon|shortcut icon)["'][^>]*href=["']([^"']*?)["']/i);
    if (faviconMatch) {
      const faviconUrl = faviconMatch[1];
      metadata.favicon_url = faviconUrl.startsWith('http') ? faviconUrl : new URL(faviconUrl, url).href;
    } else {
      metadata.favicon_url = `${urlObj.protocol}//${urlObj.host}/favicon.ico`;
    }

    // Make image URLs absolute
    if (metadata.image_url && !metadata.image_url.startsWith('http')) {
      metadata.image_url = new URL(metadata.image_url, url).href;
    }

    // Clean up data
    metadata.title = metadata.title?.replace(/\s+/g, ' ').trim().substring(0, 200);
    metadata.description = metadata.description?.replace(/\s+/g, ' ').trim().substring(0, 500);

    console.log('Extracted metadata:', metadata);

    // Cache the metadata (expires in 7 days)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const { error: insertError } = await supabase
      .from('url_previews')
      .upsert({
        ...metadata,
        expires_at: expiresAt.toISOString(),
        is_valid: true
      });

    if (insertError) {
      console.error('Error caching metadata:', insertError);
    }

    return new Response(JSON.stringify(metadata), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error fetching metadata:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch metadata',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});