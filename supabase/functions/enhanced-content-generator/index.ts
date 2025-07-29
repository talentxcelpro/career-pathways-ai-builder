import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ContentGenerationRequest {
  botId: string;
  contentType: 'job' | 'article' | 'blog' | 'post';
  sourceJobId?: string;
  templateId?: string;
  inputData?: any;
  autoPublish?: boolean;
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
    const deepSeekApiKey = Deno.env.get('DEEPSEEK_API_KEY');

    if (!deepSeekApiKey) {
      throw new Error('DEEPSEEK_API_KEY not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('🤖 Enhanced content generator started');

    const requestBody = await req.json() as ContentGenerationRequest;
    const { botId, contentType, sourceJobId, templateId, inputData, autoPublish = false } = requestBody;

    console.log(`📝 Generating ${contentType} content for bot ${botId}`);

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

    // Get appropriate template
    let template;
    if (templateId) {
      const { data: templateData, error: templateError } = await supabase
        .from('bot_content_templates')
        .select('*')
        .eq('id', templateId)
        .eq('is_active', true)
        .single();
      
      if (templateError) {
        throw new Error(`Template not found: ${templateId}`);
      }
      template = templateData;
    } else {
      // Get default template for content type
      const { data: defaultTemplate, error: defaultError } = await supabase
        .from('bot_content_templates')
        .select('*')
        .eq('content_type', contentType)
        .eq('is_active', true)
        .limit(1)
        .single();
      
      if (defaultError) {
        throw new Error(`No template found for content type: ${contentType}`);
      }
      template = defaultTemplate;
    }

    console.log(`📋 Using template: ${template.template_name}`);

    // Get source data if generating from scraped job
    let sourceData = inputData;
    if (sourceJobId) {
      const { data: scrapedJob, error: jobError } = await supabase
        .from('scraped_jobs')
        .select('*')
        .eq('id', sourceJobId)
        .single();
      
      if (jobError) {
        throw new Error(`Source job not found: ${sourceJobId}`);
      }
      sourceData = scrapedJob;
    }

    // Generate content using DeepSeek AI
    const generatedContent = await generateContentWithAI(template, sourceData, bot, deepSeekApiKey);

    console.log(`✨ Generated content: "${generatedContent.title}"`);

    // Extract SEO keywords
    const seoKeywords = extractSEOKeywords(generatedContent.content, contentType);

    // Store generated content
    const contentRecord = {
      bot_id: botId,
      content_type: contentType,
      title: generatedContent.title,
      content: generatedContent.content,
      seo_keywords: seoKeywords,
      category: generatedContent.category,
      tags: generatedContent.tags || [],
      source_job_id: sourceJobId || null,
      status: autoPublish ? 'published' : 'draft',
      generation_cost: generatedContent.cost || 0.01,
      tokens_used: generatedContent.tokens || 150,
      published_at: autoPublish ? new Date().toISOString() : null
    };

    const { data: savedContent, error: saveError } = await supabase
      .from('bot_generated_content')
      .insert(contentRecord)
      .select()
      .single();

    if (saveError) {
      throw new Error(`Failed to save content: ${saveError.message}`);
    }

    // Auto-publish if requested
    let publishedEntity = null;
    if (autoPublish) {
      publishedEntity = await publishContent(supabase, savedContent, bot);
      
      // Update content record with published entity ID
      if (publishedEntity) {
        await supabase
          .from('bot_generated_content')
          .update({ published_entity_id: publishedEntity.id })
          .eq('id', savedContent.id);
      }
    }

    // Update template usage count
    await supabase
      .from('bot_content_templates')
      .update({ 
        usage_count: (template.usage_count || 0) + 1 
      })
      .eq('id', template.id);

    // Update scraped job status if applicable
    if (sourceJobId) {
      await supabase
        .from('scraped_jobs')
        .update({ 
          processing_status: 'completed',
          enhanced_title: generatedContent.title,
          enhanced_description: generatedContent.content,
          seo_keywords: seoKeywords
        })
        .eq('id', sourceJobId);
    }

    console.log(`✅ Content generation completed successfully`);

    return new Response(JSON.stringify({
      success: true,
      content: savedContent,
      publishedEntity,
      message: `Successfully generated ${contentType} content`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error in content generator:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateContentWithAI(template: any, sourceData: any, bot: any, apiKey: string) {
  console.log('🧠 Generating content with DeepSeek AI');

  // Prepare prompt with template variables
  let prompt = template.prompt_template;
  
  if (sourceData) {
    // Replace template variables with actual data
    const variables = {
      job_title: sourceData.job_title || '',
      company: sourceData.company || '',
      location: sourceData.location || '',
      job_description: sourceData.job_description || '',
      salary: sourceData.salary || '',
      topic: sourceData.topic || 'Career Development',
      audience: sourceData.audience || 'Professionals',
      focus_area: sourceData.focus_area || 'General',
      industry: extractIndustry(sourceData),
      skills: extractSkills(sourceData)
    };

    for (const [key, value] of Object.entries(variables)) {
      prompt = prompt.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
    }
  }

  // Call DeepSeek API
  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: template.system_message || 'You are a professional content writer.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2048
    })
  });

  if (!response.ok) {
    throw new Error(`DeepSeek API error: ${response.statusText}`);
  }

  const aiResponse = await response.json();
  const generatedText = aiResponse.choices[0].message.content;

  // Parse the response and extract structured data
  return parseGeneratedContent(generatedText, template.content_type);
}

function parseGeneratedContent(text: string, contentType: string) {
  // Try to extract title and content from generated text
  const lines = text.split('\n').filter(line => line.trim());
  
  let title = '';
  let content = text;
  let category = '';
  let tags: string[] = [];

  // Extract title (first line or line starting with #)
  for (const line of lines) {
    if (line.startsWith('#')) {
      title = line.replace(/^#+\s*/, '');
      content = text.replace(line, '').trim();
      break;
    }
  }

  if (!title && lines.length > 0) {
    title = lines[0];
    content = lines.slice(1).join('\n').trim();
  }

  // Extract hashtags
  const hashtagRegex = /#[\w]+/g;
  const hashtags = text.match(hashtagRegex) || [];
  tags = hashtags.map(tag => tag.substring(1));

  // Determine category based on content type
  switch (contentType) {
    case 'job':
      category = 'Job Posting';
      break;
    case 'article':
      category = 'Career Article';
      break;
    case 'blog':
      category = 'Tech Blog';
      break;
    case 'post':
      category = 'Social Media';
      break;
    default:
      category = 'General';
  }

  return {
    title: title || `Generated ${contentType}`,
    content,
    category,
    tags,
    cost: 0.01,
    tokens: Math.floor(text.length / 4) // Rough estimate
  };
}

function extractSEOKeywords(content: string, contentType: string): string[] {
  // Basic keyword extraction
  const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should'];
  
  const words = content.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3 && !commonWords.includes(word));

  // Count word frequency
  const wordCount: { [key: string]: number } = {};
  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });

  // Get top keywords
  const keywords = Object.entries(wordCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([word]) => word);

  // Add content-type specific keywords
  const typeKeywords = {
    job: ['job', 'career', 'hiring', 'opportunity'],
    article: ['career', 'professional', 'development'],
    blog: ['tech', 'technology', 'innovation'],
    post: ['social', 'networking', 'community']
  };

  return [...keywords, ...(typeKeywords[contentType as keyof typeof typeKeywords] || [])];
}

