import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SitemapRequest {
  format?: 'xml' | 'json'
  type?: 'full' | 'jobs' | 'companies' | 'pages'
  limit?: number
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('🗺️ Sitemap Generator Starting...')
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    const url = new URL(req.url)
    const format = url.searchParams.get('format') || 'xml'
    const type = url.searchParams.get('type') || 'full'
    const limit = parseInt(url.searchParams.get('limit') || '10000')

    console.log(`📊 Generating ${format} sitemap of type: ${type}`)

    let urls: any[] = []

    // Static pages
    if (type === 'full' || type === 'pages') {
      const staticPages = [
        { url: '/', lastmod: new Date().toISOString(), changefreq: 'daily', priority: '1.0' },
        { url: '/jobs', lastmod: new Date().toISOString(), changefreq: 'hourly', priority: '0.9' },
        { url: '/companies', lastmod: new Date().toISOString(), changefreq: 'daily', priority: '0.8' },
        { url: '/learning', lastmod: new Date().toISOString(), changefreq: 'weekly', priority: '0.8' },
        { url: '/tools', lastmod: new Date().toISOString(), changefreq: 'weekly', priority: '0.7' },
        { url: '/career-map', lastmod: new Date().toISOString(), changefreq: 'weekly', priority: '0.7' },
        { url: '/network', lastmod: new Date().toISOString(), changefreq: 'daily', priority: '0.6' },
      ]
      urls.push(...staticPages)
    }

    // Jobs
    if (type === 'full' || type === 'jobs') {
      const { data: jobs } = await supabaseClient
        .from('jobs')
        .select('id, seo_slug, title, company_name, location, updated_at, created_at')
        .eq('is_active', true)
        .order('updated_at', { ascending: false })
        .limit(type === 'jobs' ? limit : Math.min(limit / 2, 5000))

      if (jobs) {
        const jobUrls = jobs.map(job => ({
          url: job.seo_slug ? `/jobs/${job.seo_slug}` : `/jobs/${job.id}`,
          lastmod: job.updated_at,
          changefreq: 'weekly',
          priority: '0.8',
          title: job.title,
          company: job.company_name,
          location: job.location
        }))
        urls.push(...jobUrls)
      }
    }

    // Companies
    if (type === 'full' || type === 'companies') {
      const { data: companies } = await supabaseClient
        .from('companies')
        .select('id, name, updated_at')
        .order('updated_at', { ascending: false })
        .limit(type === 'companies' ? limit : Math.min(limit / 4, 2500))

      if (companies) {
        const companyUrls = companies.map(company => ({
          url: `/companies/${company.id}`,
          lastmod: company.updated_at,
          changefreq: 'monthly',
          priority: '0.6',
          name: company.name
        }))
        urls.push(...companyUrls)
      }
    }

    console.log(`📈 Generated sitemap with ${urls.length} URLs`)

    if (format === 'json') {
      return new Response(JSON.stringify({
        urls,
        total: urls.length,
        generated_at: new Date().toISOString()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Generate XML sitemap
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">`

    urls.forEach(page => {
      sitemap += `
  <url>
    <loc>https://talentxcel.in${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
    })

    sitemap += `
</urlset>`

    return new Response(sitemap, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600',
      }
    })

  } catch (error) {
    console.error('❌ Sitemap Generator Error:', error)
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})