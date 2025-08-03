import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🗓️ Daily bot automation scheduler triggered');
    
    const now = new Date();
    const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000)); // IST = UTC + 5:30
    console.log(`📅 Current IST time: ${istTime.toISOString()}`);
    
    // Trigger daily content generation
    console.log('🚀 Triggering daily bot content generation...');
    
    const { data: generationResponse, error: generationError } = await supabase.functions.invoke('generate-bot-content', {
      body: {
        trigger_type: 'daily',
        scheduled_trigger: true,
        trigger_time: istTime.toISOString()
      }
    });

    if (generationError) {
      throw new Error(`Content generation failed: ${generationError.message}`);
    }

    console.log('✅ Daily content generation completed:', generationResponse);
    
    // Log the automation run
    const { error: logError } = await supabase
      .from('bot_automation_schedule')
      .insert([
        {
          trigger_type: 'daily',
          executed_at: now.toISOString(),
          bots_processed: generationResponse?.summary?.total_bots_processed || 0,
          content_generated: generationResponse?.summary?.successful_generations || 0,
          execution_status: 'completed',
          execution_metadata: {
            trigger_time: istTime.toISOString(),
            response: generationResponse,
            automated: true
          }
        }
      ]);

    if (logError) {
      console.error('⚠️ Failed to log automation run:', logError);
    }

    // Update bot activity tracking
    if (generationResponse?.results) {
      for (const result of generationResponse.results) {
        if (result.content_generated) {
          await supabase
            .from('bot_content_analytics')
            .upsert({
              bot_name: result.bot_name,
              last_generation_date: now.toISOString().split('T')[0],
              total_content_generated: 1,
              content_generated_today: 1
            }, {
              onConflict: 'bot_name',
              ignoreDuplicates: false
            });
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Daily bot automation completed successfully',
        execution_time: istTime.toISOString(),
        generation_summary: generationResponse?.summary || {},
        next_scheduled_run: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('❌ Daily bot automation failed:', error);
    
    // Log the failed automation run
    await supabase
      .from('bot_automation_schedule')
      .insert([
        {
          trigger_type: 'daily',
          executed_at: new Date().toISOString(),
          bots_processed: 0,
          content_generated: 0,
          execution_status: 'failed',
          execution_metadata: {
            error: error.message,
            automated: true
          }
        }
      ]);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});