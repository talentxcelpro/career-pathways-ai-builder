import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, cache-control',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('🔍 Testing TXC connection...')

    // Test database connection
    const { data: profiles, error } = await supabaseClient
      .from('profiles')
      .select('id, full_name')
      .limit(1)

    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }

    // Test user_txc_balances table
    const { data: txcBalances, error: txcError } = await supabaseClient
      .from('user_txc_balances')
      .select('user_id, txc_balance')
      .limit(1)

    if (txcError) {
      console.log('TXC balances table check:', txcError.message)
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'TXC connection test successful',
        profiles_count: profiles?.length || 0,
        txc_balances_accessible: !txcError,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ TXC connection test failed:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})