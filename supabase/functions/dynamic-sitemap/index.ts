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
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('🗂️ Generating dynamic sitemap...')

    // Static routes with SEO priorities
    const staticRoutes = [
      { loc: 'https://talentxcel.in/', changefreq: 'daily', priority: 1.0 },
      { loc: 'https://talentxcel.in/jobs', changefreq: 'hourly', priority: 0.9 },
      { loc: 'https://talentxcel.in/companies', changefreq: 'daily', priority: 0.8 },
      { loc: 'https://talentxcel.in/network', changefreq: 'daily', priority: 0.7 },
      { loc: 'https://talentxcel.in/courses', changefreq: 'weekly', priority: 0.6 },
      { loc: 'https://talentxcel.in/resume-builder', changefreq: 'weekly', priority: 0.7 },
      { loc: 'https://talentxcel.in/career-guidance', changefreq: 'weekly', priority: 0.6 },
      { loc: 'https://talentxcel.in/tools', changefreq: 'weekly', priority: 0.6 },
      { loc: 'https://talentxcel.in/blog', changefreq: 'daily', priority: 0.7 },
    ]

    // Fetch active jobs
    const { data: jobs, error: jobsError } = await supabase
      .from('jobs')
      .select('id, updated_at, created_at, title, companies(name)')
      .eq('is_active', true)
      .eq('job_status', 'open')
      .not('deleted_at', 'is', null)
      .order('created_at', { ascending: false })
      .limit(10000) // Reasonable limit for sitemap

    if (jobsError) {
      console.error('❌ Error fetching jobs:', jobsError)
    }

    // Fetch active companies
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('id, updated_at, name')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(5000)

    if (companiesError) {
      console.error('❌ Error fetching companies:', companiesError)
    }

    // Fetch published blog posts/articles
    const { data: articles, error: articlesError } = await supabase
      .from('blog_posts')
      .select('id, updated_at, slug, title')
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .limit(1000)

    if (articlesError) {
      console.error('❌ Error fetching articles:', articlesError)
    }

    // Generate job URLs
    const jobUrls = (jobs || []).map((job) => `
      <url>
        <loc>https://talentxcel.in/jobs/${job.id}</loc>
        <lastmod>${new Date(job.updated_at || job.created_at).toISOString()}</lastmod>
        <changefreq>daily</changefreq>
        <priority>0.9</priority>
      </url>`).join('')

    // Generate company URLs  
    const companyUrls = (companies || []).map((company) => `
      <url>
        <loc>https://talentxcel.in/companies/${company.id}</loc>
        <lastmod>${new Date(company.updated_at).toISOString()}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.7</priority>
      </url>`).join('')

    // Generate article URLs
    const articleUrls = (articles || []).map((article) => `
      <url>
        <loc>https://talentxcel.in/blog/${article.slug || article.id}</loc>
        <lastmod>${new Date(article.updated_at).toISOString()}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.6</priority>
      </url>`).join('')

    // Generate static URLs
    const staticUrls = staticRoutes.map((route) => `
      <url>
        <loc>${route.loc}</loc>
        <changefreq>${route.changefreq}</changefreq>
        <priority>${route.priority}</priority>
      </url>`).join('')

    // SEO category pages
    const categoryPages = [
      'remote-jobs', 'fresher-jobs', 'experienced-jobs', 'part-time-jobs',
      'freelance-jobs', 'internships', 'tech-jobs', 'finance-jobs', 
      'marketing-jobs', 'sales-jobs', 'bangalore-jobs', 'mumbai-jobs', 
      'delhi-jobs', 'pune-jobs', 'hyderabad-jobs', 'chennai-jobs'
    ]

    const categoryUrls = categoryPages.map((category) => `
      <url>
        <loc>https://talentxcel.in/jobs/category/${category}</loc>
        <changefreq>daily</changefreq>
        <priority>0.8</priority>
      </url>`).join('')

    // Final sitemap XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticUrls}
  ${jobUrls}
  ${companyUrls}
  ${articleUrls}
  ${categoryUrls}
</urlset>`

    console.log(`✅ Generated sitemap with:
- ${staticRoutes.length} static pages
- ${jobs?.length || 0} job pages  
- ${companies?.length || 0} company pages
- ${articles?.length || 0} article pages
- ${categoryPages.length} category pages`)

    return new Response(sitemap, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      }
    })

  } catch (error) {
    console.error('❌ Sitemap generation error:', error)
    
    // Fallback minimal sitemap
    const fallbackSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://talentxcel.in</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://talentxcel.in/jobs</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>`

    return new Response(fallbackSitemap, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml; charset=utf-8',
      }
    })
  }
})