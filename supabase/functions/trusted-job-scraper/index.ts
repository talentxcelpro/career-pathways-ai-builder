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

// Trusted job domains (production-grade allowlist)
const TRUSTED_DOMAINS = [
  'naukri.com',
  'indeed.com', 
  'foundit.in',
  'instahyre.com',
  'angel.co',
  'cutshort.io',
  'shine.com',
  'glassdoor.com',
  'linkedin.com',
  'timesjobs.com',
  'hiringplug.com',
  'workindia.in',
  'jobhai.com',
  'monsterindia.com',
  'apna.co',
  'internshala.com',
  'careers.google.com',
  'careers.microsoft.com',
  'careers.accenture.com',
  'jobs.tcs.com',
  'hcltech.com',
  'careers.cognizant.com',
  'jobs.sap.com',
  'jobs.ibm.com',
  'jobs.wipro.com',
  'unstop.com',
  'hireclap.com',
  'talent500.co',
  'relevel.com',
  'remoteok.io',
  'weworkremotely.com',
  'simplyhired.com',
  'ziprecruiter.com',
  'freshersworld.com',
  'talent.com',
  'hirect.in',
  'dice.com',
  'careerbuilder.com'
]

// Indian tech cities for location validation
const INDIA_LOCATIONS = [
  'Bengaluru', 'Mumbai', 'Hyderabad', 'Delhi NCR', 'Chennai',
  'Pune', 'Noida', 'Gurugram', 'Ahmedabad', 'Kolkata',
  'Jaipur', 'Indore', 'Surat', 'Lucknow', 'Chandigarh',
  'Coimbatore', 'Bhopal', 'Nagpur', 'Visakhapatnam', 'Thiruvananthapuram'
]

const GLOBAL_LOCATIONS = [
  'San Francisco', 'New York', 'Toronto', 'Dubai', 'Singapore',
  'London', 'Berlin', 'Sydney', 'Austin', 'Amsterdam', 'Remote'
]

function isTrustedUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    const hostname = parsed.hostname.replace('www.', '').toLowerCase()
    return TRUSTED_DOMAINS.some(domain => 
      hostname.includes(domain.toLowerCase()) || 
      hostname.endsWith(domain.toLowerCase())
    )
  } catch {
    return false
  }
}

function isJobFresh(postedDate: string): boolean {
  const posted = new Date(postedDate)
  const now = new Date()
  const daysDiff = (now.getTime() - posted.getTime()) / (1000 * 3600 * 24)
  return daysDiff <= 7 // Allow jobs up to 7 days old for better coverage
}

function getJobQualityScore(job: any): number {
  let score = 0
  
  // Fresh jobs get higher score
  const posted = new Date(job.posted_date)
  const now = new Date()
  const daysDiff = (now.getTime() - posted.getTime()) / (1000 * 3600 * 24)
  if (daysDiff <= 1) score += 10
  else if (daysDiff <= 3) score += 7
  else if (daysDiff <= 7) score += 5
  
  // Quality indicators
  if (job.title && job.title.length > 10) score += 3
  if (job.company && !job.company.toLowerCase().includes('confidential')) score += 5
  if (job.description && job.description.length > 100) score += 3
  if (job.salary_range) score += 2
  
  // Preferred job types
  const title = job.title?.toLowerCase() || ''
  if (title.includes('engineer') || title.includes('developer')) score += 8
  if (title.includes('manager') || title.includes('lead')) score += 6
  if (title.includes('intern') && title.includes('senior')) score -= 3 // conflicting levels
  
  return score
}

function isHighQualityJob(job: any): boolean {
  // Basic requirements
  if (!job.job_url || !job.title || !job.company || !job.posted_date) return false
  if (job.company.toLowerCase().includes('confidential')) return false
  
  // URL validation
  if (!isTrustedUrl(job.job_url)) return false
  
  // Freshness check
  if (!isJobFresh(job.posted_date)) return false
  
  // Quality score threshold
  return getJobQualityScore(job) >= 15
}

function isValidLocation(location: string): boolean {
  const normalizedLocation = location.toLowerCase()
  return [...INDIA_LOCATIONS, ...GLOBAL_LOCATIONS].some(validLoc => 
    normalizedLocation.includes(validLoc.toLowerCase())
  )
}

