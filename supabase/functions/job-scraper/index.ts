import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface JobScrapingRequest {
  sourceId: string;
  botId: string;
  maxJobs?: number;
  keywords?: string[];
}

interface ScrapedJob {
  title: string;
  company: string;
  location: string;
  salary?: string;
  description: string;
  sourceUrl: string;
  postedAt?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('🚀 Job scraper function started');

    const requestBody = await req.json() as JobScrapingRequest;
    const { sourceId, botId, maxJobs = 50, keywords = [] } = requestBody;

    console.log(`📦 Processing scraping request for bot ${botId} from source ${sourceId}`);

    // Get scraping source configuration
    const { data: scrapingSource, error: sourceError } = await supabase
      .from('job_scraping_sources')
      .select('*')
      .eq('id', sourceId)
      .eq('is_active', true)
      .single();

    if (sourceError || !scrapingSource) {
      throw new Error(`Scraping source not found or inactive: ${sourceId}`);
    }

    console.log(`🔍 Scraping from ${scrapingSource.source_name}`);

    // Get bot configuration
    const { data: bot, error: botError } = await supabase
      .from('ai_bots')
      .select('*')
      .eq('id', botId)
      .eq('is_active', true)
      .single();

    if (botError || !bot) {
      throw new Error(`Bot not found or inactive: ${botId}`);
    }

    // Mock job scraping for demo (replace with real scraping logic)
    const scrapedJobs: ScrapedJob[] = await mockJobScraping(scrapingSource, keywords, maxJobs);

    console.log(`📄 Scraped ${scrapedJobs.length} jobs`);

    // Store scraped jobs in database
    const jobsToInsert = scrapedJobs.map(job => ({
      bot_id: botId,
      job_title: job.title,
      company: job.company,
      location: job.location,
      salary: job.salary,
      job_description: job.description,
      source_url: job.sourceUrl,
      source_platform: scrapingSource.source_name,
      posted_at: job.postedAt ? new Date(job.postedAt).toISOString() : null,
      status: 'draft',
      processing_status: 'pending'
    }));

    const { data: insertedJobs, error: insertError } = await supabase
      .from('scraped_jobs')
      .insert(jobsToInsert)
      .select();

    if (insertError) {
      throw new Error(`Failed to store scraped jobs: ${insertError.message}`);
    }

    // Update scraping source statistics
    await supabase
      .from('job_scraping_sources')
      .update({
        last_scraped_at: new Date().toISOString(),
        jobs_scraped_count: (scrapingSource.jobs_scraped_count || 0) + scrapedJobs.length,
        success_rate: Math.min(100, ((scrapingSource.success_rate || 0) * 0.9) + 10) // Gradual improvement
      })
      .eq('id', sourceId);

    console.log(`✅ Successfully processed ${insertedJobs?.length} jobs`);

    return new Response(JSON.stringify({
      success: true,
      jobsScraped: insertedJobs?.length || 0,
      jobs: insertedJobs,
      message: `Successfully scraped and stored ${insertedJobs?.length} jobs`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error in job scraper:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Mock job scraping function (replace with real scraping logic using puppeteer/playwright)
async function mockJobScraping(
  source: any,
  keywords: string[],
  maxJobs: number
): Promise<ScrapedJob[]> {
  console.log(`🎭 Mock scraping from ${source.source_name} with keywords: ${keywords.join(', ')}`);
  
  // Simulate scraping delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  const mockJobs: ScrapedJob[] = [
    {
      title: "Senior Software Engineer - Full Stack",
      company: "TechCorp India",
      location: "Bangalore, Karnataka",
      salary: "₹12-18 LPA",
      description: "We are looking for an experienced full-stack developer to join our dynamic team. Must have expertise in React, Node.js, and cloud technologies.",
      sourceUrl: `${source.base_url}/job/senior-software-engineer-1234`,
      postedAt: new Date().toISOString()
    },
    {
      title: "Data Scientist - Machine Learning",
      company: "AI Solutions Ltd",
      location: "Mumbai, Maharashtra",
      salary: "₹15-25 LPA",
      description: "Join our ML team to build cutting-edge AI solutions. Experience with Python, TensorFlow, and statistical modeling required.",
      sourceUrl: `${source.base_url}/job/data-scientist-ml-5678`,
      postedAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
      title: "Product Manager - SaaS",
      company: "StartupXYZ",
      location: "Hyderabad, Telangana",
      salary: "₹20-30 LPA",
      description: "Drive product strategy and roadmap for our B2B SaaS platform. 3+ years experience in product management required.",
      sourceUrl: `${source.base_url}/job/product-manager-saas-9012`,
      postedAt: new Date(Date.now() - 172800000).toISOString()
    },
    {
      title: "DevOps Engineer - Cloud Infrastructure",
      company: "CloudTech Innovations",
      location: "Chennai, Tamil Nadu",
      salary: "₹10-16 LPA",
      description: "Manage and scale our cloud infrastructure on AWS/Azure. Experience with Kubernetes, Docker, and CI/CD pipelines essential.",
      sourceUrl: `${source.base_url}/job/devops-engineer-cloud-3456`,
      postedAt: new Date(Date.now() - 259200000).toISOString()
    },
    {
      title: "UI/UX Designer - Mobile Apps",
      company: "DesignStudio Pro",
      location: "Pune, Maharashtra",
      salary: "₹8-14 LPA",
      description: "Create intuitive and beautiful mobile app designs. Proficiency in Figma, user research, and mobile design patterns required.",
      sourceUrl: `${source.base_url}/job/ui-ux-designer-mobile-7890`,
      postedAt: new Date().toISOString()
    }
  ];

  // Filter by keywords if provided
  let filteredJobs = mockJobs;
  if (keywords.length > 0) {
    filteredJobs = mockJobs.filter(job => 
      keywords.some(keyword => 
        job.title.toLowerCase().includes(keyword.toLowerCase()) ||
        job.description.toLowerCase().includes(keyword.toLowerCase())
      )
    );
  }

  // Limit results
  return filteredJobs.slice(0, maxJobs);
}