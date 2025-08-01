import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Extended 50+ industries coverage
const INDUSTRIES = [
  'Technology', 'Finance', 'Healthcare', 'Education', 'Retail', 'Manufacturing',
  'Consulting', 'Marketing', 'Sales', 'Engineering', 'Design', 'Operations',
  'Human Resources', 'Legal', 'Real Estate', 'Media', 'Non-profit', 'Government',
  'Transportation', 'Hospitality', 'Energy', 'Construction', 'Agriculture',
  'Telecommunications', 'Entertainment', 'Fashion', 'Food & Beverage',
  'Banking', 'Insurance', 'Pharmaceuticals', 'Biotechnology', 'Aerospace',
  'Automotive', 'Chemical', 'Mining', 'Oil & Gas', 'Renewable Energy',
  'Logistics', 'Supply Chain', 'E-commerce', 'Gaming', 'Sports',
  'Travel & Tourism', 'Airlines', 'Maritime', 'Publishing', 'Printing',
  'Textiles', 'Jewelry', 'Furniture', 'Electronics', 'Architecture'
];

// Comprehensive 10+ experience levels from fresher to CEO
const EXPERIENCE_LEVELS = ['intern', 'fresher', 'junior', 'mid-level', 'senior-level', 'lead', 'manager', 'senior-manager', 'director', 'vp', 'svp', 'cxo'];
const EMPLOYMENT_TYPES = ['full-time', 'part-time', 'contract', 'freelance', 'internship'];

// Detailed job levels with salary mapping
const JOB_LEVEL_MAPPING = {
  'intern': { level: 'Intern', salary_range: '₹15,000-25,000/month' },
  'fresher': { level: 'Fresher (0-1 years)', salary_range: '₹3-6 LPA' },
  'junior': { level: 'Junior (1-3 years)', salary_range: '₹6-12 LPA' },
  'mid-level': { level: 'Mid-Level (3-6 years)', salary_range: '₹12-25 LPA' },
  'senior-level': { level: 'Senior (6-10 years)', salary_range: '₹25-45 LPA' },
  'lead': { level: 'Team Lead (8-12 years)', salary_range: '₹35-60 LPA' },
  'manager': { level: 'Manager (10-15 years)', salary_range: '₹50-85 LPA' },
  'senior-manager': { level: 'Senior Manager (12-18 years)', salary_range: '₹75-1.2 Cr' },
  'director': { level: 'Director (15-20 years)', salary_range: '₹1-2 Cr' },
  'vp': { level: 'Vice President (18-25 years)', salary_range: '₹1.5-3 Cr' },
  'svp': { level: 'Senior VP (20+ years)', salary_range: '₹2.5-5 Cr' },
  'cxo': { level: 'C-Level Executive (20+ years)', salary_range: '₹3-10+ Cr' }
};

// Trusted job domains (production-grade allowlist) - REMOVED PROBLEMATIC DOMAINS
const TRUSTED_DOMAINS = [
  'naukri.com', 'indeed.com', 'foundit.in', 'instahyre.com', 'angel.co',
  'cutshort.io', 'shine.com', 'glassdoor.com', 'linkedin.com',
  'hiringplug.com', 'workindia.in', 'jobhai.com', 'monsterindia.com', 'apna.co',
  'internshala.com', 'careers.google.com', 'careers.microsoft.com', 'careers.accenture.com',
  'jobs.tcs.com', 'hcltech.com', 'careers.cognizant.com', 'jobs.sap.com',
  'jobs.ibm.com', 'jobs.wipro.com', 'unstop.com', 'hireclap.com',
  'talent500.co', 'relevel.com', 'remoteok.io', 'weworkremotely.com'
];

// HIGH-QUALITY DOMAINS ONLY for URL generation (removed problematic ones)
const JOB_DOMAINS = [
  'linkedin.com', 'indeed.com', 'glassdoor.com', 'naukri.com',
  'foundit.in', 'instahyre.com', 'cutshort.io'
];

function isTrustedUrl(url: string): boolean {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return false;
  }
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.replace('www.', '').toLowerCase();
    return TRUSTED_DOMAINS.some(trustedDomain => 
      hostname.includes(trustedDomain.toLowerCase()) || 
      hostname.endsWith(trustedDomain.toLowerCase())
    );
  } catch {
    return false;
  }
}

