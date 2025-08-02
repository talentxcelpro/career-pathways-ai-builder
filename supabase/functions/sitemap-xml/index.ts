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

    const url = new URL(req.url)
    const pathname = url.pathname

    // Set XML content type headers
    const xmlHeaders = {
      ...corsHeaders,
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
    }

    // Main sitemap index
    if (pathname === '/sitemap.xml' || pathname === '/') {
      const sitemapIndex = generateSitemapIndex()
      return new Response(sitemapIndex, { headers: xmlHeaders })
    }

    // Jobs sitemap
    if (pathname === '/sitemap-jobs.xml') {
      const jobsSitemap = await generateJobsSitemap(supabase)
      return new Response(jobsSitemap, { headers: xmlHeaders })
    }

    // Companies sitemap
    if (pathname === '/sitemap-companies.xml') {
      const companiesSitemap = await generateCompaniesSitemap(supabase)
      return new Response(companiesSitemap, { headers: xmlHeaders })
    }

    // Static pages sitemap
    if (pathname === '/sitemap-static.xml') {
      const staticSitemap = generateStaticSitemap()
      return new Response(staticSitemap, { headers: xmlHeaders })
    }

    // SEO pages sitemap
    if (pathname === '/sitemap-seo.xml') {
      const seoSitemap = generateSEOSitemap()
      return new Response(seoSitemap, { headers: xmlHeaders })
    }

    // If no matching sitemap, return 404
    return new Response('Sitemap not found', { status: 404 })

  } catch (error) {
    console.error('Sitemap generation error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
})

function generateSitemapIndex() {
  const baseUrl = 'https://talentxcel.in'
  const now = new Date().toISOString()

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${baseUrl}/sitemap-static.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/sitemap-jobs.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/sitemap-companies.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/sitemap-seo.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
</sitemapindex>`
}

function generateStaticSitemap() {
  const baseUrl = 'https://talentxcel.in'
  const now = new Date().toISOString()

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

  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`

  staticPages.forEach(page => {
    sitemap += `
  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  })

  sitemap += '\n</urlset>'
  return sitemap
}

async function generateJobsSitemap(supabase: any) {
  const baseUrl = 'https://talentxcel.in'
  
  try {
    // Get active jobs (limit to 1000 for performance)
    const { data: jobs, error } = await supabase
      .from('jobs')
      .select('id, title, company_name, location, created_at, updated_at')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1000)

    if (error) {
      console.error('Error fetching jobs:', error)
      return generateEmptySitemap()
    }

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`

    jobs?.forEach(job => {
      const slug = generateJobSlug(job.title, job.company_name, job.location)
      const lastmod = job.updated_at || job.created_at
      
      sitemap += `
  <url>
    <loc>${baseUrl}/jobs/${job.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`

      // Also add SEO-friendly URLs
      sitemap += `
  <url>
    <loc>${baseUrl}/jobs/${slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`
    })

    sitemap += '\n</urlset>'
    return sitemap

  } catch (error) {
    console.error('Error generating jobs sitemap:', error)
    return generateEmptySitemap()
  }
}

async function generateCompaniesSitemap(supabase: any) {
  const baseUrl = 'https://talentxcel.in'
  
  try {
    // Get companies (limit to 1000 for performance)
    const { data: companies, error } = await supabase
      .from('companies')
      .select('id, name, location, created_at, updated_at')
      .order('created_at', { ascending: false })
      .limit(1000)

    if (error) {
      console.error('Error fetching companies:', error)
      return generateEmptySitemap()
    }

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`

    companies?.forEach(company => {
      const slug = generateCompanySlug(company.name)
      const lastmod = company.updated_at || company.created_at
      
      sitemap += `
  <url>
    <loc>${baseUrl}/companies/${company.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`

      // Also add SEO-friendly URLs
      sitemap += `
  <url>
    <loc>${baseUrl}/companies/${slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`
    })

    sitemap += '\n</urlset>'
    return sitemap

  } catch (error) {
    console.error('Error generating companies sitemap:', error)
    return generateEmptySitemap()
  }
}

function generateSEOSitemap() {
  const baseUrl = 'https://talentxcel.in'
  const now = new Date().toISOString()

  // Generate SEO landing pages for major cities and roles
  const cities = [
    'bangalore', 'mumbai', 'delhi', 'pune', 'hyderabad', 'chennai', 
    'kolkata', 'ahmedabad', 'noida', 'gurgaon', 'kochi', 'coimbatore'
  ]
  
  const roles = [
    'software-engineer', 'data-scientist', 'product-manager', 'ui-ux-designer',
    'business-analyst', 'marketing-manager', 'sales-manager', 'hr-manager',
    'full-stack-developer', 'frontend-developer', 'backend-developer',
    'devops-engineer', 'qa-engineer', 'project-manager'
  ]

  const skills = [
    'javascript', 'python', 'java', 'react', 'node-js', 'sql', 'aws',
    'machine-learning', 'digital-marketing', 'data-analysis', 'figma',
    'adobe-photoshop', 'excel', 'powerbi', 'salesforce'
  ]

  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`

  // Jobs by location pages
  cities.forEach(city => {
    sitemap += `
  <url>
    <loc>${baseUrl}/jobs/location/${city}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`

    // Jobs by role and location
    roles.slice(0, 5).forEach(role => {
      sitemap += `
  <url>
    <loc>${baseUrl}/jobs/location/${city}/${role}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>`
    })
  })

  // Jobs by role pages
  roles.forEach(role => {
    sitemap += `
  <url>
    <loc>${baseUrl}/jobs/role/${role}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`
  })

  // Skill guide pages
  skills.forEach(skill => {
    sitemap += `
  <url>
    <loc>${baseUrl}/skills/${skill}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`
  })

  // Career path pages
  roles.forEach(role => {
    sitemap += `
  <url>
    <loc>${baseUrl}/career-paths/${role}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`
  })

  sitemap += '\n</urlset>'
  return sitemap
}

function generateEmptySitemap() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`
}

function generateJobSlug(title: string, company: string, location: string) {
  const combined = `${title}-${company}-${location}`
  return combined
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 100)
}

function generateCompanySlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 100)
}