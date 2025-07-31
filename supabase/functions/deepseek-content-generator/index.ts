import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ContentRequest {
  templateId: string;
  botId: string;
  contentType: string;
  prompt: string;
  category: string;
  seoKeywords: string[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');
    if (!deepseekApiKey) {
      throw new Error('DEEPSEEK_API_KEY not found in environment variables');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { templateId, botId, contentType, prompt, category, seoKeywords }: ContentRequest = await req.json();

    // Get word count based on content type per specifications
    const getWordCount = (type: string): string => {
      switch (type.toLowerCase()) {
        case 'post':
          return '150-200 words';
        case 'article':
          return '500-700 words';
        case 'seo_page':
          return '500-700 words';
        case 'newsletter':
          return '1000-1500 words';
        case 'guide':
          return '300-400 words';
        case 'tip':
          return '100-150 words';
        default:
          return '150-200 words';
      }
    };

    // Get bot profile for personalization
    const { data: botProfile } = await supabase
      .from('ai_bots')
      .select('bot_name, personality, expertise_areas')
      .eq('id', botId)
      .single();

    const wordCount = getWordCount(contentType);
    
    // Create enhanced prompt with bot personality and SEO optimization
    const enhancedPrompt = `
You are ${botProfile?.bot_name || 'TalentXcel AI'}, an AI assistant with expertise in ${botProfile?.expertise_areas?.join(', ') || 'career development'}.

Content Brief:
- Type: ${contentType}
- Length: ${wordCount}
- Category: ${category}
- SEO Keywords to include naturally: ${seoKeywords.join(', ')}

Task: ${prompt}

Writing Guidelines:
- Write in a ${botProfile?.personality || 'professional yet friendly'} tone
- Include 2-3 SEO keywords naturally throughout the content
- Use engaging headlines and clear structure
- Include actionable insights or tips
- End with a call-to-action encouraging engagement
- Make it valuable for TalentXcel users seeking career growth

Write the content now:
`;

    console.log('📝 Sending request to DeepSeek API...');
    
    // Call DeepSeek API
    const deepseekResponse = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${deepseekApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'You are a professional content writer specializing in career development and professional networking content. Write engaging, valuable content that helps users grow their careers.'
          },
          {
            role: 'user',
            content: enhancedPrompt
          }
        ],
        max_tokens: contentType === 'newsletter' ? 2000 : contentType === 'article' || contentType === 'seo_page' ? 1000 : 400,
        temperature: 0.7,
        top_p: 0.9,
      }),
    });

    if (!deepseekResponse.ok) {
      const errorText = await deepseekResponse.text();
      console.error('DeepSeek API error:', errorText);
      throw new Error(`DeepSeek API error: ${deepseekResponse.status}`);
    }

    const deepseekData = await deepseekResponse.json();
    const generatedContent = deepseekData.choices[0]?.message?.content;

    if (!generatedContent) {
      throw new Error('No content generated from DeepSeek API');
    }

    console.log('✅ Content generated successfully');

    // Save to bot_generated_content table
    const { data: savedContent, error: saveError } = await supabase
      .from('bot_generated_content')
      .insert({
        bot_id: botId,
        template_id: templateId,
        content: generatedContent,
        content_type: contentType,
        category: category,
        seo_keywords: seoKeywords,
        status: 'approved', // Auto-approve for now
        generation_cost: 0.01,
        tokens_used: deepseekData.usage?.total_tokens || 0,
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving generated content:', saveError);
      throw saveError;
    }

    // Create actual post in the posts table for network feed
    if (contentType === 'post') {
      const { error: postError } = await supabase
        .from('posts')
        .insert({
          user_id: botId, // Bot acts as user
          content: generatedContent,
          visibility: 'public',
          tags: seoKeywords,
          is_ai_generated: true,
          metadata: {
            template_id: templateId,
            category: category,
            generation_id: savedContent.id
          }
        });

      if (postError) {
        console.error('Error creating network post:', postError);
        // Don't throw here, content was saved successfully
      } else {
        console.log('📝 Post created in network feed');
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        content: generatedContent,
        contentId: savedContent.id,
        tokensUsed: deepseekData.usage?.total_tokens || 0,
        wordCount: generatedContent.split(' ').length,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in content generation:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});