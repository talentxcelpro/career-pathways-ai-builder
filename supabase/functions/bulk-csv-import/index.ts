
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
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
  console.log(`=== BULK CSV IMPORT REQUEST ===`);
  console.log(`Method: ${req.method}`);
  console.log(`URL: ${req.url}`);
  console.log(`Headers:`, Object.fromEntries(req.headers.entries()));

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const startTime = Date.now();
    console.log('=== BULK CSV IMPORT STARTED ===');

    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    console.log('Auth header present:', !!authHeader);
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    console.log('Environment check:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!serviceRoleKey,
      urlLength: supabaseUrl?.length || 0,
      keyLength: serviceRoleKey?.length || 0
    });

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing required environment variables');
    }

    // Create client with service role for admin operations
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Get and validate request body
    let requestBody;
    try {
      requestBody = await req.json();
      console.log('Request body received:', {
        isTest: !!requestBody.test,
        hasCsvData: !!requestBody.csvData,
        csvDataLength: requestBody.csvData?.length || 0,
        batchSize: requestBody.batchSize,
        maxConcurrent: requestBody.maxConcurrent
      });
    } catch (error) {
      console.error('Failed to parse request body:', error);
      throw new Error('Invalid JSON in request body');
    }

    // Verify user authentication for non-test requests
    if (!requestBody.test && authHeader) {
      try {
        // Create a regular client to verify the user token
        const userSupabase = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
          global: {
            headers: { Authorization: authHeader }
          }
        });
        
        const { data: { user }, error: authError } = await userSupabase.auth.getUser();
        
        if (authError || !user) {
          console.error('Authentication failed:', authError);
          throw new Error('Authentication failed: Invalid or expired token');
        }
        
        console.log('User authenticated:', user.email);
      } catch (authError) {
        console.error('Auth verification failed:', authError);
        throw new Error('Authentication required');
      }
    }

    // Handle test connection requests
    if (requestBody.test) {
      console.log('=== CONNECTION TEST SUCCESSFUL ===');
      return new Response(JSON.stringify({
        success: true,
        message: 'Connection test successful',
        timestamp: new Date().toISOString(),
        service: 'bulk-csv-import'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      });
    }

    const { csvData, batchSize = 100, maxConcurrent = 5 } = requestBody;
    
    if (!csvData || !Array.isArray(csvData)) {
      throw new Error('Invalid CSV data provided - must be an array');
    }

    if (csvData.length === 0) {
      throw new Error('No user data provided in CSV');
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

    // Process users sequentially in smaller batches for better reliability
    const processBatch = async (users: UserRecord[], batchIndex: number): Promise<{successful: number, failed: number, errors: string[]}> => {
      console.log(`\n--- Processing Batch ${batchIndex + 1} (${users.length} users) ---`);
      
      const batchResults = {
        successful: 0,
        failed: 0,
        errors: [] as string[]
      };

      // Process each user in the batch
      for (let i = 0; i < users.length; i++) {
        const userData = users[i];
        console.log(`Processing user ${i + 1}/${users.length}: ${userData.email}`);
        
        try {
          // Basic email validation
          if (!userData.email || !userData.email.includes('@')) {
            throw new Error(`Invalid email: ${userData.email}`);
          }

          // Create auth user with retry logic
          let authUser;
          let authError;
          
          for (let attempt = 1; attempt <= 2; attempt++) {
            console.log(`Creating auth user for ${userData.email} (attempt ${attempt})`);
            
            const { data, error } = await supabase.auth.admin.createUser({
              email: userData.email,
              password: generateSecurePassword(),
              email_confirm: true,
              user_metadata: {
                full_name: userData.full_name || '',
                user_role: userData.user_role || 'user'
              }
            });

            if (!error) {
              authUser = data;
              break;
            } else {
              authError = error;
              if (error.message.includes('already registered')) {
                console.log(`User already exists: ${userData.email}`);
                batchResults.successful++;
                break;
              }
              
              if (attempt === 2) {
                throw error;
              }
              
              // Wait a bit before retry
              await new Promise(resolve => setTimeout(resolve, 500));
            }
          }

          if (authError?.message.includes('already registered')) {
            continue;
          }

          if (!authUser?.user) {
            throw new Error('Failed to create auth user');
          }

          console.log(`Auth user created successfully: ${authUser.user.id}`);

          // Create/update profile with retry logic
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

          for (let attempt = 1; attempt <= 2; attempt++) {
            console.log(`Creating profile for ${userData.email} (attempt ${attempt})`);
            
            const { error: profileError } = await supabase
              .from('profiles')
              .upsert(profileData, { onConflict: 'id' });

            if (!profileError) {
              console.log(`Profile created successfully for ${userData.email}`);
              batchResults.successful++;
              break;
            } else {
              if (attempt === 2) {
                console.error(`Profile creation failed for ${userData.email}:`, profileError);
                throw profileError;
              }
              
              // Wait a bit before retry
              await new Promise(resolve => setTimeout(resolve, 500));
            }
          }

        } catch (error) {
          const errorMsg = `Failed to create user ${userData.email}: ${error.message}`;
          console.error(errorMsg);
          batchResults.failed++;
          batchResults.errors.push(errorMsg);
        }

        // Small delay between users to avoid overwhelming the system
        if (i < users.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      console.log(`Batch ${batchIndex + 1} completed: ${batchResults.successful} successful, ${batchResults.failed} failed`);
      return batchResults;
    };

    // Split data into batches
    const batches: UserRecord[][] = [];
    for (let i = 0; i < csvData.length; i += batchSize) {
      batches.push(csvData.slice(i, i + batchSize));
    }

    console.log(`Created ${batches.length} batches for processing`);

    // Process batches with controlled concurrency
    let currentBatch = 0;
    const activeBatches = new Set<Promise<any>>();

    while (currentBatch < batches.length || activeBatches.size > 0) {
      // Start new batches up to the concurrency limit
      while (activeBatches.size < maxConcurrent && currentBatch < batches.length) {
        const batchIndex = currentBatch;
        const batch = batches[batchIndex];
        
        const batchPromise = processBatch(batch, batchIndex).then(result => {
          // Update progress
          progress.successful += result.successful;
          progress.failed += result.failed;
          progress.errors.push(...result.errors);
          progress.processed += result.successful + result.failed;
          progress.batchNumber++;
          
          return result;
        });

        activeBatches.add(batchPromise);
        currentBatch++;
      }

      // Wait for at least one batch to complete
      if (activeBatches.size > 0) {
        const completed = await Promise.race(activeBatches);
        
        // Remove completed batches
        for (const batchPromise of activeBatches) {
          if (await Promise.race([batchPromise, Promise.resolve('pending')]) !== 'pending') {
            activeBatches.delete(batchPromise);
          }
        }
      }
    }

    const endTime = Date.now();
    const totalTime = endTime - startTime;
    const usersPerSecond = Math.round((progress.total / totalTime) * 1000);

    console.log('=== BULK IMPORT COMPLETED ===');
    console.log(`Total time: ${totalTime}ms`);
    console.log(`Users per second: ${usersPerSecond}`);
    console.log(`Success rate: ${((progress.successful / progress.total) * 100).toFixed(2)}%`);
    console.log(`Total processed: ${progress.processed}/${progress.total}`);
    console.log(`Successful: ${progress.successful}`);
    console.log(`Failed: ${progress.failed}`);

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
    console.error('=== BULK IMPORT ERROR ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      details: error.stack,
      timestamp: new Date().toISOString()
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
