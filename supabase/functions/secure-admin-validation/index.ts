import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ValidationRequest {
  action: string;
  targetUserId?: string;
  roleToAssign?: string;
  inputData?: any;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Verify the JWT token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Invalid authentication');
    }

    // Parse request body
    const { action, targetUserId, roleToAssign, inputData }: ValidationRequest = await req.json();

    // Enhanced security validation based on action type
    let validationResult = { valid: true, message: 'Validation passed', warnings: [] as string[] };

    // Get current user's role
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!userRole) {
      throw new Error('User role not found');
    }

    // Role hierarchy validation
    const roleHierarchy = {
      'super_admin': 1,
      'admin': 2,
      'moderator': 3,
      'employer': 4,
      'user': 5
    };

    const currentUserLevel = roleHierarchy[userRole.role as keyof typeof roleHierarchy] || 5;

    // Validate specific actions
    switch (action) {
      case 'role_assignment':
        if (!roleToAssign || !targetUserId) {
          validationResult = { valid: false, message: 'Missing required parameters for role assignment', warnings: [] };
          break;
        }

        const targetRoleLevel = roleHierarchy[roleToAssign as keyof typeof roleHierarchy] || 5;
        
        // Enhanced role assignment rules
        if (currentUserLevel >= targetRoleLevel) {
          validationResult = { 
            valid: false, 
            message: 'Cannot assign role equal to or higher than your own', 
            warnings: ['Potential privilege escalation attempt'] 
          };
          break;
        }

        // Super admin restrictions
        if (roleToAssign === 'super_admin' && userRole.role !== 'super_admin') {
          validationResult = { 
            valid: false, 
            message: 'Only super_admin can assign super_admin role', 
            warnings: ['Attempted super_admin assignment by non-super_admin'] 
          };
          break;
        }

        // Self-promotion prevention
        if (targetUserId === user.id && roleToAssign === 'super_admin') {
          validationResult = { 
            valid: false, 
            message: 'Cannot self-promote to super_admin', 
            warnings: ['Self-promotion attempt detected'] 
          };
          break;
        }

        // Rate limiting check
        const { count: recentRoleChanges } = await supabase
          .from('admin_activity_log')
          .select('*', { count: 'exact', head: true })
          .eq('admin_user_id', user.id)
          .eq('action_type', 'role_assignment')
          .gte('created_at', new Date(Date.now() - 60000).toISOString()); // Last minute

        if (recentRoleChanges && recentRoleChanges >= 5) {
          validationResult = { 
            valid: false, 
            message: 'Rate limit exceeded for role changes', 
            warnings: ['Potential spam or automation detected'] 
          };
          break;
        }
        break;

      case 'user_deletion':
        if (currentUserLevel > 2) { // Only super_admin and admin
          validationResult = { 
            valid: false, 
            message: 'Insufficient privileges for user deletion', 
            warnings: ['Unauthorized deletion attempt'] 
          };
        }
        break;

      case 'data_export':
        if (currentUserLevel > 2) { // Only super_admin and admin
          validationResult = { 
            valid: false, 
            message: 'Insufficient privileges for data export', 
            warnings: ['Unauthorized data export attempt'] 
          };
        }
        break;

      case 'system_config_change':
        if (currentUserLevel > 1) { // Only super_admin
          validationResult = { 
            valid: false, 
            message: 'Only super_admin can modify system configuration', 
            warnings: ['Unauthorized system configuration attempt'] 
          };
        }
        break;

      default:
        validationResult.warnings.push('Unknown action type');
    }

    // Input sanitization validation
    if (inputData) {
      const { data: sanitationResult } = await supabase.rpc('validate_secure_input', {
        input_data: inputData
      });

      if (!sanitationResult?.valid) {
        validationResult = {
          valid: false,
          message: 'Input validation failed',
          warnings: [...validationResult.warnings, ...(sanitationResult?.errors || ['Input validation error'])]
        };
      }
    }

    // Log the validation attempt
    await supabase.from('security_events').insert({
      user_id: user.id,
      event_type: 'admin_validation_check',
      description: `Validation check for ${action}`,
      ip_address: req.headers.get('x-forwarded-for') || 'unknown',
      user_agent: req.headers.get('user-agent') || 'unknown',
      metadata: {
        action,
        valid: validationResult.valid,
        warnings: validationResult.warnings,
        severity: validationResult.valid ? 'low' : 'medium'
      }
    });

    // Log security events for failed validations
    if (!validationResult.valid) {
      await supabase.from('security_events').insert({
        user_id: user.id,
        event_type: 'admin_action_blocked',
        description: `Blocked ${action}: ${validationResult.message}`,
        ip_address: req.headers.get('x-forwarded-for') || 'unknown',
        metadata: {
          action,
          reason: validationResult.message,
          warnings: validationResult.warnings,
          severity: 'high'
        }
      });
    }

    return new Response(
      JSON.stringify(validationResult),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Validation error:', error);
    
    return new Response(
      JSON.stringify({ 
        valid: false, 
        message: error instanceof Error ? error.message : 'Validation failed',
        warnings: ['Internal validation error']
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});