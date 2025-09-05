import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Setting up news automation cron job...');

    // Set up cron job to run news automation every 30 minutes
    const { data, error } = await supabase.rpc('cron.schedule', {
      job_name: 'news-automation-every-30min',
      schedule: '*/30 * * * *', // Every 30 minutes
      command: `
        SELECT net.http_post(
          url := '${supabaseUrl}/functions/v1/news-feed-automation',
          headers := '{"Content-Type": "application/json", "Authorization": "Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}"}'::jsonb,
          body := '{"automated": true}'::jsonb
        );
      `
    });

    if (error) {
      console.error('Error setting up cron job:', error);
      throw error;
    }

    console.log('✅ News automation cron job set up successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'News automation cron job configured to run every 30 minutes',
        schedule: '*/30 * * * *'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: any) {
    console.error('❌ Cron setup error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        message: 'Failed to set up news automation cron job'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
};

serve(handler);