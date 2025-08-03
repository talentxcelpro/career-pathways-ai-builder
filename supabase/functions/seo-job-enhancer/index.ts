import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface JobSEOData {
  meta_title: string
  meta_description: string
  seo_slug: string
  structured_data: any
  keywords: string[]
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { jobId, enhance_all = false } = await req.json()

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('🔧 SEO Job Enhancement Request:', { jobId, enhance_all })

    let jobs = []

    if (enhance_all) {
      // Get all active jobs without SEO data
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          id, title, description, location, salary_min, salary_max,
          experience_level, employment_type, created_at, updated_at,
          companies(name, industry)
        `)
        .eq('is_active', true)
        .eq('job_status', 'open')
        .or('meta_title.is.null,meta_description.is.null,seo_slug.is.null')
        .limit(100) // Process in batches

      if (error) throw error
      jobs = data || []
    } else {
      // Validate jobId for single job enhancement
      if (!jobId || typeof jobId !== 'string') {
        throw new Error('Missing or invalid jobId for single job enhancement')
      }

      // Get specific job
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          id, title, description, location, salary_min, salary_max,
          experience_level, employment_type, created_at, updated_at,
          companies(name, industry)
        `)
        .eq('id', jobId)
        .eq('is_active', true)
        .single()

      if (error) throw error
      jobs = [data]
    }

    const enhancedJobs = []

    for (const job of jobs) {
      try {
        const seoData = generateJobSEO(job)
        
        // Update job with SEO data
        const { error: updateError } = await supabase
          .from('jobs')
          .update({
            meta_title: seoData.meta_title,
            meta_description: seoData.meta_description,
            seo_slug: seoData.seo_slug,
            structured_data: seoData.structured_data,
            keywords: seoData.keywords,
            updated_at: new Date().toISOString()
          })
          .eq('id', job.id)

        if (updateError) {
          console.error(`❌ Error updating job ${job.id}:`, updateError)
          continue
        }

        enhancedJobs.push({
          id: job.id,
          title: job.title,
          seo_data: seoData
        })

        console.log(`✅ Enhanced job: ${job.title}`)

      } catch (error) {
        console.error(`❌ Error enhancing job ${job.id}:`, error)
      }
    }

    return new Response(JSON.stringify({
      success: true,
      enhanced_count: enhancedJobs.length,
      total_processed: jobs.length,
      enhanced_jobs: enhancedJobs
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('❌ SEO enhancement error:', error)
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

function generateJobSEO(job: any): JobSEOData {
  const companyName = job.companies?.name || 'Company'
  const location = job.location || 'India'
  const title = job.title
  
  // Generate SEO-optimized title (under 60 characters)
  let metaTitle = `${title} at ${companyName} | TalentXcel`
  if (metaTitle.length > 60) {
    metaTitle = `${title} | ${companyName} Jobs`
  }
  if (metaTitle.length > 60) {
    metaTitle = `${title} | TalentXcel Jobs`
  }

  // Generate meta description (under 160 characters)
  const salaryPart = job.salary_min && job.salary_max 
    ? ` Salary: ₹${job.salary_min/100000}L-${job.salary_max/100000}L.`
    : ''
  
  let metaDescription = `Apply for ${title} position at ${companyName} in ${location}.${salaryPart} Join TalentXcel to advance your career today!`
  
  if (metaDescription.length > 160) {
    metaDescription = `${title} job at ${companyName} in ${location}. Apply now on TalentXcel!`
  }

  // Generate SEO slug
  const seoSlug = generateSlug(`${title}-${companyName}-${location}`)

  // Generate keywords
  const keywords = [
    title.toLowerCase(),
    `${title.toLowerCase()} jobs`,
    `${companyName.toLowerCase()} jobs`,
    `jobs in ${location.toLowerCase()}`,
    `${title.toLowerCase()} ${location.toLowerCase()}`,
    'career opportunities',
    'apply now'
  ]

  // Add experience level keywords
  if (job.experience_level) {
    keywords.push(`${job.experience_level} ${title.toLowerCase()}`)
  }

  // Add employment type keywords
  if (job.employment_type) {
    keywords.push(`${job.employment_type.toLowerCase()} jobs`)
  }

  // Generate structured data (JobPosting schema)
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    "title": title,
    "description": job.description || `Join ${companyName} as ${title}`,
    "identifier": {
      "@type": "PropertyValue",
      "name": companyName,
      "value": job.id
    },
    "datePosted": job.created_at,
    "validThrough": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
    "employmentType": job.employment_type?.toUpperCase() || "FULL_TIME",
    "hiringOrganization": {
      "@type": "Organization",
      "name": companyName,
      "url": "https://talentxcel.in"
    },
    "jobLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": location,
        "addressCountry": "IN"
      }
    },
    "url": `https://talentxcel.in/jobs/${job.id}`,
    "applicationContact": {
      "@type": "ContactPoint",
      "url": `https://talentxcel.in/jobs/${job.id}/apply`,
      "contactType": "Application Portal"
    }
  }

  // Add salary if available
  if (job.salary_min && job.salary_max) {
    structuredData.baseSalary = {
      "@type": "MonetaryAmount",
      "currency": "INR",
      "value": {
        "@type": "QuantitativeValue",
        "minValue": job.salary_min,
        "maxValue": job.salary_max,
        "unitText": "YEAR"
      }
    }
  }

  // Add industry if available
  if (job.companies?.industry) {
    structuredData.industry = job.companies.industry
  }

  return {
    meta_title: metaTitle,
    meta_description: metaDescription,
    seo_slug: seoSlug,
    structured_data: structuredData,
    keywords: keywords
  }
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim()
    .substring(0, 100) // Limit length
}