// supabase/functions/database-cleanup/index.ts
// Secured Database Maintenance & Cleanup Edge Function

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";

const handler = async (req: Request): Promise<Response> => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables');
      return new Response(
        JSON.stringify({ success: false, error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Read Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ success: false, error: 'Authorization Bearer token required' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (!token) {
      return new Response(
        JSON.stringify({ success: false, error: 'Bearer token cannot be empty' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize service client strictly on the server
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });

    // 2. Validate token and authenticate user
    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !authData?.user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid or expired authorization token' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const user = authData.user;

    // 3. Verify user has active admin role from database (never trust client claims)
    const { data: roleRecord, error: roleError } = await supabase
      .from('user_roles')
      .select('role, is_active')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (roleError) {
      console.error('Error verifying user role:', roleError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to verify administrative privileges' }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const isAdmin = roleRecord && (roleRecord.role === 'admin' || roleRecord.role === 'super_admin');
    if (!isAdmin) {
      console.warn(`Unauthorized cleanup attempt by user ${user.id} with role: ${roleRecord?.role || 'none'}`);
      return new Response(
        JSON.stringify({ success: false, error: 'Forbidden: Administrative privilege required' }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. Validate request payload
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid JSON request body' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { action, confirm } = body;
    if (!confirm || confirm !== 'EMERGENCY_CLEANUP') {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Emergency confirmation required. Payload must include confirm: "EMERGENCY_CLEANUP"'
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Verified Admin ${user.id} starting database cleanup operation: ${action}`);

    const results: string[] = [];

    // Clean up old function logs (older than 7 days)
    if (action === 'cleanup_function_logs' || action === 'cleanup_all') {
      const { count: logsDeleted, error: logsError } = await supabase
        .from('function_health_logs')
        .delete({ count: 'exact' })
        .lt('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      if (logsError) {
        console.error('Error cleaning function logs:', logsError);
      } else {
        console.log(`Cleaned ${logsDeleted || 0} old function logs`);
        results.push(`Cleaned ${logsDeleted || 0} function logs`);
      }
    }

    // Clean up old email queue entries
    if (action === 'cleanup_email_queue' || action === 'cleanup_all') {
      const { count: emailsDeleted, error: emailError } = await supabase
        .from('email_automation_queue')
        .delete({ count: 'exact' })
        .in('status', ['sent', 'failed'])
        .lt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (emailError) {
        console.error('Error cleaning email queue:', emailError);
      } else {
        console.log(`Cleaned ${emailsDeleted || 0} old email queue entries`);
        results.push(`Cleaned ${emailsDeleted || 0} email queue entries`);
      }
    }

    // Clean up old security events
    if (action === 'cleanup_security_events' || action === 'cleanup_all') {
      const { count: securityDeleted, error: securityError } = await supabase
        .from('security_events')
        .delete({ count: 'exact' })
        .lt('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (securityError) {
        console.error('Error cleaning security events:', securityError);
      } else {
        console.log(`Cleaned ${securityDeleted || 0} old security events`);
        results.push(`Cleaned ${securityDeleted || 0} security events`);
      }
    }

    // Clean up old AI processing logs
    if (action === 'cleanup_ai_logs' || action === 'cleanup_all') {
      const { count: aiLogsDeleted, error: aiLogsError } = await supabase
        .from('ai_processing_logs')
        .delete({ count: 'exact' })
        .lt('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      if (aiLogsError) {
        console.error('Error cleaning AI logs:', aiLogsError);
      } else {
        console.log(`Cleaned ${aiLogsDeleted || 0} old AI processing logs`);
        results.push(`Cleaned ${aiLogsDeleted || 0} AI processing logs`);
      }
    }

    // Clean up expired cache entries
    if (action === 'cleanup_cache' || action === 'cleanup_all') {
      const { count: cacheDeleted, error: cacheError } = await supabase
        .from('ai_prefill_cache')
        .delete({ count: 'exact' })
        .lt('expires_at', new Date().toISOString());

      if (cacheError) {
        console.error('Error cleaning cache:', cacheError);
      } else {
        console.log(`Cleaned ${cacheDeleted || 0} expired cache entries`);
        results.push(`Cleaned ${cacheDeleted || 0} cache entries`);
      }
    }

    // Log cleanup completion with admin user reference
    await supabase
      .from('function_health_logs')
      .insert({
        function_name: 'database-cleanup',
        status: 'success',
        request_count: results.length,
        error_details: `Triggered by admin: ${user.id}`
      });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Database cleanup completed successfully by authorized administrator',
        results,
        executedBy: user.id,
        timestamp: new Date().toISOString()
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );

  } catch (error: any) {
    console.error("Database cleanup error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Internal server error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
};

serve(handler);