import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, prompt, category, tags, articleId, searchQuery } = await req.json();

    switch (action) {
      case 'generate':
        return await generateArticle(prompt, category, tags);
      case 'search':
        return await searchArticles(searchQuery);
      case 'increment_views':
        return await incrementViews(articleId);
      default:
        throw new Error('Invalid action');
    }
  } catch (error) {
    console.error('Error in ai-career-content function:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process request', details: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function generateArticle(prompt: string, category: string, tags: string[]) {
  if (!openAIApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const systemMessage = `You are an expert career advisor and content creator for TalentXcel. Create high-quality, actionable career content that helps professionals advance their careers. 

Your response should be a JSON object with the following structure:
{
  "title": "Compelling article title",
  "summary": "Brief 2-3 sentence summary",
  "content": "Full article content in markdown format (700-1000 words)",
  "suggested_tags": ["tag1", "tag2", "tag3"],
  "read_time": "X min read",
  "author_name": "TalentXcel Expert"
}

Make the content practical, engaging, and specific to the ${category} category. Include actionable tips, real examples, and current industry insights.`;

  console.log('Generating article with OpenAI for category:', category);

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
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const aiResponse = await response.json();
  const generatedContent = JSON.parse(aiResponse.choices[0].message.content);

  // Log the prompt and response
  const authHeader = req.headers.get('Authorization');
  if (authHeader) {
    try {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      
      if (user) {
        await supabase.from('admin_prompts').insert({
          prompt,
          response: JSON.stringify(generatedContent),
          created_by: user.id
        });
      }
    } catch (error) {
      console.error('Error logging prompt:', error);
    }
  }

  return new Response(
    JSON.stringify({ 
      success: true,
      data: {
        ...generatedContent,
        category,
        tags: tags.length > 0 ? tags : generatedContent.suggested_tags
      }
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function searchArticles(searchQuery: string) {
  try {
    let query = supabase
      .from('career_articles')
      .select('*')
      .eq('is_published', true);

    if (searchQuery && searchQuery.trim() !== '') {
      query = query.or(`title.ilike.%${searchQuery}%,summary.ilike.%${searchQuery}%,tags.cs.{${searchQuery}}`);
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true, data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    throw new Error(`Search failed: ${error.message}`);
  }
}

async function incrementViews(articleId: string) {
  try {
    const { error } = await supabase.rpc('increment_article_views', {
      article_id: articleId
    });

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    throw new Error(`Failed to increment views: ${error.message}`);
  }
}