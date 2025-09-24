import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      contentType, 
      topic, 
      tone = 'professional', 
      targetAudience = 'professionals',
      context,
      userProfile
    } = await req.json();

    if (!contentType || !topic) {
      return new Response(JSON.stringify({ error: 'Content type and topic are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authorization required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Initialize OpenAI
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      return new Response(JSON.stringify({ error: 'OpenAI API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Content templates and guidelines
    const contentTemplates = {
      linkedin_post: {
        structure: "Hook → Value/Insight → Call to Action",
        guidelines: "Engaging opening, valuable insights, relevant hashtags, professional tone",
        maxLength: "1500 characters"
      },
      outreach_email: {
        structure: "Personalized opening → Value proposition → Clear ask → Professional closing",
        guidelines: "Concise, personalized, value-focused, clear CTA",
        maxLength: "200-300 words"
      },
      project_summary: {
        structure: "Project overview → Technologies used → Challenges overcome → Results achieved",
        guidelines: "Technical details, quantified results, learning outcomes",
        maxLength: "300-500 words"
      },
      cover_letter: {
        structure: "Opening → Relevant experience → Value proposition → Closing",
        guidelines: "Tailored to role, highlight achievements, show enthusiasm",
        maxLength: "300-400 words"
      }
    };

    const template = contentTemplates[contentType as keyof typeof contentTemplates] || contentTemplates.linkedin_post;

    // Build generation prompt
    const generationPrompt = `As a professional content creator and career expert, create ${contentType.replace('_', ' ')} content.

CONTENT TYPE: ${contentType}
TOPIC: ${topic}
TONE: ${tone}
TARGET AUDIENCE: ${targetAudience}
STRUCTURE: ${template.structure}
GUIDELINES: ${template.guidelines}
MAX LENGTH: ${template.maxLength}

${userProfile ? `USER PROFILE:
Name: ${userProfile.name}
Role: ${userProfile.role}
Industry: ${userProfile.industry}
` : ''}

${context ? `ADDITIONAL CONTEXT: ${context}` : ''}

Create compelling, professional content that:
1. Captures attention immediately
2. Provides genuine value to the audience
3. Reflects the specified tone and style
4. Includes appropriate call-to-action
5. Is optimized for the platform/purpose
6. Uses relevant industry terminology
7. Follows best practices for engagement

For LinkedIn posts: Include 3-5 relevant hashtags
For emails: Include subject line suggestion
For project summaries: Include key metrics and outcomes
For cover letters: Highlight specific qualifications

Provide the content in this JSON format:
{
  "content": "The main content here",
  "subjectLine": "Email subject line (if applicable)",
  "hashtags": ["#hashtag1", "#hashtag2"],
  "keyPoints": ["Point 1", "Point 2", "Point 3"],
  "wordCount": 150,
  "tone": "${tone}",
  "engagementTips": ["Tip 1", "Tip 2"],
  "variations": {
    "shorter": "Condensed version",
    "longer": "Extended version"
  }
}`;

    // Call OpenAI API
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert content creator specializing in professional communication, LinkedIn content, and career-focused writing. Create engaging, valuable content in valid JSON format.' 
          },
          { role: 'user', content: generationPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!openAIResponse.ok) {
      const error = await openAIResponse.text();
      console.error('OpenAI API error:', error);
      throw new Error('OpenAI API request failed');
    }

    const aiData = await openAIResponse.json();
    let contentResult;

    try {
      // Try to parse JSON response
      const responseText = aiData.choices[0].message.content;
      contentResult = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      // Fallback response
      const content = aiData.choices[0].message.content;
      contentResult = {
        content: content,
        subjectLine: contentType === 'outreach_email' ? 'Professional Inquiry' : null,
        hashtags: contentType === 'linkedin_post' ? ['#career', '#professional', '#growth'] : [],
        keyPoints: ['Professional content created', 'Tailored for audience', 'Optimized for engagement'],
        wordCount: content.split(' ').length,
        tone: tone,
        engagementTips: ['Share at optimal times', 'Engage with comments', 'Use relevant hashtags'],
        variations: {
          shorter: content.substring(0, Math.floor(content.length * 0.7)),
          longer: content + '\n\nWhat are your thoughts on this?'
        }
      };
    }

    // Store content generation result
    await supabase
      .from('ai_operations')
      .insert({
        user_id: user.id,
        operation_type: 'generate_post',
        input_data: { 
          contentType,
          topic,
          tone,
          targetAudience,
          context: context?.substring(0, 500)
        },
        output_data: {
          ...contentResult,
          content: contentResult.content?.substring(0, 1000) + '...' // Truncate for storage
        },
        status: 'completed',
        tokens_used: aiData.usage?.total_tokens || 0,
        completed_at: new Date().toISOString()
      });

    return new Response(JSON.stringify({
      success: true,
      content: contentResult,
      metadata: {
        tokens_used: aiData.usage?.total_tokens || 0,
        model: 'gpt-4o-mini',
        contentType
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-content-generator function:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: (error as Error).message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});