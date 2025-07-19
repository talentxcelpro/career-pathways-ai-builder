import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Create market data cache table if it doesn't exist
    const { error: createTableError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS market_data_cache (
          id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
          role text NOT NULL,
          location text NOT NULL DEFAULT 'global',
          industry text NOT NULL DEFAULT 'general',
          data jsonb NOT NULL,
          created_at timestamp with time zone DEFAULT now(),
          updated_at timestamp with time zone DEFAULT now(),
          UNIQUE(role, location, industry)
        );
        
        CREATE INDEX IF NOT EXISTS idx_market_data_cache_role ON market_data_cache(role);
        CREATE INDEX IF NOT EXISTS idx_market_data_cache_updated ON market_data_cache(updated_at);
      `
    });

    if (createTableError) {
      console.log('Table already exists or creation failed:', createTableError);
    }

    // Get cached data for popular roles
    const { data: cachedData, error: queryError } = await supabase
      .from('market_data_cache')
      .select('*')
      .order('updated_at', { ascending: false });

    if (queryError) {
      throw queryError;
    }

    return new Response(JSON.stringify({ 
      cached_entries: cachedData?.length || 0,
      recent_data: cachedData?.slice(0, 10) || []
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in market data cache:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});