
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.1";
import { corsHeaders } from "../_shared/cors.ts";

console.log('🚀 Bulk Create Super Admins Function Starting...');

Deno.serve(async (req) => {
  console.log('📧 Bulk admin creation request received:', req.method, req.url);
  
  if (req.method === 'OPTIONS') {
    console.log('✅ CORS preflight request handled');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Verify the user is authenticated and is a super admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authorization header missing' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
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
      return new Response(JSON.stringify({ error: 'Invalid token or user not found' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if user is super admin
    const { data: userRoles } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'super_admin')
      .eq('is_active', true);
    
    if (!userRoles || userRoles.length === 0) {
      return new Response(JSON.stringify({ error: 'Insufficient permissions. Super admin access required.' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const requestBody = await req.json();
    const { emailList } = requestBody;

    if (!emailList || !Array.isArray(emailList)) {
      return new Response(JSON.stringify({ error: 'Email list is required and must be an array' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Creating super admins for emails:', emailList);

    const results = [];
    const proElitePlanId = 'f4cc7a5b-30a7-46dd-afc5-d04cbd3272d0'; // Pro Elite plan ID

    for (const email of emailList) {
      try {
        console.log(`Processing: ${email}`);
        
        // Generate secure password
        const password = generateSecurePassword();
        
        // Extract name from email
        const fullName = email.split('@')[0].replace(/[._]/g, ' ').split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');

        // Create user in Auth
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          user_metadata: {
            full_name: fullName
          },
          email_confirm: true
        });

        if (authError) {
          throw new Error(`Auth creation failed: ${authError.message}`);
        }

        console.log(`User created in auth: ${authData.user.id}`);

        // Wait for profile creation trigger
        await new Promise(resolve => setTimeout(resolve, 200));

        // Update profile
        const { error: profileError } = await supabaseAdmin
          .from('profiles')
          .update({
            full_name: fullName,
            email: email,
            user_role: 'admin',
            profile_completed: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', authData.user.id);

        if (profileError) {
          console.error('Profile update error:', profileError);
        }

        // Assign super_admin role
        const { error: roleError } = await supabaseAdmin
          .from('user_roles')
          .insert({
            user_id: authData.user.id,
            role: 'super_admin',
            is_active: true,
            assigned_by: user.id
          });

        if (roleError) {
          console.error('Role assignment error:', roleError);
        }

        // Create Pro Elite subscription
        const currentDate = new Date();
        const nextYear = new Date(currentDate);
        nextYear.setFullYear(currentDate.getFullYear() + 1);

        const { error: subscriptionError } = await supabaseAdmin
          .from('user_subscriptions')
          .insert({
            user_id: authData.user.id,
            plan_id: proElitePlanId,
            status: 'active',
            current_period_start: currentDate.toISOString(),
            current_period_end: nextYear.toISOString(),
            created_at: currentDate.toISOString()
          });

        if (subscriptionError) {
          console.error('Subscription creation error:', subscriptionError);
        }

        // Log admin activity
        await supabaseAdmin
          .from('admin_activity_log')
          .insert({
            admin_user_id: user.id,
            action_type: 'bulk_super_admin_creation',
            target_user_id: authData.user.id,
            details: {
              email: email,
              role_assigned: 'super_admin',
              subscription_plan: 'Pro Elite',
              created_via: 'bulk_creation'
            }
          });

        // Send welcome email
        try {
          await supabaseAdmin.functions.invoke('send-email', {
            body: {
              to: email,
              subject: 'Welcome to TalentXcel - Super Admin Access Granted! 🎉',
              template: 'super_admin_welcome',
              data: {
                name: fullName,
                email: email,
                password: password,
                loginUrl: 'https://talentxcel.in/auth/login'
              }
            }
          });
          console.log(`Welcome email sent to: ${email}`);
        } catch (emailError) {
          console.error(`Failed to send email to ${email}:`, emailError);
        }

        results.push({
          email,
          success: true,
          userId: authData.user.id,
          password: password,
          message: 'Super admin account created successfully with Pro Elite subscription'
        });

      } catch (error) {
        console.error(`Failed to create super admin for ${email}:`, error);
        results.push({
          email,
          success: false,
          error: error.message,
          message: 'Failed to create super admin account'
        });
      }
    }

    console.log('Bulk creation completed:', results);

    return new Response(JSON.stringify({ 
      success: true, 
      results,
      summary: {
        total: emailList.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
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

function generateSecurePassword(): string {
  const length = 16;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  
  return password;
}
