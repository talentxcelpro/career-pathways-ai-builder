import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface JobRecord {
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
  skills_required?: string;
  skills_keywords?: string;
  job_tags?: string;
  benefits?: string;
  external_url?: string;
  application_email?: string;
  application_method?: string;
  job_type_detail?: string;
  priority?: boolean;
  job_posted_at?: string;
  expires_at?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  console.log('🚀 Bulk Job Upload function called');

  try {
    const requestBody = await req.json();
    console.log('📝 Request body:', requestBody);

    // Handle test requests
    if (requestBody.name === "Functions") {
      return new Response(JSON.stringify({
        success: true,
        message: 'Bulk Job Upload function is working!',
        timestamp: new Date().toISOString(),
        expectedParams: {
          csvData: 'CSV content as string',
          batchName: 'Name for this batch upload'
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { csvData, batchName } = requestBody;

    if (!csvData || !batchName) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required parameters: csvData and batchName',
        received: Object.keys(requestBody),
        expected: ['csvData', 'batchName']
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('📊 Processing CSV data...');

    // Parse CSV data
    const lines = csvData.trim().split('\n');
    const headers = lines[0].split(',').map((h: string) => h.trim().replace(/"/g, ''));
    
    console.log('📝 CSV Headers:', headers);

    const jobsToInsert = [];
    const errors = [];

    // Map employment types to match database constraints
    const mapEmploymentType = (type: string) => {
      if (!type) return 'Full-time';
      
      const typeMap: { [key: string]: string } = {
        'full-time': 'Full-time',
        'full_time': 'Full-time',
        'part-time': 'Part-time',
        'part_time': 'Part-time',
        'contract': 'Contract',
        'freelance': 'Freelance',
        'internship': 'Internship',
        'temporary': 'Temporary',
        'remote': 'Remote',
        'hybrid': 'Hybrid'
      };
      
      const normalizedType = type.toLowerCase().trim();
      return typeMap[normalizedType] || 'Full-time';
    };

    // Process each data row (skip header)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      try {
        // Simple CSV parsing (handles basic cases)
        const values = line.split(',').map((v: string) => v.trim().replace(/^"|"$/g, ''));
        
        const jobData: any = {};
        headers.forEach((header, index) => {
          jobData[header] = values[index] || '';
        });

        // Parse skills from comma-separated string
        const parseSkills = (skillsStr: string) => {
          if (!skillsStr) return [];
          return skillsStr.split(',').map(s => s.trim()).filter(s => s.length > 0);
        };

        // Map CSV data to our job schema
        const mappedJob = {
          title: jobData.title || 'Untitled Position',
          company_name: jobData.company_name || 'Company',
          location: jobData.location || 'India',
          description: jobData.description || 'Job description not provided.',
          employment_type: mapEmploymentType(jobData.employment_type),
          experience_level: jobData.experience_level || 'mid-level',
          salary_min: jobData.salary_min ? parseInt(jobData.salary_min) : null,
          salary_max: jobData.salary_max ? parseInt(jobData.salary_max) : null,
          salary_range: jobData.salary_min && jobData.salary_max 
            ? `₹${parseInt(jobData.salary_min).toLocaleString()} - ₹${parseInt(jobData.salary_max).toLocaleString()}`
            : jobData.salary_min
              ? `₹${parseInt(jobData.salary_min).toLocaleString()}+`
              : 'Not disclosed',
          skills_required: parseSkills(jobData.skills_required || jobData.skills_keywords || ''),
          is_remote: jobData.is_remote === 'true' || jobData.location_type === 'Remote',
          external_url: jobData.external_url || null,
          is_external: !!(jobData.external_url),
          posted_at: jobData.job_posted_at || new Date().toISOString(),
          expires_at: jobData.expires_at || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          job_status: 'open',
          is_active: true,
          is_featured: jobData.priority === 'true',
          source: batchName,
          views_count: 0,
          applications_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        jobsToInsert.push(mappedJob);

      } catch (error) {
        console.error(`Error processing row ${i}:`, error);
        errors.push({
          row: i,
          data: line,
          errors: [`Failed to parse row: ${error.message}`]
        });
      }
    }

    console.log(`📦 Prepared ${jobsToInsert.length} jobs for insertion`);

    // Insert jobs in batches
    const batchSize = 100;
    let successfulJobs = 0;
    const insertErrors = [];

    for (let i = 0; i < jobsToInsert.length; i += batchSize) {
      const batch = jobsToInsert.slice(i, i + batchSize);
      
      try {
        const { data, error } = await supabase
          .from('jobs')
          .insert(batch)
          .select('id');

        if (error) {
          console.error(`Batch ${Math.floor(i/batchSize) + 1} insertion error:`, error);
          insertErrors.push({
            batch: Math.floor(i/batchSize) + 1,
            error: error.message,
            jobs: batch.length
          });
        } else {
          successfulJobs += data?.length || 0;
          console.log(`✅ Batch ${Math.floor(i/batchSize) + 1}: Inserted ${data?.length || 0} jobs`);
        }
      } catch (batchError) {
        console.error(`Batch ${Math.floor(i/batchSize) + 1} failed:`, batchError);
        insertErrors.push({
          batch: Math.floor(i/batchSize) + 1,
          error: batchError.message,
          jobs: batch.length
        });
      }
    }

    const result = {
      success: true,
      batchId: crypto.randomUUID(),
      totalJobs: jobsToInsert.length,
      successfulJobs,
      failedJobs: jobsToInsert.length - successfulJobs,
      errors: [...errors, ...insertErrors.map(e => ({
        row: 0,
        data: `Batch ${e.batch}`,
        errors: [e.error]
      }))]
    };

    console.log('✅ Bulk upload completed:', {
      total: result.totalJobs,
      successful: result.successfulJobs,
      failed: result.failedJobs
    });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Bulk upload error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Unknown error occurred',
      details: error.toString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});