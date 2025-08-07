import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface JobData {
  // Core fields that match database
  title?: string;
  description?: string;
  requirements?: string;
  company_name?: string;
  location?: string;
  location_type?: string;
  employment_type?: string;
  experience_level?: string;
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  is_remote?: boolean;
  skills_required?: string[];
  benefits?: string[];
  external_url?: string;
  application_method?: string;
  posted_at?: string;
  expires_at?: string;
  
  // Mapped fields
  work_mode?: string;
  industry_domain?: string;
  job_summary?: string;
  educational_qualification?: string;
  minimum_education?: string;
  contact_person_name?: string;
  detailed_description?: string;
  is_featured?: boolean;
  
  // System fields
  posted_by?: string;
  is_active?: boolean;
  job_status?: string;
}

function generateSlug(title: string, company: string, location: string): string {
  const sanitize = (str: string) => 
    str.trim().toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  
  return `${sanitize(title)}-at-${sanitize(company)}-${sanitize(location)}`;
}

function parseCSVLine(line: string): string[] {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result.map(field => field.replace(/^"|"$/g, ''));
}

function validateJobData(job: Partial<JobData>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!job.title?.trim()) errors.push('Title is required');
  if (!job.company_name?.trim()) errors.push('Company name is required');
  if (!job.location?.trim()) errors.push('Location is required');
  if (!job.employment_type?.trim()) errors.push('Employment type is required');
  if (!job.description?.trim()) errors.push('Description is required');
  
  // Validate experience level against allowed values
  const validExperienceLevels = ['fresher', 'mid-level', 'senior-level', 'executive'];
  if (job.experience_level && !validExperienceLevels.includes(job.experience_level)) {
    errors.push(`Invalid experience level. Must be one of: ${validExperienceLevels.join(', ')}`);
  }
  
  // Validate employment type against allowed values
  const validEmploymentTypes = ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship', 'Temporary', 'Remote', 'Hybrid'];
  if (job.employment_type && !validEmploymentTypes.includes(job.employment_type)) {
    errors.push(`Invalid employment type. Must be one of: ${validEmploymentTypes.join(', ')}`);
  }
  
  // Validate salary values (but don't require them)
  if (job.salary_min && (isNaN(job.salary_min) || job.salary_min < 0)) {
    errors.push('Invalid minimum salary');
  }
  if (job.salary_max && (isNaN(job.salary_max) || job.salary_max < 0)) {
    errors.push('Invalid maximum salary');
  }
  if (job.salary_min && job.salary_max && job.salary_min > job.salary_max) {
    errors.push('Minimum salary cannot be greater than maximum salary');
  }
  
  return { valid: errors.length === 0, errors };
}

