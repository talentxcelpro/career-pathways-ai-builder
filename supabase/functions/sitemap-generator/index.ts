import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SITE_URL = 'https://talentxcel.in'
const MAX_URLS_PER_SITEMAP = 50000

interface SitemapEntry {
  url: string
  lastmod?: string
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority?: number
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const url = new URL(req.url)
    const type = url.searchParams.get('type') || 'index'
    const page = parseInt(url.searchParams.get('page') || '1')
    const submit = url.searchParams.get('submit') === 'true'

    console.log(`🗺️ Generating sitemap - Type: ${type}, Page: ${page}`)

    let response: Response

    switch (type) {
      case 'index':
        response = await generateSitemapIndex(supabase)
        break
      case 'jobs':
        response = await generateJobsSitemap(supabase, page)
        break
      case 'companies':
        response = await generateCompaniesSitemap(supabase, page)
        break
      case 'profiles':
        response = await generateProfilesSitemap(supabase, page)
        break
      case 'colleges':
        response = await generateCollegesSitemap(supabase)
        break
      case 'courses':
        response = await generateCoursesSitemap(supabase)
        break
      case 'tools':
        response = await generateToolsSitemap()
        break
      case 'static':
        response = await generateStaticSitemap()
        break
      case 'robots':
        response = await generateRobotsTxt()
        break
      case 'submit':
        response = await submitSitemapToSearchEngines()
        break
      default:
        response = new Response('Invalid sitemap type', { status: 400 })
    }

    // Auto-submit to search engines if requested
    if (submit && type === 'index') {
      try {
        await submitSitemapToSearchEngines()
        console.log('✅ Auto-submitted sitemap to search engines')
      } catch (error) {
        console.error('❌ Failed to auto-submit sitemap:', error)
      }
    }

    return response
  } catch (error) {
    console.error('💥 Sitemap generation error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

async function generateSitemapIndex(supabase: any): Promise<Response> {
  console.log('📋 Generating sitemap index...')
  
  const sitemaps = [
    `${SITE_URL}/functions/v1/sitemap-generator?type=static`,
    `${SITE_URL}/functions/v1/sitemap-generator?type=tools`,
  ]

  // Calculate paginated sitemaps for jobs
  const { count: jobsCount } = await supabase
    .from('jobs')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)
  
  const jobsPages = Math.ceil((jobsCount || 0) / MAX_URLS_PER_SITEMAP)
  for (let i = 1; i <= jobsPages; i++) {
    sitemaps.push(`${SITE_URL}/functions/v1/sitemap-generator?type=jobs&page=${i}`)
  }

  // Calculate paginated sitemaps for companies
  const { count: companiesCount } = await supabase
    .from('companies')
    .select('*', { count: 'exact', head: true })
  
  const companiesPages = Math.ceil((companiesCount || 0) / MAX_URLS_PER_SITEMAP)
  for (let i = 1; i <= companiesPages; i++) {
    sitemaps.push(`${SITE_URL}/functions/v1/sitemap-generator?type=companies&page=${i}`)
  }

  // Calculate paginated sitemaps for profiles
  const { count: profilesCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('is_profile_public', true)
  
  const profilesPages = Math.ceil((profilesCount || 0) / MAX_URLS_PER_SITEMAP)
  for (let i = 1; i <= profilesPages; i++) {
    sitemaps.push(`${SITE_URL}/functions/v1/sitemap-generator?type=profiles&page=${i}`)
  }

  // Add other content sitemaps
  sitemaps.push(`${SITE_URL}/functions/v1/sitemap-generator?type=colleges`)
  sitemaps.push(`${SITE_URL}/functions/v1/sitemap-generator?type=courses`)

  const xml = generateSitemapIndexXML(sitemaps)
  
  console.log(`✅ Generated sitemap index with ${sitemaps.length} sitemaps`)
  console.log(`📊 Content counts - Jobs: ${jobsCount}, Companies: ${companiesCount}, Profiles: ${profilesCount}`)
  
  return new Response(xml, {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600', // 1 hour cache
    },
  })
}

async function generateJobsSitemap(supabase: any, page: number): Promise<Response> {
  console.log(`💼 Generating jobs sitemap page ${page}...`)
  
  const offset = (page - 1) * MAX_URLS_PER_SITEMAP
  
  const { data: jobs, error } = await supabase
    .from('jobs')
    .select('id, title, location, updated_at, created_at, company_name')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .range(offset, offset + MAX_URLS_PER_SITEMAP - 1)

  if (error) throw error

  const urls: SitemapEntry[] = jobs.map((job: any) => {
    const slug = job.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim()
    
    return {
      url: `${SITE_URL}/jobs/${job.id}/${slug}`,
      lastmod: job.updated_at || job.created_at,
      changefreq: 'daily',
      priority: 0.8
    }
  })

  const xml = generateSitemapXML(urls)
  
  console.log(`✅ Generated jobs sitemap page ${page} with ${jobs.length} URLs`)
  
  return new Response(xml, {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=1800', // 30 minutes cache
    },
  })
}

