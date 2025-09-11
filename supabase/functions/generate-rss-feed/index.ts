import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/rss+xml',
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

    // Get recent news articles
    const { data: articles, error } = await supabaseClient
      .from('news_articles')
      .select(`
        id,
        title,
        summary,
        content,
        slug,
        published_at,
        created_at,
        image_url,
        category,
        tags
      `)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching articles:', error);
      throw error;
    }

    const baseUrl = 'https://talentxcel.in';
    const now = new Date().toUTCString();

    const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>TalentXcel - Latest News &amp; Press Releases</title>
    <link>${baseUrl}/news</link>
    <description>Stay updated with the latest news, announcements, and press releases from TalentXcel - India's leading career platform</description>
    <language>en-us</language>
    <lastBuildDate>${now}</lastBuildDate>
    <generator>TalentXcel RSS Generator</generator>
    <webMaster>contact@talentxcel.in (TalentXcel Team)</webMaster>
    <managingEditor>contact@talentxcel.in (TalentXcel Team)</managingEditor>
    <image>
      <url>${baseUrl}/lovable-uploads/711de76d-0f05-4939-b8b5-4acd21eb3119.png</url>
      <title>TalentXcel</title>
      <link>${baseUrl}/news</link>
      <width>144</width>
      <height>144</height>
    </image>
${articles?.map(article => `    <item>
      <title><![CDATA[${article.title}]]></title>
      <link>${baseUrl}/news/${article.slug}</link>
      <description><![CDATA[${article.summary || article.content?.substring(0, 200) + '...'}]]></description>
      <content:encoded><![CDATA[
        ${article.image_url ? `<img src="${article.image_url}" alt="${article.title}" style="max-width: 100%; height: auto; margin-bottom: 16px;" />` : ''}
        <h2>${article.title}</h2>
        ${article.content || ''}
        <p><a href="${baseUrl}/news/${article.slug}">Read full article on TalentXcel</a></p>
      ]]></content:encoded>
      <pubDate>${new Date(article.published_at || article.created_at).toUTCString()}</pubDate>
      <guid isPermaLink="true">${baseUrl}/news/${article.slug}</guid>
      <category>${article.category || 'News'}</category>
      ${article.tags ? article.tags.map(tag => `<category>${tag}</category>`).join('\n      ') : ''}
    </item>`).join('\n') || ''}
  </channel>
</rss>`;

    return new Response(rssXml, {
      headers: corsHeaders,
      status: 200,
    });

  } catch (error) {
    console.error('RSS generation error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate RSS feed' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});