function extractSkills(description: string): string[] {
  const skillSet = [
    'JavaScript', 'React', 'Node.js', 'Python', 'Java', 'C++', 'SQL', 'HTML', 'CSS',
    'AWS', 'Azure', 'Docker', 'Kubernetes', 'MongoDB', 'MySQL', 'PostgreSQL',
    'Git', 'Jenkins', 'TypeScript', 'Salesforce', 'Figma', 'UI/UX', 'Angular',
    'Vue.js', 'Express', 'Django', 'Flask', 'Spring Boot', 'Machine Learning',
    'Data Science', 'Analytics', 'Tableau', 'Power BI', 'Excel', 'Pandas',
    'TensorFlow', 'PyTorch', 'Scikit-learn', 'Hadoop', 'Spark', 'Kafka'
  ]

  const found = skillSet.filter(skill =>
    description.toLowerCase().includes(skill.toLowerCase())
  )

  return [...new Set(found)].slice(0, 10) // Max 10 skills, remove duplicates
}

function isValidSalary(salaryText: string): boolean {
  if (!salaryText) return false
  
  const salaryNum = parseInt(salaryText.replace(/\D/g, ''))
  // Realistic salary range: ₹1L - ₹50L for India, $30K - $350K for international
  return salaryNum >= 100000 && salaryNum <= 50000000
}

async function logScrapingAttempt(jobUrl: string, source: string, status: string, message: string) {
  try {
    await supabase.from('scraper_logs').insert({
      job_url: jobUrl,
      source,
      status,
      message
    })
  } catch (error) {
    console.error('Failed to log scraping attempt:', error)
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('🚀 Trusted job scraper called:', req.method)

    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders })
    }

    const { 
      job_url, 
      title, 
      company, 
      location, 
      description,
      salary_range,
      posted_date,
      employment_type = 'full-time',
      experience_level = 'mid-level',
      source 
    } = await req.json()

    console.log('📦 Processing job from:', source, 'URL:', job_url)

    // Smart quality validation - automatically filter for best jobs
    const jobData = {
      job_url,
      title,
      company,
      location,
      description,
      salary_range,
      posted_date,
      employment_type,
      experience_level,
      source
    }

    if (!isHighQualityJob(jobData)) {
      const score = getJobQualityScore(jobData)
      await logScrapingAttempt(job_url || 'NULL', source || 'unknown', 'rejected', `Low quality score: ${score}`)
      return new Response(
        JSON.stringify({ 
          error: 'Job rejected - low quality score', 
          score,
          url: job_url,
          message: 'Automatically filtered for quality - only best jobs are accepted'
        }),
        { 
          status: 204, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Extract skills from description
    const skills = extractSkills(description || '')

    // Validate and clean salary
    let cleanSalary = ''
    if (salary_range && isValidSalary(salary_range)) {
      cleanSalary = salary_range
    }

    // Check for duplicate jobs
    const { data: existingJob } = await supabase
      .from('jobs')
      .select('id')
      .eq('external_url', job_url)
      .single()

    if (existingJob) {
      await logScrapingAttempt(job_url, source, 'skipped', 'Job already exists')
      return new Response(
        JSON.stringify({ message: 'Job already exists', id: existingJob.id }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Insert job into database
    const { data: newJob, error } = await supabase.from('jobs').insert({
      title: title.trim(),
      company_name: company.trim(),
      location: location.trim(),
      description: description?.trim() || '',
      salary_range: cleanSalary,
      external_url: job_url,
      posted_date,
      expiry_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      is_scraped: true,
      source,
      status: 'active',
      employment_type,
      experience_level,
      requirements: skills.length > 0 ? skills.join(', ') : null,
      is_active: true
    }).select().single()

    if (error) {
      console.error('❌ Database insert error:', error)
      await logScrapingAttempt(job_url, source, 'error', error.message)
      throw error
    }

    console.log('✅ Job inserted successfully:', newJob.id)
    await logScrapingAttempt(job_url, source, 'success', `Job inserted with ID: ${newJob.id}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        job_id: newJob.id,
        message: 'Job inserted successfully',
        skills_extracted: skills.length
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('💥 Trusted job scraper error:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: errorMessage
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})