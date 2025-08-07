import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
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
  console.log('=== BULK JOB UPLOAD FUNCTION START ===');
  console.log(`Method: ${req.method}`);
  console.log(`URL: ${req.url}`);

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