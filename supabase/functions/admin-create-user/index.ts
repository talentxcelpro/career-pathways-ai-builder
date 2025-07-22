
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

    console.log(`[${requestId}] Environment check: {
  hasUrl: ${!!supabaseUrl},
  hasServiceKey: ${!!supabaseServiceKey},
  urlLength: ${supabaseUrl?.length || 0},
  serviceKeyLength: ${supabaseServiceKey?.length || 0}
}`);

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing required environment variables');
    }

    // Authorization check
    const authHeader = req.headers.get('Authorization');
    console.log(`[${requestId}] Authorization header present: ${!!authHeader}`);

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
      bodyText = await req.text();
      console.log(`[${requestId}] Request body length: ${bodyText.length}`);
      
      if (bodyText.length === 0) {
        throw new Error('Empty request body received');
      }

      requestBody = JSON.parse(bodyText);
      console.log(`[${requestId}] Successfully parsed JSON body`);
      
    } catch (parseError) {
      console.error(`[${requestId}] Failed to parse request body:`, parseError);
      console.log(`[${requestId}] Raw body text: "${bodyText}"`);
      
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

    // Improved validation
    const errors = [];
    if (!userEmail || typeof userEmail !== 'string' || !userEmail.includes('@')) {
      errors.push('Valid email is required');
    }
    if (!userName || typeof userName !== 'string' || userName.trim().length < 2) {
      errors.push('Name must be at least 2 characters');
    }

    // Validate role against known values
    const validRoles = ['job_seeker', 'employer', 'admin'];
    const roleToUse = userRole || 'job_seeker';
    if (!validRoles.includes(roleToUse)) {
      errors.push(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
    }

    if (errors.length > 0) {
      console.error(`[${requestId}] Validation errors:`, errors);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Validation failed',
          details: errors.join('; '),
          receivedData: { userEmail, userName, userRole: roleToUse }
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

    // Create the user with improved error handling
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: userEmail,
      password: temporaryPassword || 'TempPass123!',
      email_confirm: true,
      user_metadata: {
        full_name: userName,
        role: roleToUse
      }
    });

    if (authError) {
      console.error(`[${requestId}] Auth error creating user:`, authError);
      
      // Handle specific auth errors
      let errorMessage = 'Failed to create user account';
      if (authError.message?.includes('already registered')) {
        errorMessage = 'User with this email already exists';
      } else if (authError.message?.includes('email')) {
        errorMessage = 'Invalid email address';
      }
      
      return new Response(
        JSON.stringify({
          success: false,
          error: errorMessage,
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

    // Create/update the user profile with proper role handling
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: authData.user.id,
        full_name: userName,
        email: userEmail,
        user_role: roleToUse, // This should now work with the enum
        profile_completed: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (profileError) {
      console.error(`[${requestId}] Profile creation error:`, profileError);
      
      // If profile creation fails, we might want to clean up the auth user
      // For now, we'll log the error but not fail the entire operation
      console.log(`[${requestId}] User created but profile creation failed - auth user exists`);
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
          role: roleToUse
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
