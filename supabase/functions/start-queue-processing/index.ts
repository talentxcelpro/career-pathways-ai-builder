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

    const { batchSize = 2000, concurrentJobs = 5, priority = 'medium' } = await req.json();

    // Get pending CV files
    const { data: pendingFiles, error: filesError } = await supabaseClient
      .from('cv_files')
      .select('id, original_filename, file_url, file_type, batch_id')
      .eq('parsing_status', 'pending')
      .limit(batchSize);

    if (filesError) throw filesError;

    if (!pendingFiles || pendingFiles.length === 0) {
      return new Response(JSON.stringify({
        success: false,
        message: 'No pending files to process'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Starting queue processing: ${pendingFiles.length} files, batch size: ${batchSize}, concurrent: ${concurrentJobs}`);

    // Process files in parallel batches
    const promises: Promise<any>[] = [];
    
    for (let i = 0; i < Math.min(concurrentJobs, pendingFiles.length); i++) {
      const file = pendingFiles[i];
      
      if (file) {
        promises.push(
          processFileAsync(supabaseClient, file)
        );
      }
    }

    // Start initial batch
    Promise.allSettled(promises).then(results => {
      console.log(`Initial batch completed: ${results.length} files processed`);
      
      // Continue processing remaining files
      if (pendingFiles.length > concurrentJobs) {
        continueProcessing(supabaseClient, pendingFiles.slice(concurrentJobs), concurrentJobs);
      }
    });

    return new Response(JSON.stringify({
      success: true,
      message: `Queue processing started: ${pendingFiles.length} files`,
      stats: {
        totalFiles: pendingFiles.length,
        batchSize,
        concurrentJobs,
        priority
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error starting queue processing:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function processFileAsync(supabaseClient: any, file: any) {
  try {
    // Update status to processing
    await supabaseClient
      .from('cv_files')
      .update({ 
        parsing_status: 'processing',
        updated_at: new Date().toISOString()
      })
      .eq('id', file.id);

    // Call CV parser
    const { data: result, error: parseError } = await supabaseClient.functions.invoke('cv-parser', {
      body: {
        fileUrl: file.file_url,
        fileName: file.original_filename,
        fileType: file.file_type,
        batchId: file.batch_id,
        cvFileId: file.id
      }
    });

    if (parseError) throw parseError;

    console.log(`Successfully processed file: ${file.original_filename}`);
    return { success: true, file: file.id, result };

  } catch (error) {
    console.error(`Failed to process file ${file.original_filename}:`, error);
    
    // Update status to error
    await supabaseClient
      .from('cv_files')
      .update({ 
        parsing_status: 'error',
        parsing_error: error.message,
        updated_at: new Date().toISOString()
      })
      .eq('id', file.id);

    return { success: false, file: file.id, error: error.message };
  }
}

async function continueProcessing(supabaseClient: any, remainingFiles: any[], concurrentJobs: number) {
  for (let i = 0; i < remainingFiles.length; i += concurrentJobs) {
    const batch = remainingFiles.slice(i, i + concurrentJobs);
    const promises = batch.map(file => processFileAsync(supabaseClient, file));
    
    try {
      await Promise.allSettled(promises);
      console.log(`Processed batch ${Math.floor(i / concurrentJobs) + 1}`);
      
      // Small delay between batches to prevent overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error('Batch processing error:', error);
    }
  }
  
  console.log('Queue processing completed');
}