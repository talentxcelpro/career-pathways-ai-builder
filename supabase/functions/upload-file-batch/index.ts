import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('🚀 Upload-file-batch function called', {
    method: req.method,
    url: req.url,
    headers: Object.fromEntries(req.headers.entries())
  });

  if (req.method === 'OPTIONS') {
    console.log('📋 Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔧 Creating Supabase clients...');
    
    // Create regular client for user authentication
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    // Create service role client for database operations (bypasses RLS)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    console.log('📥 Parsing request form data...');
    
    // Check if request has form data
    const contentType = req.headers.get('content-type') || '';
    
    if (!contentType.includes('multipart/form-data')) {
      console.error('❌ Invalid content type:', contentType);
      throw new Error('Request must contain multipart/form-data');
    }

    // Get form data
    const formData = await req.formData();
    const sessionId = formData.get('sessionId') as string;
    const batchIndex = parseInt(formData.get('batchIndex') as string);
    const config = JSON.parse(formData.get('config') as string);

    console.log('📋 Request data:', { sessionId, batchIndex, config });

    if (!sessionId) {
      console.error('❌ Validation failed: Session ID is required');
      throw new Error('Session ID is required');
    }

    console.log('✅ Validation passed, getting current user...');

    // Get current user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('❌ Authentication failed: No auth header');
      throw new Error('Authentication required');
    }

    console.log('🔐 Getting user from auth header...');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      console.error('❌ Authentication failed:', userError);
      throw new Error('Authentication failed');
    }

    console.log('✅ User authenticated:', user.id);

    // Get all files from formData
    const files = formData.getAll('files') as File[];
    
    if (files.length === 0) {
      console.error('❌ No files provided in batch');
      throw new Error('No files provided');
    }

    console.log(`📁 Processing batch ${batchIndex} with ${files.length} files for session ${sessionId}`);

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

        // Create CV file record using admin client to bypass RLS
        const { data: cvFileData, error: cvFileError } = await supabaseAdmin
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

    // Update batch progress using correct column names
    const successCount = uploadResults.filter(r => r.success).length;
    const errorCount = uploadResults.length - successCount;

    console.log(`📊 Batch ${batchIndex} summary: ${successCount} success, ${errorCount} errors`);

    // Use admin client to update batch progress (bypasses RLS)
    await supabaseAdmin
      .from('bulk_upload_batches')
      .update({
        processed_jobs: successCount,
        failed_jobs: errorCount,
        last_activity_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId);

    console.log('✅ Batch progress updated successfully');

    const response = {
      success: true,
      batchIndex,
      totalFiles: files.length,
      successCount,
      errorCount,
      results: uploadResults
    };

    console.log('🎉 Returning success response:', response);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('💥 Critical error in upload-file-batch:', {
      error: error.message,
      stack: error.stack,
      name: error.name
    });
    
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});