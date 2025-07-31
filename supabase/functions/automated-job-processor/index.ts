import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log("Starting automated job processing...");

    // Get active bots with their scraping schedules
    const { data: activeBots, error: botsError } = await supabase
      .from('ai_bots')
      .select(`
        *,
        scraping_schedules!inner(*)
      `)
      .eq('is_active', true)
      .eq('scraping_schedules.is_active', true);

    if (botsError) {
      throw new Error(`Failed to fetch active bots: ${botsError.message}`);
    }

    console.log(`Found ${activeBots?.length || 0} active bots with schedules`);

    const processedBots = [];
    const results = {
      totalBots: activeBots?.length || 0,
      processedBots: 0,
      totalJobsScraped: 0,
      errors: []
    };

    for (const bot of activeBots || []) {
      try {
        console.log(`Processing bot: ${bot.name} (${bot.id})`);
        
        // Get bot's scraping assignments
        const { data: assignments } = await supabase
          .from('bot_scraping_assignments')
          .select(`
            *,
            job_scraping_sources!inner(*)
          `)
          .eq('bot_id', bot.id)
          .eq('is_active', true);

        if (!assignments || assignments.length === 0) {
          console.log(`No active assignments for bot ${bot.name}`);
          continue;
        }

        // Collect source URLs from assignments
        const sourceUrls = [];
        for (const assignment of assignments) {
          // Add company career page URLs
          if (assignment.job_scraping_sources.base_url) {
            sourceUrls.push(assignment.job_scraping_sources.base_url);
            
            // Add common career page patterns
            const baseUrl = assignment.job_scraping_sources.base_url;
            const commonPaths = ['/careers', '/jobs', '/opportunities', '/join-us'];
            
            for (const path of commonPaths) {
              sourceUrls.push(`${baseUrl}${path}`);
            }
          }
        }

        // Add industry-specific and location-based sources
        const additionalSources = await generateTargetSources(bot, supabase);
        sourceUrls.push(...additionalSources);

        if (sourceUrls.length === 0) {
          console.log(`No source URLs found for bot ${bot.name}`);
          continue;
        }

        console.log(`Bot ${bot.name} will scrape ${sourceUrls.length} sources`);

        // Call job scraper for this bot
        const scrapingResult = await supabase.functions.invoke('job-scraper', {
          body: {
            sourceUrls: sourceUrls.slice(0, 20), // Limit per run
            botId: bot.id,
            maxJobs: 50,
            testMode: false,
            sourceCategory: 'automated_scraping'
          }
        });

        if (scrapingResult.error) {
          throw new Error(`Scraping failed: ${scrapingResult.error.message}`);
        }

        const scrapingData = scrapingResult.data;
        console.log(`Bot ${bot.name} scraped ${scrapingData.jobsScraped} jobs`);

        // Update scraping schedule
        const schedule = bot.scraping_schedules[0];
        const nextRunAt = new Date(Date.now() + parseInterval(schedule.scraping_frequency));
        
        await supabase
          .from('scraping_schedules')
          .update({
            last_run_at: new Date().toISOString(),
            next_run_at: nextRunAt.toISOString(),
            success_count: schedule.success_count + 1
          })
          .eq('id', schedule.id);

        // Process approved jobs for SEO optimization and publishing
        if (scrapingData.jobsScraped > 0) {
          await processJobsForSEO(supabase, bot.id);
        }

        processedBots.push({
          botId: bot.id,
          botName: bot.name,
          jobsScraped: scrapingData.jobsScraped,
          sourcesProcessed: sourceUrls.length
        });

        results.processedBots++;
        results.totalJobsScraped += scrapingData.jobsScraped;

      } catch (error) {
        console.error(`Error processing bot ${bot.name}:`, error);
        results.errors.push({
          botId: bot.id,
          botName: bot.name,
          error: error.message
        });

        // Update error count
        const schedule = bot.scraping_schedules?.[0];
        if (schedule) {
          await supabase
            .from('scraping_schedules')
            .update({
              error_count: schedule.error_count + 1
            })
            .eq('id', schedule.id);
        }
      }
    }

    console.log(`Automation complete: ${results.processedBots} bots processed, ${results.totalJobsScraped} jobs scraped`);

    return new Response(JSON.stringify({
      success: true,
      results,
      processedBots,
      message: `Automated processing complete: ${results.totalJobsScraped} jobs scraped by ${results.processedBots} bots`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Automated job processor error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Helper Functions
async function generateTargetSources(bot: any, supabase: any): Promise<string[]> {
  const sources = [];
  
  // Industry-specific job boards (non-portal sources)
  const industryUrls = {
    'technology': [
      'https://angel.co/jobs',
      'https://remoteok.io',
      'https://stackoverflow.com/jobs'
    ],
    'healthcare': [
      'https://healthjobsuk.com',
      'https://practicematch.com'
    ],
    'finance': [
      'https://efinancialcareers.com',
      'https://financejobs.com'
    ],
    'education': [
      'https://higheredjobs.com',
      'https://academicjobs.com'
    ]
  };

  // Add industry-specific sources based on bot's content domains
  for (const domain of bot.content_domains || []) {
    if (industryUrls[domain.toLowerCase()]) {
      sources.push(...industryUrls[domain.toLowerCase()]);
    }
  }

  // Add government job sources (India specific)
  const govSources = [
    'https://www.sarkariresult.com',
    'https://employ.gov.in',
    'https://www.fresherslive.com/government-jobs'
  ];
  sources.push(...govSources);

  // Add location-specific company sources
  const locationBasedSources = await getLocationBasedSources(supabase);
  sources.push(...locationBasedSources.slice(0, 10));

  return sources;
}

async function getLocationBasedSources(supabase: any): Promise<string[]> {
  try {
    // Get companies from database to scrape their career pages
    const { data: companies } = await supabase
      .from('companies')
      .select('website_url, name')
      .not('website_url', 'is', null)
      .limit(20);

    const sources = [];
    for (const company of companies || []) {
      if (company.website_url) {
        sources.push(company.website_url);
        sources.push(`${company.website_url}/careers`);
        sources.push(`${company.website_url}/jobs`);
      }
    }

    return sources;
  } catch (error) {
    console.error('Failed to get location-based sources:', error);
    return [];
  }
}

async function processJobsForSEO(supabase: any, botId: string) {
  try {
    // Get recently scraped approved jobs
    const { data: approvedJobs } = await supabase
      .from('scraped_jobs')
      .select('*')
      .eq('bot_id', botId)
      .eq('status', 'approved')
      .eq('processing_status', 'completed')
      .is('published_job_id', null)
      .order('scraped_at', { ascending: false })
      .limit(50);

    if (!approvedJobs || approvedJobs.length === 0) {
      console.log('No approved jobs to process for SEO');
      return;
    }

    console.log(`Processing ${approvedJobs.length} jobs for SEO optimization`);

    for (const scrapedJob of approvedJobs) {
      try {
        // Generate SEO-optimized content
        const seoData = generateJobSEOData(scrapedJob);
        
        // Insert into main jobs table with SEO optimization
        const { data: publishedJob, error: publishError } = await supabase
          .from('jobs')
          .insert({
            title: seoData.title,
            description: seoData.description,
            company_name: scrapedJob.company,
            location: scrapedJob.location,
            employment_type: determineEmploymentType(scrapedJob.job_description),
            experience_level: determineExperienceLevel(scrapedJob.job_description),
            external_url: scrapedJob.source_url,
            is_active: true,
            is_remote: scrapedJob.location?.toLowerCase().includes('remote') || false,
            seo_title: seoData.seoTitle,
            seo_description: seoData.seoDescription,
            seo_keywords: seoData.keywords,
            source_type: 'scraped',
            scraped_job_id: scrapedJob.id
          })
          .select()
          .single();

        if (publishError) {
          console.error(`Failed to publish job ${scrapedJob.id}:`, publishError);
          continue;
        }

        // Update scraped job with published job reference
        await supabase
          .from('scraped_jobs')
          .update({
            published_job_id: publishedJob.id,
            processing_status: 'published'
          })
          .eq('id', scrapedJob.id);

        console.log(`Published job: ${publishedJob.title} (${publishedJob.id})`);

      } catch (error) {
        console.error(`Failed to process job ${scrapedJob.id} for SEO:`, error);
      }
    }

  } catch (error) {
    console.error('SEO processing error:', error);
  }
}

function generateJobSEOData(scrapedJob: any) {
  const title = scrapedJob.job_title;
  const company = scrapedJob.company;
  const location = scrapedJob.location || 'Remote';
  
  // Generate SEO-optimized title
  const seoTitle = `${title} at ${company} - ${location} | TalentXcel Jobs`;
  
  // Generate SEO description
  const seoDescription = `${title} position at ${company} in ${location}. ${scrapedJob.job_description?.substring(0, 120)}... Apply now on TalentXcel.`;
  
  // Generate keywords
  const keywords = [
    title.toLowerCase(),
    company.toLowerCase(),
    location.toLowerCase(),
    'jobs',
    'career',
    'hiring',
    'employment'
  ];

  // Clean up description
  let description = scrapedJob.job_description || '';
  if (description.length < 200) {
    description = `Join ${company} as a ${title} in ${location}. ${description} This is an excellent opportunity for career growth and development.`;
  }

  return {
    title,
    description,
    seoTitle: seoTitle.substring(0, 60), // SEO title limit
    seoDescription: seoDescription.substring(0, 155), // SEO description limit
    keywords
  };
}

function determineEmploymentType(description: string): string {
  const text = description?.toLowerCase() || '';
  
  if (text.includes('part-time') || text.includes('part time')) return 'part-time';
  if (text.includes('contract') || text.includes('freelance')) return 'contract';
  if (text.includes('internship') || text.includes('intern')) return 'internship';
  
  return 'full-time';
}

function determineExperienceLevel(description: string): string {
  const text = description?.toLowerCase() || '';
  
  if (text.includes('senior') || text.includes('lead') || text.includes('principal')) return 'senior';
  if (text.includes('junior') || text.includes('entry') || text.includes('fresher')) return 'entry';
  
  return 'mid';
}

function parseInterval(interval: string): number {
  // Parse PostgreSQL interval to milliseconds
  if (interval.includes('hour')) {
    const hours = parseInt(interval.match(/(\d+)\s*hour/)?.[1] || '1');
    return hours * 60 * 60 * 1000;
  }
  if (interval.includes('minute')) {
    const minutes = parseInt(interval.match(/(\d+)\s*minute/)?.[1] || '30');
    return minutes * 60 * 1000;
  }
  
  // Default to 1 hour
  return 60 * 60 * 1000;
}