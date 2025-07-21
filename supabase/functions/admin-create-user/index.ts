
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

serve(async (req) => {
  const requestId = Math.random().toString(36).substring(2, 10);
  console.log(`[${requestId}] Received ${req.method} request to admin-create-user`);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log(`[${requestId}] CORS preflight request`);
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Environment validation
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');

    console.log(`[${requestId}] Environment check: {
  hasUrl: ${!!supabaseUrl},
  hasAnonKey: ${!!supabaseAnonKey},
  hasServiceKey: ${!!supabaseServiceKey},
  urlLength: ${supabaseUrl?.length || 0},
  anonKeyLength: ${supabaseAnonKey?.length || 0},
  serviceKeyLength: ${supabaseServiceKey?.length || 0}
}`);

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing required environment variables');
    }

    // Authorization check
    const authHeader = req.headers.get('Authorization');
    console.log(`[${requestId}] Authorization header present, length: ${authHeader?.length || 0}`);

    // Handle GET request for health checks
    if (req.method === 'GET') {
      console.log(`[${requestId}] Health check via GET method`);
      return new Response(
        JSON.stringify({ 
          success: true, 
          healthCheck: true,
          message: 'Edge Function is healthy',
          timestamp: new Date().toISOString()
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    // Parse request body with multiple methods
    let requestBody = null;
    let bodyText = '';
    
    try {
      // Method 1: Try to get text first
      bodyText = await req.text();
      console.log(`[${requestId}] Request body length: ${bodyText.length}`);
      console.log(`[${requestId}] Request body preview: ${bodyText.substring(0, 200)}`);
      
      if (bodyText.length === 0) {
        throw new Error('Empty request body received');
      }

      // Method 2: Parse JSON from text
      requestBody = JSON.parse(bodyText);
      console.log(`[${requestId}] Successfully parsed JSON body`);
      
    } catch (parseError) {
      console.error(`[${requestId}] Failed to parse request body:`, parseError);
      console.log(`[${requestId}] Raw body text: "${bodyText}"`);
      console.log(`[${requestId}] Content-Type: ${req.headers.get('content-type')}`);
      
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid request body format',
          details: parseError.message,
          receivedBodyLength: bodyText.length,
          contentType: req.headers.get('content-type')
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    // Handle debug requests
    if (requestBody.debug === true) {
      console.log(`[${requestId}] Debug request received`);
      return new Response(
        JSON.stringify({
          success: true,
          debug: true,
          message: 'Debug endpoint working',
          environment: {
            hasUrl: !!supabaseUrl,
            hasAnonKey: !!supabaseAnonKey,
            hasServiceKey: !!supabaseServiceKey,
            urlLength: supabaseUrl?.length || 0,
            anonKeyLength: supabaseAnonKey?.length || 0,
            serviceKeyLength: supabaseServiceKey?.length || 0
          },
          timestamp: new Date().toISOString(),
          requestId
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    // Handle health check requests
    if (requestBody.healthCheck === true) {
      console.log(`[${requestId}] Health check request received`);
      return new Response(
        JSON.stringify({
          success: true,
          healthCheck: true,
          message: 'Edge Function is healthy',
          timestamp: new Date().toISOString(),
          requestId
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    // Validate required fields for user creation
    const { userEmail, userName, userRole, temporaryPassword } = requestBody;
    
    console.log(`[${requestId}] Received user data: {
  userEmail: "${userEmail}",
  userName: "${userName}",
  userRole: "${userRole}",
  hasPassword: ${!!temporaryPassword}
}`);

    const missingFields = {
      userEmail: !userEmail,
      userName: !userName
    };

    if (missingFields.userEmail || missingFields.userName) {
      console.error(`[${requestId}] Missing required fields:`, missingFields);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing required fields',
          details: 'Email and name are required',
          missingFields,
          receivedData: { userEmail, userName, userRole }
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    // Create Supabase admin client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log(`[${requestId}] Creating user with email: ${userEmail}`);

    // Create the user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: userEmail,
      password: temporaryPassword || 'TempPass123!',
      email_confirm: true,
      user_metadata: {
        full_name: userName,
        role: userRole || 'job_seeker'
      }
    });

    if (authError) {
      console.error(`[${requestId}] Auth error creating user:`, authError);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to create user account',
          details: authError.message
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    if (!authData.user) {
      console.error(`[${requestId}] No user data returned from auth.admin.createUser`);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'User creation failed - no user data returned'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }

    console.log(`[${requestId}] User created successfully with ID: ${authData.user.id}`);

    // Create/update the user profile
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: authData.user.id,
        full_name: userName,
        email: userEmail,
        user_role: userRole || 'job_seeker',
        profile_completed: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (profileError) {
      console.error(`[${requestId}] Profile creation error:`, profileError);
      // Don't fail the entire operation if profile creation fails
      console.log(`[${requestId}] User created but profile creation failed - continuing`);
    } else {
      console.log(`[${requestId}] Profile created/updated successfully`);
    }

    console.log(`[${requestId}] User creation process completed successfully`);

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: authData.user.id,
          email: userEmail,
          name: userName,
          role: userRole || 'job_seeker'
        },
        message: 'User created successfully'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error(`[${requestId}] Unexpected error:`, error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal server error',
        details: error.message,
        requestId
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
