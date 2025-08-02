import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action = 'generate_batch', botId, scheduleId, count = 5 } = await req.json();

    if (action === 'generate_batch') {
      // Get active bots or specific bot
      let botsQuery = supabase
        .from('ai_bots')
        .select('*')
        .eq('is_active', true);
      
      if (botId) {
        botsQuery = botsQuery.eq('id', botId);
      }

      const { data: bots, error: botsError } = await botsQuery;
      
      if (botsError) {
        throw new Error(`Failed to fetch bots: ${botsError.message}`);
      }

      const results = [];

      // Process each bot
      for (const bot of bots) {
        try {
          // Get prompts for this bot (prioritized by performance and freshness)
          const { data: prompts } = await supabase
            .from('bot_prompt_library')
            .select('*')
            .eq('bot_id', bot.id)
            .eq('is_active', true)
            .order('priority', { ascending: false })
            .order('last_used_at', { ascending: true, nullsFirst: true })
            .limit(count);

          if (!prompts || prompts.length === 0) {
            console.log(`No prompts found for bot ${bot.name}`);
            continue;
          }

          // Generate content for each selected prompt
          for (const prompt of prompts) {
            const generatedContent = await generateContent(bot, prompt, openAIApiKey);
            
            if (generatedContent) {
              // Store in bot_generated_content
              const { data: contentRecord, error: contentError } = await supabase
                .from('bot_generated_content')
                .insert({
                  bot_id: bot.id,
                  template_id: prompt.id,
                  content_type: 'post',
                  title: generatedContent.title,
                  content: generatedContent.content,
                  meta_data: {
                    prompt_used: prompt.prompt_text,
                    generation_time: new Date().toISOString(),
                    seo_optimized: true
                  },
                  seo_keywords: prompt.seo_focus,
                  status: 'generated',
                  ai_model_used: 'gpt-4.1-2025-04-14',
                  generation_cost: 0.01
                })
                .select()
                .single();

              if (!contentError && contentRecord) {
                // Queue for publishing
                await supabase
                  .from('bot_content_queue')
                  .insert({
                    bot_id: bot.id,
                    prompt_id: prompt.id,
                    schedule_id: scheduleId,
                    content_type: 'post',
                    status: 'generated',
                    priority: prompt.priority,
                    scheduled_for: new Date(Date.now() + Math.random() * 3600000), // Random within next hour
                    generated_content: JSON.stringify(generatedContent),
                    seo_keywords: prompt.seo_focus
                  });

                // Update prompt usage
                await supabase
                  .from('bot_prompt_library')
                  .update({
                    usage_count: prompt.usage_count + 1,
                    last_used_at: new Date().toISOString()
                  })
                  .eq('id', prompt.id);

                results.push({
                  bot: bot.name,
                  prompt: prompt.category,
                  contentId: contentRecord.id,
                  title: generatedContent.title,
                  status: 'success'
                });
              }
            }
          }
        } catch (error) {
          console.error(`Error processing bot ${bot.name}:`, error);
          results.push({
            bot: bot.name,
            status: 'error',
            error: error.message
          });
        }
      }

      return new Response(JSON.stringify({
        success: true,
        generated: results.length,
        results
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'publish_queue') {
      // Get ready-to-publish content from queue
      const { data: queueItems } = await supabase
        .from('bot_content_queue')
        .select('*, ai_bots(name, email, user_id)')
        .eq('status', 'generated')
        .lte('scheduled_for', new Date().toISOString())
        .order('priority', { ascending: false })
        .limit(20);

      const published = [];

      for (const item of queueItems || []) {
        try {
          const contentData = JSON.parse(item.generated_content);
          
          // Create post using bot identity
          const { error: postError } = await supabase.rpc('create_bot_post', {
            bot_uuid: item.bot_id,
            post_title: contentData.title,
            post_content: contentData.content,
            post_type: 'text',
            is_manual: false
          });

          if (!postError) {
            // Update queue status
            await supabase
              .from('bot_content_queue')
              .update({ status: 'published' })
              .eq('id', item.id);

            published.push({
              bot: item.ai_bots.name,
              title: contentData.title,
              status: 'published'
            });
          }
        } catch (error) {
          console.error(`Error publishing for bot ${item.ai_bots?.name}:`, error);
          await supabase
            .from('bot_content_queue')
            .update({ 
              status: 'failed',
              error_message: error.message,
              retry_count: item.retry_count + 1
            })
            .eq('id', item.id);
        }
      }

      return new Response(JSON.stringify({
        success: true,
        published: published.length,
        results: published
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in bot content engine:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateContent(bot: any, prompt: any, openAIApiKey: string) {
  try {
    // Enhanced system message with SEO optimization
    const systemMessage = `You are ${bot.name}, a ${bot.role} at TalentXcel. 
Your personality: ${bot.tone_style} and professional.
Content domains: ${bot.content_domains.join(', ')}.
Department focus: ${bot.department.join(', ')}.

IMPORTANT INSTRUCTIONS:
1. Write in a human, conversational tone - never robotic
2. Include relevant hashtags (3-5 maximum)
3. Add a clear call-to-action linking to TalentXcel features
4. Optimize for SEO keywords: ${prompt.seo_focus.join(', ')}
5. Keep posts between 150-300 words for optimal engagement
6. Include internal links to /jobs, /learn, or /mentors when relevant
7. Make content shareable and actionable

Write as if you're genuinely passionate about helping people succeed in their careers.`;

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
          { role: 'user', content: prompt.prompt_text }
        ],
        temperature: 0.7,
        max_tokens: 500
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Extract title from first line or create one
    const lines = content.split('\n').filter(line => line.trim());
    const title = lines[0].length > 100 ? 
      lines[0].substring(0, 97) + '...' : 
      lines[0];
    
    const postContent = lines.slice(1).join('\n').trim() || content;

    return {
      title: title.replace(/^[#\*\-\s]+/, ''), // Remove markdown formatting
      content: postContent
    };

  } catch (error) {
    console.error('Error generating content:', error);
    return null;
  }
}