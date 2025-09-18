import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Approval workflow status definitions
const APPROVAL_STATUS = {
  DRAFT: 'draft',
  PENDING_REVIEW: 'pending_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  NEEDS_REVISION: 'needs_revision',
  ARCHIVED: 'archived'
};

// Approval roles and permissions
const APPROVAL_PERMISSIONS = {
  CREATE: ['admin', 'super_admin', 'moderator'],
  REVIEW: ['admin', 'super_admin'],
  APPROVE: ['super_admin'],
  ARCHIVE: ['super_admin']
};

async function getUserRole(supabase: any, userId: string): Promise<string | null> {
  const { data: userRole } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  
  return userRole?.role || null;
}

function hasPermission(userRole: string, action: string): boolean {
  const requiredRoles = APPROVAL_PERMISSIONS[action as keyof typeof APPROVAL_PERMISSIONS] || [];
  return requiredRoles.includes(userRole);
}

// Template approval workflow logic
async function processApprovalAction(
  supabase: any, 
  templateId: string, 
  action: string, 
  userId: string, 
  reviewNotes?: string,
  changes?: any
) {
  const userRole = await getUserRole(supabase, userId);
  
  if (!userRole || !hasPermission(userRole, action.toUpperCase())) {
    throw new Error(`Insufficient permissions for action: ${action}`);
  }

  // Get current template
  const { data: template, error: templateError } = await supabase
    .from('email_templates')
    .select('*')
    .eq('id', templateId)
    .single();

  if (templateError || !template) {
    throw new Error('Template not found');
  }

  let newStatus = template.approval_status;
  let updateData: any = {
    updated_at: new Date().toISOString()
  };

  switch (action) {
    case 'submit_for_review':
      if (template.approval_status !== APPROVAL_STATUS.DRAFT) {
        throw new Error('Only draft templates can be submitted for review');
      }
      newStatus = APPROVAL_STATUS.PENDING_REVIEW;
      break;

    case 'approve':
      if (template.approval_status !== APPROVAL_STATUS.PENDING_REVIEW) {
        throw new Error('Only templates pending review can be approved');
      }
      newStatus = APPROVAL_STATUS.APPROVED;
      updateData.approved_at = new Date().toISOString();
      updateData.approved_by = userId;
      break;

    case 'reject':
      if (template.approval_status !== APPROVAL_STATUS.PENDING_REVIEW) {
        throw new Error('Only templates pending review can be rejected');
      }
      newStatus = APPROVAL_STATUS.REJECTED;
      break;

    case 'request_revision':
      if (template.approval_status !== APPROVAL_STATUS.PENDING_REVIEW) {
        throw new Error('Only templates pending review can be sent for revision');
      }
      newStatus = APPROVAL_STATUS.NEEDS_REVISION;
      break;

    case 'archive':
      newStatus = APPROVAL_STATUS.ARCHIVED;
      updateData.is_active = false;
      break;

    case 'reactivate':
      if (template.approval_status !== APPROVAL_STATUS.ARCHIVED) {
        throw new Error('Only archived templates can be reactivated');
      }
      newStatus = APPROVAL_STATUS.DRAFT;
      updateData.is_active = true;
      break;

    default:
      throw new Error(`Invalid approval action: ${action}`);
  }

  // Apply any template changes if provided
  if (changes) {
    updateData = { ...updateData, ...changes };
  }

  updateData.approval_status = newStatus;

  // Update template
  const { error: updateError } = await supabase
    .from('email_templates')
    .update(updateData)
    .eq('id', templateId);

  if (updateError) throw updateError;

  // Log approval activity
  const { error: logError } = await supabase
    .from('template_approval_log')
    .insert({
      template_id: templateId,
      action,
      reviewer_id: userId,
      previous_status: template.approval_status,
      new_status: newStatus,
      review_notes: reviewNotes,
      created_at: new Date().toISOString()
    });

  if (logError) {
    console.warn('Failed to log approval activity:', logError);
  }

  return {
    template_id: templateId,
    previous_status: template.approval_status,
    new_status: newStatus,
    reviewer: userId,
    action,
    timestamp: new Date().toISOString()
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { 
      action, 
      template_id, 
      user_id, 
      review_notes, 
      template_changes,
      status_filter,
      reviewer_id
    } = body;

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    switch (action) {
      case 'get_approval_queue': {
        // Get templates pending approval
        let query = supabase
          .from('email_templates')
          .select(`
            *,
            template_approval_log (
              action,
              reviewer_id,
              review_notes,
              created_at
            )
          `)
          .eq('is_active', true);

        if (status_filter) {
          query = query.eq('approval_status', status_filter);
        } else {
          query = query.in('approval_status', [
            APPROVAL_STATUS.PENDING_REVIEW,
            APPROVAL_STATUS.NEEDS_REVISION
          ]);
        }

        const { data: templates, error } = await query
          .order('created_at', { ascending: true });

        if (error) throw error;

        // Get reviewer information
        const reviewerIds = [
          ...new Set(
            templates?.flatMap(t => 
              t.template_approval_log?.map((log: any) => log.reviewer_id)
            ).filter(Boolean) || []
          )
        ];

        const { data: reviewers } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', reviewerIds);

        const reviewerMap = Object.fromEntries(
          reviewers?.map(r => [r.id, r]) || []
        );

        const enrichedTemplates = templates?.map(template => ({
          ...template,
          template_approval_log: template.template_approval_log?.map((log: any) => ({
            ...log,
            reviewer: reviewerMap[log.reviewer_id]
          }))
        }));

        return new Response(JSON.stringify({
          success: true,
          approval_queue: enrichedTemplates,
          queue_summary: {
            total_pending: templates?.length || 0,
            pending_review: templates?.filter(t => t.approval_status === APPROVAL_STATUS.PENDING_REVIEW).length || 0,
            needs_revision: templates?.filter(t => t.approval_status === APPROVAL_STATUS.NEEDS_REVISION).length || 0
          },
          message: `Found ${templates?.length || 0} templates in approval queue`
        }), {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      case 'process_approval': {
        if (!template_id || !user_id || !body.approval_action) {
          throw new Error('template_id, user_id, and approval_action are required');
        }

        const result = await processApprovalAction(
          supabase,
          template_id,
          body.approval_action,
          user_id,
          review_notes,
          template_changes
        );

        return new Response(JSON.stringify({
          success: true,
          approval_result: result,
          message: `Template ${body.approval_action} processed successfully`
        }), {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      case 'get_approval_history': {
        if (!template_id) {
          throw new Error('template_id is required');
        }

        const { data: history, error } = await supabase
          .from('template_approval_log')
          .select(`
            *,
            reviewer:profiles!template_approval_log_reviewer_id_fkey (
              id,
              full_name,
              email
            )
          `)
          .eq('template_id', template_id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        return new Response(JSON.stringify({
          success: true,
          approval_history: history,
          template_id,
          message: `Retrieved approval history for template ${template_id}`
        }), {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      case 'bulk_approval': {
        if (!body.template_ids || !user_id || !body.approval_action) {
          throw new Error('template_ids, user_id, and approval_action are required');
        }

        const results = [];
        const errors = [];

        for (const templateId of body.template_ids) {
          try {
            const result = await processApprovalAction(
              supabase,
              templateId,
              body.approval_action,
              user_id,
              review_notes
            );
            results.push(result);
          } catch (error) {
            errors.push({
              template_id: templateId,
              error: error.message
            });
          }
        }

        return new Response(JSON.stringify({
          success: true,
          bulk_approval_results: {
            successful: results,
            failed: errors,
            summary: {
              total_processed: body.template_ids.length,
              successful_count: results.length,
              failed_count: errors.length
            }
          },
          message: `Bulk ${body.approval_action} completed. ${results.length} successful, ${errors.length} failed.`
        }), {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      case 'get_approval_stats': {
        const { data: stats, error } = await supabase
          .from('email_templates')
          .select('approval_status, created_at, updated_at')
          .eq('is_active', true);

        if (error) throw error;

        const statusCounts = stats?.reduce((acc: any, template) => {
          acc[template.approval_status] = (acc[template.approval_status] || 0) + 1;
          return acc;
        }, {}) || {};

        const last30Days = new Date();
        last30Days.setDate(last30Days.getDate() - 30);

        const recentActivity = stats?.filter(t => 
          new Date(t.updated_at) > last30Days
        ).length || 0;

        return new Response(JSON.stringify({
          success: true,
          approval_statistics: {
            status_breakdown: statusCounts,
            total_templates: stats?.length || 0,
            approval_rate: Math.round(
              ((statusCounts[APPROVAL_STATUS.APPROVED] || 0) / (stats?.length || 1)) * 100
            ),
            recent_activity_30_days: recentActivity,
            pending_review_count: statusCounts[APPROVAL_STATUS.PENDING_REVIEW] || 0,
            needs_attention: (statusCounts[APPROVAL_STATUS.NEEDS_REVISION] || 0) + 
                           (statusCounts[APPROVAL_STATUS.PENDING_REVIEW] || 0)
          },
          message: 'Approval statistics retrieved successfully'
        }), {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      default:
        throw new Error('Invalid action. Available: get_approval_queue, process_approval, get_approval_history, bulk_approval, get_approval_stats');
    }

  } catch (error: any) {
    console.error("Error in template-approval-workflow function:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);