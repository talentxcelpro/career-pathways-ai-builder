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
    console.log('📋 Generating sitemap index...')

    // Initialize Supabase client with anon key (public function)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Get total count of active jobs to calculate number of sitemaps needed
    const { count: totalJobs } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .eq('job_status', 'open')

    const URLS_PER_SITEMAP = 50000
    const STATIC_URLS_COUNT = 100 // Approximate count of static URLs + categories + locations
    
    // Calculate total sitemaps needed
    const totalJobSitemaps = Math.ceil((totalJobs || 0) / URLS_PER_SITEMAP)
    const totalSitemaps = Math.max(1, totalJobSitemaps + 1) // +1 for static URLs sitemap

    console.log(`📊 Total jobs: ${totalJobs}, Total sitemaps needed: ${totalSitemaps}`)

    // Generate sitemap index XML
    const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://talentxcel.in/api/optimized-sitemap</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </sitemap>
${Array.from({ length: totalJobSitemaps }, (_, i) => `  <sitemap>
    <loc>https://talentxcel.in/api/optimized-sitemap-${i + 1}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </sitemap>`).join('\n')}
</sitemapindex>`

    return new Response(sitemapIndex, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        ...corsHeaders
      }
    })

  } catch (error) {
    console.error('❌ Sitemap index generation error:', error)
    return new Response(JSON.stringify({
      error: 'Failed to generate sitemap index',
      details: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})