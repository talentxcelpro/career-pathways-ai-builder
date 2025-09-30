import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    // Get processing statistics
    const { data: cvFiles, error: cvError } = await supabaseClient
      .from('cv_files')
      .select('parsing_status, created_at, parsed_at')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    if (cvError) throw cvError;

    const stats = {
      total: cvFiles?.length || 0,
      pending: cvFiles?.filter(f => f.parsing_status === 'pending').length || 0,
      processing: cvFiles?.filter(f => f.parsing_status === 'processing').length || 0,
      completed: cvFiles?.filter(f => f.parsing_status === 'completed').length || 0,
      failed: cvFiles?.filter(f => f.parsing_status === 'error').length || 0,
      estimated_time: 0,
      processing_rate: 0
    };

    // Calculate processing rate (files per minute in last hour)
    const lastHour = new Date(Date.now() - 60 * 60 * 1000);
    const recentCompleted = cvFiles?.filter(f => 
      f.parsing_status === 'completed' && 
      f.parsed_at && 
      new Date(f.parsed_at) > lastHour
    ).length || 0;

    stats.processing_rate = recentCompleted;

    // Estimate remaining time
    if (stats.processing_rate > 0 && stats.pending > 0) {
      stats.estimated_time = (stats.pending / stats.processing_rate) * 60; // seconds
    }

    console.log('Queue stats:', stats);

    return new Response(JSON.stringify(stats), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error getting queue stats:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      total: 0,
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0,
      estimated_time: 0,
      processing_rate: 0
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});