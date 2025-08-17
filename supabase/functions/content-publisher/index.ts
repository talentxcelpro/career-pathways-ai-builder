import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ContentPublishRequest {
  contentType: 'job' | 'post' | 'article' | 'company_page' | 'landing_page';
  contentId?: string;
  content?: any;
  publishTo: ('website' | 'social' | 'email' | 'seo_pages')[];
  scheduleDate?: string;
  autoOptimize?: boolean;
}

interface PublishingResult {
  contentId: string;
  contentType: string;
  publishedTo: string[];
  seoOptimized: boolean;
  socialMediaPosts: any[];
  errors: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    console.log('📝 Request received:', JSON.stringify(requestBody, null, 2));
    
    // Handle test requests
    if (requestBody.name === 'Functions' || !requestBody.contentType) {
      return new Response(JSON.stringify({
        success: true,
        message: 'Content Publisher function is running',
        timestamp: new Date().toISOString(),
        example: {
          contentType: 'job',
          contentId: 'optional-existing-id',
          content: { title: 'Software Engineer', company_name: 'Tech Corp' },
          publishTo: ['website', 'social'],
          autoOptimize: true
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const {
      contentType,
      contentId,
      content,
      publishTo,
      scheduleDate,
      autoOptimize = true
    }: ContentPublishRequest = requestBody;

    console.log(`📝 Starting content publishing for ${contentType}`);

    const result: PublishingResult = {
      contentId: contentId || '',
      contentType,
      publishedTo: [],
      seoOptimized: false,
      socialMediaPosts: [],
      errors: []
    };

    // Get or create content - add validation here
    let contentData;
    if (contentId) {
      contentData = await fetchExistingContent(supabase, contentType, contentId);
    } else if (content) {
      contentData = await createNewContent(supabase, contentType, content);
      result.contentId = contentData.id;
    } else {
      // This should not happen due to the test request check above, but add a fallback
      console.log('⚠️ No contentId or content provided, creating demo content');
      contentData = {
        id: 'demo-' + Date.now(),
        title: 'Demo Content',
        description: 'Demo content for testing',
        created_at: new Date().toISOString()
      };
      result.contentId = contentData.id;
    }

    // SEO Optimization
    if (autoOptimize && publishTo.includes('website')) {
      try {
        await optimizeContentForSEO(supabase, contentType, result.contentId);
        result.seoOptimized = true;
        console.log('✅ SEO optimization completed');
      } catch (error) {
        result.errors.push(`SEO optimization failed: ${error.message}`);
        console.error('❌ SEO optimization failed:', error);
      }
    }

    // Publish to different channels
    for (const channel of publishTo) {
      try {
        switch (channel) {
          case 'website':
            await publishToWebsite(supabase, contentType, contentData);
            result.publishedTo.push('website');
            break;
          
          case 'social':
            const socialPosts = await publishToSocialMedia(supabase, contentType, contentData);
            result.socialMediaPosts.push(...socialPosts);
            result.publishedTo.push('social');
            break;
          
          case 'email':
            await publishToEmailCampaign(supabase, contentType, contentData);
            result.publishedTo.push('email');
            break;
          
          case 'seo_pages':
            await publishToSEOPages(supabase, contentType, contentData);
            result.publishedTo.push('seo_pages');
            break;
        }
        
        console.log(`✅ Successfully published to ${channel}`);
      } catch (error) {
        result.errors.push(`Publishing to ${channel} failed: ${error.message}`);
        console.error(`❌ Publishing to ${channel} failed:`, error);
      }
    }

    // Log publishing activity
    await logPublishingActivity(supabase, result);

    console.log(`📄 Content publishing completed. Published to: ${result.publishedTo.join(', ')}`);

    return new Response(JSON.stringify({
      success: true,
      message: 'Content published successfully',
      result
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Content publishing error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function fetchExistingContent(supabase: any, contentType: string, contentId: string) {
  const tableName = getTableName(contentType);
  
  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .eq('id', contentId)
    .single();
  
  if (error || !data) {
    throw new Error(`Failed to fetch ${contentType} with ID ${contentId}`);
  }
  
  return data;
}

async function createNewContent(supabase: any, contentType: string, content: any) {
  const tableName = getTableName(contentType);
  
  const { data, error } = await supabase
    .from(tableName)
    .insert([{
      ...content,
      created_at: new Date().toISOString(),
      status: 'published'
    }])
    .select()
    .single();
  
  if (error || !data) {
    throw new Error(`Failed to create ${contentType}: ${error?.message}`);
  }
  
  return data;
}

async function optimizeContentForSEO(supabase: any, contentType: string, contentId: string) {
  // Call the seo-optimizer function
  const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/seo-optimizer`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contentType: contentType === 'landing_page' ? 'page' : contentType,
      entityId: contentId,
      includeStructuredData: true,
      updateMetaTags: true
    })
  });

  if (!response.ok) {
    throw new Error(`SEO optimization failed: ${response.statusText}`);
  }

  return await response.json();
}

async function publishToWebsite(supabase: any, contentType: string, contentData: any) {
  // Update content status to published and set publish date
  const tableName = getTableName(contentType);
  
  await supabase
    .from(tableName)
    .update({
      status: 'published',
      published_at: new Date().toISOString(),
      is_public: true
    })
    .eq('id', contentData.id);
}

async function publishToSocialMedia(supabase: any, contentType: string, contentData: any) {
  const socialPosts = [];
  
  // Generate social media content based on the main content
  const socialContent = generateSocialContent(contentType, contentData);
  
  for (const platform of ['linkedin', 'twitter']) {
    try {
      const { data: post, error } = await supabase
        .from('social_media_posts')
        .insert([{
          platform,
          content: socialContent[platform],
          content_type: contentType,
          content_id: contentData.id,
          status: 'scheduled',
          scheduled_for: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // Schedule 5 minutes from now
          created_at: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (!error && post) {
        socialPosts.push(post);
      }
    } catch (error) {
      console.error(`Failed to create ${platform} post:`, error);
    }
  }
  
  return socialPosts;
}

async function publishToEmailCampaign(supabase: any, contentType: string, contentData: any) {
  // Create email campaign entry
  const emailContent = generateEmailContent(contentType, contentData);
  
  await supabase
    .from('email_campaigns')
    .insert([{
      name: `${contentType}_${contentData.id}_campaign`,
      subject: emailContent.subject,
      content: emailContent.body,
      content_type: contentType,
      content_id: contentData.id,
      status: 'draft',
      created_at: new Date().toISOString()
    }]);
}

async function publishToSEOPages(supabase: any, contentType: string, contentData: any) {
  // Create SEO landing pages or update sitemap
  if (contentType === 'job') {
    // Create job-specific landing pages
    const landingPages = generateJobLandingPages(contentData);
    
    for (const page of landingPages) {
      await supabase
        .from('dynamic_landing_pages')
        .upsert([{
          ...page,
          source_content_type: contentType,
          source_content_id: contentData.id,
          created_at: new Date().toISOString()
        }]);
    }
  }
  
  // Update sitemap
  try {
    await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/sitemap-generator`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refresh: true })
    });
  } catch (error) {
    console.error('Failed to update sitemap:', error);
  }
}

function generateSocialContent(contentType: string, contentData: any) {
  const baseContent = {
    linkedin: '',
    twitter: ''
  };
  
  switch (contentType) {
    case 'job':
      baseContent.linkedin = `🚀 New opportunity alert! ${contentData.title} at ${contentData.company_name || 'a great company'}
      
${contentData.location ? `📍 ${contentData.location}` : ''}
${contentData.salary_range ? `💰 ${contentData.salary_range}` : ''}

Apply now: https://talentxcel.in/jobs/${contentData.id}

#Jobs #Career #Hiring ${contentData.title.replace(/\s+/g, '')}`;
      
      baseContent.twitter = `🚀 ${contentData.title} position open${contentData.company_name ? ` at ${contentData.company_name}` : ''}
      
${contentData.location ? `📍 ${contentData.location}\n` : ''}Apply: https://talentxcel.in/jobs/${contentData.id}

#Jobs #Hiring`;
      break;
      
    case 'post':
      baseContent.linkedin = contentData.content?.substring(0, 280) || '';
      baseContent.twitter = contentData.content?.substring(0, 200) || '';
      break;
  }
  
  return baseContent;
}

function generateEmailContent(contentType: string, contentData: any) {
  switch (contentType) {
    case 'job':
      return {
        subject: `New Job Alert: ${contentData.title}`,
        body: `
        <h2>New Job Opportunity</h2>
        <h3>${contentData.title}</h3>
        <p><strong>Company:</strong> ${contentData.company_name || 'Not specified'}</p>
        <p><strong>Location:</strong> ${contentData.location || 'Remote/Not specified'}</p>
        <p><strong>Salary:</strong> ${contentData.salary_range || 'Competitive'}</p>
        
        <p>${contentData.description || ''}</p>
        
        <a href="https://talentxcel.in/jobs/${contentData.id}" 
           style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Apply Now
        </a>
        `
      };
    default:
      return {
        subject: `New Content: ${contentData.title || 'TalentXcel Update'}`,
        body: contentData.content || contentData.description || ''
      };
  }
}

function generateJobLandingPages(jobData: any) {
  const pages = [];
  
  // Job title + location page
  if (jobData.location) {
    pages.push({
      slug: `${jobData.title.toLowerCase().replace(/\s+/g, '-')}-jobs-${jobData.location.toLowerCase().replace(/\s+/g, '-')}`,
      title: `${jobData.title} Jobs in ${jobData.location}`,
      content: `Find ${jobData.title} opportunities in ${jobData.location}`,
      meta_description: `Browse ${jobData.title} jobs in ${jobData.location}. Find your next career opportunity.`,
      page_type: 'job_location'
    });
  }
  
  // Company jobs page
  if (jobData.company_name) {
    pages.push({
      slug: `${jobData.company_name.toLowerCase().replace(/\s+/g, '-')}-jobs`,
      title: `${jobData.company_name} Jobs and Careers`,
      content: `Explore career opportunities at ${jobData.company_name}`,
      meta_description: `Find jobs at ${jobData.company_name}. Join a great team and advance your career.`,
      page_type: 'company_jobs'
    });
  }
  
  return pages;
}

function getTableName(contentType: string): string {
  switch (contentType) {
    case 'job': return 'jobs';
    case 'post': return 'posts';
    case 'article': return 'articles';
    case 'company_page': return 'companies';
    case 'landing_page': return 'dynamic_landing_pages';
    default: return 'content';
  }
}

async function logPublishingActivity(supabase: any, result: PublishingResult) {
  try {
    await supabase
      .from('content_publishing_logs')
      .insert([{
        content_type: result.contentType,
        content_id: result.contentId,
        published_to: result.publishedTo,
        seo_optimized: result.seoOptimized,
        social_posts_created: result.socialMediaPosts.length,
        errors: result.errors,
        published_at: new Date().toISOString()
      }]);
  } catch (error) {
    console.error('Failed to log publishing activity:', error);
  }
}