import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, jobData, jobId } = await req.json();

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('Job Quality Checker request:', { action, jobId });

    switch (action) {
      case 'validate_job':
        return await validateJobData(jobData);
      case 'enrich_job':
        return await enrichJobData(jobData);
      case 'cleanup_all_jobs':
        return await cleanupAllJobs();
      case 'fix_job':
        return await fixSpecificJob(jobId);
      default:
        throw new Error('Invalid action');
    }

  } catch (error) {
    console.error('Error in job-quality-checker:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function validateJobData(jobData: any) {
  const issues = [];
  
  // 1. Salary Validation
  const salaryIssues = validateSalary(jobData);
  if (salaryIssues.length > 0) issues.push(...salaryIssues);
  
  // 2. Skills Validation
  const skillIssues = await validateSkills(jobData);
  if (skillIssues.length > 0) issues.push(...skillIssues);
  
  // 3. Company Information
  const companyIssues = validateCompanyInfo(jobData);
  if (companyIssues.length > 0) issues.push(...companyIssues);
  
  // 4. Required Fields
  const fieldIssues = validateRequiredFields(jobData);
  if (fieldIssues.length > 0) issues.push(...fieldIssues);

  const isValid = issues.length === 0;
  const severity = issues.filter(i => i.severity === 'critical').length > 0 ? 'critical' : 
                  issues.filter(i => i.severity === 'high').length > 0 ? 'high' : 'medium';

  return new Response(JSON.stringify({
    success: true,
    isValid,
    severity,
    issues,
    score: Math.max(0, 100 - (issues.length * 10))
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function validateSalary(jobData: any) {
  const issues = [];
  const { salary_min, salary_max, employment_type, experience_level, title } = jobData;

  // Salary limits by experience level and job type (in INR annually)
  const salaryLimits = {
    'internship': { max: 500000, maxFreelance: 200000 },
    'fresher': { max: 1200000, maxFreelance: 800000 },
    'mid-level': { max: 3500000, maxFreelance: 2000000 },
    'senior-level': { max: 8000000, maxFreelance: 5000000 },
    'executive': { max: 15000000, maxFreelance: 10000000 }
  };

  const limits = salaryLimits[experience_level] || salaryLimits['mid-level'];
  const maxAllowed = employment_type === 'freelance' ? limits.maxFreelance : limits.max;

  if (salary_max && salary_max > maxAllowed) {
    issues.push({
      type: 'salary',
      severity: 'critical',
      message: `Salary ₹${(salary_max/100000).toFixed(1)}L is unrealistic for ${experience_level} ${employment_type}. Max should be ₹${(maxAllowed/100000).toFixed(1)}L`,
      suggestion: `Set salary to ₹${Math.round(maxAllowed * 0.7 / 100000)}L - ₹${Math.round(maxAllowed / 100000)}L`
    });
  }

  if (salary_min && salary_max && salary_min > salary_max) {
    issues.push({
      type: 'salary',
      severity: 'high',
      message: 'Minimum salary is higher than maximum salary',
      suggestion: 'Swap min and max values'
    });
  }

  // Check for obviously wrong salaries
  if (salary_max && salary_max > 50000000) { // 5+ Cr
    issues.push({
      type: 'salary',
      severity: 'critical',
      message: 'Salary exceeds realistic CEO-level compensation',
      suggestion: 'Review and correct salary data'
    });
  }

  return issues;
}

async function validateSkills(jobData: any) {
  const issues = [];
  const { title, skills_required, department } = jobData;

  if (!skills_required || skills_required.length === 0) {
    issues.push({
      type: 'skills',
      severity: 'high',
      message: 'No skills specified for the role',
      suggestion: 'Add relevant skills for this position'
    });
    return issues;
  }

  // Use AI to validate skill-role match
  try {
    const prompt = `Analyze if these skills match the job role:

Job Title: ${title}
Department: ${department}
Skills: ${skills_required.join(', ')}

Rate the match (0-100) and identify any mismatched skills.

Return JSON:
{
  "matchScore": 85,
  "mismatchedSkills": ["React", "Vue.js"],
  "reason": "Technical skills don't match recruitment role",
  "suggestedSkills": ["Talent Acquisition", "ATS", "HR Policies"]
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an expert at job role and skill matching. Identify unrealistic skill combinations.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 500,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const analysis = JSON.parse(data.choices[0].message.content);
      
      if (analysis.matchScore < 70) {
        issues.push({
          type: 'skills',
          severity: 'high',
          message: `Skills poorly match the role (${analysis.matchScore}% match). ${analysis.reason}`,
          suggestion: `Consider these skills instead: ${analysis.suggestedSkills.join(', ')}`,
          data: analysis
        });
      }
    }
  } catch (error) {
    console.error('Error validating skills:', error);
  }

  return issues;
}

function validateCompanyInfo(jobData: any) {
  const issues = [];
  const { company_name, company_id, posted_by } = jobData;

  if (!company_name || company_name.trim() === '') {
    issues.push({
      type: 'company',
      severity: 'critical',
      message: 'Company name is missing',
      suggestion: 'Add company name or mark as "Confidential Employer"'
    });
  }

  if (!company_id && !posted_by) {
    issues.push({
      type: 'company',
      severity: 'high',
      message: 'No company or poster information',
      suggestion: 'Link to company profile or add poster details'
    });
  }

  return issues;
}

function validateRequiredFields(jobData: any) {
  const issues = [];
  const requiredFields = [
    { field: 'title', name: 'Job Title' },
    { field: 'location', name: 'Location' },
    { field: 'employment_type', name: 'Employment Type' },
    { field: 'experience_level', name: 'Experience Level' }
  ];

  requiredFields.forEach(({ field, name }) => {
    if (!jobData[field] || jobData[field].trim() === '') {
      issues.push({
        type: 'required_field',
        severity: 'critical',
        message: `${name} is required but missing`,
        suggestion: `Add ${name} to complete the job posting`
      });
    }
  });

  return issues;
}

async function enrichJobData(jobData: any) {
  const prompt = `Enrich this job posting with realistic data:

Current Data:
Title: ${jobData.title}
Company: ${jobData.company_name || 'Unknown'}
Experience: ${jobData.experience_level}
Type: ${jobData.employment_type}
Location: ${jobData.location}
Current Skills: ${jobData.skills_required?.join(', ') || 'None'}
Current Salary: ${jobData.salary_min} - ${jobData.salary_max}

Please provide:
1. Realistic salary range for this role in India
2. Appropriate skills (5-8 relevant skills)
3. Professional job description (2-3 paragraphs)
4. Key requirements and qualifications

Return as JSON:
{
  "salary": {"min": 800000, "max": 1500000},
  "skills": ["Skill1", "Skill2"],
  "description": "Professional description...",
  "requirements": ["Requirement 1", "Requirement 2"]
}`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an expert HR professional who creates realistic job postings with market-accurate salaries and relevant skills.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.4,
        max_tokens: 1000,
      }),
    });

    const data = await response.json();
    const enrichedData = JSON.parse(data.choices[0].message.content);

    return new Response(JSON.stringify({
      success: true,
      enrichedData,
      originalData: jobData
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error enriching job data:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to enrich job data'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

async function cleanupAllJobs() {
  try {
    console.log('Starting job cleanup process...');

    // 1. Flag jobs with unrealistic salaries
    const { data: salaryIssues, error: salaryError } = await supabase
      .from('jobs')
      .update({ 
        status: 'flagged',
        notes: 'Flagged: Unrealistic salary detected'
      })
      .or('salary_max.gt.15000000,salary_min.gt.10000000')
      .select('id, title, salary_max');

    console.log('Salary issues flagged:', salaryIssues?.length || 0);

    // 2. Flag jobs missing company names
    const { data: companyIssues, error: companyError } = await supabase
      .from('jobs')
      .update({
        status: 'flagged',
        notes: 'Flagged: Missing company information'
      })
      .or('company_name.is.null,company_name.eq.')
      .select('id, title');

    console.log('Company issues flagged:', companyIssues?.length || 0);

    // 3. Get jobs with skill mismatches (this would need manual review)
    const { data: skillIssues, error: skillError } = await supabase
      .from('jobs')
      .select('id, title, skills_required, department')
      .not('skills_required', 'is', null)
      .limit(50); // Process in batches

    let skillMismatches = 0;
    if (skillIssues) {
      for (const job of skillIssues) {
        // Check for obvious mismatches
        const hasReactSkills = job.skills_required?.some((skill: string) => 
          ['React', 'Vue.js', 'Angular', 'JavaScript'].includes(skill));
        const isNonTechRole = job.title?.toLowerCase().includes('sales') || 
                              job.title?.toLowerCase().includes('recruitment') ||
                              job.title?.toLowerCase().includes('marketing');

        if (hasReactSkills && isNonTechRole) {
          await supabase
            .from('jobs')
            .update({
              status: 'flagged',
              notes: 'Flagged: Skill-role mismatch detected'
            })
            .eq('id', job.id);
          skillMismatches++;
        }
      }
    }

    console.log('Skill mismatches flagged:', skillMismatches);

    return new Response(JSON.stringify({
      success: true,
      cleanup_summary: {
        salary_issues: salaryIssues?.length || 0,
        company_issues: companyIssues?.length || 0,
        skill_mismatches: skillMismatches,
        total_flagged: (salaryIssues?.length || 0) + (companyIssues?.length || 0) + skillMismatches
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error during cleanup:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

async function fixSpecificJob(jobId: string) {
  try {
    // Get the job data
    const { data: job, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (error || !job) {
      throw new Error('Job not found');
    }

    // Validate the job
    const validation = await validateJobData(job);
    const validationResult = await validation.json();

    if (validationResult.isValid) {
      return new Response(JSON.stringify({
        success: true,
        message: 'Job is already valid',
        score: validationResult.score
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Enrich the job data
    const enrichment = await enrichJobData(job);
    const enrichmentResult = await enrichment.json();

    if (!enrichmentResult.success) {
      throw new Error('Failed to enrich job data');
    }

    // Update the job with enriched data
    const updates = {
      salary_min: enrichmentResult.enrichedData.salary.min,
      salary_max: enrichmentResult.enrichedData.salary.max,
      skills_required: enrichmentResult.enrichedData.skills,
      description: enrichmentResult.enrichedData.description,
      status: 'active',
      notes: 'Auto-fixed by AI quality checker',
      updated_at: new Date().toISOString()
    };

    const { error: updateError } = await supabase
      .from('jobs')
      .update(updates)
      .eq('id', jobId);

    if (updateError) {
      throw updateError;
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Job successfully fixed and enriched',
      updates,
      issues_resolved: validationResult.issues.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error fixing job:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}