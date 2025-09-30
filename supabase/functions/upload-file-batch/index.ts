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

    // Check if request has form data
    const contentType = req.headers.get('content-type') || '';
    
    if (!contentType.includes('multipart/form-data')) {
      throw new Error('Request must contain multipart/form-data');
    }

    // Get form data
    const formData = await req.formData();
    const sessionId = formData.get('sessionId') as string;
    const batchIndex = parseInt(formData.get('batchIndex') as string);
    const config = JSON.parse(formData.get('config') as string);

    if (!sessionId) {
      throw new Error('Session ID is required');
    }

    // Get current user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authentication required');
    }

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      throw new Error('Authentication failed');
    }

    // Get all files from formData
    const files = formData.getAll('files') as File[];
    
    if (files.length === 0) {
      throw new Error('No files provided');
    }

    console.log(`Processing batch ${batchIndex} with ${files.length} files for session ${sessionId}`);

    const uploadResults = [];

    // Process each file in the batch
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      try {
        // Upload file to storage
        const fileName = `cv-uploads/${sessionId}/${batchIndex}_${i}_${file.name}`;
        const { data: uploadData, error: uploadError } = await supabaseClient.storage
          .from('cv-files')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;

        // Create CV file record
        const { data: cvFileData, error: cvFileError } = await supabaseClient
          .from('cv_files')
          .insert({
            original_filename: file.name,
            file_url: uploadData.path,
            file_type: file.type,
            file_size: file.size,
            batch_id: sessionId,
            uploaded_by: user.id,
            parsing_status: 'pending'
          })
          .select()
          .single();

        if (cvFileError) throw cvFileError;

        // Queue for AI parsing if enabled
        if (config.autoGenerateProfiles) {
          await supabaseClient.functions.invoke('cv-parser', {
            body: {
              fileUrl: uploadData.path,
              fileName: file.name,
              fileType: file.type,
              batchId: sessionId,
              cvFileId: cvFileData.id
            }
          });
        }

        uploadResults.push({
          success: true,
          fileName: file.name,
          cvFileId: cvFileData.id
        });

      } catch (error) {
        console.error(`Failed to process file ${file.name}:`, error);
        uploadResults.push({
          success: false,
          fileName: file.name,
          error: error.message
        });
      }
    }

    // Update batch progress
    const successCount = uploadResults.filter(r => r.success).length;
    const errorCount = uploadResults.length - successCount;

    await supabaseClient
      .from('bulk_upload_batches')
      .update({
        files_processed: successCount,
        processing_errors: errorCount,
        last_activity_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId);

    return new Response(JSON.stringify({
      success: true,
      batchIndex,
      totalFiles: files.length,
      successCount,
      errorCount,
      results: uploadResults
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error processing file batch:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});