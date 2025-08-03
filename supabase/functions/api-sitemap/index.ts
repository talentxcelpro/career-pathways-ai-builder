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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Set XML content type headers
    const xmlHeaders = {
      ...corsHeaders,
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
    }

    console.log('🗺️ Generating main sitemap.xml...')

    // Generate comprehensive sitemap with all content
    const sitemap = await generateMainSitemap(supabase)
    return new Response(sitemap, { headers: xmlHeaders })

  } catch (error) {
    console.error('❌ Sitemap generation error:', error)
    return new Response(generateEmptySitemap(), { 
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml; charset=utf-8',
      }
    })
  }
})

async function generateMainSitemap(supabase: any) {
  const baseUrl = 'https://talentxcel.in'
  const now = new Date().toISOString()

  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`

  // Static pages
  const staticPages = [
    { url: '', priority: '1.0', changefreq: 'daily' },
    { url: '/jobs', priority: '0.9', changefreq: 'hourly' },
    { url: '/companies', priority: '0.8', changefreq: 'daily' },
    { url: '/resume-builder', priority: '0.8', changefreq: 'weekly' },
    { url: '/network', priority: '0.7', changefreq: 'daily' },
    { url: '/courses', priority: '0.7', changefreq: 'weekly' },
    { url: '/career-guidance', priority: '0.6', changefreq: 'weekly' },
    { url: '/about', priority: '0.5', changefreq: 'monthly' },
    { url: '/contact', priority: '0.5', changefreq: 'monthly' },
    { url: '/privacy', priority: '0.3', changefreq: 'yearly' },
    { url: '/terms', priority: '0.3', changefreq: 'yearly' },
  ]

  staticPages.forEach(page => {
    sitemap += `
  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  })

  try {
    // Add ALL active jobs (no limit for SEO)
    const { data: jobs } = await supabase
      .from('jobs')
      .select('id, title, company_name, location, created_at, updated_at, slug')
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (jobs) {
      console.log(`📊 Adding ${jobs.length} job listings to sitemap`)
      jobs.forEach((job: any) => {
        const lastmod = job.updated_at || job.created_at
        const jobSlug = job.slug || job.id
        sitemap += `
  <url>
    <loc>${baseUrl}/jobs/${jobSlug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
      })
    }

    // Add companies
    const { data: companies } = await supabase
      .from('companies')
      .select('id, name, created_at, updated_at, slug')
      .order('created_at', { ascending: false })

    if (companies) {
      console.log(`🏢 Adding ${companies.length} companies to sitemap`)
      companies.forEach((company: any) => {
        const lastmod = company.updated_at || company.created_at
        const companySlug = company.slug || company.id
        sitemap += `
  <url>
    <loc>${baseUrl}/companies/${companySlug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`
      })
    }

    // Add posts from the network/posts
    const { data: posts } = await supabase
      .from('posts')
      .select('id, headline, content, created_at, updated_at, author_id')
      .eq('status', 'published')
      .eq('visibility', 'public')
      .order('created_at', { ascending: false })

    if (posts) {
      console.log(`📝 Adding ${posts.length} posts to sitemap`)
      posts.forEach((post: any) => {
        const lastmod = post.updated_at || post.created_at
        sitemap += `
  <url>
    <loc>${baseUrl}/posts/${post.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`
      })
    }

  } catch (error) {
    console.error('⚠️ Error fetching dynamic content for sitemap:', error)
  }

  // Add SEO landing pages
  const cities = [
    'bangalore', 'mumbai', 'delhi', 'pune', 'hyderabad', 'chennai', 
    'kolkata', 'ahmedabad', 'noida', 'gurgaon'
  ]
  
  const roles = [
    'software-engineer', 'data-scientist', 'product-manager', 'ui-ux-designer',
    'business-analyst', 'marketing-manager', 'full-stack-developer',
    'frontend-developer', 'backend-developer', 'devops-engineer'
  ]

  // Jobs by location
  cities.forEach(city => {
    sitemap += `
  <url>
    <loc>${baseUrl}/jobs/location/${city}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`
  })

  // Jobs by role
  roles.forEach(role => {
    sitemap += `
  <url>
    <loc>${baseUrl}/jobs/role/${role}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`
  })

  // Companies by location
  cities.forEach(city => {
    sitemap += `
  <url>
    <loc>${baseUrl}/companies/location/${city}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`
  })

  sitemap += '\n</urlset>'
  
  const totalUrls = staticPages.length + (jobs?.length || 0) + (companies?.length || 0) + (posts?.length || 0) + cities.length * 2 + roles.length
  console.log(`✅ Generated sitemap with ${totalUrls} URLs: ${jobs?.length || 0} jobs, ${posts?.length || 0} posts, ${companies?.length || 0} companies`)
  
  return sitemap
}

function generateEmptySitemap() {
  const baseUrl = 'https://talentxcel.in'
  const now = new Date().toISOString()
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`
}