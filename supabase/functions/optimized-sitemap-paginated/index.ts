import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const URLS_PER_SITEMAP = 50000

    console.log(`🗂️ Generating paginated sitemap page ${page}...`)

    // Initialize Supabase client with anon key (public function)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Calculate offset for pagination
    const offset = (page - 1) * URLS_PER_SITEMAP
    const limit = URLS_PER_SITEMAP

    // Fetch active jobs for this page
    console.log(`📋 Fetching jobs ${offset} to ${offset + limit}...`)
    const { data: jobs, error: jobsError } = await supabase
      .from('jobs')
      .select('id, seo_slug, updated_at, title, location, company_name')
      .eq('status', 'active')
      .not('seo_slug', 'is', null)
      .order('updated_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (jobsError) {
      console.error('❌ Error fetching jobs:', jobsError)
    }

    const activeJobs = jobs || []
    console.log(`✅ Found ${activeJobs.length} jobs for page ${page}`)

    // Helper function to format dates
    const formatDate = (date: string | null) => {
      if (!date) return new Date().toISOString().split('T')[0]
      return new Date(date).toISOString().split('T')[0]
    }

    // Build job URLs for this page
    const jobUrls = activeJobs.map(job => ({
      loc: `https://talentxcel.in/jobs/${job.seo_slug || job.id}`,
      lastmod: formatDate(job.updated_at),
      changefreq: 'hourly',
      priority: 0.9
    }))

    console.log(`📊 Generated sitemap page ${page} with ${jobUrls.length} URLs`)

    // Generate XML sitemap for this page
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${jobUrls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`

    return new Response(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=1800', // Cache for 30 minutes
        ...corsHeaders
      }
    })

  } catch (error) {
    console.error('❌ Paginated sitemap generation error:', error)
    return new Response(JSON.stringify({
      error: 'Failed to generate paginated sitemap',
      details: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})