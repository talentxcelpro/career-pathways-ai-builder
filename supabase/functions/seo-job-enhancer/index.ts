import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface JobEnhancementRequest {
  job_id: string
  enhancement_type: 'full' | 'metadata' | 'content'
  force_regenerate?: boolean
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('🔧 SEO Job Enhancer Starting...')
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const requestBody = await req.json() as JobEnhancementRequest
    const { job_id, enhancement_type = 'full', force_regenerate = false } = requestBody

    console.log(`🎯 Enhancing job: ${job_id} with type: ${enhancement_type}`)

    // Get job details
    const { data: job, error: jobError } = await supabaseClient
      .from('jobs')
      .select('*')
      .eq('id', job_id)
      .single()

    if (jobError || !job) {
      throw new Error(`Job not found: ${job_id}`)
    }

    // Check if SEO content already exists
    if (!force_regenerate) {
      const { data: existingContent } = await supabaseClient
        .from('seo_content_cache')
        .select('*')
        .eq('entity_id', job_id)
        .eq('entity_type', 'job')
        .single()

      if (existingContent) {
        console.log('✅ Using existing SEO content from cache')
        return new Response(JSON.stringify({
          success: true,
          enhanced: true,
          cached: true,
          job_id,
          enhancement_type
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
    }

    // Generate SEO enhancements
    const seoEnhancements = {
      meta_title: `${job.title} at ${job.company_name} | ${job.location} | TalentXcel`,
      meta_description: `Apply for ${job.title} at ${job.company_name} in ${job.location}. ${job.employment_type} position offering competitive salary. Join TalentXcel to find your dream job.`,
      keywords: [
        job.title.toLowerCase(),
        job.company_name.toLowerCase(),
        job.location.toLowerCase(),
        job.employment_type.toLowerCase(),
        'jobs',
        'careers',
        'hiring'
      ],
      structured_data: {
        "@context": "https://schema.org/",
        "@type": "JobPosting",
        "title": job.title,
        "description": job.description,
        "hiringOrganization": {
          "@type": "Organization",
          "name": job.company_name,
          "url": `https://talentxcel.in/companies/${job.company_id || 'company'}`
        },
        "jobLocation": {
          "@type": "Place",
          "address": job.location
        },
        "employmentType": job.employment_type?.toUpperCase(),
        "datePosted": job.created_at,
        "validThrough": job.expires_at,
        "baseSalary": job.salary_range ? {
          "@type": "MonetaryAmount",
          "currency": "INR",
          "value": {
            "@type": "QuantitativeValue",
            "minValue": job.salary_min,
            "maxValue": job.salary_max,
            "unitText": "YEAR"
          }
        } : undefined
      }
    }

    // Save to cache
    const { error: cacheError } = await supabaseClient
      .from('seo_content_cache')
      .upsert({
        entity_id: job_id,
        entity_type: 'job',
        content_type: 'job_posting',
        content_data: seoEnhancements,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
      })

    if (cacheError) {
      console.error('Cache save error:', cacheError)
    }

    // Update job with SEO slug if needed
    if (!job.seo_slug) {
      const seoSlug = `${job.title}-${job.company_name}-${job.location}`
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 100)

      await supabaseClient
        .from('jobs')
        .update({ seo_slug: seoSlug })
        .eq('id', job_id)
    }

    console.log('✅ Job SEO enhancement completed')

    return new Response(JSON.stringify({
      success: true,
      enhanced: true,
      cached: false,
      job_id,
      enhancement_type,
      seo_data: seoEnhancements
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('❌ SEO Job Enhancer Error:', error)
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})