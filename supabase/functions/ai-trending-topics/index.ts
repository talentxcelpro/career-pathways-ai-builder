import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, userInterests, userIndustry, timeframe = 'week' } = await req.json();
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get recent posts from user's network and industry
    const { data: recentPosts, error: postsError } = await supabase
      .from('posts')
      .select('content, intent_tags, created_at')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .eq('is_public', true)
      .limit(50);

    if (postsError) {
      console.error('Error fetching posts:', postsError);
    }

    // Get user profile for context
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    // Analyze trending topics using AI
    const systemPrompt = `You are an AI that identifies trending professional topics and creates personalized recommendations.

    User Context:
    - Industry: ${userIndustry || userProfile?.industry || 'Technology'}
    - Interests: ${userInterests?.join(', ') || 'Professional development'}
    - Career Level: ${userProfile?.career_stage || 'mid-career'}
    - Location: ${userProfile?.location || 'Global'}

    Based on recent professional discussions and current industry trends, generate 8-10 trending topics that would be relevant for this user.

    For each topic, provide:
    1. Topic name (2-4 words)
    2. Brief description (1 sentence)
    3. Relevance score (1-10)
    4. Suggested hashtags (2-3)
    5. Content angle (how to approach this topic)

    Focus on:
    - Current industry developments
    - Professional skills and growth
    - Technology trends
    - Career advancement
    - Industry insights
    - Workplace culture
    - Leadership and management

    Return as JSON array with objects containing: topicName, description, relevanceScore, hashtags, contentAngle, trendReason.`;

    const recentPostsContent = recentPosts?.map(post => post.content).join('\n\n') || '';

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
            content: `Recent posts from professional network:\n${recentPostsContent.substring(0, 2000)}\n\nGenerate personalized trending topics for this user.` 
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      // Fallback trending topics
      const fallbackTopics = [
        {
          topicName: "AI in Workplace",
          description: "How artificial intelligence is transforming professional workflows and productivity.",
          relevanceScore: 9,
          hashtags: ["#AI", "#Productivity", "#FutureOfWork"],
          contentAngle: "Share your experience with AI tools in your daily work",
          trendReason: "Growing adoption of AI tools across industries"
        },
        {
          topicName: "Remote Work Evolution",
          description: "The changing landscape of remote and hybrid work arrangements.",
          relevanceScore: 8,
          hashtags: ["#RemoteWork", "#WorkFromHome", "#HybridWork"],
          contentAngle: "Discuss remote work best practices and challenges",
          trendReason: "Post-pandemic workplace transformation"
        },
        {
          topicName: "Skills Development",
          description: "Continuous learning and professional skill enhancement in 2024.",
          relevanceScore: 8,
          hashtags: ["#SkillsDevelopment", "#Learning", "#CareerGrowth"],
          contentAngle: "Share your learning journey and skill-building strategies",
          trendReason: "Increased focus on lifelong learning"
        },
        {
          topicName: "Leadership Insights",
          description: "Modern leadership approaches and management strategies.",
          relevanceScore: 7,
          hashtags: ["#Leadership", "#Management", "#TeamBuilding"],
          contentAngle: "Share leadership lessons and team management experiences",
          trendReason: "Evolving leadership styles in modern workplaces"
        },
        {
          topicName: "Industry Innovation",
          description: "Breakthrough innovations and emerging technologies in your field.",
          relevanceScore: 8,
          hashtags: ["#Innovation", "#Technology", "#Industry"],
          contentAngle: "Discuss how innovation is impacting your industry",
          trendReason: "Rapid technological advancement across sectors"
        }
      ];

      return new Response(JSON.stringify({ 
        topics: fallbackTopics,
        generatedAt: new Date().toISOString(),
        source: 'fallback'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    let topics = [];

    try {
      const content = data.choices[0].message.content;
      topics = JSON.parse(content);
    } catch (parseError) {
      // Fallback if JSON parsing fails
      topics = [
        {
          topicName: "Professional Growth",
          description: "Career development and advancement strategies.",
          relevanceScore: 8,
          hashtags: ["#CareerGrowth", "#Professional", "#Development"],
          contentAngle: "Share your career development insights",
          trendReason: "Ongoing focus on professional advancement"
        }
      ];
    }

    // Store trending topics for caching
    if (topics.length > 0) {
      await supabase
        .from('trending_topics')
        .upsert({
          user_id: userId,
          topics: topics,
          generated_at: new Date().toISOString(),
          timeframe: timeframe
        });
    }

    return new Response(JSON.stringify({ 
      topics: topics.slice(0, 10),
      generatedAt: new Date().toISOString(),
      source: 'ai'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-trending-topics function:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});