import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('🗺️ Starting sitemap generation...')

    // Get all active jobs for sitemap
    const { data: jobs, error: jobsError } = await supabase
      .from('jobs')
      .select('id, title, created_at, updated_at')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (jobsError) {
      throw jobsError
    }

    console.log(`📊 Found ${jobs?.length || 0} active jobs for sitemap`)

    // Generate sitemap XML
    const baseUrl = 'https://talentxcel.in'
    const currentDate = new Date().toISOString().split('T')[0]

    let sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Homepage -->
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- Main sections -->
  <url>
    <loc>${baseUrl}/jobs</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.9</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/companies</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/network</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/learning</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`

    // Add job pages to sitemap
    if (jobs && jobs.length > 0) {
      for (const job of jobs) {
        const jobSlug = job.title
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .trim()
        
        const lastmod = job.updated_at ? 
          new Date(job.updated_at).toISOString().split('T')[0] : 
          new Date(job.created_at).toISOString().split('T')[0]

        sitemapXml += `  <url>
    <loc>${baseUrl}/jobs/${job.id}/${jobSlug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
`
      }
    }

    sitemapXml += `</urlset>`

    // Generate robots.txt
    const robotsTxt = `User-agent: *
Allow: /

# Sitemaps
Sitemap: ${baseUrl}/sitemap.xml

# Crawl-delay for politeness
Crawl-delay: 1

# Block sensitive areas
Disallow: /admin/
Disallow: /api/
Disallow: /auth/
Disallow: /_next/
Disallow: /private/

# Allow important pages
Allow: /jobs
Allow: /companies
Allow: /network
Allow: /learning
`

    console.log('✅ Generated sitemap with robots.txt')
    console.log(`📍 Sitemap contains ${jobs?.length || 0} job URLs`)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Sitemap and robots.txt generated successfully',
        stats: {
          total_urls: (jobs?.length || 0) + 4, // 4 main sections + job pages
          job_urls: jobs?.length || 0,
          generated_at: new Date().toISOString()
        },
        sitemap: sitemapXml,
        robots: robotsTxt
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('💥 Sitemap generation error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})