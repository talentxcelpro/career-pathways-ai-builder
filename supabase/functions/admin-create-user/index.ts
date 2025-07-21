
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface CreateUserRequest {
  userEmail: string;
  userName: string;
  userRole?: string;
  temporaryPassword?: string;
}

interface CreateUserResponse {
  success: boolean;
  userId?: string;
  error?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authorization = req.headers.get('authorization');
    if (!authorization) {
      return new Response(
        JSON.stringify({ success: false, error: 'No authorization header' }),
        {
          status: 401,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Create regular supabase client to verify admin status
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

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
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('Authentication error:', userError);
      return new Response(
        JSON.stringify({ success: false, error: 'Authentication failed' }),
        {
          status: 401,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Check if user is admin using the existing function
    const { data: isAdmin, error: adminError } = await supabase
      .rpc('is_app_admin', { _user_id: user.id });

    if (adminError || !isAdmin) {
      console.error('Admin check failed:', adminError);
      return new Response(
        JSON.stringify({ success: false, error: 'Admin privileges required' }),
        {
          status: 403,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Parse request body
    const { userEmail, userName, userRole = 'job_seeker', temporaryPassword }: CreateUserRequest = await req.json();

    if (!userEmail || !userName) {
      return new Response(
        JSON.stringify({ success: false, error: 'Email and name are required' }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Create service role client for admin operations
    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log('Creating user:', userEmail, userName);

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
      console.error('Failed to create auth user:', createError);
      return new Response(
        JSON.stringify({ success: false, error: createError.message }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    if (!authUser.user) {
      return new Response(
        JSON.stringify({ success: false, error: 'User creation failed - no user returned' }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log('Auth user created:', authUser.user.id);

    // Create the profile using service role client
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
      console.error('Failed to create profile:', profileError);
      // If profile creation fails, we should clean up the auth user
      await adminClient.auth.admin.deleteUser(authUser.user.id);
      
      return new Response(
        JSON.stringify({ success: false, error: `Profile creation failed: ${profileError.message}` }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log('Profile created successfully for:', userEmail);

    // Queue welcome email by calling the send-welcome-email function
    try {
      const { error: emailError } = await adminClient.functions.invoke('send-welcome-email', {
        body: {
          userEmail,
          userName,
          temporaryPassword
        }
      });
      
      if (emailError) {
        console.error('Failed to queue welcome email:', emailError);
        // Don't fail the whole operation if email fails
      }
    } catch (emailError) {
      console.error('Error queuing welcome email:', emailError);
      // Don't fail the whole operation if email fails
    }

    const response: CreateUserResponse = {
      success: true,
      userId: authUser.user.id
    };

    console.log('User creation completed successfully:', userEmail);

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Error in admin-create-user function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
