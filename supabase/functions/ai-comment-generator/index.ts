import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { postContent, postAuthor, userProfile, commentType } = await req.json();

    if (!postContent) {
      return new Response(JSON.stringify({ error: 'Post content is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const commentTypes = {
      thoughtful: "Generate a thoughtful, insightful comment that adds value to the discussion. Ask a follow-up question or share a related perspective.",
      supportive: "Generate a supportive, encouraging comment that celebrates the author's achievement or perspective.",
      professional: "Generate a professional comment that demonstrates expertise and adds to the conversation in a meaningful way.",
      engaging: "Generate an engaging comment that's likely to spark further discussion and interaction.",
      question: "Generate a thoughtful question that encourages the author to share more details or insights."
    };

    const userContext = userProfile ? `
    User's background:
    - Name: ${userProfile.full_name || 'Professional'}
    - Title: ${userProfile.title || 'Professional'}
    - Industry: ${userProfile.industry || 'Technology'}
    - Career Level: ${userProfile.career_stage || 'mid-career'}
    ` : '';

    const systemPrompt = `You are an AI assistant helping professionals write engaging comments on LinkedIn-style posts.

    ${commentTypes[commentType as keyof typeof commentTypes] || commentTypes.professional}

    ${userContext}

    Guidelines:
    1. Keep comments professional but personable
    2. Length: 20-100 words
    3. Add value to the conversation
    4. Be authentic and avoid generic responses
    5. Use emojis sparingly (max 1-2)
    6. Don't be overly promotional
    7. Show genuine interest in the topic
    8. Relate to the user's background when appropriate

    Generate 3 different comment variations, each with a slightly different approach.
    Return as JSON array with objects containing 'comment' and 'tone' fields.`;

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
          { 
            role: 'user', 
            content: `Post by ${postAuthor?.name || 'someone'}: "${postContent}"
            
            Generate smart comment suggestions for this post.` 
          }
        ],
        temperature: 0.8,
        max_tokens: 400,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      return new Response(JSON.stringify({ error: 'AI service unavailable' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    let suggestions = [];

    try {
      // Try to parse as JSON first
      const content = data.choices[0].message.content;
      suggestions = JSON.parse(content);
    } catch (parseError) {
      // If JSON parsing fails, create simple suggestions from text
      const content = data.choices[0].message.content;
      const lines = content.split('\n').filter(line => line.trim());
      suggestions = lines.slice(0, 3).map((line, index) => ({
        comment: line.replace(/^\d+\.\s*/, '').trim(),
        tone: ['thoughtful', 'supportive', 'engaging'][index] || 'professional'
      }));
    }

    return new Response(JSON.stringify({ 
      suggestions: suggestions.slice(0, 3),
      postExcerpt: postContent.substring(0, 100) + '...'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-comment-generator function:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});