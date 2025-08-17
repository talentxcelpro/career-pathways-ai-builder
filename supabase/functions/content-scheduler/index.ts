import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  // Health check endpoint
  if (req.method === 'GET') {
    return new Response(JSON.stringify({ ok: true, function: 'content-scheduler' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    console.log('📅 Content Scheduler v1.1 Starting...');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check current time slot
    const now = new Date();
    const currentHour = now.getHours().toString().padStart(2, '0');
    const currentTime = `${currentHour}:00`;

    console.log(`⏰ Current time slot: ${currentTime}`);

    // Get active schedules for this time slot
    const { data: schedules } = await supabase
      .from('content_automation_schedule')
      .select('*')
      .eq('is_active', true);

    if (!schedules || schedules.length === 0) {
      console.log('❌ No active schedules found');
      return new Response(JSON.stringify({ message: 'No schedules active' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let totalTriggered = 0;

    for (const schedule of schedules) {
      const timeSlots = schedule.time_slots as string[];
      
      if (timeSlots.includes(currentTime)) {
        console.log(`🎯 Triggering schedule: ${schedule.schedule_name}`);
        
        // Call comprehensive generator via Supabase client (existing function)
        const { data, error: invokeError } = await supabase.functions.invoke('ai-comprehensive-generator', {
          body: { schedule_id: schedule.id }
        });

        if (!invokeError) {
          totalTriggered++;
          console.log(`✅ Successfully triggered content generation for: ${schedule.schedule_name}`);
        } else {
          console.error(`❌ Failed to trigger generation for: ${schedule.schedule_name}`, invokeError);
        }
      }
    }

    // Update analytics
    await supabase.from('content_analytics').insert({
      content_id: null,
      metric_type: 'scheduler_runs',
      metric_value: totalTriggered,
      metadata: {
        time_slot: currentTime,
        schedules_checked: schedules.length,
        schedules_triggered: totalTriggered
      }
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: `Scheduler completed: ${totalTriggered} schedules triggered`,
        time_slot: currentTime,
        triggered_count: totalTriggered
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('❌ Scheduler error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});