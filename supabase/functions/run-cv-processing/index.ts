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

    // Get error CVs that can be reprocessed
    const { data: errorCVs, error: fetchError } = await supabase
      .from('cv_files')
      .select('*')
      .eq('parsing_status', 'error')
      .limit(50);

    if (fetchError) {
      console.error('❌ Error fetching error CVs:', fetchError);
      return new Response(JSON.stringify({
        success: false,
        error: fetchError.message
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!errorCVs || errorCVs.length === 0) {
      console.log('✅ No error CVs to reprocess');
      return new Response(JSON.stringify({
        success: true,
        message: 'No error CVs to reprocess',
        processed: 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`📋 Found ${errorCVs.length} error CVs to reprocess`);

    let processed = 0;
    let failed = 0;

    // Process each error CV
    for (const cv of errorCVs) {
      try {
        console.log(`🔄 Reprocessing CV: ${cv.original_filename} (${cv.id})`);

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

    console.log(`✅ Reprocessing complete: ${processed} processed, ${failed} failed`);

    return new Response(JSON.stringify({
      success: true,
      message: `Reprocessed ${processed} CVs, ${failed} failed`,
      processed,
      failed,
      total: errorCVs.length
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