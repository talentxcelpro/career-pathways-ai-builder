
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

interface CreateUserRequest {
  userEmail: string;
  userName: string;
  userRole?: string;
  temporaryPassword?: string;
  healthCheck?: boolean;
  debug?: boolean;
}

interface CreateUserResponse {
  success: boolean;
  userId?: string;
  error?: string;
  healthCheck?: boolean;
  debug?: any;
}

const handler = async (req: Request): Promise<Response> => {
  const requestId = crypto.randomUUID().substring(0, 8);
  console.log(`[${requestId}] Received ${req.method} request to admin-create-user`);

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log(`[${requestId}] CORS preflight request`);
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Environment variable check
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    console.log(`[${requestId}] Environment check:`, {
      hasUrl: !!supabaseUrl,
      hasAnonKey: !!supabaseAnonKey,
      hasServiceKey: !!supabaseServiceKey,
      urlLength: supabaseUrl?.length || 0,
      anonKeyLength: supabaseAnonKey?.length || 0,
      serviceKeyLength: supabaseServiceKey?.length || 0
    });

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
      console.error(`[${requestId}] Missing required environment variables`);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Server configuration error: Missing required environment variables',
          debug: {
            hasUrl: !!supabaseUrl,
            hasAnonKey: !!supabaseAnonKey,
            hasServiceKey: !!supabaseServiceKey
          }
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Handle GET requests for health checks
    if (req.method === "GET") {
      console.log(`[${requestId}] Health check via GET method`);
      return new Response(
        JSON.stringify({ 
          success: true, 
          healthCheck: true, 
          message: "Edge Function is healthy",
          timestamp: new Date().toISOString(),
          requestId
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Get the authorization header
    const authorization = req.headers.get('authorization');
    if (!authorization) {
      console.error(`[${requestId}] No authorization header provided`);
      return new Response(
        JSON.stringify({ success: false, error: 'No authorization header' }),
        {
          status: 401,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`[${requestId}] Authorization header present, length:`, authorization.length);

    // Parse request body with better error handling
    let requestBody;
    try {
      const bodyText = await req.text();
      console.log(`[${requestId}] Request body length:`, bodyText.length);
      requestBody = JSON.parse(bodyText);
    } catch (parseError) {
      console.error(`[${requestId}] Failed to parse request body:`, parseError);
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid request body: ' + parseError.message }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Handle debug requests
    if (requestBody.debug) {
      console.log(`[${requestId}] Debug request received`);
      return new Response(
        JSON.stringify({ 
          success: true, 
          debug: true, 
          message: "Debug endpoint working",
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
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Handle health check requests
    if (requestBody.healthCheck) {
      console.log(`[${requestId}] Health check request received`);
      return new Response(
        JSON.stringify({ 
          success: true, 
          healthCheck: true, 
          message: "Edge Function is healthy and authenticated",
          timestamp: new Date().toISOString(),
          requestId
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const { userEmail, userName, userRole = 'job_seeker', temporaryPassword }: CreateUserRequest = requestBody;

    if (!userEmail || !userName) {
      console.error(`[${requestId}] Missing required fields:`, { userEmail: !!userEmail, userName: !!userName });
      return new Response(
        JSON.stringify({ success: false, error: 'Email and name are required' }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`[${requestId}] Creating user:`, userEmail, userName);

    // Create regular supabase client to verify admin status
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      global: {
        headers: {
          authorization
        }
      }
    });

    // Verify the user is authenticated and is an admin
    console.log(`[${requestId}] Verifying user authentication...`);
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error(`[${requestId}] Authentication error:`, userError);
      return new Response(
        JSON.stringify({ success: false, error: 'Authentication failed: ' + (userError?.message || 'No user') }),
        {
          status: 401,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`[${requestId}] User authenticated:`, user.email);

    // Check if user is admin using the existing function
    console.log(`[${requestId}] Checking admin privileges...`);
    const { data: isAdmin, error: adminError } = await supabase
      .rpc('is_app_admin', { _user_id: user.id });

    if (adminError || !isAdmin) {
      console.error(`[${requestId}] Admin check failed:`, adminError, 'isAdmin:', isAdmin);
      return new Response(
        JSON.stringify({ success: false, error: 'Admin privileges required' }),
        {
          status: 403,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`[${requestId}] Admin privileges verified`);

    // Create service role client for admin operations
    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log(`[${requestId}] Creating auth user...`);

    // Create the auth user with service role privileges
    const { data: authUser, error: createError } = await adminClient.auth.admin.createUser({
      email: userEmail,
      password: temporaryPassword || Math.random().toString(36).slice(-8),
      email_confirm: true, // Skip email confirmation for admin-created users
      user_metadata: {
        full_name: userName
      }
    });

    if (createError) {
      console.error(`[${requestId}] Failed to create auth user:`, createError);
      return new Response(
        JSON.stringify({ success: false, error: createError.message }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    if (!authUser.user) {
      console.error(`[${requestId}] User creation failed - no user returned`);
      return new Response(
        JSON.stringify({ success: false, error: 'User creation failed - no user returned' }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`[${requestId}] Auth user created:`, authUser.user.id);

    // Create the profile using service role client
    console.log(`[${requestId}] Creating profile...`);
    const { error: profileError } = await adminClient
      .from('profiles')
      .insert({
        id: authUser.user.id,
        email: userEmail,
        full_name: userName,
        user_role: userRole as any,
        profile_completed: false,
        first_login: true,
        onboarding_completed: false
      });

    if (profileError) {
      console.error(`[${requestId}] Failed to create profile:`, profileError);
      // If profile creation fails, we should clean up the auth user
      try {
        await adminClient.auth.admin.deleteUser(authUser.user.id);
        console.log(`[${requestId}] Cleaned up auth user after profile creation failure`);
      } catch (cleanupError) {
        console.error(`[${requestId}] Failed to cleanup auth user:`, cleanupError);
      }
      
      return new Response(
        JSON.stringify({ success: false, error: `Profile creation failed: ${profileError.message}` }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`[${requestId}] Profile created successfully for:`, userEmail);

    // Queue welcome email by calling the send-welcome-email function
    try {
      console.log(`[${requestId}] Queuing welcome email...`);
      const { error: emailError } = await adminClient.functions.invoke('send-welcome-email', {
        body: {
          userEmail,
          userName,
          temporaryPassword
        }
      });
      
      if (emailError) {
        console.error(`[${requestId}] Failed to queue welcome email:`, emailError);
        // Don't fail the whole operation if email fails
      } else {
        console.log(`[${requestId}] Welcome email queued successfully`);
      }
    } catch (emailError) {
      console.error(`[${requestId}] Error queuing welcome email:`, emailError);
      // Don't fail the whole operation if email fails
    }

    const response: CreateUserResponse = {
      success: true,
      userId: authUser.user.id
    };

    console.log(`[${requestId}] User creation completed successfully:`, userEmail);

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error(`[${requestId}] Error in admin-create-user function:`, error);
    console.error(`[${requestId}] Error stack:`, error.stack);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Internal server error',
        requestId 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
