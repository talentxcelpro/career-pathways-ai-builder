import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Utility functions (copied from seoUrls.ts since we can't import)
const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
};

const extractJobCodeFromTitle = (title: string): string | undefined => {
  const codeMatch = title.match(/([A-Z]{2,}\d{3,})/);
  return codeMatch ? codeMatch[1] : undefined;
};

const generateJobSlug = (title: string, company: string, location?: string, jobCode?: string): string => {
  const parts = [];
  
  // Add title (required)
  if (title) {
    parts.push(slugify(title));
  }
  
  // Add job code if available (like GOV0004)
  if (jobCode) {
    parts.push(slugify(jobCode));
  }
  
  // Add company name (required) 
  if (company) {
    parts.push(slugify(company));
  }
  
  // Add location (fallback to 'india')
  const locationSlug = location ? slugify(location) : 'india';
  parts.push(locationSlug);
  
  return parts.filter(part => part.length > 0).join('-');
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'standardize';

    if (action === 'standardize') {
      console.log('🔄 Starting job slug standardization...');

      // Fetch all jobs that need slug updates
      const { data: jobs, error: fetchError } = await supabaseClient
        .from('jobs')
        .select('id, title, company_name, location, seo_slug')
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      console.log(`📊 Found ${jobs?.length || 0} jobs to process`);

      let updatedCount = 0;
      let skippedCount = 0;
      const errors: string[] = [];

      if (jobs && jobs.length > 0) {
        // Process in batches of 100 to avoid timeout
        const batchSize = 100;
        for (let i = 0; i < jobs.length; i += batchSize) {
          const batch = jobs.slice(i, i + batchSize);
          
          for (const job of batch) {
            try {
              // Extract job code from title
              const jobCode = extractJobCodeFromTitle(job.title);
              
              // Generate new standardized slug
              const newSlug = generateJobSlug(
                job.title,
                job.company_name,
                job.location,
                jobCode
              );

              // Only update if the slug is different
              if (job.seo_slug !== newSlug) {
                const { error: updateError } = await supabaseClient
                  .from('jobs')
                  .update({ seo_slug: newSlug })
                  .eq('id', job.id);

                if (updateError) {
                  errors.push(`Job ${job.id}: ${updateError.message}`);
                } else {
                  updatedCount++;
                  if (updatedCount % 50 === 0) {
                    console.log(`✅ Updated ${updatedCount} jobs so far...`);
                  }
                }
              } else {
                skippedCount++;
              }
            } catch (error) {
              errors.push(`Job ${job.id}: ${error.message}`);
            }
          }
          
          // Small delay between batches
          if (i + batchSize < jobs.length) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
      }

      const result = {
        success: true,
        totalJobs: jobs?.length || 0,
        updatedCount,
        skippedCount,
        errorCount: errors.length,
        errors: errors.slice(0, 10), // Only include first 10 errors
        message: `Standardization complete: ${updatedCount} updated, ${skippedCount} skipped, ${errors.length} errors`
      };

      console.log('✅ Job slug standardization completed:', result);

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });

    } else if (action === 'sample') {
      // Show sample of current slugs vs new standardized format
      const { data: jobs, error } = await supabaseClient
        .from('jobs')
        .select('id, title, company_name, location, seo_slug')
        .limit(10);

      if (error) throw error;

      const samples = jobs?.map(job => {
        const jobCode = extractJobCodeFromTitle(job.title);
        const newSlug = generateJobSlug(job.title, job.company_name, job.location, jobCode);
        
        return {
          id: job.id,
          title: job.title,
          company: job.company_name,
          location: job.location,
          currentSlug: job.seo_slug,
          newSlug: newSlug,
          needsUpdate: job.seo_slug !== newSlug
        };
      });

      return new Response(JSON.stringify({ samples }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });

  } catch (error) {
    console.error('❌ Error in standardize-job-slugs:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      stack: error.stack 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});