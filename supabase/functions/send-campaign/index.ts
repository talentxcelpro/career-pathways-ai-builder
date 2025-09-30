import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { campaign_id } = await req.json();
    
    if (!campaign_id) {
      throw new Error("campaign_id is required");
    }
    
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get campaign with template
    const { data: campaign, error: campaignError } = await supabase
      .from('email_campaigns')
      .select('*, email_templates_v2!inner(*)')
      .eq('id', campaign_id)
      .single();

    if (campaignError) throw campaignError;
    if (!campaign) throw new Error('Campaign not found');

    // Get users based on target audience
    let query = supabase
      .from('profiles')
      .select('id, full_name, email')
      .not('email', 'is', null);

    // Apply audience filters
    if (campaign.target_audience === 'job_seekers') {
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'user')
        .eq('is_active', true);
      
      if (roleData && roleData.length > 0) {
        query = query.in('id', roleData.map((r: any) => r.user_id));
      } else {
        throw new Error('No job seekers found');
      }
    } else if (campaign.target_audience === 'employers') {
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'employer')
        .eq('is_active', true);
      
      if (roleData && roleData.length > 0) {
        query = query.in('id', roleData.map((r: any) => r.user_id));
      } else {
        throw new Error('No employers found');
      }
    }

    const { data: users, error: usersError } = await query;
    
    if (usersError) throw usersError;
    if (!users || users.length === 0) {
      throw new Error('No users found for this audience');
    }

    // Update campaign status
    await supabase
      .from('email_campaigns')
      .update({
        status: 'running',
        total_recipients: users.length,
      })
      .eq('id', campaign_id);

    // Queue emails
    let queued = 0;
    const template = campaign.email_templates_v2;

    for (const user of users) {
      const { error: queueError } = await supabase
        .from('email_automation_queue')
        .insert({
          recipient_email: user.email,
          recipient_name: user.full_name || 'User',
          trigger_type: 'campaign_email',
          template_data: {
            username: user.full_name || 'User',
            subject: template.subject_template?.replace('{{username}}', user.full_name || 'User'),
            html_content: template.html_template,
            campaign_id: campaign_id,
          },
          scheduled_at: new Date().toISOString(),
          status: 'pending',
        });

      if (!queueError) queued++;
    }

    // Update campaign with results
    await supabase
      .from('email_campaigns')
      .update({
        emails_sent: queued,
        status: queued > 0 ? 'running' : 'failed',
      })
      .eq('id', campaign_id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Campaign started: ${queued} emails queued`,
        queued,
        total: users.length,
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error: any) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error?.message || "Unknown error",
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
};

serve(handler);
