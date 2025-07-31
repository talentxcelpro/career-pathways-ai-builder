import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const deepSeekApiKey = Deno.env.get('DEEPSEEK_API_KEY');
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log("Starting test job seeding process...");

    // Get 15 best quality scraped jobs (we'll filter to 10)
    const { data: scrapedJobs, error: fetchError } = await supabase
      .from('scraped_jobs')
      .select('*')
      .gte('quality_score', 60)
      .eq('is_portal_job', false)
      .not('job_title', 'is', null)
      .not('company', 'is', null)
      .not('job_description', 'is', null)
      .order('quality_score', { ascending: false })
      .limit(15);

    if (fetchError) {
      throw new Error(`Failed to fetch scraped jobs: ${fetchError.message}`);
    }

    if (!scrapedJobs || scrapedJobs.length === 0) {
      throw new Error('No quality scraped jobs found');
    }

    console.log(`Found ${scrapedJobs.length} quality scraped jobs`);

    const processedJobs = [];
    let processedCount = 0;

    for (const scrapedJob of scrapedJobs) {
      if (processedCount >= 10) break;

      try {
        // Validate and enhance with DeepSeek if available
        let enhancedJob = scrapedJob;
        if (deepSeekApiKey) {
          enhancedJob = await enhanceJobWithAI(deepSeekApiKey, scrapedJob);
        }

        // Create SEO-optimized job data
        const jobData = createJobData(enhancedJob);
        
        // Insert into jobs table
        const { data: insertedJob, error: insertError } = await supabase
          .from('jobs')
          .insert(jobData)
          .select()
          .single();

        if (insertError) {
          console.error(`Failed to insert job ${scrapedJob.job_title}:`, insertError);
          continue;
        }

        // Update scraped job reference
        await supabase
          .from('scraped_jobs')
          .update({ published_job_id: insertedJob.id })
          .eq('id', scrapedJob.id);

        processedJobs.push({
          id: insertedJob.id,
          title: insertedJob.title,
          company: insertedJob.company_name,
          location: insertedJob.location,
          originalQuality: scrapedJob.quality_score
        });

        processedCount++;
        console.log(`✅ Created job: ${insertedJob.title} at ${insertedJob.company_name}`);

      } catch (error) {
        console.error(`Failed to process job ${scrapedJob.job_title}:`, error);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      jobsCreated: processedCount,
      processedJobs,
      message: `Successfully created ${processedCount} test jobs ready for final testing`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Test job seeding error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function enhanceJobWithAI(apiKey: string, scrapedJob: any) {
  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'You are a job data validator and enhancer. Clean up job data and return JSON with: {"title": "clean title", "company": "company name", "location": "location", "description": "enhanced description", "valid": true/false}'
          },
          {
            role: 'user',
            content: `Validate and enhance this job data:
Title: ${scrapedJob.job_title}
Company: ${scrapedJob.company}
Location: ${scrapedJob.location}
Description: ${scrapedJob.job_description?.substring(0, 500)}...
Source: ${scrapedJob.source_url}

Clean and enhance this data for a professional job board.`
          }
        ],
        temperature: 0.3,
        max_tokens: 800
      }),
    });

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    try {
      const enhanced = JSON.parse(content);
      if (enhanced.valid) {
        return {
          ...scrapedJob,
          job_title: enhanced.title || scrapedJob.job_title,
          company: enhanced.company || scrapedJob.company,
          location: enhanced.location || scrapedJob.location,
          job_description: enhanced.description || scrapedJob.job_description
        };
      }
    } catch (parseError) {
      console.error('AI response parsing failed:', parseError);
    }
    
    return scrapedJob;
  } catch (error) {
    console.error('AI enhancement failed:', error);
    return scrapedJob;
  }
}

function createJobData(scrapedJob: any) {
  const title = scrapedJob.job_title;
  const company = scrapedJob.company;
  const location = scrapedJob.location || 'Remote';
  
  // Generate SEO-friendly slug
  const slug = generateSlug(`${title} at ${company} in ${location}`);
  
  // Create SEO metadata
  const seoTitle = `${title} at ${company} - ${location} | TalentXcel`;
  const seoDescription = `${title} position at ${company} in ${location}. ${scrapedJob.job_description?.substring(0, 120)}... Apply now on TalentXcel.`;
  
  // Determine job details
  const description = scrapedJob.job_description || '';
  const employmentType = determineEmploymentType(description);
  const experienceLevel = determineExperienceLevel(description);
  const isRemote = location.toLowerCase().includes('remote');
  
  return {
    title,
    description,
    company_name: company,
    location,
    employment_type: employmentType,
    experience_level: experienceLevel,
    is_remote: isRemote,
    is_active: true,
    external_url: scrapedJob.source_url,
    seo_title: seoTitle.substring(0, 60),
    seo_description: seoDescription.substring(0, 155),
    seo_keywords: [title.toLowerCase(), company.toLowerCase(), location.toLowerCase(), 'jobs', 'career'],
    slug,
    posted_at: scrapedJob.posted_at || new Date().toISOString(),
    source_type: 'scraped',
    scraped_job_id: scrapedJob.id
  };
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 100);
}

function determineEmploymentType(description: string): string {
  const text = description.toLowerCase();
  if (text.includes('part-time') || text.includes('part time')) return 'part-time';
  if (text.includes('contract') || text.includes('freelance')) return 'contract';
  if (text.includes('internship') || text.includes('intern')) return 'internship';
  return 'full-time';
}

function determineExperienceLevel(description: string): string {
  const text = description.toLowerCase();
  if (text.includes('senior') || text.includes('lead') || text.includes('principal')) return 'senior';
  if (text.includes('junior') || text.includes('entry') || text.includes('fresher')) return 'entry';
  return 'mid';
}