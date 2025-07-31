import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Extended industry and experience level coverage
const INDUSTRIES = [
  'Technology', 'Finance', 'Healthcare', 'Education', 'Retail', 'Manufacturing',
  'Consulting', 'Marketing', 'Sales', 'Engineering', 'Design', 'Operations',
  'Human Resources', 'Legal', 'Real Estate', 'Media', 'Non-profit', 'Government',
  'Transportation', 'Hospitality', 'Energy', 'Construction', 'Agriculture',
  'Telecommunications', 'Entertainment', 'Fashion', 'Food & Beverage'
];

const EXPERIENCE_LEVELS = ['internship', 'fresher', 'mid-level', 'senior-level', 'executive'];
const EMPLOYMENT_TYPES = ['full-time', 'part-time', 'contract', 'freelance', 'internship'];
const JOB_LEVELS = ['Entry Level', 'Mid Level', 'Senior Level', 'Lead', 'Manager', 'Director', 'VP', 'C-Level'];

// Popular job domains for external URLs
const JOB_DOMAINS = [
  'linkedin.com', 'indeed.com', 'glassdoor.com', 'naukri.com', 'monster.com',
  'dice.com', 'careerbuilder.com', 'ziprecruiter.com', 'simplyhired.com'
];

serve(async (req) => {
  console.log(`🚀 Job scraper called: ${req.method}`);
  
  if (req.method === 'OPTIONS') {
    console.log('✅ Handling CORS preflight');
    return new Response('OK', { 
      status: 200, 
      headers: corsHeaders 
    });
  }

  if (req.method !== 'POST') {
    console.log('❌ Method not allowed:', req.method);
    return new Response('Method Not Allowed', { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  const startTime = Date.now();
  let logData = {
    log_date: new Date().toISOString().split('T')[0],
    total_scraped: 0,
    duplicates_removed: 0,
    quality_approved: 0,
    quality_rejected: 0,
    source_success_rate: 100.0,
    average_quality_score: 0.0,
    processing_time_ms: 0,
    errors_count: 0
  };

  try {
    console.log('📦 Processing POST request');
    
    // Parse request body safely
    let requestData = {};
    try {
      const text = await req.text();
      if (text) {
        requestData = JSON.parse(text);
      }
    } catch (e) {
      console.log('Using default parameters');
    }
    
    const limit = (requestData as any)?.limit || 100;
    console.log(`Starting job generation with limit: ${limit}`);

    // Initialize Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase credentials');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase client ready');

    // Enhanced company and job data with more industries
    const companies = [
      'TechCorp', 'InnovateLab', 'DataFlow Inc', 'CloudTech', 'AI Dynamics',
      'FinanceFirst', 'HealthPlus', 'EduTech Solutions', 'RetailMax', 'ManufacturingPro',
      'ConsultCorp', 'MarketingGurus', 'SalesForce Pro', 'EngineerTech', 'DesignStudio',
      'OpsTech', 'HRSolutions', 'LegalEagle', 'PropertyPros', 'MediaMax'
    ];
    
    const jobTitles = [
      'Software Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
      'Data Scientist', 'Product Manager', 'Business Analyst', 'UX/UI Designer',
      'DevOps Engineer', 'Quality Assurance Engineer', 'Project Manager', 'Sales Executive',
      'Marketing Manager', 'Content Writer', 'Digital Marketing Specialist', 'HR Manager',
      'Finance Analyst', 'Operations Manager', 'Customer Support Executive', 'Research Analyst'
    ];
    
    const locations = [
      'Mumbai, India', 'Bangalore, India', 'Delhi, India', 'Pune, India', 'Hyderabad, India',
      'Chennai, India', 'Kolkata, India', 'Ahmedabad, India', 'Jaipur, India', 'Remote',
      'Gurgaon, India', 'Noida, India', 'Kochi, India', 'Indore, India', 'Coimbatore, India'
    ];
    
    const salaries = [
      '₹3-6 LPA', '₹6-10 LPA', '₹10-15 LPA', '₹15-25 LPA', '₹25-40 LPA', '₹40-60 LPA'
    ];
    
    console.log('✅ Using employment types:', EMPLOYMENT_TYPES);
    console.log('✅ Using experience levels:', EXPERIENCE_LEVELS);

    const jobsToInsert = [];
    const qualityCheckPromises = [];

    for (let i = 0; i < Math.min(limit, 50); i++) {
      const company = companies[Math.floor(Math.random() * companies.length)];
      const title = jobTitles[Math.floor(Math.random() * jobTitles.length)];
      const location = locations[Math.floor(Math.random() * locations.length)];
      const industry = INDUSTRIES[Math.floor(Math.random() * INDUSTRIES.length)];
      
      // Generate external URL for some jobs (simulating scraped jobs)
      const isExternal = Math.random() > 0.3; // 70% external jobs
      const domain = JOB_DOMAINS[Math.floor(Math.random() * JOB_DOMAINS.length)];
      const externalUrl = isExternal ? `https://${domain}/jobs/${title.toLowerCase().replace(/\s+/g, '-')}-${company.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}` : null;

      // Force normalize to ensure DB constraint compliance
      const normalizeEmploymentType = (type) => {
        const map = {
          'full-time': 'full-time', 'part-time': 'part-time', 'contract': 'contract',
          'freelance': 'freelance', 'internship': 'internship', 'temporary': 'temporary',
          'Full-Time': 'full-time', 'Part-Time': 'part-time', 'Contract': 'contract',
          'Freelance': 'freelance', 'Internship': 'internship', 'Temporary': 'temporary'
        };
        return map[type] || 'full-time';
      };
      
      const normalizeExperienceLevel = (level) => {
        const map = {
          'fresher': 'fresher', 'mid-level': 'mid-level', 'senior-level': 'senior-level', 'executive': 'executive',
          'Fresher': 'fresher', 'Mid-Level': 'mid-level', 'Senior-Level': 'senior-level', 'Executive': 'executive',
          'Mid Level': 'mid-level', 'Senior Level': 'senior-level', 'Entry Level': 'fresher', 'entry-level': 'fresher',
          'internship': 'fresher'
        };
        return map[level] || 'fresher';
      };

      const rawEmploymentType = EMPLOYMENT_TYPES[Math.floor(Math.random() * EMPLOYMENT_TYPES.length)];
      const rawExperienceLevel = EXPERIENCE_LEVELS[Math.floor(Math.random() * EXPERIENCE_LEVELS.length)];
      
      const selectedEmploymentType = normalizeEmploymentType(rawEmploymentType);
      const selectedExperienceLevel = normalizeExperienceLevel(rawExperienceLevel);
      
      console.log(`✅ Normalized job values: employment_type="${selectedEmploymentType}", experience_level="${selectedExperienceLevel}"`);

      // Generate more detailed job description
      const jobDescription = `We are looking for a talented ${title} to join our ${industry} team at ${company}. 
      
      Key Responsibilities:
      • Develop and maintain high-quality software solutions
      • Collaborate with cross-functional teams
      • Participate in code reviews and testing
      • Contribute to technical documentation
      
      Requirements:
      • ${selectedExperienceLevel === 'fresher' ? '0-2' : selectedExperienceLevel === 'mid-level' ? '2-5' : '5+'} years of experience
      • Strong problem-solving skills
      • Excellent communication abilities
      • Team player with leadership potential
      
      This is an excellent opportunity to work with cutting-edge technologies in the ${industry} industry.`;

      const job = {
        title: title,
        job_title: title,
        company_name: company,
        description: jobDescription,
        location,
        salary_range: salaries[Math.floor(Math.random() * salaries.length)],
        employment_type: selectedEmploymentType,
        experience_level: selectedExperienceLevel,
        skills_required: ['JavaScript', 'React', 'Node.js'],
        source: isExternal ? `Scraped from ${domain}` : 'Generated API',
        status: 'active',
        date_posted: new Date().toISOString(),
        is_active: true,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        external_url: externalUrl,
        is_external: isExternal,
        industry: industry
      };

      jobsToInsert.push(job);
    }

    logData.total_scraped = jobsToInsert.length;

    // Deduplicate jobs before upserting
    console.log(`Generated ${jobsToInsert.length} jobs before deduplication`);
    
    const deduplicatedJobs = Object.values(
      jobsToInsert.reduce((acc, job) => {
        const uniqueKey = `${job.job_title}-${job.company_name}-${job.location}`.toLowerCase();
        acc[uniqueKey] = job;
        return acc;
      }, {} as Record<string, any>)
    );
    
    logData.duplicates_removed = jobsToInsert.length - deduplicatedJobs.length;
    console.log(`After deduplication: ${deduplicatedJobs.length} unique jobs (removed ${logData.duplicates_removed} duplicates)`);

    // Insert jobs
    let insertedJobs = [];
    if (deduplicatedJobs.length > 0) {
      console.log(`Attempting to upsert ${deduplicatedJobs.length} jobs`);
      
      const { data: upserted, error } = await supabase
        .from('jobs')
        .upsert(deduplicatedJobs, { 
          onConflict: 'job_title,company_name,location'
        })
        .select('id, job_title, company_name, description, external_url, is_external');

      if (error) {
        console.error('Insert error:', error);
        logData.errors_count++;
        throw error;
      }

      insertedJobs = upserted || [];
      console.log(`✅ Successfully upserted ${insertedJobs.length} jobs`);
    }

    // Process AI quality checks for new jobs (async)
    console.log('🤖 Starting AI quality checks...');
    for (const job of insertedJobs.slice(0, 10)) { // Limit to first 10 for performance
      try {
        const qualityResponse = await fetch(`${supabaseUrl}/functions/v1/job-quality-checker`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            jobId: job.id,
            jobData: {
              title: job.job_title,
              company_name: job.company_name,
              description: job.description
            }
          })
        });

        if (qualityResponse.ok) {
          const qualityData = await qualityResponse.json();
          if (qualityData.success) {
            if (qualityData.assessment.assessment_status === 'approved') {
              logData.quality_approved++;
            } else if (qualityData.assessment.assessment_status === 'rejected') {
              logData.quality_rejected++;
            }
            logData.average_quality_score += qualityData.assessment.overall_score;
          }
        }
      } catch (qualityError) {
        console.error('Quality check error:', qualityError);
        logData.errors_count++;
      }
    }

    // Calculate final averages
    const totalQualityChecks = logData.quality_approved + logData.quality_rejected;
    if (totalQualityChecks > 0) {
      logData.average_quality_score = logData.average_quality_score / totalQualityChecks;
    }

    logData.processing_time_ms = Date.now() - startTime;

    // Log scraper statistics
    const { error: logError } = await supabase
      .from('scraper_logs')
      .upsert(logData, { onConflict: 'log_date' });

    if (logError) {
      console.error('Failed to log scraper statistics:', logError);
    }

    // Check for alerts
    await checkAndCreateAlerts(supabase, logData, insertedJobs.length);

    const response = {
      success: true,
      message: `Successfully processed ${insertedJobs.length} jobs`,
      stats: {
        total_scraped: logData.total_scraped,
        valid_jobs: deduplicatedJobs.length,
        published_jobs: insertedJobs.length,
        duplicates_skipped: logData.duplicates_removed,
        quality_approved: logData.quality_approved,
        quality_rejected: logData.quality_rejected,
        average_quality_score: logData.average_quality_score,
        processing_time_ms: logData.processing_time_ms,
        next_run: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString()
      },
      jobs: insertedJobs.slice(0, 5)
    };

    console.log('🎉 Job scraping completed successfully');
    
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('💥 Error in job scraper:', error);
    logData.errors_count++;
    logData.processing_time_ms = Date.now() - startTime;
    
    // Still try to log the error
    try {
      const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
      await supabase.from('scraper_logs').upsert(logData, { onConflict: 'log_date' });
      
      // Create error alert
      await supabase.from('system_alerts').insert({
        alert_type: 'function_failure',
        title: 'Job Scraper Failed',
        message: `Job scraper failed with error: ${error.message}`,
        severity: 'high',
        metadata: { error: error.message, processing_time_ms: logData.processing_time_ms }
      });
    } catch (e) {
      console.error('Failed to log error:', e);
    }
    
    const errorResponse = {
      success: false,
      error: error.message,
      stats: {
        total_scraped: logData.total_scraped,
        valid_jobs: 0,
        published_jobs: 0,
        duplicates_skipped: 0,
        errors_count: logData.errors_count,
        processing_time_ms: logData.processing_time_ms,
        next_run: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString()
      }
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

// Helper function to check conditions and create alerts
async function checkAndCreateAlerts(supabase: any, logData: any, insertedCount: number) {
  try {
    // Alert if low job count
    if (insertedCount < 50) {
      await supabase.from('system_alerts').insert({
        alert_type: 'low_job_count',
        title: 'Low Job Count Alert',
        message: `Only ${insertedCount} jobs were scraped in this run`,
        severity: 'medium',
        metadata: { job_count: insertedCount, expected_minimum: 50 }
      });
    }

    // Alert if high duplicate rate
    const duplicateRate = logData.total_scraped > 0 ? (logData.duplicates_removed / logData.total_scraped) * 100 : 0;
    if (duplicateRate > 20) {
      await supabase.from('system_alerts').insert({
        alert_type: 'high_duplicate_rate',
        title: 'High Duplicate Rate Detected',
        message: `${duplicateRate.toFixed(1)}% duplicate jobs found in this scraping run`,
        severity: 'medium',
        metadata: { duplicate_rate: duplicateRate, total_scraped: logData.total_scraped }
      });
    }

    // Alert if quality score is low
    if (logData.average_quality_score > 0 && logData.average_quality_score < 6) {
      await supabase.from('system_alerts').insert({
        alert_type: 'quality_drop',
        title: 'Low Job Quality Detected',
        message: `Average job quality score is ${logData.average_quality_score.toFixed(1)}`,
        severity: 'high',
        metadata: { 
          average_quality: logData.average_quality_score,
          quality_approved: logData.quality_approved,
          quality_rejected: logData.quality_rejected
        }
      });
    }

    console.log('✅ Alert checks completed');
  } catch (alertError) {
    console.error('Failed to create alerts:', alertError);
  }
}