async function generateCompaniesSitemap(supabase: any, page: number): Promise<Response> {
  console.log(`🏢 Generating companies sitemap page ${page}...`)
  
  const offset = (page - 1) * MAX_URLS_PER_SITEMAP
  
  const { data: companies, error } = await supabase
    .from('companies')
    .select('id, name, updated_at, created_at')
    .order('created_at', { ascending: false })
    .range(offset, offset + MAX_URLS_PER_SITEMAP - 1)

  if (error) throw error

  const urls: SitemapEntry[] = companies.map((company: any) => {
    const slug = company.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim()

    return {
      url: `${SITE_URL}/companies/${company.id}/${slug}`,
      lastmod: company.updated_at || company.created_at,
      changefreq: 'weekly',
      priority: 0.7
    }
  })

  const xml = generateSitemapXML(urls)
  
  console.log(`✅ Generated companies sitemap page ${page} with ${companies.length} URLs`)
  
  return new Response(xml, {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600', // 1 hour cache
    },
  })
}

async function generateProfilesSitemap(supabase: any, page: number): Promise<Response> {
  console.log(`👤 Generating profiles sitemap page ${page}...`)
  
  const offset = (page - 1) * MAX_URLS_PER_SITEMAP
  
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, username, custom_profile_url, full_name, updated_at, created_at')
    .eq('is_profile_public', true)
    .order('created_at', { ascending: false })
    .range(offset, offset + MAX_URLS_PER_SITEMAP - 1)

  if (error) throw error

  const urls: SitemapEntry[] = profiles.map((profile: any) => {
    const slug = profile.custom_profile_url || profile.username || profile.id
    
    return {
      url: `${SITE_URL}/profile/${slug}`,
      lastmod: profile.updated_at || profile.created_at,
      changefreq: 'weekly',
      priority: 0.6
    }
  })

  const xml = generateSitemapXML(urls)
  
  console.log(`✅ Generated profiles sitemap page ${page} with ${profiles.length} URLs`)
  
  return new Response(xml, {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600', // 1 hour cache
    },
  })
}

async function generateCollegesSitemap(supabase: any): Promise<Response> {
  console.log('🎓 Generating colleges sitemap...')
  
  const { data: colleges, error } = await supabase
    .from('colleges')
    .select('id, name, updated_at, created_at')
    .order('created_at', { ascending: false })

  if (error) throw error

  const urls: SitemapEntry[] = colleges.map((college: any) => {
    const slug = college.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim()

    return {
      url: `${SITE_URL}/colleges/${college.id}/${slug}`,
      lastmod: college.updated_at || college.created_at,
      changefreq: 'monthly',
      priority: 0.6
    }
  })

  const xml = generateSitemapXML(urls)
  
  console.log(`✅ Generated colleges sitemap with ${colleges.length} URLs`)
  
  return new Response(xml, {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=7200', // 2 hours cache
    },
  })
}

async function generateCoursesSitemap(supabase: any): Promise<Response> {
  console.log('📚 Generating courses sitemap...')
  
  const { data: courses, error } = await supabase
    .from('courses')
    .select('id, title, updated_at, created_at')
    .order('created_at', { ascending: false })

  if (error) throw error

  const urls: SitemapEntry[] = courses.map((course: any) => {
    const slug = course.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim()

    return {
      url: `${SITE_URL}/learning/${course.id}/${slug}`,
      lastmod: course.updated_at || course.created_at,
      changefreq: 'weekly',
      priority: 0.7
    }
  })

  const xml = generateSitemapXML(urls)
  
  console.log(`✅ Generated courses sitemap with ${courses.length} URLs`)
  
  return new Response(xml, {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600', // 1 hour cache
    },
  })
}

async function generateToolsSitemap(): Promise<Response> {
  console.log('🔧 Generating tools sitemap...')
  
  const toolPages = [
    { slug: 'resume-builder', priority: 0.9 },
    { slug: 'ats-checker', priority: 0.8 },
    { slug: 'cover-letter-generator', priority: 0.8 },
    { slug: 'interview-prep', priority: 0.7 },
    { slug: 'salary-calculator', priority: 0.7 },
    { slug: 'skill-assessment', priority: 0.7 },
    { slug: 'career-path-finder', priority: 0.8 },
    { slug: 'job-tracker', priority: 0.6 },
    { slug: 'linkedin-optimizer', priority: 0.6 },
    { slug: 'portfolio-builder', priority: 0.6 }
  ]

  const urls: SitemapEntry[] = toolPages.map(tool => ({
    url: `${SITE_URL}/tools/${tool.slug}`,
    lastmod: new Date().toISOString(),
    changefreq: 'monthly',
    priority: tool.priority
  }))

  const xml = generateSitemapXML(urls)
  
  console.log(`✅ Generated tools sitemap with ${toolPages.length} URLs`)
  
  return new Response(xml, {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400', // 24 hours cache
    },
  })
}

