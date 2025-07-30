import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface JobPublishRequest {
  botId?: string;
  maxJobs?: number;
  autoPublish?: boolean;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('🚀 Job publisher function started');

    const requestBody = await req.json() as JobPublishRequest;
    const { botId, maxJobs = 100, autoPublish = true } = requestBody;

    // Get Raj and Shelly bot IDs
    const { data: bots, error: botsError } = await supabase
      .from('ai_bots')
      .select('id, name, email')
      .in('email', ['raj@talentxcel.in', 'shelly@talentxcel.in'])
      .eq('is_active', true);

    if (botsError || !bots?.length) {
      throw new Error('Raj and Shelly bots not found');
    }

    const rajBot = bots.find(bot => bot.email === 'raj@talentxcel.in');
    const shellyBot = bots.find(bot => bot.email === 'shelly@talentxcel.in');

    if (!rajBot || !shellyBot) {
      throw new Error('Both Raj and Shelly bots must be available');
    }

    // Get scraped jobs that are ready for publishing
    let query = supabase
      .from('scraped_jobs')
      .select('*')
      .eq('status', 'draft')
      .eq('processing_status', 'pending')
      .order('scraped_at', { ascending: false });

    if (botId) {
      query = query.eq('bot_id', botId);
    }

    if (maxJobs) {
      query = query.limit(maxJobs);
    }

    const { data: scrapedJobs, error: scrapedError } = await query;

    if (scrapedError) {
      throw new Error(`Failed to fetch scraped jobs: ${scrapedError.message}`);
    }

    if (!scrapedJobs?.length) {
      return new Response(JSON.stringify({
        success: true,
        message: 'No jobs available for publishing',
        published: 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`📦 Publishing ${scrapedJobs.length} jobs`);

    // Alternate between Raj and Shelly for job assignment
    const publishedJobs = [];
    let counter = 0;

    for (const scrapedJob of scrapedJobs) {
      const assignedBot = counter % 2 === 0 ? rajBot : shellyBot;
      
      // Generate SEO-optimized data
      const seoKeywords = generateSEOKeywords(scrapedJob.job_title, scrapedJob.location);
      const country = scrapedJob.location?.includes('India') || 
                     scrapedJob.location?.includes('Bangalore') ||
                     scrapedJob.location?.includes('Mumbai') ||
                     scrapedJob.location?.includes('Delhi') ||
                     scrapedJob.location?.includes('Chennai') ||
                     scrapedJob.location?.includes('Hyderabad') ||
                     scrapedJob.location?.includes('Pune') ? 'India' : 'Global';

      // Create job posting
      const jobData = {
        title: scrapedJob.job_title,
        description: scrapedJob.job_description,
        location: scrapedJob.location,
        salary_range: scrapedJob.salary,
        company_id: null, // Posted by bots, not companies
        posted_by_bot: assignedBot.id,
        source_url: scrapedJob.source_url,
        seo_keywords: seoKeywords,
        country: country,
        original_post_date: scrapedJob.posted_at,
        job_type: 'full_time',
        work_mode: scrapedJob.location?.toLowerCase().includes('remote') ? 'remote' : 'office',
        experience_level: extractExperienceLevel(scrapedJob.job_title),
        is_active: autoPublish,
        skills_required: extractSkills(scrapedJob.job_description),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: publishedJob, error: publishError } = await supabase
        .from('jobs')
        .insert(jobData)
        .select()
        .single();

      if (publishError) {
        console.error(`Failed to publish job: ${publishError.message}`);
        continue;
      }

      // Update scraped job status
      await supabase
        .from('scraped_jobs')
        .update({
          status: autoPublish ? 'published' : 'ready',
          processing_status: 'completed',
          published_job_id: publishedJob.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', scrapedJob.id);

      publishedJobs.push({
        ...publishedJob,
        assignedBot: assignedBot.name,
        originalScrapedJob: scrapedJob.id
      });

      counter++;
    }

    console.log(`✅ Successfully published ${publishedJobs.length} jobs`);

    return new Response(JSON.stringify({
      success: true,
      published: publishedJobs.length,
      jobs: publishedJobs,
      botAssignments: {
        raj: publishedJobs.filter(job => job.assignedBot === 'Raj Kumar').length,
        shelly: publishedJobs.filter(job => job.assignedBot === 'Shelly Sharma').length
      },
      message: `Successfully published ${publishedJobs.length} jobs`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error in job publisher:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Helper functions
function generateSEOKeywords(title: string, location: string): string[] {
  const keywords = [];
  
  // Extract keywords from title
  const titleWords = title.toLowerCase().split(/\s+/);
  const techKeywords = ['react', 'node', 'python', 'java', 'javascript', 'typescript', 'angular', 'vue', 'php', 'ruby', 'go', 'rust', 'kotlin', 'swift'];
  const roleKeywords = ['developer', 'engineer', 'manager', 'analyst', 'designer', 'architect', 'lead', 'senior', 'junior'];
  
  // Add tech keywords found in title
  techKeywords.forEach(tech => {
    if (titleWords.some(word => word.includes(tech))) {
      keywords.push(tech);
    }
  });
  
  // Add role keywords found in title
  roleKeywords.forEach(role => {
    if (titleWords.some(word => word.includes(role))) {
      keywords.push(role);
    }
  });
  
  // Add location-based keywords
  if (location) {
    const locationWords = location.toLowerCase().split(/[,\s]+/);
    keywords.push(...locationWords.filter(word => word.length > 2));
  }
  
  // Add general job keywords
  keywords.push('jobs', 'careers', 'hiring', 'employment');
  
  return [...new Set(keywords)]; // Remove duplicates
}

function extractExperienceLevel(title: string): string {
  const titleLower = title.toLowerCase();
  
  if (titleLower.includes('senior') || titleLower.includes('lead') || titleLower.includes('principal')) {
    return 'senior';
  } else if (titleLower.includes('junior') || titleLower.includes('entry') || titleLower.includes('fresher')) {
    return 'entry';
  } else {
    return 'mid';
  }
}

function extractSkills(description: string): string[] {
  const descLower = description.toLowerCase();
  const commonSkills = [
    'react', 'angular', 'vue', 'node.js', 'express', 'javascript', 'typescript',
    'python', 'django', 'flask', 'java', 'spring', 'php', 'laravel',
    'html', 'css', 'sass', 'scss', 'bootstrap', 'tailwind',
    'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch',
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform',
    'git', 'github', 'gitlab', 'jira', 'confluence',
    'figma', 'sketch', 'photoshop', 'illustrator',
    'machine learning', 'data science', 'tensorflow', 'pytorch',
    'agile', 'scrum', 'devops', 'ci/cd'
  ];
  
  const foundSkills = commonSkills.filter(skill => 
    descLower.includes(skill.toLowerCase())
  );
  
  return foundSkills.slice(0, 10); // Limit to 10 skills
}