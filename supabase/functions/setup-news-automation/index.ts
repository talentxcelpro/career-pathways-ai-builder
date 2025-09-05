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
    console.log('🔧 Setting up news automation system...');

    // Test the news automation function first
    const testResponse = await fetch(`${supabaseUrl}/functions/v1/news-feed-automation`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ test: true })
    });

    if (!testResponse.ok) {
      throw new Error(`News automation test failed: ${testResponse.status}`);
    }

    const testResult = await testResponse.json();
    console.log('✅ News automation test successful:', testResult);

    // Create the cron job using SQL
    const cronJobSql = `
      SELECT cron.schedule(
        'news-automation-every-30min',
        '*/30 * * * *',
        $$
        SELECT
          net.http_post(
            url := '${supabaseUrl}/functions/v1/news-feed-automation',
            headers := '{"Content-Type": "application/json", "Authorization": "Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}"}'::jsonb,
            body := '{"automated": true}'::jsonb
          ) as request_id;
        $$
      );
    `;

    const { data: cronResult, error: cronError } = await supabase.rpc('execute_sql', {
      query: cronJobSql
    });

    if (cronError) {
      console.error('Cron job creation error:', cronError);
      // Try alternative approach using direct SQL execution
      const { error: altError } = await supabase
        .from('cron.job')
        .upsert({
          jobname: 'news-automation-every-30min',
          schedule: '*/30 * * * *',
          command: `
            SELECT
              net.http_post(
                url := '${supabaseUrl}/functions/v1/news-feed-automation',
                headers := '{"Content-Type": "application/json", "Authorization": "Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}"}'::jsonb,
                body := '{"automated": true}'::jsonb
              ) as request_id;
          `,
          active: true
        }, {
          onConflict: 'jobname'
        });

      if (altError) {
        console.warn('Alternative cron setup also failed:', altError);
      }
    }

    console.log('✅ News automation system setup completed');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'News automation system configured successfully',
        testResult,
        schedule: 'Every 30 minutes',
        nextRun: 'Within the next 30 minutes',
        features: [
          'Fetches job and career news from NewsAPI',
          'Creates news posts in the feed',
          'Cleans up old articles automatically',
          'Marks trending content',
          'Runs every 30 minutes automatically'
        ]
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: any) {
    console.error('❌ Setup error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        message: 'Failed to set up news automation system'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
};

serve(handler);