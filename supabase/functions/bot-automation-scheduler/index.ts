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

    console.log('🤖 Bot automation scheduler triggered at:', new Date().toISOString());

    // Get active schedules and bots
    const { data: schedules } = await supabase
      .from('bot_automation_schedule')
      .select('*')
      .eq('is_active', true);

    if (!schedules?.length) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'No active schedules found' 
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    console.log(`Found ${schedules.length} schedules to process`);
    const results = [];

    // Process each schedule
    for (const schedule of schedules) {
      console.log(`Processing schedule: ${schedule.name} for bot: ${schedule.bot_name}`);
      
      try {
        // Queue content generation jobs for this bot
        const { data: queueResponse, error: queueError } = await supabase.functions.invoke('ai-comprehensive-generator', {
          body: { 
            action: 'queue',
            count: schedule.posts_per_day || 3,
            bot_id: schedule.bot_id,
            schedule_id: schedule.id
          }
        });

        if (queueError) {
          console.error(`Failed to queue jobs for ${schedule.bot_name}:`, queueError);
          results.push({
            schedule: schedule.name,
            bot: schedule.bot_name,
            generated: 0,
            status: 'error',
            error: queueError.message,
            nextExecution: new Date(Date.now() + (schedule.frequency_hours || 24) * 60 * 60 * 1000).toISOString()
          });
          continue;
        }

        // Process the queued jobs
        const { data: processResponse, error: processError } = await supabase.functions.invoke('ai-comprehensive-generator', {
          body: { 
            action: 'process',
            bot_id: schedule.bot_id
          }
        });

        if (processError) {
          console.error(`Failed to process jobs for ${schedule.bot_name}:`, processError);
        }

        const generated = processResponse?.processed || queueResponse?.jobs_queued || 0;
        console.log(`Successfully generated ${generated} posts for ${schedule.bot_name}`);

        results.push({
          schedule: schedule.name,
          bot: schedule.bot_name,
          generated,
          status: 'success',
          nextExecution: new Date(Date.now() + (schedule.frequency_hours || 24) * 60 * 60 * 1000).toISOString()
        });

        // Update last execution time
        await supabase
          .from('bot_automation_schedule')
          .update({ last_executed_at: new Date().toISOString() })
          .eq('id', schedule.id);

      } catch (error) {
        console.error(`Error processing schedule ${schedule.name}:`, error);
        results.push({
          schedule: schedule.name,
          bot: schedule.bot_name,
          generated: 0,
          status: 'error',
          error: error.message,
          nextExecution: new Date(Date.now() + (schedule.frequency_hours || 24) * 60 * 60 * 1000).toISOString()
        });
      }
    }

    // Publish any queued posts
    const { data: posts } = await supabase
      .from('published_content')
      .select('*')
      .eq('status', 'queued')
      .limit(10);

    let published = 0;
    if (posts?.length) {
      for (const post of posts) {
        // Move to posts table if it has user_id
        if (post.metadata?.user_id) {
          const { error: postError } = await supabase
            .from('posts')
            .insert({
              user_id: post.metadata.user_id,
              content: post.content,
              visibility: 'public',
              is_ai_generated: true,
              metadata: { 
                ...post.metadata,
                published_at: new Date().toISOString()
              }
            });

          if (!postError) {
            await supabase
              .from('published_content')
              .update({ status: 'published' })
              .eq('id', post.id);
            published++;
          }
        }
      }
    }

    console.log(`Published ${published} posts from queue`);
    results.push({
      action: 'publish_queue',
      published,
      status: 'success'
    });

    return new Response(JSON.stringify({
      success: true,
      processed: schedules.length,
      results,
      timestamp: new Date().toISOString()
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