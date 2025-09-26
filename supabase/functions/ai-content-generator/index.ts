import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      contentType, 
      topic, 
      targetAudience = 'job seekers', 
      tone = 'professional',
      keywords = [],
      generateBulk = false,
      bulkCount = 10 
    } = await req.json();

    console.log(`Generating AI content: ${contentType} for topic: ${topic}`);

    if (generateBulk) {
      return await generateBulkContent({
        contentType,
        topic,
        targetAudience,
        tone,
        keywords,
        bulkCount
      });
    } else {
      return await generateSingleContent({
        contentType,
        topic,
        targetAudience,
        tone,
        keywords
      });
    }

  } catch (error) {
    console.error('Error in AI content generator:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateSingleContent(params: any) {
  const { contentType, topic, targetAudience, tone, keywords } = params;
  
  // Add to queue
  const { data: queueItem } = await supabase
    .from('ai_content_generation_queue')
    .insert({
      content_type: contentType,
      input_parameters: {
        topic,
        targetAudience,
        tone,
        keywords
      },
      status: 'processing'
    })
    .select()
    .single();

  try {
    const content = await generateContentWithOpenAI(params);
    
    // Update queue item with generated content
    await supabase
      .from('ai_content_generation_queue')
      .update({
        status: 'completed',
        generated_content: content.content,
        metadata: content.metadata,
        completed_at: new Date().toISOString(),
        is_published: true
      })
      .eq('id', queueItem.id);

    return new Response(JSON.stringify({
      success: true,
      content: content.content,
      metadata: content.metadata,
      contentId: queueItem.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    // Update queue item with error
    await supabase
      .from('ai_content_generation_queue')
      .update({
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown error'
      })
      .eq('id', queueItem.id);

    throw error;
  }
}

async function generateBulkContent(params: any) {
  const { contentType, topic, targetAudience, tone, keywords, bulkCount } = params;
  
  const results = [];
  
  for (let i = 0; i < bulkCount; i++) {
    const variation = `${topic} - Variation ${i + 1}`;
    
    // Add to queue
    const { data: queueItem } = await supabase
      .from('ai_content_generation_queue')
      .insert({
        content_type: contentType,
        input_parameters: {
          topic: variation,
          targetAudience,
          tone,
          keywords
        },
        status: 'processing'
      })
      .select()
      .single();

    try {
      const content = await generateContentWithOpenAI({
        ...params,
        topic: variation
      });
      
      // Update queue item
      await supabase
        .from('ai_content_generation_queue')
        .update({
          status: 'completed',
          generated_content: content.content,
          metadata: content.metadata,
          completed_at: new Date().toISOString(),
          is_published: true
        })
        .eq('id', queueItem.id);

      results.push({
        success: true,
        contentId: queueItem.id,
        content: content.content,
        metadata: content.metadata
      });

    } catch (error) {
      await supabase
        .from('ai_content_generation_queue')
        .update({
          status: 'failed',
          error_message: error instanceof Error ? error.message : 'Unknown error'
        })
        .eq('id', queueItem.id);

      results.push({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Small delay to avoid rate limits
    if (i < bulkCount - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  return new Response(JSON.stringify({
    success: true,
    results,
    totalGenerated: results.filter(r => r.success).length,
    totalRequested: bulkCount
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function generateContentWithOpenAI(params: any) {
  const { contentType, topic, targetAudience, tone, keywords } = params;
  
  const systemPrompt = getSystemPrompt(contentType);
  const userPrompt = getUserPrompt(contentType, topic, targetAudience, tone, keywords);

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 2000,
      temperature: 0.7
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const generatedContent = data.choices[0].message.content;

  // Extract metadata from generated content
  const lines = generatedContent.split('\n');
  const title = lines.find((line: string) => line.startsWith('Title:'))?.replace('Title:', '').trim() || topic;
  const description = lines.find((line: string) => line.startsWith('Description:'))?.replace('Description:', '').trim() || '';
  
  return {
    content: generatedContent,
    metadata: {
      title,
      description,
      keywords: keywords.join(', '),
      slug: generateSlug(title),
      contentType,
      wordCount: generatedContent.split(' ').length
    }
  };
}

function getSystemPrompt(contentType: string): string {
  switch (contentType) {
    case 'job_description':
      return 'You are an expert HR professional who writes compelling job descriptions. Create detailed, engaging job descriptions that attract top talent while clearly outlining requirements and benefits.';
    case 'company_page':
      return 'You are a corporate content writer specializing in company profiles. Create engaging company pages that showcase culture, values, and opportunities while maintaining professionalism.';
    case 'blog_post':
      return 'You are a professional content writer specializing in career advice and industry insights. Write informative, engaging blog posts that provide value to job seekers and professionals.';
    case 'landing_page':
      return 'You are a conversion copywriter who creates high-converting landing pages. Focus on benefits, clear value propositions, and compelling calls-to-action.';
    case 'course_description':
      return 'You are an educational content specialist. Create detailed course descriptions that clearly communicate learning outcomes, prerequisites, and benefits.';
    default:
      return 'You are a professional content writer. Create high-quality, engaging content that serves the specified purpose and target audience.';
  }
}

function getUserPrompt(contentType: string, topic: string, targetAudience: string, tone: string, keywords: string[]): string {
  const keywordText = keywords.length > 0 ? ` Include these keywords naturally: ${keywords.join(', ')}.` : '';
  
  return `Create a ${contentType} about "${topic}" for ${targetAudience}. 

Use a ${tone} tone.${keywordText}

Please structure your response as follows:
Title: [Main title]
Description: [Brief description/summary]

[Main content here]

Make sure the content is SEO-optimized, engaging, and provides real value to the target audience.`;
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}