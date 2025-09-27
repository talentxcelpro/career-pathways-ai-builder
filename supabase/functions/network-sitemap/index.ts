import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SitemapEntry {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

const generateSitemapXML = (entries: SitemapEntry[]): string => {
  const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>\n';
  const urlsetOpen = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  const urlsetClose = '</urlset>';

  const urlEntries = entries.map(entry => {
    let urlXml = `  <url>\n    <loc>${entry.loc}</loc>\n`;
    
    if (entry.lastmod) {
      urlXml += `    <lastmod>${entry.lastmod}</lastmod>\n`;
    }
    
    if (entry.changefreq) {
      urlXml += `    <changefreq>${entry.changefreq}</changefreq>\n`;
    }
    
    if (entry.priority) {
      urlXml += `    <priority>${entry.priority}</priority>\n`;
    }
    
    urlXml += `  </url>`;
    return urlXml;
  }).join('\n');

  return xmlHeader + urlsetOpen + urlEntries + '\n' + urlsetClose;
};

const generateSitemapIndex = (sitemapUrls: string[]): string => {
  const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>\n';
  const sitemapIndexOpen = '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  const sitemapIndexClose = '</sitemapindex>';

  const sitemapEntries = sitemapUrls.map(url => 
    `  <sitemap>\n    <loc>${url}</loc>\n    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n  </sitemap>`
  ).join('\n');

  return xmlHeader + sitemapIndexOpen + sitemapEntries + '\n' + sitemapIndexClose;
};

const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .substring(0, 100);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const baseUrl = 'https://talentxcel.in';
    const url = new URL(req.url);
    const sitemapType = url.searchParams.get('type') || 'index';

    // Generate main network sitemap index
    if (sitemapType === 'index') {
      const sitemapUrls = [
        `${baseUrl}/sitemap-network-posts-1.xml`,
        `${baseUrl}/sitemap-network-posts-2.xml`,
        `${baseUrl}/sitemap-network-profiles-1.xml`,
        `${baseUrl}/sitemap-network-profiles-2.xml`,
        `${baseUrl}/sitemap-network-communities-1.xml`,
        `${baseUrl}/sitemap-network-events-1.xml`,
      ];

      const sitemapIndex = generateSitemapIndex(sitemapUrls);

      return new Response(sitemapIndex, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/xml',
        },
      });
    }

    // Generate posts sitemap
    if (sitemapType === 'posts') {
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = 10000;
      const offset = (page - 1) * limit;

      const { data: posts } = await supabase
        .from('posts')
        .select('id, headline, updated_at, created_at')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      const sitemapEntries: SitemapEntry[] = posts?.map(post => ({
        loc: `${baseUrl}/feed/post/${generateSlug(post.headline || `post-${post.id}`)}`,
        lastmod: new Date(post.updated_at || post.created_at).toISOString().split('T')[0],
        changefreq: 'daily',
        priority: 0.9
      })) || [];

      const sitemap = generateSitemapXML(sitemapEntries);

      return new Response(sitemap, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/xml',
        },
      });
    }

    // Generate profiles sitemap
    if (sitemapType === 'profiles') {
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = 10000;
      const offset = (page - 1) * limit;

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, updated_at, created_at')
        .not('full_name', 'is', null)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      const sitemapEntries: SitemapEntry[] = profiles?.map(profile => ({
        loc: `${baseUrl}/network/${generateSlug(profile.full_name || `user-${profile.id}`)}`,
        lastmod: new Date(profile.updated_at || profile.created_at).toISOString().split('T')[0],
        changefreq: 'weekly',
        priority: 0.8
      })) || [];

      const sitemap = generateSitemapXML(sitemapEntries);

      return new Response(sitemap, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/xml',
        },
      });
    }

    // Generate communities sitemap
    if (sitemapType === 'communities') {
      const { data: communities } = await supabase
        .from('communities')
        .select('id, name, updated_at, created_at')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(10000);

      const sitemapEntries: SitemapEntry[] = communities?.map(community => ({
        loc: `${baseUrl}/communities/${generateSlug(community.name || `community-${community.id}`)}`,
        lastmod: new Date(community.updated_at || community.created_at).toISOString().split('T')[0],
        changefreq: 'weekly',
        priority: 0.7
      })) || [];

      const sitemap = generateSitemapXML(sitemapEntries);

      return new Response(sitemap, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/xml',
        },
      });
    }

    // Generate events sitemap
    if (sitemapType === 'events') {
      const { data: events } = await supabase
        .from('events')
        .select('id, title, updated_at, created_at')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(10000);

      const sitemapEntries: SitemapEntry[] = events?.map(event => ({
        loc: `${baseUrl}/events/${generateSlug(event.title || `event-${event.id}`)}`,
        lastmod: new Date(event.updated_at || event.created_at).toISOString().split('T')[0],
        changefreq: 'weekly',
        priority: 0.7
      })) || [];

      const sitemap = generateSitemapXML(sitemapEntries);

      return new Response(sitemap, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/xml',
        },
      });
    }

    return new Response(
      JSON.stringify({ error: 'Invalid sitemap type' }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error) {
    console.error('Error generating network sitemap:', error);
    
    return new Response(
      JSON.stringify({
        error: 'Failed to generate network sitemap',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});