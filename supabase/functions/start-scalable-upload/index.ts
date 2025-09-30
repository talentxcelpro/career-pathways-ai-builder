import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('🚀 Start-scalable-upload function called', {
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

    console.log('📥 Parsing request body...');
    const { config, totalFiles, estimatedDuration } = await req.json();

    console.log('📋 Request data:', { config, totalFiles, estimatedDuration });

    // Validate configuration
    if (!config?.batchName) {
      console.error('❌ Validation failed: Batch name is required');
      throw new Error('Batch name is required');
    }

    if (totalFiles <= 0) {
      console.error('❌ Validation failed: No files to process');
      throw new Error('No files to process');
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

    // Create upload session record
    const sessionId = crypto.randomUUID();
    console.log('🆔 Generated session ID:', sessionId);
    
    const uploadSessionData = {
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
    };

    console.log('💾 Creating upload session with admin client:', uploadSessionData);

    // Use admin client to bypass RLS
    const { data: uploadSession, error: sessionError } = await supabaseAdmin
      .from('bulk_upload_batches')
      .insert(uploadSessionData)
      .select()
      .single();

    if (sessionError) {
      console.error('❌ Session creation failed:', sessionError);
      throw sessionError;
    }

    console.log('✅ Upload session created successfully:', uploadSession.id);

    console.log('📊 Upload session stats:', {
      sessionId,
      batchName: config.batchName,
      totalFiles,
      estimatedDuration,
      config
    });

    // Send notification email if configured
    if (config.notificationEmail) {
      console.log('📧 Sending notification email to:', config.notificationEmail);
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
        console.log('✅ Notification email sent successfully');
      } catch (emailError) {
        console.warn('⚠️ Failed to send notification email:', emailError);
      }
    }

    const response = {
      success: true,
      sessionId,
      uploadSession,
      message: 'Scalable upload session created successfully'
    };

    console.log('🎉 Returning success response:', response);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('💥 Critical error in start-scalable-upload:', {
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