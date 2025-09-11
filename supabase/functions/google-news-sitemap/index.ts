import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/xml',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    // Get recent news articles (last 2 days for Google News)
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
    
    const { data: articles, error } = await supabaseClient
      .from('news_articles')
      .select(`
        id,
        title,
        slug,
        published_at,
        created_at,
        category
      `)
      .eq('status', 'published')
      .gte('published_at', twoDaysAgo)
      .order('published_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error fetching articles:', error);
      throw error;
    }

    const baseUrl = 'https://talentxcel.in';

    // Google News sitemap format
    const xmlHeader = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">`;
    
    const xmlFooter = '</urlset>';
    
    const xmlUrls = articles?.map(article => `  <url>
    <loc>${baseUrl}/news/${article.slug}</loc>
    <lastmod>${article.published_at || article.created_at}</lastmod>
    <news:news>
      <news:publication>
        <news:name>TalentXcel</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${article.published_at || article.created_at}</news:publication_date>
      <news:title><![CDATA[${article.title}]]></news:title>
      <news:keywords>${article.category || 'Career, Technology, Business'}</news:keywords>
    </news:news>
  </url>`).join('\n') || '';

    const sitemap = `${xmlHeader}\n${xmlUrls}\n${xmlFooter}`;

    // Log sitemap generation
    await supabaseClient
      .from('function_health_logs')
      .insert({
        function_name: 'google-news-sitemap',
        status: 'success',
        request_count: 1,
        response_time_ms: Date.now() % 1000
      });

    return new Response(sitemap, {
      headers: corsHeaders,
      status: 200,
    });

  } catch (error) {
    console.error('Google News sitemap error:', error);
    
    // Log error
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );
    
    await supabaseClient
      .from('function_health_logs')
      .insert({
        function_name: 'google-news-sitemap',
        status: 'error',
        error_message: error.message,
        request_count: 1
      });

    return new Response(
      JSON.stringify({ error: 'Failed to generate Google News sitemap' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});