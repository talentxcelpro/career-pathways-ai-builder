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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('🔍 Running job quality checker...')

    const { data: jobs, error: jobsError } = await supabase
      .from('jobs')
      .select('*')
      .eq('is_active', true)
      .eq('job_status', 'open')

    if (jobsError) {
      console.error('❌ Failed to fetch jobs:', jobsError)
      throw jobsError
    }

    let qualityIssues = 0
    let processedJobs = 0

    for (const job of jobs || []) {
      let hasIssues = false
      const issues = []

      // Check for missing or poor quality data
      if (!job.title || job.title.length < 10) {
        issues.push('Title too short or missing')
        hasIssues = true
      }

      if (!job.description || job.description.length < 50) {
        issues.push('Description too short or missing')
        hasIssues = true
      }

      if (!job.company_name || job.company_name.length < 2) {
        issues.push('Company name missing or invalid')
        hasIssues = true
      }

      if (!job.location || job.location.length < 3) {
        issues.push('Location missing or invalid')
        hasIssues = true
      }

      if (!job.employment_type) {
        issues.push('Employment type not specified')
        hasIssues = true
      }

      // Check for spam patterns
      const spamPatterns = [
        /earn.*money.*home/i,
        /part.*time.*work/i,
        /click.*here/i,
        /limited.*time.*offer/i,
        /guaranteed.*income/i
      ]

      const fullText = `${job.title} ${job.description} ${job.company_name}`.toLowerCase()
      if (spamPatterns.some(pattern => pattern.test(fullText))) {
        issues.push('Potential spam content detected')
        hasIssues = true
      }

      if (hasIssues) {
        qualityIssues++
        
        // Log quality issues (table may not exist yet)
        try {
          await supabase.from('scraper_logs').insert({
            job_url: job.external_url,
            source: 'quality_checker',
            status: 'quality_issue',
            message: `Quality issues found: ${issues.join(', ')}`
          })
        } catch (logError) {
          console.warn('Failed to log quality issue:', logError)
        }

        // Disable severely problematic jobs
        if (issues.length > 3) {
          await supabase
            .from('jobs')
            .update({ 
              is_active: false,
              job_status: 'suspended',
              updated_at: new Date().toISOString()
            })
            .eq('id', job.id)
        }
      }

      processedJobs++
    }

    console.log(`✅ Quality check completed. Processed: ${processedJobs}, Issues found: ${qualityIssues}`)

    return new Response(
      JSON.stringify({ 
        success: true,
        processed_jobs: processedJobs,
        quality_issues: qualityIssues,
        message: `Quality check completed. Found ${qualityIssues} jobs with quality issues out of ${processedJobs} processed.`
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('💥 Quality check error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Quality check failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})