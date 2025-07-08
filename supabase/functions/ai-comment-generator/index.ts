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
      appreciative: "Generate an appreciative comment that congratulates or shows support for the author's achievement, milestone, or perspective.",
      engaging: "Generate an engaging comment that invites conversation and encourages the author to share more details or insights.",
      question: "Generate a thoughtful question that sparks a reply by asking about specific aspects, challenges, or experiences related to the post.",
      domain_smart: "Generate a domain-smart comment that adds industry-specific insight, mentions relevant trends, or provides expert context.",
      networking: "Generate a networking-focused comment that encourages connection, collaboration, or professional relationship building.",
      reflective: "Generate a reflective comment that shares a related personal experience, draws parallels, or offers deeper thought on the topic."
    };

    const userContext = userProfile ? `
    User's background:
    - Name: ${userProfile.full_name || 'Professional'}
    - Title: ${userProfile.title || 'Professional'}
    - Industry: ${userProfile.industry || 'Technology'}
    - Career Level: ${userProfile.career_stage || 'mid-career'}
    ` : '';

    const systemPrompt = `You are an AI assistant helping professionals write engaging comments on LinkedIn-style posts.

    Generate 5-6 smart, diverse comments that follow these styles:
    1. Appreciative: Congratulates or shows support
    2. Engaging: Invites conversation and encourages sharing
    3. Question-Based: Asks thoughtful questions to spark replies
    4. Domain-Smart: Adds industry-specific insights or trends
    5. Networking: Encourages connection or collaboration
    6. Reflective: Shares related experience or deeper thoughts

    ${userContext}

    Guidelines:
    1. Keep comments professional but personable (20-100 words each)
    2. Add genuine value to the conversation
    3. Be authentic and avoid generic responses
    4. Use emojis sparingly (max 1-2 per comment)
    5. Show genuine interest in the topic
    6. Relate to the user's background when appropriate
    7. Make each comment distinctly different in approach

    Return as JSON array with objects containing 'comment' and 'tone' fields.
    Ensure each comment represents a different style from the list above.`;

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
      suggestions = lines.slice(0, 6).map((line, index) => ({
        comment: line.replace(/^\d+\.\s*/, '').trim(),
        tone: ['appreciative', 'engaging', 'question', 'domain_smart', 'networking', 'reflective'][index] || 'appreciative'
      }));
    }

    return new Response(JSON.stringify({ 
      suggestions: suggestions.slice(0, 6),
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