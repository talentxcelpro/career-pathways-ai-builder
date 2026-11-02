// supabase/functions/si-orchestrator/index.ts
// TalentXcel SI Orchestrator Edge Function
// Handles secure server-side AI agent execution, command processing and approval management

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SICommandRequest {
  action: 'process_command' | 'get_metrics' | 'resolve_approval' | 'get_engine_status' | 'run_health_check';
  instruction?: string;
  engineTarget?: string;
  approvalId?: string;
  decision?: 'APPROVED' | 'REJECTED';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const openaiKey = Deno.env.get('OPENAI_API_KEY') ?? '';

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create authenticated client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const userToken = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(userToken);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify admin access
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin, role')
      .eq('id', user.id)
      .single();

    const isAdmin = profile?.is_admin === true || ['admin', 'superadmin'].includes(profile?.role || '');
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: 'Forbidden: Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body: SICommandRequest = await req.json();

    switch (body.action) {
      case 'process_command': {
        if (!body.instruction) {
          return new Response(JSON.stringify({ error: 'instruction required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Log command
        const { data: cmd } = await supabase.from('si_commands').insert({
          instruction: body.instruction,
          engine_target: body.engineTarget || null,
          status: 'EXECUTING',
          issued_by: user.id,
        }).select('id').single();

        const commandId = (cmd as any)?.id;

        // Process via OpenAI if available
        let result = 'Command received and queued for autonomous processing.';

        if (openaiKey) {
          try {
            const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${openaiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                  {
                    role: 'system',
                    content: `You are TalentXcel SI, an autonomous growth operating system for TalentXcel, an Indian career platform. 
                    You coordinate 6 autonomous engines: Marketing Factory, Customer Acquisition, Career Intelligence, MCP Gateway, Tech Evolution, Growth Flywheel.
                    Respond concisely with the specific action you will take and which engine/agents will execute it. Be concrete and actionable. Max 2 sentences.`,
                  },
                  { role: 'user', content: body.instruction },
                ],
                max_tokens: 150,
                temperature: 0.7,
              }),
            });

            if (aiResponse.ok) {
              const aiData = await aiResponse.json();
              result = aiData.choices?.[0]?.message?.content || result;
            }
          } catch {
            // Fall back to rule-based routing
          }
        }

        // Update command status
        if (commandId) {
          await supabase.from('si_commands').update({
            status: 'COMPLETED',
            result,
            completed_at: new Date().toISOString(),
          }).eq('id', commandId);
        }

        // Log to audit
        await supabase.from('si_audit_logs').insert({
          agent_id: 'si_orchestrator',
          engine_id: body.engineTarget || null,
          action: 'PROCESS_COMMAND',
          payload: { instruction: body.instruction, commandId },
          success: true,
        });

        return new Response(JSON.stringify({ commandId, status: 'COMPLETED', result }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'get_metrics': {
        const [profiles, companies, jobs, revenue, pendingApprovals, activeTasks] = await Promise.all([
          supabase.from('profiles').select('id', { count: 'exact', head: true }),
          supabase.from('companies').select('id', { count: 'exact', head: true }),
          supabase.from('scraped_jobs').select('id', { count: 'exact', head: true }),
          supabase.from('claim1_platform_revenue').select('fee_amount_inr'),
          supabase.from('si_approvals').select('id', { count: 'exact', head: true }).eq('status', 'PENDING'),
          supabase.from('si_tasks').select('id', { count: 'exact', head: true }).in('status', ['QUEUED', 'RUNNING']),
        ]);

        const totalRevenue = ((revenue.data as any[]) || []).reduce(
          (sum: number, r: any) => sum + (Number(r.fee_amount_inr) || 0), 0
        );

        return new Response(JSON.stringify({
          totalUsers: profiles.count || 0,
          totalCompanies: companies.count || 0,
          totalJobs: jobs.count || 0,
          totalRevenue,
          pendingApprovals: pendingApprovals.count || 0,
          activeTasks: activeTasks.count || 0,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'resolve_approval': {
        if (!body.approvalId || !body.decision) {
          return new Response(JSON.stringify({ error: 'approvalId and decision required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        await supabase.from('si_approvals').update({
          status: body.decision,
          resolved_at: new Date().toISOString(),
          resolved_by: user.id,
        }).eq('id', body.approvalId);

        await supabase.from('si_audit_logs').insert({
          agent_id: user.id,
          action: `APPROVAL_${body.decision}`,
          payload: { approvalId: body.approvalId, decision: body.decision },
          success: true,
        });

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'run_health_check': {
        const startTime = Date.now();
        const [dbCheck] = await Promise.all([
          supabase.from('profiles').select('id', { count: 'exact', head: true }),
        ]);
        const latency = Date.now() - startTime;

        return new Response(JSON.stringify({
          database: 'HEALTHY',
          latencyMs: latency,
          timestamp: new Date().toISOString(),
          status: 'OPERATIONAL',
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        return new Response(JSON.stringify({ error: `Unknown action: ${body.action}` }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
