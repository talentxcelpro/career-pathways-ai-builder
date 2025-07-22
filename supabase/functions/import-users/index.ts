
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UserImportData {
  email: string;
  name: string;
  role: string;
  temporaryPassword?: string;
}

interface ImportRequest {
  users: UserImportData[];
}

serve(async (req) => {
  console.log('=== Import Users Function Called ===');
  console.log('Method:', req.method);
  console.log('Headers:', Object.fromEntries(req.headers.entries()));

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
    
    console.log('Environment check:');
    console.log('- SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
    console.log('- SUPABASE_SERVICE_ROLE_KEY:', serviceRoleKey ? 'Set' : 'Missing');
    console.log('- SUPABASE_ANON_KEY:', anonKey ? 'Set' : 'Missing');

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('Missing required environment variables');
      return new Response(
        JSON.stringify({ 
          error: 'Server configuration error - missing environment variables',
          details: {
            supabaseUrl: !!supabaseUrl,
            serviceRoleKey: !!serviceRoleKey
          }
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the service role client (has admin privileges)
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log('Service role client created');

    // Verify the request is from an authenticated user
    const authHeader = req.headers.get('Authorization')?.replace('Bearer ', '');
    console.log('Auth header present:', !!authHeader);
    
    if (!authHeader) {
      console.error('No authorization header provided');
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the user with the regular client
    const supabaseClient = createClient(supabaseUrl, anonKey);
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(authHeader);
    
    console.log('User verification:');
    console.log('- User ID:', user?.id);
    console.log('- User email:', user?.email);
    console.log('- Auth error:', authError?.message);
    
    if (authError || !user) {
      console.error('Authentication failed:', authError);
      return new Response(
        JSON.stringify({ error: 'Invalid authentication', details: authError?.message }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Simplified admin check - check if user email is the super admin
    const isAdmin = user.email === 'talentxcelpro@gmail.com';
    console.log('Admin check result:', isAdmin);
    
    if (!isAdmin) {
      console.error('User is not admin:', user.email);
      return new Response(
        JSON.stringify({ error: 'Admin privileges required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    let requestBody;
    try {
      requestBody = await req.json();
      console.log('Request body parsed, users count:', requestBody?.users?.length);
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { users }: ImportRequest = requestBody;

    if (!users || !Array.isArray(users) || users.length === 0) {
      console.error('No users provided in request');
      return new Response(
        JSON.stringify({ error: 'No users provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results = {
      successful: 0,
      failed: 0,
      errors: [] as string[]
    };

    console.log(`Starting to process ${users.length} users`);

    // Process each user
    for (const userData of users) {
      try {
        console.log(`Processing user: ${userData.email}`);

        // Create user with admin privileges
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: userData.email,
          password: userData.temporaryPassword || 'TempPass123!',
          email_confirm: true
        });

        if (authError || !authData.user) {
          console.error('User creation failed for', userData.email, ':', authError);
          results.failed++;
          results.errors.push(`${userData.email}: ${authError?.message || 'Failed to create user account'}`);
          continue;
        }

        console.log(`✓ User account created: ${userData.email}, ID: ${authData.user.id}`);

        // Create user profile
        const { error: profileError } = await supabaseAdmin
          .from('profiles')
          .insert({
            id: authData.user.id,
            full_name: userData.name,
            user_role: userData.role as any,
            is_employer: userData.role === 'employer',
            employer_status: userData.role === 'employer' ? 'approved' : null,
            profile_completed: true,
            onboarding_completed: true,
            first_login: false
          });

        if (profileError) {
          console.error('Profile creation failed for', userData.email, ':', profileError);
          
          // Cleanup: Delete the auth user since profile creation failed
          try {
            await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
            console.log('Cleaned up auth user after profile creation failure');
          } catch (cleanupError) {
            console.error('Failed to cleanup auth user:', cleanupError);
          }
          
          results.failed++;
          results.errors.push(`${userData.email}: Profile creation failed - ${profileError.message}`);
          continue;
        }

        console.log(`✓ User profile created: ${userData.email}`);
        results.successful++;

      } catch (error) {
        console.error('Unexpected error during user creation for', userData.email, ':', error);
        results.failed++;
        results.errors.push(`${userData.email}: ${error instanceof Error ? error.message : 'Unexpected error'}`);
      }
    }

    console.log('Final results:', results);

    return new Response(
      JSON.stringify(results),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Critical error in import-users function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: 'Check function logs for more information'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
