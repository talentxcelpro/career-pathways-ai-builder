import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  try {
    console.log("📧 Campaign service received request");
    console.log("📧 Method:", req.method);
    
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
      console.log("📧 Handling OPTIONS request");
      return new Response(null, { headers: corsHeaders });
    }

    console.log("📧 About to parse request body...");
    let requestBody;
    try {
      const text = await req.text();
      console.log("📧 Raw body:", text);
      requestBody = JSON.parse(text);
      console.log("📧 Parsed body:", requestBody);
    } catch (parseErr) {
      console.error("❌ Parse error:", parseErr);
      throw new Error("Failed to parse request body: " + parseErr.message);
    }

    const { campaign_id } = requestBody;
    
    if (!campaign_id) {
      console.error("❌ No campaign_id in body");
      throw new Error("campaign_id is required");
    }
    
    console.log("📧 Campaign ID:", campaign_id);
    
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    console.log("📧 Fetching campaign...");
    
    // Get campaign
    const { data: campaign, error: campaignError } = await supabase
      .from('email_campaigns')
      .select('*, email_templates_v2!inner(*)')
      .eq('id', campaign_id)
      .single();

    if (campaignError) throw campaignError;
    if (!campaign) throw new Error('Campaign not found');

    console.log("📧 Campaign found:", campaign.campaign_name);

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
        query = query.in('id', roleData.map(r => r.user_id));
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
        query = query.in('id', roleData.map(r => r.user_id));
      } else {
        throw new Error('No employers found');
      }
    }

    const { data: users, error: usersError } = await query;
    
    if (usersError) throw usersError;
    if (!users || users.length === 0) {
      throw new Error('No users found for this audience');
    }

    console.log(`📧 Found ${users.length} recipients`);

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

    console.log(`✅ Queued ${queued}/${users.length} emails`);

    // Update campaign
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
    console.error("❌ Error:", error);
    console.error("❌ Error message:", error?.message);
    console.error("❌ Error stack:", error?.stack);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error?.message || "Unknown error",
        details: error?.toString(),
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (outerError: any) {
    console.error("❌ Outer catch error:", outerError);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: "Critical error: " + outerError?.message,
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
