import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.1";
import { corsHeaders } from "../_shared/cors.ts";

// Force redeployment - Updated timestamp: 2025-07-12T05:26:00Z

Deno.serve(async (req) => {
  console.log(`[${new Date().toISOString()}] Received ${req.method} request from ${req.headers.get('Origin')} to admin-create-user`)
  
  try {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      console.log('Handling CORS preflight request')
      return new Response('ok', { headers: corsHeaders });
    }

    // Health check endpoint
    if (req.method === 'GET') {
      console.log('Health check request')
      return new Response(JSON.stringify({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        service: 'admin-create-user',
        env_check: {
          has_supabase_url: !!Deno.env.get('SUPABASE_URL'),
          has_service_role: !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
          has_anon_key: !!Deno.env.get('SUPABASE_ANON_KEY')
        }
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Only handle POST requests for user creation
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Processing POST request for user creation')

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header provided')
      return new Response(JSON.stringify({ error: 'Authorization header missing' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify the user is authenticated and is an admin
    const token = authHeader.replace('Bearer ', '');
    
    // Create a client with the user's token for permission checking
    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    );

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    
    if (userError || !user) {
      console.error('User verification error:', userError);
      return new Response(JSON.stringify({ error: 'Invalid token or user not found' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('User authenticated:', user.email);

    // Check if user is admin - check user_roles table directly
    let isAdmin = false;
    
    try {
      // Method 1: Check user_roles table using admin client
      const { data: userRoles, error: rolesError } = await supabaseAdmin
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .in('role', ['super_admin', 'admin']);
      
      if (!rolesError && userRoles && userRoles.length > 0) {
        isAdmin = true;
        console.log('Admin verified via user_roles table:', userRoles[0].role);
      } else {
        // Method 2: Fallback - check email directly for super admin
        const { data: adminUser, error: emailCheckError } = await supabaseAdmin.auth.admin.getUserById(user.id);
        if (!emailCheckError && adminUser?.user?.email === 'talentxcelpro@gmail.com') {
          isAdmin = true;
          console.log('Admin verified via direct email check (super admin)');
        }
      }
    } catch (error) {
      console.error('Admin check failed:', error);
      // Try email fallback as last resort
      try {
        const { data: adminUser, error: emailCheckError } = await supabaseAdmin.auth.admin.getUserById(user.id);
        if (!emailCheckError && adminUser?.user?.email === 'talentxcelpro@gmail.com') {
          isAdmin = true;
          console.log('Admin verified via email fallback');
        }
      } catch (emailError) {
        console.error('All admin checks failed:', emailError);
      }
    }

    if (!isAdmin) {
      console.error('User is not admin:', user.email);
      return new Response(JSON.stringify({ error: 'Insufficient permissions. Admin access required.' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { email, password, fullName, role, status, sendWelcomeEmail } = await req.json();

    console.log('Creating user:', { email, fullName, role, status });

    // Create the user in Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        full_name: fullName
      },
      email_confirm: true // Auto-confirm email
    });

    if (authError) {
      console.error('Auth error:', authError);
      return new Response(JSON.stringify({ error: authError.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('User created in auth:', authData.user.id);

    // Create profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: authData.user.id,
        full_name: fullName,
        email: email,
        user_role: role,
        profile_completed: status === 'active'
      });

    if (profileError) {
      console.error('Profile error:', profileError);
      // Clean up auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return new Response(JSON.stringify({ error: 'Failed to create user profile' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Profile created successfully');

    // Send welcome email if requested
    if (sendWelcomeEmail) {
      try {
        const { error: emailError } = await supabaseAdmin.functions.invoke('send-welcome-email', {
          body: {
            userEmail: email,
            userName: fullName,
            temporaryPassword: password
          }
        });
        
        if (emailError) {
          console.error('Welcome email error:', emailError);
        }
      } catch (emailErr) {
        console.error('Failed to send welcome email:', emailErr);
      }
    }

    console.log('User creation completed successfully');

    return new Response(JSON.stringify({ 
      success: true, 
      user: {
        id: authData.user.id,
        email: authData.user.email,
        full_name: fullName,
        user_role: role
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Function error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});