serve(async (req) => {
  console.log('=== BULK JOB UPLOAD FUNCTION START (v2.0) ===');
  console.log(`Method: ${req.method}`);
  console.log(`URL: ${req.url}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with the authorization header from request
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    console.log('Environment check:', { 
      hasUrl: !!supabaseUrl, 
      hasAnonKey: !!supabaseAnonKey 
    });

    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    console.log('Auth header present:', !!authHeader);
    
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('Missing or invalid authorization header');
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client that will use the user's JWT for authentication
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    // Verify authentication and get user
    console.log('Verifying user authentication...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('Authentication error:', authError);
      return new Response(
        JSON.stringify({ error: 'Authentication failed', details: authError.message }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!user?.id) {
      console.error('No user found in JWT');
      return new Response(
        JSON.stringify({ error: 'No user ID found in token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('User authenticated successfully:', { userId: user.id, email: user.email });

    // Check user permissions - directly query user_roles table
    console.log('Checking user permissions...');
    const { data: userRoles, error: roleError } = await supabase
      .from('user_roles')
      .select('role, is_active')
      .eq('user_id', user.id)
      .eq('is_active', true);

    if (roleError) {
      console.error('Error checking user roles:', roleError);
      return new Response(
        JSON.stringify({ error: 'Permission check failed', details: roleError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('User roles found:', userRoles);

    // Check if user has any admin/employer role
    const allowedRoles = ['super_admin', 'admin', 'moderator', 'employer'];
    const hasPermission = userRoles?.some(role => 
      allowedRoles.includes(role.role) && role.is_active
    );

    if (!hasPermission) {
      console.error('User lacks required permissions. Roles:', userRoles);
      return new Response(
        JSON.stringify({ 
          error: 'Insufficient permissions', 
          message: 'You need admin or employer role to upload bulk jobs',
          userRoles: userRoles?.map(r => r.role) || []
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Permission check passed');

    // Parse request body
    console.log('Parsing request body...');
    const { csvData, batchName } = await req.json();

    if (!csvData || !batchName) {
      return new Response(
        JSON.stringify({ error: 'CSV data and batch name are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing CSV data...');
    // Parse CSV data
    const lines = csvData.trim().split('\n');
    const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().replace(/\s+/g, '_'));
    
    console.log('CSV headers:', headers);
    
    // Expected headers
    const requiredHeaders = ['title', 'company_name', 'location', 'employment_type', 'description'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    
    if (missingHeaders.length > 0) {
      return new Response(
        JSON.stringify({ 
          error: `Missing required headers: ${missingHeaders.join(', ')}`,
          expectedHeaders: requiredHeaders,
          foundHeaders: headers
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create batch record
    console.log('Creating batch record...');
    const { data: batch, error: batchError } = await supabase
      .from('bulk_upload_batches')
      .insert({
        uploaded_by: user.id,
        batch_name: batchName,
        total_jobs: lines.length - 1,
        status: 'processing'
      })
      .select()
      .single();

    if (batchError) {
      console.error('Error creating batch:', batchError);
      return new Response(
        JSON.stringify({ error: 'Failed to create batch', details: batchError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Batch created successfully:', batch.id);

    // Process jobs
    const successfulJobs: any[] = [];
    const failedJobs: any[] = [];
    
    console.log(`Processing ${lines.length - 1} jobs...`);
    
    for (let i = 1; i < lines.length; i++) {
      try {
        const values = parseCSVLine(lines[i]);
        const jobData: Partial<JobData> = {};
        
        // Map CSV headers to actual database columns
        headers.forEach((header, index) => {
          const value = values[index];
          if (value !== undefined && value !== '') {
            switch (header) {
              // Skip job_id - database auto-generates 'id'
              case 'job_id':
                break;
              case 'title':
                jobData.title = value;
                break;
              case 'company_name':
                jobData.company_name = value;
                break;
              case 'description':
                jobData.description = value;
                jobData.requirements = value; // Map to requirements field too
                break;
              case 'location':
                jobData.location = value;
                break;
              case 'location_type':
                jobData.location_type = value;
                jobData.work_mode = value; // Map to work_mode as well
                break;
              case 'employment_type':
                // Map common employment type values to database constraints
                const employmentTypeMap: { [key: string]: string } = {
                  'full-time': 'Full-time',
                  'fulltime': 'Full-time',
                  'full time': 'Full-time',
                  'part-time': 'Part-time',
                  'parttime': 'Part-time',
                  'part time': 'Part-time',
                  'contract': 'Contract',
                  'freelance': 'Freelance',
                  'internship': 'Internship',
                  'intern': 'Internship',
                  'temporary': 'Temporary',
                  'temp': 'Temporary',
                  'remote': 'Remote',
                  'hybrid': 'Hybrid'
                };
                const normalizedType = value.toLowerCase().replace(/\s+/g, '-');
                jobData.employment_type = employmentTypeMap[normalizedType] || 'Full-time';
                break;
              case 'industry':
                jobData.industry_domain = value; // Map to industry_domain
                break;
              case 'job_function':
                // Map to job_summary since job_function doesn't exist
                jobData.job_summary = value;
                break;
              case 'education_requirements':
                jobData.educational_qualification = value;
                jobData.minimum_education = value;
                break;
              case 'experience_level':
                // Map common experience level values to database constraints
                const experienceLevelMap: { [key: string]: string } = {
                  'entry': 'fresher',
                  'entry-level': 'fresher',
                  'junior': 'fresher',
                  'fresher': 'fresher',
                  'mid': 'mid-level',
                  'mid-level': 'mid-level',
                  'middle': 'mid-level',
                  'intermediate': 'mid-level',
                  'senior': 'senior-level',
                  'senior-level': 'senior-level',
                  'lead': 'senior-level',
                  'principal': 'senior-level',
                  'executive': 'executive',
                  'director': 'executive',
                  'manager': 'executive'
                };
                const normalizedLevel = value.toLowerCase().replace(/\s+/g, '-');
                jobData.experience_level = experienceLevelMap[normalizedLevel] || 'fresher';
                break;
              case 'salary_min':
                jobData.salary_min = parseFloat(value) || undefined;
                break;
              case 'salary_max':
                jobData.salary_max = parseFloat(value) || undefined;
                break;
              case 'salary_currency':
                jobData.salary_currency = value;
                break;
              case 'is_remote':
                jobData.is_remote = value.toLowerCase() === 'true' || value === '1';
                break;
              case 'skills_required':
                jobData.skills_required = value.split(',').map(s => s.trim());
                break;
              case 'skills_keywords':
                // Add to skills_required since skills_keywords doesn't exist
                const existingSkills = jobData.skills_required || [];
                const newSkills = value.split(',').map(s => s.trim());
                jobData.skills_required = [...existingSkills, ...newSkills].filter((v, i, a) => a.indexOf(v) === i);
                break;
              case 'job_tags':
                // Store in a custom field or ignore
                break;
              case 'benefits':
                jobData.benefits = value.split(',').map(s => s.trim());
                break;
              case 'external_url':
                jobData.external_url = value;
                break;
              case 'application_email':
                // Map to contact fields
                jobData.contact_person_name = value;
                break;
              case 'application_method':
                jobData.application_method = value;
                break;
              case 'job_type_detail':
                jobData.detailed_description = value;
                break;
              case 'priority':
                jobData.is_featured = value.toLowerCase() === 'high' || value === '1';
                break;
              case 'job_posted_at':
                jobData.posted_at = new Date(value).toISOString();
                break;
              case 'expires_at':
                jobData.expires_at = new Date(value).toISOString();
                break;
              default:
                // Ignore unknown headers
                break;
            }
          }
        });

        // Validate job data
        const validation = validateJobData(jobData);
        if (!validation.valid) {
          failedJobs.push({
            row: i + 1,
            data: jobData,
            errors: validation.errors
          });
          continue;
        }

        // Generate additional fields
        const baseSlug = generateSlug(
          jobData.title!,
          jobData.company_name!,
          jobData.location!
        );
        
        // Make slug unique by adding timestamp
        const slug = `${baseSlug}-${Date.now()}`;

        // Check for existing job with same title, company, location
        const { data: existingJob } = await supabase
          .from('jobs')
          .select('id')
          .eq('title', jobData.title)
          .eq('company_name', jobData.company_name)
          .eq('location', jobData.location)
          .limit(1);

        if (existingJob && existingJob.length > 0) {
          failedJobs.push({
            row: i + 1,
            data: jobData,
            errors: [`Duplicate job: A job with title "${jobData.title}" at "${jobData.company_name}" in "${jobData.location}" already exists`]
          });
          continue;
        }

        // Set default values
        const jobToInsert = {
          ...jobData,
          seo_slug: slug,
          source_type: 'bulk_upload',
          bulk_upload_batch_id: batch.id,
          posted_by: user.id,
          is_active: true,
          job_status: 'open',
          salary_currency: jobData.salary_currency || 'INR',
          expires_at: jobData.expires_at || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        };

        // Insert job
        const { data: insertedJob, error: insertError } = await supabase
          .from('jobs')
          .insert(jobToInsert)
          .select()
          .single();

        if (insertError) {
          console.error(`Error inserting job at row ${i + 1}:`, insertError);
          failedJobs.push({
            row: i + 1,
            data: jobData,
            errors: [insertError.message]
          });
        } else {
          successfulJobs.push(insertedJob);
        }

      } catch (error) {
        console.error(`Error processing row ${i + 1}:`, error);
        failedJobs.push({
          row: i + 1,
          data: {},
          errors: [`Processing error: ${error.message}`]
        });
      }
    }

    // Update batch with results
    console.log('Updating batch with results...');
    const { error: updateError } = await supabase
      .from('bulk_upload_batches')
      .update({
        processed_jobs: successfulJobs.length,
        failed_jobs: failedJobs.length,
        status: failedJobs.length === 0 ? 'completed' : 'completed_with_errors',
        error_log: failedJobs,
        completed_at: new Date().toISOString()
      })
      .eq('id', batch.id);

    if (updateError) {
      console.error('Error updating batch:', updateError);
    }

    console.log(`Bulk upload completed: ${successfulJobs.length} successful, ${failedJobs.length} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        batchId: batch.id,
        totalJobs: lines.length - 1,
        successfulJobs: successfulJobs.length,
        failedJobs: failedJobs.length,
        errors: failedJobs.length > 0 ? failedJobs : undefined
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Bulk upload error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message,
        stack: error.stack 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});