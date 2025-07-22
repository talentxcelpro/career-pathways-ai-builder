import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface UserRecord {
  email: string;
  full_name?: string;
  user_role?: string;
  phone?: string;
  title?: string;
  location?: string;
  company?: string;
}

interface ImportProgress {
  total: number;
  processed: number;
  successful: number;
  failed: number;
  errors: string[];
  batchNumber: number;
  startTime: number;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== BULK CSV IMPORT STARTED ===');
    const startTime = Date.now();

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    if (!serviceRoleKey) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY not configured');
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Get request body
    const { csvData, batchSize = 500, maxConcurrent = 10 } = await req.json();
    
    if (!csvData || !Array.isArray(csvData)) {
      throw new Error('Invalid CSV data provided');
    }

    console.log(`Processing ${csvData.length} users in batches of ${batchSize}`);
    console.log(`Max concurrent batches: ${maxConcurrent}`);

    const progress: ImportProgress = {
      total: csvData.length,
      processed: 0,
      successful: 0,
      failed: 0,
      errors: [],
      batchNumber: 0,
      startTime
    };

    // Process in batches with concurrency control
    const batches: UserRecord[][] = [];
    for (let i = 0; i < csvData.length; i += batchSize) {
      batches.push(csvData.slice(i, i + batchSize));
    }

    console.log(`Created ${batches.length} batches for processing`);

    // Process batches with controlled concurrency
    const semaphore = new Array(maxConcurrent).fill(null);
    let batchIndex = 0;

    const processBatch = async (batch: UserRecord[], batchNum: number) => {
      console.log(`Processing batch ${batchNum + 1}/${batches.length} (${batch.length} users)`);
      const batchResults = {
        successful: 0,
        failed: 0,
        errors: [] as string[]
      };

      // Process users in the batch concurrently
      const userPromises = batch.map(async (userData) => {
        try {
          // Validate email
          if (!userData.email || !userData.email.includes('@')) {
            throw new Error(`Invalid email: ${userData.email}`);
          }

          // Create auth user
          const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
            email: userData.email,
            password: generateSecurePassword(),
            email_confirm: true,
            user_metadata: {
              full_name: userData.full_name || '',
              user_role: userData.user_role || 'user'
            }
          });

          if (authError) {
            // Check if user already exists
            if (authError.message.includes('already registered')) {
              console.log(`User already exists: ${userData.email}`);
              return { success: true, skipped: true };
            }
            throw authError;
          }

          // Create/update profile
          const profileData = {
            id: authUser.user.id,
            full_name: userData.full_name || '',
            user_role: (userData.user_role as any) || 'user',
            phone: userData.phone || null,
            title: userData.title || null,
            location: userData.location || null,
            company: userData.company || null,
            is_employer: userData.user_role === 'employer',
            employer_status: userData.user_role === 'employer' ? 'approved' : null,
            profile_completed: true,
            onboarding_completed: true,
            first_login: false
          };

          const { error: profileError } = await supabase
            .from('profiles')
            .upsert(profileData, { onConflict: 'id' });

          if (profileError) {
            console.error(`Profile creation failed for ${userData.email}:`, profileError);
            throw profileError;
          }

          return { success: true, userId: authUser.user.id };
        } catch (error) {
          const errorMsg = `Failed to create user ${userData.email}: ${error.message}`;
          console.error(errorMsg);
          return { success: false, error: errorMsg };
        }
      });

      // Wait for all users in batch to complete
      const results = await Promise.all(userPromises);
      
      results.forEach(result => {
        if (result.success) {
          batchResults.successful++;
        } else {
          batchResults.failed++;
          batchResults.errors.push(result.error);
        }
      });

      console.log(`Batch ${batchNum + 1} completed: ${batchResults.successful} successful, ${batchResults.failed} failed`);
      return batchResults;
    };

    // Process all batches with concurrency control
    const batchPromises = [];
    for (let i = 0; i < Math.min(maxConcurrent, batches.length); i++) {
      if (batches[batchIndex]) {
        batchPromises.push(processBatch(batches[batchIndex], batchIndex));
        batchIndex++;
      }
    }

    // Process remaining batches as others complete
    while (batchPromises.length > 0) {
      const result = await Promise.race(batchPromises);
      
      // Update progress
      progress.successful += result.successful;
      progress.failed += result.failed;
      progress.errors.push(...result.errors);
      progress.processed += result.successful + result.failed;
      progress.batchNumber++;

      // Remove completed promise and add new one if available
      const completedIndex = batchPromises.findIndex(p => p === result);
      batchPromises.splice(completedIndex, 1);

      if (batchIndex < batches.length) {
        batchPromises.push(processBatch(batches[batchIndex], batchIndex));
        batchIndex++;
      }
    }

    const endTime = Date.now();
    const totalTime = endTime - startTime;
    const usersPerSecond = Math.round((progress.total / totalTime) * 1000);

    console.log('=== BULK IMPORT COMPLETED ===');
    console.log(`Total time: ${totalTime}ms`);
    console.log(`Users per second: ${usersPerSecond}`);
    console.log(`Success rate: ${((progress.successful / progress.total) * 100).toFixed(2)}%`);

    return new Response(JSON.stringify({
      success: true,
      progress: {
        ...progress,
        totalTime,
        usersPerSecond,
        successRate: (progress.successful / progress.total) * 100
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('Bulk import error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      details: error.stack
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});

function generateSecurePassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 16; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}