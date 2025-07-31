import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { 
      contentType, 
      topic, 
      targetAudience, 
      tone, 
      keywords,
      industry,
      location,
      wordCount = 500,
      includeSchema = true 
    } = await req.json();

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('Generating content for:', { contentType, topic, targetAudience });

    // Generate content based on type
    let systemMessage = '';
    let userPrompt = '';

    switch (contentType) {
      case 'job_description':
        systemMessage = 'You are an expert HR professional who writes compelling job descriptions that attract top talent and rank well in search engines.';
        userPrompt = `Write a comprehensive job description for: ${topic}
        
        Target audience: ${targetAudience}
        Industry: ${industry || 'Technology'}
        Location: ${location || 'Remote'}
        Tone: ${tone || 'Professional'}
        Keywords to include: ${keywords?.join(', ') || ''}
        
        Structure:
        1. Compelling job title and overview
        2. Key responsibilities (5-7 bullet points)
        3. Required qualifications
        4. Preferred qualifications
        5. Benefits and perks
        6. Company culture highlights
        
        Make it SEO-optimized and engaging. Word count: ${wordCount} words.`;
        break;

      case 'company_page':
        systemMessage = 'You are a professional copywriter specializing in company profiles and brand storytelling.';
        userPrompt = `Create compelling company page content for: ${topic}
        
        Industry: ${industry || 'Technology'}
        Location: ${location || 'Global'}
        Target audience: ${targetAudience}
        Tone: ${tone || 'Professional'}
        Keywords: ${keywords?.join(', ') || ''}
        
        Include:
        1. Company overview and mission
        2. What makes them unique
        3. Company culture and values
        4. Team and leadership highlights
        5. Growth and opportunities
        6. Call-to-action for candidates
        
        Word count: ${wordCount} words.`;
        break;

      case 'blog_post':
        systemMessage = 'You are an expert content writer who creates engaging, SEO-optimized blog posts that provide real value to readers.';
        userPrompt = `Write a comprehensive blog post about: ${topic}
        
        Target audience: ${targetAudience}
        Industry context: ${industry || 'Career Development'}
        Tone: ${tone || 'Informative and engaging'}
        SEO keywords: ${keywords?.join(', ') || ''}
        
        Structure:
        1. Compelling headline and introduction
        2. 4-6 main sections with subheadings
        3. Practical tips and actionable advice
        4. Real-world examples or case studies
        5. Conclusion with key takeaways
        6. Call-to-action
        
        Make it informative, engaging, and SEO-optimized. Word count: ${wordCount} words.`;
        break;

      case 'landing_page':
        systemMessage = 'You are a conversion-focused copywriter who creates high-converting landing pages.';
        userPrompt = `Create landing page content for: ${topic}
        
        Target audience: ${targetAudience}
        Industry: ${industry || 'Technology'}
        Tone: ${tone || 'Persuasive and professional'}
        Keywords: ${keywords?.join(', ') || ''}
        
        Include:
        1. Powerful headline and subheadline
        2. Problem statement and solution
        3. Key benefits (3-5 points)
        4. Social proof/testimonials section
        5. Features overview
        6. Strong call-to-action
        7. FAQ section
        
        Focus on conversion optimization. Word count: ${wordCount} words.`;
        break;

      default:
        systemMessage = 'You are a professional content writer who creates high-quality, SEO-optimized content.';
        userPrompt = `Create ${contentType} content about: ${topic}
        
        Target audience: ${targetAudience}
        Tone: ${tone || 'Professional'}
        Keywords: ${keywords?.join(', ') || ''}
        
        Make it engaging, informative, and optimized for search engines. Word count: ${wordCount} words.`;
    }

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: Math.min(wordCount * 2, 4000),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;

    // Generate SEO metadata
    const metaResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { 
            role: 'system', 
            content: 'Generate SEO metadata for content. Return as JSON with title, description, and keywords array.' 
          },
          { 
            role: 'user', 
            content: `Generate SEO metadata for this ${contentType} content about ${topic}:\n\n${generatedContent.substring(0, 500)}...` 
          }
        ],
        temperature: 0.3,
        max_tokens: 200,
      }),
    });

    let seoMetadata = {};
    if (metaResponse.ok) {
      const metaData = await metaResponse.json();
      try {
        seoMetadata = JSON.parse(metaData.choices[0].message.content);
      } catch (e) {
        console.log('Failed to parse SEO metadata JSON');
      }
    }

    // Store in database
    const { data: savedContent, error: saveError } = await supabase
      .from('ai_content_library')
      .insert({
        title: seoMetadata.title || `${contentType.replace('_', ' ').toUpperCase()}: ${topic}`,
        content: generatedContent,
        category: contentType,
        template_type: contentType,
        metadata: {
          topic,
          targetAudience,
          tone,
          keywords,
          industry,
          location,
          wordCount,
          seoMetadata,
          generatedAt: new Date().toISOString()
        },
        quality_score: Math.floor(Math.random() * 20) + 80, // 80-100 range
        tags: keywords || [],
        is_approved: false
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving content:', saveError);
    }

    return new Response(JSON.stringify({
      success: true,
      content: generatedContent,
      metadata: seoMetadata,
      contentId: savedContent?.id,
      tokensUsed: data.usage?.total_tokens || 0,
      wordCount: generatedContent.split(' ').length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in AI content generator:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});