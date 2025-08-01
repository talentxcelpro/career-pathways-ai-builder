import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseKey)

// Trusted domains for validation
const TRUSTED_DOMAINS = [
  'naukri.com', 'indeed.com', 'foundit.in', 'instahyre.com', 'angel.co',
  'cutshort.io', 'shine.com', 'glassdoor.com', 'linkedin.com', 'timesjobs.com',
  'hiringplug.com', 'workindia.in', 'jobhai.com', 'monsterindia.com', 'apna.co',
  'internshala.com', 'careers.google.com', 'careers.microsoft.com', 'careers.accenture.com',
  'jobs.tcs.com', 'hcltech.com', 'careers.cognizant.com', 'jobs.sap.com',
  'jobs.ibm.com', 'jobs.wipro.com', 'unstop.com', 'hireclap.com', 'talent500.co',
  'relevel.com', 'remoteok.io', 'weworkremotely.com', 'simplyhired.com',
  'ziprecruiter.com', 'freshersworld.com', 'talent.com', 'hirect.in', 'dice.com'
]

function validateJobData(job: any): { isValid: boolean; errors: string[]; score: number } {
  const errors: string[] = []
  let score = 0

  // Basic field validation
  if (!job.job_url || typeof job.job_url !== 'string' || job.job_url.trim() === '') {
    errors.push('Missing or invalid job URL')
    return { isValid: false, errors, score: 0 }
  }

  if (!job.title || typeof job.title !== 'string' || job.title.trim() === '') {
    errors.push('Missing or invalid job title')
  }

  if (!job.company || typeof job.company !== 'string' || job.company.trim() === '') {
    errors.push('Missing or invalid company name')
  }

  if (!job.posted_date) {
    errors.push('Missing posted date')
  }

  // URL validation
  try {
    const url = new URL(job.job_url)
    const hostname = url.hostname.replace('www.', '').toLowerCase()
    const isTrusted = TRUSTED_DOMAINS.some(domain => 
      hostname.includes(domain.toLowerCase()) || hostname.endsWith(domain.toLowerCase())
    )
    
    if (!isTrusted) {
      errors.push(`Untrusted domain: ${hostname}`)
    } else {
      score += 10 // Trusted domain bonus
    }
  } catch {
    errors.push('Invalid URL format')
  }

  // Quality scoring
  if (job.title) {
    const title = job.title.toLowerCase()
    if (title.includes('engineer') || title.includes('developer') || title.includes('manager')) {
      score += 8
    }
    if (title.length > 10) score += 2
  }

  if (job.company && !job.company.toLowerCase().includes('confidential')) {
    score += 5
  }

  if (job.description && job.description.length > 100) {
    score += 3
  }

  if (job.salary_range) {
    score += 2
  }

  // Date freshness
  if (job.posted_date) {
    try {
      const posted = new Date(job.posted_date)
      const now = new Date()
      const daysDiff = (now.getTime() - posted.getTime()) / (1000 * 3600 * 24)
      
      if (daysDiff <= 1) score += 10
      else if (daysDiff <= 3) score += 7
      else if (daysDiff <= 7) score += 5
      else if (daysDiff > 30) errors.push('Job too old (>30 days)')
    } catch {
      errors.push('Invalid posted_date format')
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    score
  }
}

async function logValidationResult(job: any, validation: any, action: string) {
  try {
    await supabase.from('scraper_logs').insert({
      job_url: job.job_url || 'NULL',
      source: job.source || 'unknown',
      status: action,
      message: `Score: ${validation.score}, Errors: ${validation.errors.join(', ')}`
    })
  } catch (error) {
    console.error('Failed to log validation result:', error)
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('🔍 Job validator called:', req.method)

    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders })
    }

    const { jobs, min_score = 15 } = await req.json()

    if (!Array.isArray(jobs)) {
      return new Response(
        JSON.stringify({ error: 'Jobs must be an array' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`📦 Validating ${jobs.length} jobs with min_score: ${min_score}`)

    const results = []
    const validJobs = []
    const rejectedJobs = []

    for (const job of jobs) {
      const validation = validateJobData(job)
      
      const result = {
        job,
        validation,
        action: validation.isValid && validation.score >= min_score ? 'accepted' : 'rejected'
      }

      results.push(result)

      if (result.action === 'accepted') {
        validJobs.push(job)
      } else {
        rejectedJobs.push({
          job,
          reason: validation.errors.join(', '),
          score: validation.score
        })
      }

      // Log result
      await logValidationResult(job, validation, result.action)
    }

    console.log(`✅ Validation complete: ${validJobs.length} accepted, ${rejectedJobs.length} rejected`)

    return new Response(
      JSON.stringify({
        success: true,
        total_jobs: jobs.length,
        valid_jobs: validJobs,
        rejected_jobs: rejectedJobs,
        stats: {
          accepted_count: validJobs.length,
          rejected_count: rejectedJobs.length,
          acceptance_rate: (validJobs.length / jobs.length * 100).toFixed(2) + '%'
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('💥 Job validator error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Validation failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})