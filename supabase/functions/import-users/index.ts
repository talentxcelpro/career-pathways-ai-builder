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
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the service role client (has admin privileges)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Verify the request is from an authenticated admin user
    const authHeader = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the user with the regular client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(authHeader);
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is admin (you may need to adjust this based on your user roles implementation)
    const { data: userRoles } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('is_active', true);

    const isAdmin = userRoles?.some(r => ['super_admin', 'admin'].includes(r.role));
    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Admin privileges required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { users }: ImportRequest = await req.json();

    const results = {
      successful: 0,
      failed: 0,
      errors: [] as string[]
    };

    // Process each user
    for (const userData of users) {
      try {
        console.log(`Creating user: ${userData.email}`);

        // Create user with admin privileges
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: userData.email,
          password: userData.temporaryPassword || 'TempPass123!',
          email_confirm: true
        });

        if (authError || !authData.user) {
          console.error('User creation failed:', authError);
          results.failed++;
          results.errors.push(`${userData.email}: ${authError?.message || 'Failed to create user account'}`);
          continue;
        }

        console.log(`✓ User account created: ${userData.email}`);

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
          console.error('Profile creation failed:', profileError);
          
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
        console.error('Unexpected error during user creation:', error);
        results.failed++;
        results.errors.push(`${userData.email}: ${error instanceof Error ? error.message : 'Unexpected error'}`);
      }
    }

    return new Response(
      JSON.stringify(results),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in import-users function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});