async function generateStaticSitemap(): Promise<Response> {
  console.log('📄 Generating static pages sitemap...')
  
  const staticPages = [
    { url: '', priority: 1.0, changefreq: 'daily' as const }, // Homepage
    { url: 'jobs', priority: 0.9, changefreq: 'hourly' as const },
    { url: 'companies', priority: 0.8, changefreq: 'daily' as const },
    { url: 'network', priority: 0.8, changefreq: 'daily' as const },
    { url: 'learning', priority: 0.8, changefreq: 'weekly' as const },
    { url: 'tools', priority: 0.8, changefreq: 'weekly' as const },
    { url: 'colleges', priority: 0.7, changefreq: 'weekly' as const },
    { url: 'career-map', priority: 0.7, changefreq: 'weekly' as const },
    { url: 'about', priority: 0.5, changefreq: 'monthly' as const },
    { url: 'contact', priority: 0.5, changefreq: 'monthly' as const },
    { url: 'privacy', priority: 0.3, changefreq: 'yearly' as const },
    { url: 'terms', priority: 0.3, changefreq: 'yearly' as const }
  ]

  const urls: SitemapEntry[] = staticPages.map(page => ({
    url: `${SITE_URL}/${page.url}`,
    lastmod: new Date().toISOString(),
    changefreq: page.changefreq,
    priority: page.priority
  }))

  const xml = generateSitemapXML(urls)
  
  console.log(`✅ Generated static sitemap with ${staticPages.length} URLs`)
  
  return new Response(xml, {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400', // 24 hours cache
    },
  })
}

async function generateRobotsTxt(): Promise<Response> {
  console.log('🤖 Generating robots.txt...')
  
  const robotsTxt = `User-agent: *
Allow: /

# High-crawl sections
Allow: /jobs
Allow: /companies
Allow: /network
Allow: /learning
Allow: /tools
Allow: /colleges
Allow: /profile

# Block sensitive areas
Disallow: /admin/
Disallow: /api/
Disallow: /auth/
Disallow: /_next/
Disallow: /private/
Disallow: /employer/settings
Disallow: /resume/edit

# Sitemaps
Sitemap: ${SITE_URL}/functions/v1/sitemap-generator?type=index
Sitemap: ${SITE_URL}/sitemap.xml

# Crawl-delay for politeness
Crawl-delay: 1

# Block AI crawlers if needed (optional)
# User-agent: ChatGPT-User
# Disallow: /

# User-agent: GPTBot
# Disallow: /`

  return new Response(robotsTxt, {
    headers: {
      ...corsHeaders,
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400', // 24 hours cache
    },
  })
}

async function submitSitemapToSearchEngines(): Promise<Response> {
  console.log('🚀 Submitting sitemap to search engines...')
  
  const sitemapUrl = `${SITE_URL}/functions/v1/sitemap-generator?type=index`
  
  try {
    const results = []

    // Submit to Google
    try {
      const googleResponse = await fetch(
        `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`
      )
      results.push({
        engine: 'Google',
        success: googleResponse.ok,
        status: googleResponse.status
      })
      console.log(`📊 Google submission: ${googleResponse.ok ? 'SUCCESS' : 'FAILED'} (${googleResponse.status})`)
    } catch (error) {
      results.push({
        engine: 'Google',
        success: false,
        error: error.message
      })
    }

    // Submit to Bing
    try {
      const bingResponse = await fetch(
        `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`
      )
      results.push({
        engine: 'Bing',
        success: bingResponse.ok,
        status: bingResponse.status
      })
      console.log(`📊 Bing submission: ${bingResponse.ok ? 'SUCCESS' : 'FAILED'} (${bingResponse.status})`)
    } catch (error) {
      results.push({
        engine: 'Bing',
        success: false,
        error: error.message
      })
    }

    return new Response(JSON.stringify({
      success: true,
      submitted_at: new Date().toISOString(),
      sitemap_url: sitemapUrl,
      results: results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('❌ Error submitting sitemap:', error)
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
}

function generateSitemapIndexXML(sitemaps: string[]): string {
  const date = new Date().toISOString()
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps.map(sitemap => `  <sitemap>
    <loc>${sitemap}</loc>
    <lastmod>${date}</lastmod>
  </sitemap>`).join('\n')}
</sitemapindex>`
}

function generateSitemapXML(urls: SitemapEntry[]): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(entry => `  <url>
    <loc>${entry.url}</loc>
    ${entry.lastmod ? `<lastmod>${new Date(entry.lastmod).toISOString()}</lastmod>` : ''}
    ${entry.changefreq ? `<changefreq>${entry.changefreq}</changefreq>` : ''}
    ${entry.priority ? `<priority>${entry.priority}</priority>` : ''}
  </url>`).join('\n')}
</urlset>`
}