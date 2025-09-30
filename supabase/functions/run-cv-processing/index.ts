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

    // Get pending CVs
    const { data: pendingCVs, error: fetchError } = await supabase
      .from('cv_files')
      .select('*')
      .eq('parsing_status', 'pending')
      .limit(50);

    if (fetchError) {
      console.error('❌ Error fetching pending CVs:', fetchError);
      return new Response(JSON.stringify({
        success: false,
        error: fetchError.message
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!pendingCVs || pendingCVs.length === 0) {
      console.log('✅ No pending CVs to process');
      return new Response(JSON.stringify({
        success: true,
        message: 'No pending CVs to process',
        processed: 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`📋 Found ${pendingCVs.length} pending CVs to process`);

    let processed = 0;
    let failed = 0;

    // Process each CV
    for (const cv of pendingCVs) {
      try {
        console.log(`🔄 Processing CV: ${cv.original_filename} (${cv.id})`);

        // Call fix-cv-processing for this specific CV
        const { data: result, error } = await supabase.functions.invoke('fix-cv-processing', {
          body: { cvId: cv.id }
        });

        if (error) {
          console.error(`❌ Failed to process CV ${cv.id}:`, error);
          failed++;
        } else {
          console.log(`✅ Successfully processed CV ${cv.id}:`, result);
          processed++;
        }
      } catch (error) {
        console.error(`❌ Error processing CV ${cv.id}:`, error);
        failed++;
      }
    }

    console.log(`✅ Processing complete: ${processed} processed, ${failed} failed`);

    return new Response(JSON.stringify({
      success: true,
      message: `Processed ${processed} CVs, ${failed} failed`,
      processed,
      failed,
      total: pendingCVs.length
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