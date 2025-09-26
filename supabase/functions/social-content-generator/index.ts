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
      contentType = 'post',
      platform = 'linkedin',
      topic,
      hashtags = [],
      generateBatch = false,
      batchSize = 20
    } = await req.json();

    console.log(`Generating social content: ${contentType} for ${platform} about ${topic}`);

    if (generateBatch) {
      return await generateBatchSocialContent({
        contentType,
        platform,
        topic,
        hashtags,
        batchSize
      });
    } else {
      return await generateSingleSocialContent({
        contentType,
        platform,
        topic,
        hashtags
      });
    }

  } catch (error) {
    console.error('Error in social content generator:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateSingleSocialContent(params: any) {
  const { contentType, platform, topic, hashtags } = params;
  
  const content = await generateSocialContentWithAI(params);
  
  // Store in database
  const { data: socialContent } = await supabase
    .from('social_media_content')
    .insert({
      platform,
      content_type: contentType,
      title: content.title,
      content: content.content,
      hashtags,
      metadata: content.metadata,
      is_published: true
    })
    .select()
    .single();

  return new Response(JSON.stringify({
    success: true,
    content: content.content,
    metadata: content.metadata,
    contentId: socialContent.id
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function generateBatchSocialContent(params: any) {
  const { contentType, platform, topic, hashtags, batchSize } = params;
  
  const results = [];
  const variations = generateTopicVariations(topic, batchSize);
  
  for (let i = 0; i < variations.length; i++) {
    try {
      const content = await generateSocialContentWithAI({
        ...params,
        topic: variations[i]
      });
      
      // Store in database
      const { data: socialContent } = await supabase
        .from('social_media_content')
        .insert({
          platform,
          content_type: contentType,
          title: content.title,
          content: content.content,
          hashtags,
          metadata: content.metadata,
          is_published: true
        })
        .select()
        .single();

      results.push({
        success: true,
        contentId: socialContent.id,
        content: content.content,
        metadata: content.metadata
      });

    } catch (error) {
      results.push({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Small delay to avoid rate limits
    if (i < variations.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }

  return new Response(JSON.stringify({
    success: true,
    results,
    totalGenerated: results.filter(r => r.success).length,
    totalRequested: batchSize
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function generateSocialContentWithAI(params: any) {
  const { contentType, platform, topic, hashtags } = params;
  
  const systemPrompt = getSocialSystemPrompt(platform, contentType);
  const userPrompt = getSocialUserPrompt(topic, hashtags, platform, contentType);

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
      max_tokens: 1000,
      temperature: 0.8
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const generatedContent = data.choices[0].message.content;

  // Extract title and content
  const lines = generatedContent.split('\n');
  const title = lines[0].replace(/^(Title:|Post:|Content:)\s*/i, '').trim();
  const content = lines.slice(1).join('\n').trim();

  return {
    title,
    content: generatedContent,
    metadata: {
      platform,
      contentType,
      characterCount: generatedContent.length,
      hashtagCount: hashtags.length,
      estimatedEngagement: calculateEstimatedEngagement(platform, contentType)
    }
  };
}

function getSocialSystemPrompt(platform: string, contentType: string): string {
  const platformSpecs: Record<string, string> = {
    linkedin: 'Professional network focused on career development and industry insights. Maintain a professional tone while being engaging.',
    twitter: 'Fast-paced microblogging platform. Be concise, witty, and use trending topics.',
    facebook: 'Social network for broader audience. Be relatable and community-focused.',
    instagram: 'Visual-first platform. Focus on inspiration and lifestyle aspects.',
    tiktok: 'Short-form video platform. Be trendy, fun, and attention-grabbing.'
  };

  return `You are a social media expert specialized in ${platform}. ${platformSpecs[platform] || 'Create engaging social media content.'} Create ${contentType} content that drives engagement and builds community.`;
}

function getSocialUserPrompt(topic: string, hashtags: string[], platform: string, contentType: string): string {
  const hashtagText = hashtags.length > 0 ? ` Include these hashtags: ${hashtags.join(' ')}.` : '';
  
  const platformLimits: Record<string, string> = {
    linkedin: '1300 characters',
    twitter: '280 characters', 
    facebook: '500 characters',
    instagram: '2200 characters',
    tiktok: '150 characters'
  };

  const limit = platformLimits[platform] || '500 characters';

  return `Create a ${contentType} for ${platform} about "${topic}". 

Keep it under ${limit} and make it highly engaging for the platform's audience.${hashtagText}

Make sure to:
- Hook readers in the first line
- Provide value or insight
- Include a call-to-action
- Use platform-appropriate tone and style
- Optimize for engagement (likes, shares, comments)`;
}

function generateTopicVariations(baseTopic: string, count: number): string[] {
  const variations = [baseTopic];
  
  const prefixes = ['Top tips for', 'How to excel in', 'Secrets of', 'Essential guide to', 'Master the art of'];
  const suffixes = ['in 2024', 'for beginners', 'like a pro', 'step by step', 'that works'];
  const angles = ['from a recruiter perspective', 'industry insights', 'real-world examples', 'expert advice', 'proven strategies'];
  
  for (let i = 1; i < count; i++) {
    if (i <= prefixes.length) {
      variations.push(`${prefixes[i-1]} ${baseTopic.toLowerCase()}`);
    } else if (i <= prefixes.length + suffixes.length) {
      variations.push(`${baseTopic} ${suffixes[i - prefixes.length - 1]}`);
    } else {
      const angleIndex = (i - prefixes.length - suffixes.length - 1) % angles.length;
      variations.push(`${baseTopic}: ${angles[angleIndex]}`);
    }
  }
  
  return variations.slice(0, count);
}

function calculateEstimatedEngagement(platform: string, contentType: string): string {
  const baseRates: Record<string, Record<string, string>> = {
    linkedin: { post: 'medium', article: 'high', video: 'high' },
    twitter: { post: 'high', thread: 'medium', video: 'high' },
    facebook: { post: 'low', video: 'medium', story: 'medium' },
    instagram: { post: 'medium', story: 'high', reel: 'very-high' },
    tiktok: { video: 'very-high', live: 'high' }
  };

  return baseRates[platform]?.[contentType] || 'medium';
}