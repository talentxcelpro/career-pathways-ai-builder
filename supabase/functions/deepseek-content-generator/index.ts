import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ContentRequest {
  templateId?: string;
  botId: string;
  contentType: string;
  prompt?: any;
  category: string;
  seoKeywords?: string[];
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

    const requestBody = await req.json();
    console.log('📦 Request body received:', JSON.stringify(requestBody, null, 2));
    
    const { 
      templateId = null, 
      botId, 
      contentType = 'post', 
      prompt = {}, 
      category = 'General', 
      seoKeywords = ['jobs', 'career', 'hiring'] 
    } = requestBody;

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
    const { data: botProfile, error: botError } = await supabase
      .from('ai_bots')
      .select('name, role, content_domains, tone_style, department')
      .eq('id', botId)
      .maybeSingle();

    if (botError) {
      throw new Error(`Error fetching bot profile: ${botError.message}`);
    }

    if (!botProfile) {
      throw new Error(`Bot with ID ${botId} not found or inactive`);
    }

    const wordCount = getWordCount(contentType);
    const botName = botProfile?.name || 'TalentXcel AI';
    const botRole = botProfile?.role || 'Career Advisor';
    const botDomains = botProfile?.content_domains || ['career development'];
    const botTone = botProfile?.tone_style || 'professional';
    
    // Create comprehensive prompt with specific requirements
    const enhancedPrompt = `
CONTENT CREATOR PROFILE:
You are ${botName}, a ${botRole} at TalentXcel, specializing in ${botDomains.join(', ')}.

CONTENT SPECIFICATIONS:
- Content Type: ${contentType.toUpperCase()}
- Target Length: ${wordCount} (STRICT requirement)
- Writing Tone: ${botTone} yet engaging
- Category: ${category}
- SEO Keywords (use naturally): ${seoKeywords.join(', ')}

CONTENT TASK:
${typeof prompt === 'string' ? prompt : `Create engaging ${contentType} content about ${category} for TalentXcel professionals.`}

DETAILED WRITING REQUIREMENTS:
1. START with an attention-grabbing headline or opening
2. STRUCTURE your content with clear paragraphs
3. INCLUDE specific, actionable advice
4. ADD real examples or scenarios when relevant  
5. INCORPORATE the SEO keywords naturally (${seoKeywords.join(', ')})
6. END with a clear call-to-action for TalentXcel users

${contentType === 'post' ? `
POST-SPECIFIC REQUIREMENTS:
- Write exactly 150-200 words
- Start with a hook that grabs attention
- Include 2-3 key takeaways
- End with an engaging question or call-to-action
- Make it shareable and discussion-worthy
` : ''}

${contentType === 'article' ? `
ARTICLE-SPECIFIC REQUIREMENTS:
- Write 500-700 words with clear sections
- Include: Introduction, 3-4 main points, practical examples, conclusion
- Add subheadings for better readability
- Provide step-by-step guidance where applicable
- Include statistics or insights when relevant
` : ''}

${contentType === 'seo_page' ? `
SEO PAGE REQUIREMENTS:
- Write 500-700 words optimized for search
- Include the main keyword in the first paragraph
- Use related keywords throughout naturally
- Structure with H2/H3 equivalent sections
- Provide comprehensive coverage of the topic
- End with related recommendations
` : ''}

${contentType === 'newsletter' ? `
NEWSLETTER REQUIREMENTS:
- Write 1000-1500 words with multiple sections
- Include: Welcome note, Main content, Quick tips, Upcoming events, Call-to-action
- Make it personal and conversational
- Add value in each section
- Include multiple engagement opportunities
` : ''}

QUALITY STANDARDS:
- NO generic or placeholder content
- NO repetitive phrases
- BE specific and actionable
- PROVIDE real value to career-focused professionals
- WRITE as ${botName} with expertise in ${botDomains.join(' and ')}

Now write the complete ${contentType} content following ALL requirements above:`;

    console.log('📝 Sending enhanced request to DeepSeek API...');
    console.log('🤖 Bot:', botName, '| Type:', contentType, '| Words:', wordCount);

    console.log('📝 Sending request to DeepSeek API...');
    
    // Call DeepSeek API
    const deepseekResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
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
            content: `You are an expert content writer for TalentXcel, a professional career platform. You specialize in creating high-quality, engaging content that helps professionals advance their careers. 

CRITICAL REQUIREMENTS:
- Always write the FULL required word count
- Make content specific, actionable, and valuable
- Include real examples and practical advice
- Never write generic or placeholder content
- Maintain professional but engaging tone
- Integrate SEO keywords naturally`
          },
          {
            role: 'user',
            content: enhancedPrompt
          }
        ],
        max_tokens: contentType === 'newsletter' ? 2000 : contentType === 'article' || contentType === 'seo_page' ? 1200 : 600,
        temperature: 0.8,
        top_p: 0.95,
        frequency_penalty: 0.3,
        presence_penalty: 0.1,
      }),
    });

    if (!deepseekResponse.ok) {
      const errorText = await deepseekResponse.text();
      console.error('DeepSeek API error:', errorText);
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { error: { message: errorText } };
      }
      
      // Check for insufficient balance specifically
      if (deepseekResponse.status === 402 || errorData?.error?.message?.includes('Insufficient Balance')) {
        throw new Error('INSUFFICIENT_BALANCE: Your DeepSeek API account has insufficient balance. Please top up your account at https://platform.deepseek.com/');
      }
      
      throw new Error(`DeepSeek API error: ${deepseekResponse.status} - ${errorData?.error?.message || errorText}`);
    }

    const deepseekData = await deepseekResponse.json();
    const generatedContent = deepseekData.choices[0]?.message?.content;

    if (!generatedContent) {
      throw new Error('No content generated from DeepSeek API');
    }

    console.log('✅ Content generated successfully');

    // Validate content quality
    const wordCount_actual = generatedContent.split(' ').length;
    const hasKeywords = seoKeywords.some(keyword => 
      generatedContent.toLowerCase().includes(keyword.toLowerCase())
    );

    console.log(`📊 Generated: ${wordCount_actual} words | Keywords found: ${hasKeywords}`);

    if (wordCount_actual < 50) {
      throw new Error('Generated content too short - regeneration needed');
    }

    // Extract title from content or generate one
    const lines = generatedContent.split('\n').filter(line => line.trim());
    let title = lines[0]?.replace(/[#*]/g, '').trim() || '';
    
    // If no good title found, generate one based on content type and category
    if (!title || title.length < 10) {
      title = `${category} Guide: ${contentType === 'post' ? 'Quick Tips' : 'Professional Insights'} from ${botName}`;
    }

    // Save to bot_generated_content table
    const { data: savedContent, error: saveError } = await supabase
      .from('bot_generated_content')
      .insert({
        bot_id: botId,
        template_id: templateId,
        title: title,
        content: generatedContent,
        content_type: contentType,
        meta_data: {
          category: category,
          word_count: wordCount_actual,
          target_word_count: wordCount,
          has_seo_keywords: hasKeywords,
          bot_name: botName,
          generation_timestamp: new Date().toISOString()
        },
        seo_keywords: seoKeywords,
        status: 'approved', // Auto-approve for now
        ai_model_used: 'deepseek-chat',
        generation_cost: 0.01,
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving generated content:', saveError);
      throw saveError;
    }

    // Create actual post in the posts table for network feed
    if (contentType === 'post') {
      // Create a better formatted post for the network
      const postContent = generatedContent.length > 300 ? 
        generatedContent.substring(0, 300) + '...' : 
        generatedContent;

      const { error: postError } = await supabase
        .from('posts')
        .insert({
          user_id: botId, // Bot acts as user
          headline: title,
          content: postContent,
          visibility: 'public',
          tags: seoKeywords,
          is_ai_generated: true,
          metadata: {
            template_id: templateId,
            category: category,
            generation_id: savedContent.id,
            full_content_available: true
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
        title: title,
        contentId: savedContent.id,
        stats: {
          wordCount: wordCount_actual,
          targetWordCount: wordCount,
          hasKeywords: hasKeywords,
          tokensUsed: deepseekData.usage?.total_tokens || 0
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in content generation:', error);
    
    // Check if this is an insufficient balance error
    if (error.message.includes('INSUFFICIENT_BALANCE')) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'INSUFFICIENT_BALANCE',
          message: 'Your DeepSeek API account has insufficient balance. Please top up your account.',
          topUpUrl: 'https://platform.deepseek.com/',
          usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }
        }),
        { 
          status: 402, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Content generation failed',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});