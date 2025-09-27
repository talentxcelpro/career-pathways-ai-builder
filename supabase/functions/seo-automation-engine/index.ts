import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SEOPageRequest {
  pageType: 'job' | 'profile' | 'company' | 'location' | 'skill' | 'industry' | 'salary' | 'category'
  primarySlug: string
  secondarySlug?: string
  tertiarySlug?: string
  batchSize?: number
  priority?: 'high' | 'medium' | 'low'
}

interface SEOContent {
  metaTitle: string
  metaDescription: string
  h1Title: string
  introContent: string
  mainContent: string
  faqs: Array<{ question: string; answer: string }>
  structuredData: any
  keywords: string[]
  canonicalUrl: string
  breadcrumbs: Array<{ name: string; url: string }>
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
    const action = url.searchParams.get('action') || 'generate'

    switch (action) {
      case 'generate':
        return await generateSEOPages(req, supabase)
      case 'bulk-generate':
        return await bulkGenerateSEOPages(req, supabase)
      case 'sitemap':
        return await generateDynamicSitemap(req, supabase)
      case 'performance':
        return await getSEOPerformance(req, supabase)
      case 'status':
        return await getSEOStatus(req, supabase)
      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }
  } catch (error) {
    console.error('SEO Automation Engine Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

async function generateSEOPages(req: Request, supabase: any) {
  const { pageType, primarySlug, secondarySlug, tertiarySlug, priority = 'medium' }: SEOPageRequest = await req.json()

  // Generate SEO content based on page type
  const seoContent = await generateSEOContent(pageType, primarySlug, secondarySlug, tertiarySlug, supabase)
  
  // Save to database with caching
  const { data: savedContent, error } = await supabase
    .from('seo_generated_content')
    .upsert({
      page_type: pageType,
      primary_slug: primarySlug,
      secondary_slug: secondarySlug,
      tertiary_slug: tertiarySlug,
      meta_title: seoContent.metaTitle,
      meta_description: seoContent.metaDescription,
      h1_title: seoContent.h1Title,
      intro_content: seoContent.introContent,
      content_blocks: { main: seoContent.mainContent },
      faqs: seoContent.faqs,
      structured_data: seoContent.structuredData,
      keywords: seoContent.keywords,
      canonical_url: seoContent.canonicalUrl,
      breadcrumbs: seoContent.breadcrumbs,
      quality_score: calculateQualityScore(seoContent),
      last_generated_at: new Date().toISOString(),
      is_active: true
    })
    .select()
    .single()

  if (error) throw error

  // Schedule sitemap update
  await scheduleSitemapUpdate(pageType, supabase)

  return new Response(JSON.stringify({
    success: true,
    content: savedContent,
    message: 'SEO page generated successfully'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function bulkGenerateSEOPages(req: Request, supabase: any) {
  const { requests, batchSize = 100 }: { requests: SEOPageRequest[], batchSize?: number } = await req.json()

  const results = []
  const batches = []
  
  // Split into batches
  for (let i = 0; i < requests.length; i += batchSize) {
    batches.push(requests.slice(i, i + batchSize))
  }

  let totalGenerated = 0
  for (const batch of batches) {
    const batchPromises = batch.map(async (request) => {
      try {
        const content = await generateSEOContent(
          request.pageType,
          request.primarySlug,
          request.secondarySlug,
          request.tertiarySlug,
          supabase
        )
        
        return {
          page_type: request.pageType,
          primary_slug: request.primarySlug,
          secondary_slug: request.secondarySlug,
          tertiary_slug: request.tertiarySlug,
          meta_title: content.metaTitle,
          meta_description: content.metaDescription,
          h1_title: content.h1Title,
          intro_content: content.introContent,
          content_blocks: { main: content.mainContent },
          faqs: content.faqs,
          structured_data: content.structuredData,
          keywords: content.keywords,
          canonical_url: content.canonicalUrl,
          breadcrumbs: content.breadcrumbs,
          quality_score: calculateQualityScore(content),
          last_generated_at: new Date().toISOString(),
          is_active: true
        }
      } catch (error) {
        console.error(`Error generating content for ${request.primarySlug}:`, error)
        return null
      }
    })

    const batchResults = (await Promise.all(batchPromises)).filter(Boolean)
    
    if (batchResults.length > 0) {
      const { data, error } = await supabase
        .from('seo_generated_content')
        .upsert(batchResults)
        .select()

      if (!error) {
        totalGenerated += batchResults.length
        results.push(...(data || []))
      }
    }

    // Small delay between batches to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  return new Response(JSON.stringify({
    success: true,
    totalGenerated,
    totalRequested: requests.length,
    message: `Generated ${totalGenerated} SEO pages successfully`
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function generateDynamicSitemap(req: Request, supabase: any) {
  const url = new URL(req.url)
  const type = url.searchParams.get('type') || 'all'
  const page = parseInt(url.searchParams.get('page') || '1')
  const limit = parseInt(url.searchParams.get('limit') || '50000')

  const baseUrl = 'https://talentxcel.in'
  const now = new Date().toISOString()

  let query = supabase
    .from('seo_generated_content')
    .select('page_type, primary_slug, secondary_slug, tertiary_slug, last_generated_at, quality_score')
    .eq('is_active', true)

  if (type !== 'all') {
    query = query.eq('page_type', type)
  }

  const { data: seoPages, error } = await query
    .order('quality_score', { ascending: false })
    .range((page - 1) * limit, page * limit - 1)

  if (error) throw error

  const urls = seoPages?.map(page => {
    const urlPath = buildSEOUrl(page.page_type, page.primary_slug, page.secondary_slug, page.tertiary_slug)
    const priority = calculateUrlPriority(page.page_type, page.quality_score)
    const changefreq = getChangeFrequency(page.page_type)

    return `  <url>
    <loc>${baseUrl}${urlPath}</loc>
    <lastmod>${page.last_generated_at}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
  }).join('\n') || ''

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`

  return new Response(xmlContent, {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/xml'
    }
  })
}

async function getSEOPerformance(req: Request, supabase: any) {
  const { data: stats } = await supabase
    .from('seo_generated_content')
    .select('page_type, quality_score, last_generated_at')
    .eq('is_active', true)

  const performance = {
    totalPages: stats?.length || 0,
    byPageType: {},
    averageQuality: 0,
    recentlyUpdated: 0
  }

  if (stats) {
    // Group by page type
    stats.forEach(page => {
      if (!performance.byPageType[page.page_type]) {
        performance.byPageType[page.page_type] = { count: 0, avgQuality: 0 }
      }
      performance.byPageType[page.page_type].count++
    })

    // Calculate average quality
    performance.averageQuality = stats.reduce((sum, page) => sum + (page.quality_score || 0), 0) / stats.length

    // Count recently updated (last 24 hours)
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    performance.recentlyUpdated = stats.filter(page => page.last_generated_at > yesterday).length
  }

  return new Response(JSON.stringify({
    success: true,
    performance,
    timestamp: new Date().toISOString()
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function getSEOStatus(req: Request, supabase: any) {
  // Get comprehensive status of SEO system
  const [contentStats, recentActivity, topPerformers] = await Promise.all([
    supabase.from('seo_generated_content').select('page_type').eq('is_active', true),
    supabase.from('seo_generated_content').select('*').gte('last_generated_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()).limit(10),
    supabase.from('seo_generated_content').select('*').eq('is_active', true).order('quality_score', { ascending: false }).limit(10)
  ])

  return new Response(JSON.stringify({
    success: true,
    status: {
      totalPages: contentStats.data?.length || 0,
      recentActivity: recentActivity.data || [],
      topPerformers: topPerformers.data || []
    }
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function generateSEOContent(
  pageType: string,
  primarySlug: string,
  secondarySlug?: string,
  tertiarySlug?: string,
  supabase?: any
): Promise<SEOContent> {
  // This would integrate with AI content generation
  // For now, returning structured template-based content

  const templates = {
    job: {
      metaTitle: `${formatSlug(primarySlug)} Jobs${secondarySlug ? ` in ${formatSlug(secondarySlug)}` : ''} | TalentXcel`,
      h1Title: `${formatSlug(primarySlug)} Jobs${secondarySlug ? ` in ${formatSlug(secondarySlug)}` : ''}`,
      introContent: `Find the best ${formatSlug(primarySlug)} opportunities${secondarySlug ? ` in ${formatSlug(secondarySlug)}` : ''}. Browse thousands of jobs from top companies with competitive salaries and benefits.`
    },
    location: {
      metaTitle: `Jobs in ${formatSlug(primarySlug)} | Top Companies Hiring | TalentXcel`,
      h1Title: `Jobs in ${formatSlug(primarySlug)}`,
      introContent: `Discover exciting career opportunities in ${formatSlug(primarySlug)}. Connect with leading employers and find your dream job in this thriving location.`
    },
    skill: {
      metaTitle: `${formatSlug(primarySlug)} Jobs | Skills-Based Opportunities | TalentXcel`,
      h1Title: `${formatSlug(primarySlug)} Opportunities`,
      introContent: `Leverage your ${formatSlug(primarySlug)} skills to advance your career. Find roles that match your expertise and grow professionally.`
    }
  }

  const template = templates[pageType] || templates.job
  
  return {
    metaTitle: template.metaTitle,
    metaDescription: template.introContent.substring(0, 160),
    h1Title: template.h1Title,
    introContent: template.introContent,
    mainContent: generateMainContent(pageType, primarySlug, secondarySlug, tertiarySlug),
    faqs: generateFAQs(pageType, primarySlug),
    structuredData: generateStructuredData(pageType, primarySlug, secondarySlug),
    keywords: generateKeywords(pageType, primarySlug, secondarySlug),
    canonicalUrl: buildSEOUrl(pageType, primarySlug, secondarySlug, tertiarySlug),
    breadcrumbs: generateBreadcrumbs(pageType, primarySlug, secondarySlug, tertiarySlug)
  }
}

function formatSlug(slug: string): string {
  return slug.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
}

function buildSEOUrl(pageType: string, primary: string, secondary?: string, tertiary?: string): string {
  const parts = [pageType, primary, secondary, tertiary].filter(Boolean)
  return '/' + parts.join('/')
}

function calculateQualityScore(content: SEOContent): number {
  let score = 50 // Base score
  
  // Title optimization
  if (content.metaTitle.length >= 30 && content.metaTitle.length <= 60) score += 10
  
  // Description optimization
  if (content.metaDescription.length >= 120 && content.metaDescription.length <= 160) score += 10
  
  // Content length
  if (content.mainContent.length > 300) score += 10
  
  // FAQs present
  if (content.faqs.length >= 3) score += 10
  
  // Keywords variety
  if (content.keywords.length >= 5) score += 10
  
  return Math.min(score, 100)
}

function calculateUrlPriority(pageType: string, qualityScore: number): string {
  const basePriority = {
    job: 0.9,
    location: 0.8,
    skill: 0.7,
    company: 0.8,
    industry: 0.6,
    salary: 0.6
  }[pageType] || 0.5
  
  const qualityBonus = (qualityScore - 50) / 100 * 0.1
  return Math.min(basePriority + qualityBonus, 1.0).toFixed(1)
}

function getChangeFrequency(pageType: string): string {
  return {
    job: 'daily',
    location: 'weekly',
    skill: 'weekly',
    company: 'weekly',
    industry: 'monthly',
    salary: 'monthly'
  }[pageType] || 'weekly'
}

function generateMainContent(pageType: string, primary: string, secondary?: string, tertiary?: string): string {
  // Template-based content generation
  return `Comprehensive content about ${formatSlug(primary)}${secondary ? ` in ${formatSlug(secondary)}` : ''}.`
}

function generateFAQs(pageType: string, primary: string): Array<{ question: string; answer: string }> {
  return [
    {
      question: `What are the best ${formatSlug(primary)} opportunities?`,
      answer: `Top ${formatSlug(primary)} opportunities include roles at leading companies with competitive salaries and growth potential.`
    },
    {
      question: `How do I find ${formatSlug(primary)} jobs?`,
      answer: `Use TalentXcel's advanced search filters to find ${formatSlug(primary)} positions that match your skills and preferences.`
    },
    {
      question: `What skills are needed for ${formatSlug(primary)}?`,
      answer: `Key skills for ${formatSlug(primary)} include both technical expertise and soft skills like communication and problem-solving.`
    }
  ]
}

function generateStructuredData(pageType: string, primary: string, secondary?: string): any {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": `${formatSlug(primary)}${secondary ? ` in ${formatSlug(secondary)}` : ''} | TalentXcel`,
    "description": `Find ${formatSlug(primary)} opportunities${secondary ? ` in ${formatSlug(secondary)}` : ''} on TalentXcel`,
    "url": `https://talentxcel.in${buildSEOUrl(pageType, primary, secondary)}`
  }
}

function generateKeywords(pageType: string, primary: string, secondary?: string): string[] {
  const base = [primary, `${primary} jobs`, `${primary} careers`]
  if (secondary) {
    base.push(`${primary} ${secondary}`, `${primary} jobs ${secondary}`)
  }
  return base
}

function generateBreadcrumbs(pageType: string, primary: string, secondary?: string, tertiary?: string): Array<{ name: string; url: string }> {
  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: formatSlug(pageType), url: `/${pageType}` }
  ]
  
  if (primary) {
    breadcrumbs.push({ name: formatSlug(primary), url: `/${pageType}/${primary}` })
  }
  
  if (secondary) {
    breadcrumbs.push({ name: formatSlug(secondary), url: `/${pageType}/${primary}/${secondary}` })
  }
  
  return breadcrumbs
}

async function scheduleSitemapUpdate(pageType: string, supabase: any) {
  // Schedule sitemap regeneration
  await supabase.from('seo_sitemap_queue').insert({
    sitemap_type: pageType,
    status: 'pending',
    scheduled_at: new Date().toISOString()
  })
}