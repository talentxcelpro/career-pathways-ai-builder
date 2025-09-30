import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Starting CV processing pipeline...');

    // Call the fix-cv-processing function
    const { data: cvResult, error: cvError } = await supabase.functions.invoke('fix-cv-processing', {
      body: {}
    });

    if (cvError) {
      console.error('❌ CV processing failed:', cvError);
      return new Response(JSON.stringify({
        success: false,
        error: cvError.message,
        step: 'cv_processing'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('✅ CV processing completed:', cvResult);

    // Call email queue processing
    const { data: emailResult, error: emailError } = await supabase.functions.invoke('process-email-queue', {
      body: {}
    });

    if (emailError) {
      console.error('⚠️ Email processing failed (non-critical):', emailError);
    } else {
      console.log('✅ Email processing completed:', emailResult);
    }

    return new Response(JSON.stringify({
      success: true,
      cvProcessing: cvResult,
      emailProcessing: emailResult
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Pipeline error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});