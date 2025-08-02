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
    console.log('Bot automation scheduler triggered at:', new Date().toISOString());

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const currentHour = new Date().getHours();
    const currentTimeSlot = `${currentHour.toString().padStart(2, '0')}:00`;
    
    // Get active automation schedules that should run now
    const { data: schedules, error: schedulesError } = await supabase
      .from('bot_automation_schedule')
      .select('*, ai_bots(*)')
      .eq('is_active', true)
      .or(`time_slots.cs.{${currentTimeSlot}},next_execution_at.lte.${new Date().toISOString()}`);

    if (schedulesError) {
      throw new Error(`Failed to fetch schedules: ${schedulesError.message}`);
    }

    console.log(`Found ${schedules?.length || 0} schedules to process`);

    const results = [];

    for (const schedule of schedules || []) {
      try {
        console.log(`Processing schedule: ${schedule.name} for bot: ${schedule.ai_bots?.name}`);

        // Check if we should generate content based on frequency
        const shouldGenerate = await shouldGenerateContent(schedule, supabase);
        
        if (!shouldGenerate) {
          console.log(`Skipping schedule ${schedule.name} - not time to generate yet`);
          continue;
        }

        // Trigger content generation
        const generateResponse = await fetch(`${supabaseUrl}/functions/v1/ai-bot-content-engine`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'generate_batch',
            botId: schedule.bot_id,
            scheduleId: schedule.id,
            count: schedule.posts_per_cycle
          })
        });

        if (generateResponse.ok) {
          const generateData = await generateResponse.json();
          
          // Update schedule execution time
          const nextExecution = calculateNextExecution(schedule);
          await supabase
            .from('bot_automation_schedule')
            .update({
              last_executed_at: new Date().toISOString(),
              next_execution_at: nextExecution
            })
            .eq('id', schedule.id);

          results.push({
            schedule: schedule.name,
            bot: schedule.ai_bots?.name,
            generated: generateData.generated || 0,
            status: 'success',
            nextExecution
          });

          console.log(`Successfully generated ${generateData.generated || 0} posts for ${schedule.ai_bots?.name}`);
        } else {
          throw new Error(`Content generation failed: ${generateResponse.status}`);
        }

      } catch (error) {
        console.error(`Error processing schedule ${schedule.name}:`, error);
        results.push({
          schedule: schedule.name,
          bot: schedule.ai_bots?.name,
          status: 'error',
          error: error.message
        });
      }
    }

    // Also try to publish any ready content
    try {
      const publishResponse = await fetch(`${supabaseUrl}/functions/v1/ai-bot-content-engine`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'publish_queue'
        })
      });

      if (publishResponse.ok) {
        const publishData = await publishResponse.json();
        console.log(`Published ${publishData.published || 0} posts from queue`);
        
        results.push({
          action: 'publish_queue',
          published: publishData.published || 0,
          status: 'success'
        });
      }
    } catch (error) {
      console.error('Error publishing queue:', error);
    }

    // Log analytics
    await supabase
      .from('bot_content_analytics')
      .insert({
        bot_id: null, // System analytics
        analytics_date: new Date().toISOString().split('T')[0],
        views: 0,
        likes: 0,
        comments: 0,
        shares: 0,
        meta_data: {
          scheduler_run: true,
          schedules_processed: schedules?.length || 0,
          successful_generations: results.filter(r => r.status === 'success').length,
          timestamp: new Date().toISOString()
        }
      });

    return new Response(JSON.stringify({
      success: true,
      processed: schedules?.length || 0,
      results,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Bot automation scheduler error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function shouldGenerateContent(schedule: any, supabase: any): Promise<boolean> {
  const now = new Date();
  const lastExecuted = schedule.last_executed_at ? new Date(schedule.last_executed_at) : null;

  // If never executed, allow generation
  if (!lastExecuted) {
    return true;
  }

  // Check based on frequency type
  switch (schedule.frequency_type) {
    case 'hourly':
      const hoursSinceLastExecution = (now.getTime() - lastExecuted.getTime()) / (1000 * 60 * 60);
      return hoursSinceLastExecution >= schedule.frequency_value;
      
    case 'daily':
      const daysSinceLastExecution = (now.getTime() - lastExecuted.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceLastExecution >= schedule.frequency_value;
      
    case 'weekly':
      const weeksSinceLastExecution = (now.getTime() - lastExecuted.getTime()) / (1000 * 60 * 60 * 24 * 7);
      return weeksSinceLastExecution >= schedule.frequency_value;
      
    default:
      return false;
  }
}

function calculateNextExecution(schedule: any): string {
  const now = new Date();
  let nextExecution = new Date(now);

  switch (schedule.frequency_type) {
    case 'hourly':
      nextExecution.setHours(nextExecution.getHours() + schedule.frequency_value);
      break;
      
    case 'daily':
      nextExecution.setDate(nextExecution.getDate() + schedule.frequency_value);
      break;
      
    case 'weekly':
      nextExecution.setDate(nextExecution.getDate() + (schedule.frequency_value * 7));
      break;
      
    default:
      nextExecution.setHours(nextExecution.getHours() + 1); // Default to 1 hour
  }

  return nextExecution.toISOString();
}