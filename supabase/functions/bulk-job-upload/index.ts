import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface JobData {
  job_id?: string;
  title: string;
  company_name: string;
  location: string;
  location_type?: string;
  employment_type: string;
  industry?: string;
  job_function?: string;
  description: string;
  education_requirements?: string;
  experience_level?: string;
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  is_remote?: boolean;
  skills_required?: string[];
  skills_keywords?: string[];
  job_tags?: string[];
  benefits?: string[];
  external_url?: string;
  application_email?: string;
  application_method?: string;
  job_type_detail?: string;
  priority?: boolean;
  job_posted_at?: string;
  expires_at?: string;
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
  
  // Validate salary values
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
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Since verify_jwt = true, the JWT is already validated by Supabase
    // We can get the user from the Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client for auth operations
    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: {
            authorization: authHeader,
          },
        },
      }
    );

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    
    if (authError || !user) {
      console.error('Authentication failed:', authError);
      return new Response(
        JSON.stringify({ error: 'Authentication failed' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client with SERVICE_ROLE_KEY for database operations
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const userId = user.id;

    // Check if user has permission to upload jobs
    const { data: userRole } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('is_active', true)
      .in('role', ['super_admin', 'admin', 'staffing_partner'])
      .single();

    if (!userRole) {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions' }),
        { status: 403, headers: corsHeaders }
      );
    }

    const { csvData, batchName } = await req.json();

    if (!csvData || !batchName) {
      return new Response(
        JSON.stringify({ error: 'CSV data and batch name are required' }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Parse CSV data
    const lines = csvData.trim().split('\n');
    const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().replace(/\s+/g, '_'));
    
    // Expected headers
    const requiredHeaders = ['title', 'company_name', 'location', 'employment_type', 'description'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    
    if (missingHeaders.length > 0) {
      return new Response(
        JSON.stringify({ 
          error: `Missing required headers: ${missingHeaders.join(', ')}`,
          expectedHeaders: requiredHeaders
        }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Create batch record
    const { data: batch, error: batchError } = await supabaseClient
      .from('bulk_upload_batches')
      .insert({
        uploaded_by: userId,
        batch_name: batchName,
        total_jobs: lines.length - 1,
        status: 'processing'
      })
      .select()
      .single();

    if (batchError) {
      console.error('Error creating batch:', batchError);
      return new Response(
        JSON.stringify({ error: 'Failed to create batch' }),
        { status: 500, headers: corsHeaders }
      );
    }

    // Process jobs
    const successfulJobs: any[] = [];
    const failedJobs: any[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      try {
        const values = parseCSVLine(lines[i]);
        const jobData: Partial<JobData> = {};
        
        headers.forEach((header, index) => {
          if (values[index] !== undefined && values[index] !== '') {
            switch (header) {
              case 'salary_min':
              case 'salary_max':
                jobData[header] = parseFloat(values[index]) || undefined;
                break;
              case 'is_remote':
              case 'priority':
                jobData[header] = values[index].toLowerCase() === 'true';
                break;
               case 'skills_required':
               case 'skills_keywords':
               case 'job_tags':
               case 'benefits':
                 jobData[header] = values[index].split(',').map(s => s.trim());
                 break;
               default:
                 (jobData as any)[header] = values[index];
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
        const slug = generateSlug(
          jobData.title!,
          jobData.company_name!,
          jobData.location!
        );

        // Set default values
        const jobToInsert = {
          ...jobData,
          seo_slug: slug,
          source_type: 'bulk_upload',
          bulk_upload_batch_id: batch.id,
          posted_by: userId,
          posted_by_role: userRole.role,
          is_active: true,
          job_status: 'open',
          salary_currency: jobData.salary_currency || 'INR',
          expires_at: jobData.expires_at || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        };

        // Insert job
        const { data: insertedJob, error: insertError } = await supabaseClient
          .from('jobs')
          .insert(jobToInsert)
          .select()
          .single();

        if (insertError) {
          failedJobs.push({
            row: i + 1,
            data: jobData,
            errors: [insertError.message]
          });
        } else {
          successfulJobs.push(insertedJob);
        }

      } catch (error) {
        failedJobs.push({
          row: i + 1,
          data: {},
          errors: [`Processing error: ${error.message}`]
        });
      }
    }

    // Update batch with results
    await supabaseClient
      .from('bulk_upload_batches')
      .update({
        processed_jobs: successfulJobs.length,
        failed_jobs: failedJobs.length,
        status: failedJobs.length === 0 ? 'completed' : 'completed_with_errors',
        error_log: failedJobs,
        completed_at: new Date().toISOString()
      })
      .eq('id', batch.id);

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
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});