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

    const { config, totalFiles, estimatedDuration } = await req.json();

    // Validate configuration
    if (!config?.batchName) {
      throw new Error('Batch name is required');
    }

    if (totalFiles <= 0) {
      throw new Error('No files to process');
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

    // Create upload session record
    const sessionId = crypto.randomUUID();
    
    const { data: uploadSession, error: sessionError } = await supabaseClient
      .from('bulk_upload_batches')
      .insert({
        id: sessionId,
        batch_name: config.batchName,
        total_files: totalFiles,
        uploaded_by: user.id,
        processing_status: 'pending',
        upload_data: {
          config,
          estimatedDuration,
          sessionStarted: new Date().toISOString(),
          priority: config.priority || 'medium',
          batchSize: config.batchSize || 2000,
          concurrentProcessing: config.concurrentProcessing || 5
        }
      })
      .select()
      .single();

    if (sessionError) throw sessionError;

    console.log('Scalable upload session created:', {
      sessionId,
      batchName: config.batchName,
      totalFiles,
      estimatedDuration,
      config
    });

    // Send notification email if configured
    if (config.notificationEmail) {
      try {
        await supabaseClient.functions.invoke('send-notification-email', {
          body: {
            to: config.notificationEmail,
            subject: `Upload Session Started: ${config.batchName}`,
            template: 'upload_started',
            data: {
              batchName: config.batchName,
              totalFiles,
              estimatedDuration,
              sessionId
            }
          }
        });
      } catch (emailError) {
        console.warn('Failed to send notification email:', emailError);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      sessionId,
      uploadSession,
      message: 'Scalable upload session created successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error starting scalable upload:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});