function extractIndustry(data: any): string {
  if (data.company) {
    // Simple industry mapping based on company or job title
    const text = (data.company + ' ' + (data.job_title || '')).toLowerCase();
    if (text.includes('tech') || text.includes('software') || text.includes('developer')) return 'Technology';
    if (text.includes('finance') || text.includes('bank')) return 'Finance';
    if (text.includes('health') || text.includes('medical')) return 'Healthcare';
    if (text.includes('education') || text.includes('school')) return 'Education';
  }
  return 'General';
}

function extractSkills(data: any): string {
  if (data.job_description) {
    const skillKeywords = ['react', 'node', 'python', 'java', 'javascript', 'aws', 'docker', 'kubernetes'];
    const foundSkills = skillKeywords.filter(skill => 
      data.job_description.toLowerCase().includes(skill)
    );
    return foundSkills.join(', ');
  }
  return '';
}

async function publishContent(supabase: any, content: any, bot: any) {
  console.log(`📤 Publishing ${content.content_type} content`);

  try {
    switch (content.content_type) {
      case 'job':
        return await publishAsJob(supabase, content, bot);
      case 'article':
      case 'blog':
      case 'post':
        return await publishAsPost(supabase, content, bot);
      default:
        console.warn(`Unknown content type: ${content.content_type}`);
        return null;
    }
  } catch (error) {
    console.error('Failed to publish content:', error);
    return null;
  }
}

async function publishAsJob(supabase: any, content: any, bot: any) {
  // Extract job details from content
  const jobData = {
    title: content.title,
    description: content.content,
    company_id: null, // Would need to create or find company
    location: 'India', // Default location
    employment_type: 'Full-time',
    experience_level: 'Mid-level',
    skills_required: content.seo_keywords?.slice(0, 5) || [],
    posted_by_bot: true,
    bot_id: content.bot_id,
    status: 'active',
    created_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('jobs')
    .insert(jobData)
    .select()
    .single();

  if (error) {
    console.error('Failed to publish job:', error);
    return null;
  }

  return data;
}

async function publishAsPost(supabase: any, content: any, bot: any) {
  const postData = {
    author_id: bot.user_id, // Bot's user ID in profiles table
    headline: content.title,
    content: content.content,
    post_type: content.content_type === 'article' ? 'article' : 'general',
    tags: content.tags || [],
    status: 'published',
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('posts')
    .insert(postData)
    .select()
    .single();

  if (error) {
    console.error('Failed to publish post:', error);
    return null;
  }

  return data;
}