import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sitemapType = 'full', limit = 50000 } = await req.json().catch(() => ({}));
    
    console.log(`Generating massive sitemap: ${sitemapType}, limit: ${limit}`);
    
    const baseUrl = 'https://talentxcel.in';
    const now = new Date().toISOString();
    
    // Log the generation start
    const { data: logEntry } = await supabase
      .from('sitemap_generation_log')
      .insert({
        generation_type: sitemapType,
        status: 'in_progress',
        pages_generated: 0,
        generation_time_ms: 0
      })
      .select()
      .single();

    const startTime = Date.now();
    let totalUrls = 0;
    let sitemapContent = '';

    if (sitemapType === 'full' || sitemapType === 'seo') {
      // Generate SEO content combinations
      const seoUrls = await generateSEOContentSitemap(baseUrl, now, limit);
      sitemapContent += seoUrls.content;
      totalUrls += seoUrls.count;
    }

    if (sitemapType === 'full' || sitemapType === 'dynamic') {
      // Generate dynamic content pages
      const dynamicUrls = await generateDynamicContentSitemap(baseUrl, now, limit);
      sitemapContent += dynamicUrls.content;
      totalUrls += dynamicUrls.count;
    }

    if (sitemapType === 'full' || sitemapType === 'social') {
      // Generate social media integrated pages
      const socialUrls = await generateSocialMediaSitemap(baseUrl, now, limit);
      sitemapContent += socialUrls.content;
      totalUrls += socialUrls.count;
    }

    if (sitemapType === 'full' || sitemapType === 'ai') {
      // Generate AI-powered content pages
      const aiUrls = await generateAIContentSitemap(baseUrl, now, limit);
      sitemapContent += aiUrls.content;
      totalUrls += aiUrls.count;
    }

    // Build final sitemap
    const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
    const xmlFooter = '</urlset>';
    const finalSitemap = `${xmlHeader}\n${sitemapContent}\n${xmlFooter}`;

    const generationTime = Date.now() - startTime;

    // Update log entry
    if (logEntry) {
      await supabase
        .from('sitemap_generation_log')
        .update({
          status: 'completed',
          pages_generated: totalUrls,
          generation_time_ms: generationTime,
          completed_at: new Date().toISOString()
        })
        .eq('id', logEntry.id);
    }

    console.log(`Massive sitemap generated: ${totalUrls} URLs in ${generationTime}ms`);

    return new Response(JSON.stringify({
      sitemap: finalSitemap,
      stats: {
        total_urls: totalUrls,
        generation_time_ms: generationTime,
        sitemap_type: sitemapType,
        generated_at: now
      }
    }), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600'
      },
    });

  } catch (error) {
    console.error('Error in massive sitemap generator:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      sitemap: '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateSEOContentSitemap(baseUrl: string, lastmod: string, limit: number) {
  const { data: seoPages } = await supabase
    .from('seo_content_combinations')
    .select('*')
    .eq('is_active', true)
    .limit(Math.min(limit, 10000));

  let content = '';
  let count = 0;

  if (seoPages) {
    for (const page of seoPages) {
      content += `  <url>
    <loc>${baseUrl}${page.page_path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${page.priority > 0.8 ? 'daily' : 'weekly'}</changefreq>
    <priority>${page.priority}</priority>
  </url>\n`;
      count++;
    }
  }

  return { content, count };
}

async function generateDynamicContentSitemap(baseUrl: string, lastmod: string, limit: number) {
  // Dynamic job, company, and course pages
  const locations = ['bangalore', 'mumbai', 'delhi', 'hyderabad', 'chennai', 'pune', 'kolkata', 'gurgaon', 'noida', 'ahmedabad'];
  const roles = ['software-engineer', 'data-scientist', 'product-manager', 'devops-engineer', 'ui-ux-designer', 'business-analyst', 'full-stack-developer', 'frontend-developer', 'backend-developer', 'mobile-developer'];
  const skills = ['javascript', 'python', 'react', 'java', 'aws', 'machine-learning', 'nodejs', 'angular', 'vue', 'docker', 'kubernetes', 'sql', 'mongodb', 'redis'];
  const industries = ['fintech', 'healthcare', 'ecommerce', 'edtech', 'gaming', 'travel', 'logistics', 'media', 'retail', 'manufacturing'];
  const experienceLevels = ['entry-level', 'mid-level', 'senior-level', 'lead', 'principal', 'director'];
  const salaryRanges = ['0-5-lakh', '5-10-lakh', '10-20-lakh', '20-50-lakh', '50-lakh-plus'];

  let content = '';
  let count = 0;
  const maxPages = Math.min(limit, 50000);

  // Job pages by combinations
  for (const location of locations) {
    for (const role of roles) {
      if (count >= maxPages) break;
      content += `  <url>
    <loc>${baseUrl}/jobs/${location}/${role}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>\n`;
      count++;

      for (const experience of experienceLevels.slice(0, 3)) {
        if (count >= maxPages) break;
        content += `  <url>
    <loc>${baseUrl}/jobs/${location}/${role}/${experience}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>\n`;
        count++;
      }
    }
    if (count >= maxPages) break;
  }

  // Company pages by location and industry
  for (const location of locations) {
    for (const industry of industries.slice(0, 5)) {
      if (count >= maxPages) break;
      content += `  <url>
    <loc>${baseUrl}/companies/${location}/${industry}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>\n`;
      count++;
    }
  }

  // Salary pages
  for (const role of roles) {
    for (const location of locations.slice(0, 5)) {
      if (count >= maxPages) break;
      content += `  <url>
    <loc>${baseUrl}/salary/${role}/${location}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>\n`;
      count++;
    }
  }

  return { content, count };
}

async function generateSocialMediaSitemap(baseUrl: string, lastmod: string, limit: number) {
  const { data: socialContent } = await supabase
    .from('social_media_content')
    .select('*')
    .eq('is_published', true)
    .limit(Math.min(limit, 5000));

  let content = '';
  let count = 0;

  if (socialContent) {
    for (const item of socialContent) {
      content += `  <url>
    <loc>${baseUrl}/social/${item.content_type}/${item.id}</loc>
    <lastmod>${item.updated_at || lastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>\n`;
      count++;
    }
  }

  return { content, count };
}

async function generateAIContentSitemap(baseUrl: string, lastmod: string, limit: number) {
  const { data: aiContent } = await supabase
    .from('ai_content_generation_queue')
    .select('*')
    .eq('status', 'completed')
    .eq('is_published', true)
    .limit(Math.min(limit, 5000));

  let content = '';
  let count = 0;

  if (aiContent) {
    for (const item of aiContent) {
      const slug = item.metadata?.slug || `ai-content-${item.id}`;
      content += `  <url>
    <loc>${baseUrl}/ai-content/${item.content_type}/${slug}</loc>
    <lastmod>${item.updated_at || lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>\n`;
      count++;
    }
  }

  return { content, count };
}