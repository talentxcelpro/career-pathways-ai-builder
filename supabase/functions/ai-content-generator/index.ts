// XHR polyfill removed to prevent Illegal return in Deno runtime
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { contentType, topic, targetAudience, tone, keywords, industry, location, wordCount, includeSchema } = await req.json();
    
    console.log('Generating content for:', { contentType, topic, targetAudience });
    
    // If required params are missing, return a helpful message without saving
    if (!contentType || !topic) {
      const fallbackContent = `I'm sorry, but there isn't enough information to generate content. Please provide at least a contentType and topic.`;
      const result = {
        success: true,
        content: fallbackContent,
        metadata: {
          title: 'Insufficient Information Provided',
          description: 'We are unable to generate content without a content type and topic.',
          keywords: ['content generation', 'insufficient information', 'request clarification']
        },
        contentId: crypto.randomUUID(),
        tokensUsed: 0,
        wordCount: fallbackContent.split(' ').length
      };
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let systemPrompt = '';
    let userPrompt = '';

    switch (contentType) {
      case 'job_description':
        systemPrompt = 'You are an expert HR professional who creates compelling job descriptions.';
        userPrompt = `Create a professional job description for: ${topic}
        ${industry ? `Industry: ${industry}` : ''}
        ${location ? `Location: ${location}` : ''}
        ${targetAudience ? `Target Audience: ${targetAudience}` : ''}
        ${tone ? `Tone: ${tone}` : ''}
        ${keywords ? `Keywords to include: ${keywords.join(', ')}` : ''}
        ${wordCount ? `Word count: approximately ${wordCount} words` : ''}
        
        Include: Job summary, key responsibilities, requirements, benefits, and company culture.`;
        break;

      case 'company_page':
        systemPrompt = 'You are an expert copywriter who creates engaging company pages.';
        userPrompt = `Create compelling company page content for: ${topic}
        ${industry ? `Industry: ${industry}` : ''}
        ${targetAudience ? `Target Audience: ${targetAudience}` : ''}
        ${tone ? `Tone: ${tone}` : ''}
        ${keywords ? `Keywords to include: ${keywords.join(', ')}` : ''}
        ${wordCount ? `Word count: approximately ${wordCount} words` : ''}
        
        Include: Company overview, mission/values, services/products, team highlights, and call-to-action.`;
        break;

      case 'blog_post':
        systemPrompt = 'You are an expert content writer who creates engaging blog posts.';
        userPrompt = `Write a comprehensive blog post about: ${topic}
        ${targetAudience ? `Target Audience: ${targetAudience}` : ''}
        ${tone ? `Tone: ${tone}` : ''}
        ${keywords ? `Keywords to include: ${keywords.join(', ')}` : ''}
        ${wordCount ? `Word count: approximately ${wordCount} words` : ''}
        
        Include: Compelling headline, introduction, main sections with subheadings, conclusion, and meta description.`;
        break;

      case 'landing_page':
        systemPrompt = 'You are an expert conversion copywriter who creates high-converting landing pages.';
        userPrompt = `Create a high-converting landing page for: ${topic}
        ${targetAudience ? `Target Audience: ${targetAudience}` : ''}
        ${tone ? `Tone: ${tone}` : ''}
        ${keywords ? `Keywords to include: ${keywords.join(', ')}` : ''}
        
        Include: Compelling headline, value proposition, benefits, social proof, features, and strong call-to-action.`;
        break;

      default:
        systemPrompt = 'You are an expert content creator who adapts to any content type.';
        userPrompt = `Create content about: ${topic}
        Content Type: ${contentType}
        ${targetAudience ? `Target Audience: ${targetAudience}` : ''}
        ${tone ? `Tone: ${tone}` : ''}
        ${keywords ? `Keywords to include: ${keywords.join(', ')}` : ''}
        ${wordCount ? `Word count: approximately ${wordCount} words` : ''}`;
    }

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
        max_tokens: wordCount ? Math.min(wordCount * 2, 4000) : 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Extract metadata
    const lines = content.split('\n');
    const title = lines.find(line => line.toLowerCase().includes('headline') || line.toLowerCase().includes('title'))?.replace(/^.*?:/, '').trim() || topic;
    const description = lines.slice(0, 3).join(' ').substring(0, 160);
    const extractedKeywords = keywords || [topic];

    const contentId = crypto.randomUUID();
    
    // Save to database
    try {
      if (supabaseUrl && supabaseServiceKey) {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        const safeCategory = contentType || 'general';
        const safeTemplate = contentType || 'generic';
        const tagsArray = Array.isArray(extractedKeywords)
          ? [safeCategory, ...extractedKeywords]
          : [safeCategory];

        const { error: saveError } = await supabase
          .from('ai_content_library')
          .insert({
            id: contentId,
            category: safeCategory,
            template_type: safeTemplate,
            title: title || String(topic || 'Untitled Content'),
            content,
            metadata: {
              ...(Array.isArray(extractedKeywords) && { keywords: extractedKeywords }),
              wordCount: content.split(' ').length,
              generatedAt: new Date().toISOString(),
              subject: topic,
              ...(targetAudience && { targetAudience }),
              ...(tone && { tone }),
              ...(industry && { industry }),
              ...(location && { location })
            },
            quality_score: data.usage?.total_tokens || 0,
            usage_count: 0,
            is_approved: false,
            tags: tagsArray
          });

        if (saveError) {
          console.error('Error saving content:', saveError);
        } else {
          console.log('Content saved to ai_content_library with id:', contentId);
        }
      } else {
        console.warn('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not configured - skipping DB save');
      }
    } catch (dbError) {
      console.error('Database error:', dbError);
      // Continue with response even if DB save fails
    }

    const result = {
      success: true,
      content,
      metadata: {
        title,
        description,
        keywords: extractedKeywords
      },
      contentId,
      tokensUsed: data.usage?.total_tokens || 0,
      wordCount: content.split(' ').length
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('AI content generation error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});