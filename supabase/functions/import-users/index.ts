
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
  batchSize?: number;
  maxConcurrency?: number;
}

interface BatchResult {
  successful: number;
  failed: number;
  errors: string[];
  processedBatches: number;
  totalBatches: number;
}

serve(async (req) => {
  console.log('=== Enhanced Batch Import Users Function Called ===');
  console.log('Method:', req.method);
  console.log('Timestamp:', new Date().toISOString());

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

    // Admin check
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

    const { users, batchSize = 100, maxConcurrency = 5 }: ImportRequest = requestBody;

    if (!users || !Array.isArray(users) || users.length === 0) {
      console.error('No users provided in request');
      return new Response(
        JSON.stringify({ error: 'No users provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Starting enhanced batch processing:`);
    console.log(`- Total users: ${users.length}`);
    console.log(`- Batch size: ${batchSize}`);
    console.log(`- Max concurrency: ${maxConcurrency}`);

    const startTime = Date.now();
    const result = await processBatchesWithConcurrency(
      supabaseAdmin, 
      users, 
      batchSize, 
      maxConcurrency
    );

    const endTime = Date.now();
    const processingTime = endTime - startTime;

    console.log(`Batch processing completed in ${processingTime}ms`);
    console.log('Final results:', result);

    return new Response(
      JSON.stringify({
        ...result,
        processingTimeMs: processingTime,
        usersPerSecond: Math.round((users.length * 1000) / processingTime)
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Critical error in enhanced import-users function:', error);
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

async function processBatchesWithConcurrency(
  supabaseAdmin: any,
  users: UserImportData[],
  batchSize: number,
  maxConcurrency: number
): Promise<BatchResult> {
  const batches = [];
  
  // Split users into batches
  for (let i = 0; i < users.length; i += batchSize) {
    batches.push(users.slice(i, i + batchSize));
  }

  console.log(`Created ${batches.length} batches of size ${batchSize}`);

  const result: BatchResult = {
    successful: 0,
    failed: 0,
    errors: [],
    processedBatches: 0,
    totalBatches: batches.length
  };

  // Process batches with concurrency control
  for (let i = 0; i < batches.length; i += maxConcurrency) {
    const currentBatches = batches.slice(i, i + maxConcurrency);
    
    console.log(`Processing batch group ${Math.floor(i / maxConcurrency) + 1}/${Math.ceil(batches.length / maxConcurrency)}`);
    
    const batchPromises = currentBatches.map((batch, batchIndex) => 
      processBatch(supabaseAdmin, batch, i + batchIndex + 1)
    );

    const batchResults = await Promise.allSettled(batchPromises);

    // Aggregate results
    for (const batchResult of batchResults) {
      if (batchResult.status === 'fulfilled') {
        const { successful, failed, errors } = batchResult.value;
        result.successful += successful;
        result.failed += failed;
        result.errors.push(...errors);
      } else {
        console.error('Batch processing failed:', batchResult.reason);
        result.errors.push(`Batch processing failed: ${batchResult.reason}`);
      }
      result.processedBatches++;
    }

    // Small delay between batch groups to prevent overwhelming the database
    if (i + maxConcurrency < batches.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  return result;
}

async function processBatch(
  supabaseAdmin: any,
  users: UserImportData[],
  batchNumber: number
): Promise<{ successful: number; failed: number; errors: string[] }> {
  console.log(`Processing batch ${batchNumber} with ${users.length} users`);
  
  const batchResult = {
    successful: 0,
    failed: 0,
    errors: [] as string[]
  };

  // Process users in parallel within the batch
  const userPromises = users.map(userData => processUser(supabaseAdmin, userData));
  const userResults = await Promise.allSettled(userPromises);

  for (let i = 0; i < userResults.length; i++) {
    const userResult = userResults[i];
    const userData = users[i];

    if (userResult.status === 'fulfilled') {
      if (userResult.value.success) {
        batchResult.successful++;
      } else {
        batchResult.failed++;
        batchResult.errors.push(`${userData.email}: ${userResult.value.error}`);
      }
    } else {
      batchResult.failed++;
      batchResult.errors.push(`${userData.email}: ${userResult.reason}`);
    }
  }

  console.log(`Batch ${batchNumber} completed: ${batchResult.successful} success, ${batchResult.failed} failed`);
  return batchResult;
}

async function processUser(
  supabaseAdmin: any,
  userData: UserImportData
): Promise<{ success: boolean; error?: string }> {
  try {
    // Create user with admin privileges
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: userData.email,
      password: userData.temporaryPassword || 'TempPass123!',
      email_confirm: true
    });

    if (authError || !authData.user) {
      return { success: false, error: authError?.message || 'Failed to create user account' };
    }

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
      // Cleanup: Delete the auth user since profile creation failed
      try {
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      } catch (cleanupError) {
        console.error('Failed to cleanup auth user:', cleanupError);
      }
      
      return { success: false, error: `Profile creation failed - ${profileError.message}` };
    }

    return { success: true };

  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unexpected error' 
    };
  }
}
