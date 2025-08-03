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
    const pathname = url.pathname
    const page = url.searchParams.get('page')
    const type = url.searchParams.get('type') || 'main'

    console.log(`🗂️ Generating sitemap type: ${type}, page: ${page}`)

    // Initialize Supabase client with anon key (public function)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Handle sitemap index
    if (type === 'index') {
      console.log('📋 Generating sitemap index...')
      
      // Get total count of active jobs to calculate number of sitemaps needed
      const { count: totalJobs } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .eq('job_status', 'open')

      const URLS_PER_SITEMAP = 50000
      const totalJobSitemaps = Math.ceil((totalJobs || 0) / URLS_PER_SITEMAP)

      console.log(`📊 Total jobs: ${totalJobs}, Total sitemaps needed: ${totalJobSitemaps}`)

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
          'Cache-Control': 'public, max-age=3600',
          ...corsHeaders
        }
      })
    }

    // Handle paginated sitemaps
    if (type === 'paginated' && page) {
      const pageNum = parseInt(page)
      const URLS_PER_SITEMAP = 50000
      const offset = (pageNum - 1) * URLS_PER_SITEMAP

      console.log(`📋 Fetching jobs ${offset} to ${offset + URLS_PER_SITEMAP}...`)
      const { data: jobs, error: jobsError } = await supabase
        .from('jobs')
        .select('id, seo_slug, updated_at, title, location, company_name')
        .eq('is_active', true)
        .eq('job_status', 'open')
        .not('seo_slug', 'is', null)
        .order('updated_at', { ascending: false })
        .range(offset, offset + URLS_PER_SITEMAP - 1)

      if (jobsError) {
        console.error('❌ Error fetching jobs:', jobsError)
      }

      const activeJobs = jobs || []
      console.log(`✅ Found ${activeJobs.length} jobs for page ${pageNum}`)

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
          'Cache-Control': 'public, max-age=1800',
          ...corsHeaders
        }
      })
    }

    // Default: Main sitemap with static URLs and categories
    console.log('📋 Fetching active jobs...')
    const { data: jobs, error: jobsError } = await supabase
      .from('jobs')
      .select('id, seo_slug, updated_at, title, location, company_name')
      .eq('is_active', true)
      .eq('job_status', 'open')
      .not('seo_slug', 'is', null)
      .order('updated_at', { ascending: false })
      .limit(10000) // Prevent oversized sitemaps

    if (jobsError) {
      console.error('❌ Error fetching jobs:', jobsError)
    }

    const activeJobs = jobs || []
    console.log(`✅ Found ${activeJobs.length} active jobs`)

    // Static URLs with priorities
    const staticUrls = [
      { loc: '/', changefreq: 'daily', priority: 1.0 },
      { loc: '/jobs', changefreq: 'hourly', priority: 0.9 },
      { loc: '/companies', changefreq: 'daily', priority: 0.8 },
      { loc: '/network', changefreq: 'daily', priority: 0.7 },
      { loc: '/resume-builder', changefreq: 'weekly', priority: 0.8 },
      { loc: '/career-guidance', changefreq: 'weekly', priority: 0.7 },
      { loc: '/tools', changefreq: 'weekly', priority: 0.6 },
      { loc: '/pricing', changefreq: 'monthly', priority: 0.5 },
      { loc: '/contact', changefreq: 'monthly', priority: 0.4 },
      { loc: '/about', changefreq: 'monthly', priority: 0.4 },
    ]

    // Job category URLs (high value for SEO)
    const jobCategories = [
      'remote-jobs', 'fresher-jobs', 'experienced-jobs', 'part-time-jobs',
      'freelance-jobs', 'internships', 'contract-jobs',
      'tech-jobs', 'software-developer', 'data-scientist', 'product-manager',
      'finance-jobs', 'marketing-jobs', 'sales-jobs', 'hr-jobs',
      'design-jobs', 'content-writer', 'business-analyst'
    ]

    // Location-based URLs (excellent for local SEO)
    const locations = [
      'bangalore', 'mumbai', 'delhi', 'pune', 'hyderabad', 'chennai',
      'kolkata', 'ahmedabad', 'surat', 'jaipur', 'lucknow', 'kanpur',
      'nagpur', 'indore', 'thane', 'bhopal', 'visakhapatnam', 'pimpri-chinchwad'
    ]

    // Salary-based URLs for better targeting
    const salaryRanges = [
      '0-3-lpa', '3-5-lpa', '5-10-lpa', '10-15-lpa', '15-20-lpa', '20-plus-lpa'
    ]

    // Helper function to format dates
    const formatDate = (date: string | null) => {
      if (!date) return new Date().toISOString().split('T')[0]
      return new Date(date).toISOString().split('T')[0]
    }

    // Build all URLs
    const allUrls = [
      // Static pages
      ...staticUrls.map(item => ({
        loc: `https://talentxcel.in${item.loc}`,
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: item.changefreq,
        priority: item.priority
      })),

      // Job category pages
      ...jobCategories.map(category => ({
        loc: `https://talentxcel.in/jobs/category/${category}`,
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: 'daily',
        priority: 0.8
      })),

      // Location-based job pages
      ...locations.map(location => ({
        loc: `https://talentxcel.in/jobs/location/${location}`,
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: 'daily',
        priority: 0.8
      })),

      // Salary-based job pages
      ...salaryRanges.map(range => ({
        loc: `https://talentxcel.in/jobs/salary/${range}`,
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: 'weekly',
        priority: 0.7
      })),
    ]

    console.log(`📊 Generated sitemap with:
- ${staticUrls.length} static pages
- ${jobCategories.length} category pages
- ${locations.length} location pages
- ${salaryRanges.length} salary pages
- ${allUrls.length} total URLs`)

    // Generate XML sitemap
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`

    return new Response(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        ...corsHeaders
      }
    })

  } catch (error) {
    console.error('❌ Sitemap generation error:', error)
    return new Response(JSON.stringify({
      error: 'Failed to generate sitemap',
      details: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})