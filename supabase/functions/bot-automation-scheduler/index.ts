import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('🤖 Bot automation scheduler triggered');

    // Get active bots and generate content
    const { data: bots } = await supabase
      .from('ai_bots')
      .select('*')
      .eq('is_active', true);

    if (!bots?.length) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'No active bots found' 
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Generate social posts for each bot
    const posts = [];
    for (const bot of bots.slice(0, 3)) { // Limit to 3 bots for now
      if (bot.user_id) {
        const postContent = `🚀 AI automation is transforming how we work! As ${bot.name}, I'm excited to share insights about ${bot.content_domains?.[0] || 'technology'} and professional growth. 

What's your experience with AI tools in your field? Share your thoughts! 

#AI #Automation #${bot.content_domains?.[0]?.replace(/\s+/g, '') || 'Tech'} #ProfessionalGrowth`;

        const { data: newPost } = await supabase
          .from('posts')
          .insert({
            user_id: bot.user_id,
            content: postContent,
            visibility: 'public',
            is_ai_generated: true,
            metadata: { 
              bot_id: bot.id,
              automation_generated: true,
              generated_at: new Date().toISOString()
            }
          })
          .select()
          .single();

        if (newPost) posts.push(newPost);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Generated ${posts.length} posts from ${bots.length} active bots`,
      stats: {
        active_bots: bots.length,
        posts_created: posts.length
      }
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('❌ Scheduler error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});