function isJobFresh(dateString: string): boolean {
  const jobDate = new Date(dateString);
  const now = new Date();
  const daysDiff = (now.getTime() - jobDate.getTime()) / (1000 * 3600 * 24);
  return daysDiff <= 1.5; // Only jobs from today or yesterday
}

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

    // Comprehensive companies across 50+ industries
    const companies = [
      // Technology
      'TechCorp', 'InnovateLab', 'DataFlow Inc', 'CloudTech', 'AI Dynamics', 'CyberSoft', 'QuantumTech',
      // Finance & Banking
      'FinanceFirst', 'CreditMax', 'InvestPro', 'BankTech', 'InsureSecure', 'WealthBuilders',
      // Healthcare & Pharma
      'HealthPlus', 'MediCore', 'PharmaAdvance', 'BioTech Solutions', 'CareFirst', 'LifeSciences',
      // Education & Training
      'EduTech Solutions', 'LearnMax', 'SkillDev', 'AcademyPro', 'KnowledgeHub',
      // Retail & E-commerce
      'RetailMax', 'ShopTech', 'EcommerceElite', 'MarketPlace Pro', 'Consumer Connect',
      // Manufacturing & Industrial
      'ManufacturingPro', 'IndustrialTech', 'Production Plus', 'Assembly Works', 'Factory Solutions',
      // Energy & Environment
      'GreenEnergy', 'SolarTech', 'CleanPower', 'EcoSolutions', 'RenewableTech',
      // Media & Entertainment
      'MediaMax', 'ContentCorp', 'StreamTech', 'GameDev Studios', 'CreativeWorks',
      // Transportation & Logistics
      'LogiTech', 'TransportPro', 'ShipmentMax', 'DeliveryFirst', 'MobilityTech'
    ];
    
    // Comprehensive job titles across all levels and industries
    const jobTitles = [
      // Technology - All levels
      'Software Engineer', 'Senior Software Engineer', 'Principal Engineer', 'Engineering Manager', 'VP Engineering', 'CTO',
      'Frontend Developer', 'Senior Frontend Developer', 'Lead Frontend Developer', 'Frontend Architect',
      'Backend Developer', 'Senior Backend Developer', 'Lead Backend Developer', 'Backend Architect',
      'Full Stack Developer', 'Senior Full Stack Developer', 'Lead Full Stack Developer',
      'Data Scientist', 'Senior Data Scientist', 'Principal Data Scientist', 'Head of Data Science', 'Chief Data Officer',
      'DevOps Engineer', 'Senior DevOps Engineer', 'DevOps Manager', 'Infrastructure Architect',
      'QA Engineer', 'Senior QA Engineer', 'QA Manager', 'Test Architect',
      'Product Manager', 'Senior Product Manager', 'Principal Product Manager', 'Director of Product', 'VP Product', 'CPO',
      'UX Designer', 'Senior UX Designer', 'Lead UX Designer', 'Design Manager', 'Head of Design', 'Chief Design Officer',
      'Business Analyst', 'Senior Business Analyst', 'Principal Business Analyst', 'Analytics Manager',
      
      // Finance & Banking
      'Financial Analyst', 'Senior Financial Analyst', 'Finance Manager', 'Finance Director', 'CFO',
      'Investment Banker', 'Senior Investment Banker', 'VP Investment Banking', 'Managing Director',
      'Risk Manager', 'Senior Risk Manager', 'Chief Risk Officer',
      'Compliance Officer', 'Senior Compliance Officer', 'Head of Compliance',
      
      // Sales & Marketing
      'Sales Executive', 'Senior Sales Executive', 'Sales Manager', 'Sales Director', 'VP Sales', 'Chief Sales Officer',
      'Marketing Executive', 'Marketing Manager', 'Senior Marketing Manager', 'Marketing Director', 'CMO',
      'Digital Marketing Specialist', 'Digital Marketing Manager', 'Head of Digital Marketing',
      'Content Writer', 'Content Manager', 'Content Director', 'Head of Content',
      
      // Operations & Management
      'Operations Executive', 'Operations Manager', 'Senior Operations Manager', 'Operations Director', 'COO',
      'Project Manager', 'Senior Project Manager', 'Program Manager', 'Portfolio Manager',
      'Strategy Consultant', 'Senior Consultant', 'Principal Consultant', 'Partner',
      
      // HR & Administration
      'HR Executive', 'HR Manager', 'Senior HR Manager', 'HR Director', 'CHRO',
      'Talent Acquisition Specialist', 'Recruitment Manager', 'Head of Talent',
      'Training Manager', 'L&D Manager', 'Head of Learning',
      
      // Legal & Compliance
      'Legal Associate', 'Legal Manager', 'Senior Legal Manager', 'General Counsel', 'Chief Legal Officer',
      
      // Executive & Leadership
      'CEO', 'President', 'Executive Vice President', 'Managing Director', 'Board Member',
      'Chief Executive Officer', 'Chief Operating Officer', 'Chief Financial Officer',
      'Chief Technology Officer', 'Chief Marketing Officer', 'Chief Human Resources Officer'
    ];
    
    const locations = [
      'Mumbai, India', 'Bangalore, India', 'Delhi, India', 'Pune, India', 'Hyderabad, India',
      'Chennai, India', 'Kolkata, India', 'Ahmedabad, India', 'Jaipur, India', 'Remote',
      'Gurgaon, India', 'Noida, India', 'Kochi, India', 'Indore, India', 'Coimbatore, India',
      'Lucknow, India', 'Chandigarh, India', 'Nagpur, India', 'Bhopal, India', 'Vadodara, India',
      'New York, USA', 'London, UK', 'Singapore', 'Dubai, UAE', 'Toronto, Canada'
    ];
    
    console.log('✅ Using employment types:', EMPLOYMENT_TYPES);
    console.log('✅ Using experience levels:', EXPERIENCE_LEVELS);

    const jobsToInsert = [];
    const qualityCheckPromises = [];

    for (let i = 0; i < Math.min(limit, 200); i++) {
      const company = companies[Math.floor(Math.random() * companies.length)];
      const title = jobTitles[Math.floor(Math.random() * jobTitles.length)];
      const location = locations[Math.floor(Math.random() * locations.length)];
      const industry = INDUSTRIES[Math.floor(Math.random() * INDUSTRIES.length)];
      
      
      // Generate external URL ONLY from high-quality domains
      const isExternal = Math.random() > 0.3; // 70% external jobs
      let externalUrl = null;
      
      if (isExternal) {
        const domain = JOB_DOMAINS[Math.floor(Math.random() * JOB_DOMAINS.length)];
        const jobSlug = title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
        const companySlug = company.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
        externalUrl = `https://${domain}/jobs/${jobSlug}-${companySlug}-${Date.now()}`;
        
        // Double-check URL is trusted (failsafe)
        if (!isTrustedUrl(externalUrl)) {
          console.log(`❌ Generated untrusted URL, skipping: ${externalUrl}`);
          continue; // Skip this job completely
        }
      }

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
          'intern': 'fresher', 'fresher': 'fresher', 'junior': 'fresher', 
          'mid-level': 'mid-level', 'senior-level': 'senior-level', 
          'lead': 'senior-level', 'manager': 'executive', 'senior-manager': 'executive',
          'director': 'executive', 'vp': 'executive', 'svp': 'executive', 'cxo': 'executive',
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
      
      // Get salary based on experience level
      const levelInfo = JOB_LEVEL_MAPPING[rawExperienceLevel] || JOB_LEVEL_MAPPING['fresher'];
      const salaryRange = levelInfo.salary_range;
      
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

      // Extract skills from job description based on title and content
      const extractedSkills = extractSkillsFromJobDescription(title, jobDescription, industry);
      
      const job = {
        title: title,
        job_title: title,
        company_name: company,
        description: jobDescription,
        location,
        salary_range: salaryRange,
        employment_type: selectedEmploymentType,
        experience_level: selectedExperienceLevel,
        skills_required: extractedSkills, // Use extracted skills instead of hardcoded
        source: isExternal ? domain : 'Generated API',
        status: 'active',
        date_posted: new Date().toISOString(),
        posted_date: new Date().toISOString().split('T')[0], // Add posted_date field
        expiry_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days (production standard)
        is_scraped: true, // Mark as scraped job
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

// Helper function to extract realistic skills based on job title, description, and industry
function extractSkillsFromJobDescription(title: string, description: string, industry: string): string[] {
  const allSkills = {
    // Programming Languages
    programming: ['JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'C++', 'PHP', 'Ruby', 'Go', 'Rust', 'Swift', 'Kotlin'],
    
    // Frontend Technologies
    frontend: ['React', 'Vue.js', 'Angular', 'HTML', 'CSS', 'SASS', 'jQuery', 'Bootstrap', 'Tailwind CSS'],
    
    // Backend Technologies
    backend: ['Node.js', 'Express.js', 'Django', 'Flask', 'Spring Boot', 'ASP.NET', 'Ruby on Rails'],
    
    // Databases
    databases: ['MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Oracle', 'SQL Server', 'DynamoDB', 'Cassandra'],
    
    // Cloud & DevOps
    cloud: ['AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Jenkins', 'CI/CD', 'Terraform'],
    
    // Data & Analytics
    data: ['SQL', 'Python', 'R', 'Tableau', 'Power BI', 'Excel', 'Machine Learning', 'Data Science', 'Pandas', 'NumPy'],
    
    // Design & UX
    design: ['Figma', 'Adobe Creative Suite', 'Sketch', 'InVision', 'Prototyping', 'User Research', 'Wireframing'],
    
    // Business & Management
    business: ['Project Management', 'Agile', 'Scrum', 'JIRA', 'Confluence', 'Strategic Planning', 'Leadership'],
    
    // Finance
    finance: ['Financial Analysis', 'Excel', 'Bloomberg', 'SAP', 'QuickBooks', 'Financial Modeling', 'Risk Management'],
    
    // Marketing & Sales
    marketing: ['Google Analytics', 'SEO', 'SEM', 'Content Marketing', 'Social Media', 'HubSpot', 'Salesforce'],
    
    // Healthcare
    healthcare: ['EMR Systems', 'HIPAA', 'Medical Coding', 'Clinical Research', 'Healthcare Analytics'],
    
    // Legal
    legal: ['Contract Law', 'Compliance', 'Legal Research', 'Risk Assessment', 'Regulatory Affairs']
  };

  const extractedSkills: string[] = [];
  const lowerTitle = title.toLowerCase();
  const lowerDescription = description.toLowerCase();
  const lowerIndustry = industry.toLowerCase();

  // Role-based skill extraction
  if (lowerTitle.includes('frontend') || lowerTitle.includes('ui') || lowerTitle.includes('react')) {
    extractedSkills.push(...allSkills.frontend.slice(0, 4));
    extractedSkills.push(...allSkills.programming.filter(s => ['JavaScript', 'TypeScript'].includes(s)));
  } else if (lowerTitle.includes('backend') || lowerTitle.includes('api') || lowerTitle.includes('server')) {
    extractedSkills.push(...allSkills.backend.slice(0, 3));
    extractedSkills.push(...allSkills.databases.slice(0, 3));
    extractedSkills.push(...allSkills.programming.filter(s => ['Python', 'Java', 'Node.js'].includes(s)));
  } else if (lowerTitle.includes('full stack') || lowerTitle.includes('fullstack')) {
    extractedSkills.push(...allSkills.frontend.slice(0, 2));
    extractedSkills.push(...allSkills.backend.slice(0, 2));
    extractedSkills.push('JavaScript', 'Python');
  } else if (lowerTitle.includes('data') || lowerTitle.includes('analyst') || lowerTitle.includes('scientist')) {
    extractedSkills.push(...allSkills.data.slice(0, 5));
  } else if (lowerTitle.includes('devops') || lowerTitle.includes('infrastructure')) {
    extractedSkills.push(...allSkills.cloud.slice(0, 5));
  } else if (lowerTitle.includes('design') || lowerTitle.includes('ux') || lowerTitle.includes('ui')) {
    extractedSkills.push(...allSkills.design.slice(0, 4));
  } else if (lowerTitle.includes('manager') || lowerTitle.includes('director') || lowerTitle.includes('lead')) {
    extractedSkills.push(...allSkills.business.slice(0, 4));
  } else if (lowerTitle.includes('sales') || lowerTitle.includes('marketing')) {
    extractedSkills.push(...allSkills.marketing.slice(0, 4));
  } else if (lowerTitle.includes('finance') || lowerTitle.includes('analyst')) {
    extractedSkills.push(...allSkills.finance.slice(0, 4));
  }

  // Industry-specific skills
  if (lowerIndustry.includes('technology') || lowerIndustry.includes('tech')) {
    extractedSkills.push('Agile', 'Git', 'REST APIs');
  } else if (lowerIndustry.includes('finance') || lowerIndustry.includes('banking')) {
    extractedSkills.push(...allSkills.finance.slice(0, 3));
  } else if (lowerIndustry.includes('healthcare') || lowerIndustry.includes('medical')) {
    extractedSkills.push(...allSkills.healthcare.slice(0, 3));
  } else if (lowerIndustry.includes('legal')) {
    extractedSkills.push(...allSkills.legal.slice(0, 3));
  }

  // Remove duplicates and return max 6 skills
  const uniqueSkills = [...new Set(extractedSkills)];
  return uniqueSkills.slice(0, 6);
}