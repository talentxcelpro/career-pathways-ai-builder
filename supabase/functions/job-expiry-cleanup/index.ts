import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseKey)

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('🧹 Running job expiry cleanup...')

    // Call the cleanup function
    const { error } = await supabase.rpc('cleanup_expired_jobs')

    if (error) {
      console.error('❌ Cleanup failed:', error)
      throw error
    }

    // Get count of expired jobs for logging
    const { count } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'expired')

    console.log(`✅ Job cleanup completed. Total expired jobs: ${count || 0}`)

    // Log the cleanup operation
    await supabase.from('scraper_logs').insert({
      job_url: null,
      source: 'system',
      status: 'cleanup',
      message: `Cleanup completed. ${count || 0} expired jobs found.`
    })

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Cleanup completed. ${count || 0} expired jobs found.`,
        expired_count: count || 0
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('💥 Cleanup error:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    // Log the error
    await supabase.from('scraper_logs').insert({
      job_url: null,
      source: 'system',
      status: 'error',
      message: `Cleanup failed: ${errorMessage}`
    })
    
    return new Response(
      JSON.stringify({ 
        error: 'Cleanup failed',
        message: errorMessage
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})