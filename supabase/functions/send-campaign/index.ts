import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CampaignRequest {
  campaign_id: string;
}

function renderTemplate(template: string, data: Record<string, any>): string {
  let rendered = template;
  for (const [key, value] of Object.entries(data)) {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    rendered = rendered.replace(regex, String(value || ''));
  }
  // Add defaults
  rendered = rendered.replace(/{{year}}/g, new Date().getFullYear().toString());
  rendered = rendered.replace(/{{logo_url}}/g, 'https://talentxcel.in/assets/talentxcel-logo.png');
  return rendered;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("📧 Campaign Email Service: Starting...");
    console.log("📧 Request method:", req.method);
    console.log("📧 Request URL:", req.url);
    
    // Parse request body first with error handling
    let requestBody;
    try {
      const bodyText = await req.text();
      console.log("📧 Raw request body:", bodyText);
      requestBody = JSON.parse(bodyText);
      console.log("📧 Parsed request body:", requestBody);
    } catch (parseError) {
      console.error("❌ Failed to parse request body:", parseError);
      throw new Error("Invalid JSON in request body");
    }

    const { campaign_id } = requestBody as CampaignRequest;
    
    if (!campaign_id) {
      console.error("❌ No campaign_id in request");
      throw new Error("campaign_id is required");
    }
    
    console.log("📧 Processing campaign:", campaign_id);
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseKey) {
      console.error("❌ Missing environment variables");
      throw new Error("Missing Supabase credentials");
    }
    
    console.log("📧 Initializing Supabase client...");
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get campaign details
    console.log("📧 Fetching campaign:", campaign_id);
    const { data: campaign, error: campaignError } = await supabase
      .from('email_campaigns')
      .select('*')
      .eq('id', campaign_id)
      .single();

    if (campaignError || !campaign) {
      console.error('Campaign error:', campaignError);
      throw new Error('Campaign not found: ' + (campaignError?.message || 'Unknown error'));
    }

    console.log("📧 Campaign found, fetching template:", campaign.template_id);
    
    // Get template separately
    const { data: template, error: templateError } = await supabase
      .from('email_templates_v2')
      .select('html_template, text_template, subject_template')
      .eq('id', campaign.template_id)
      .single();

    if (templateError || !template) {
      console.error('Template error:', templateError);
      throw new Error('Template not found: ' + (templateError?.message || 'Unknown error'));
    }

    console.log("📧 Template loaded successfully");

    // Get target users based on audience
    let userIds: string[] = [];
    
    // First, get user IDs based on role if needed
    if (campaign.target_audience === 'job_seekers' || campaign.target_audience === 'employers') {
      const targetRole = campaign.target_audience === 'job_seekers' ? 'user' : 'employer';
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', targetRole)
        .eq('is_active', true);
      
      if (roleError) {
        throw new Error('Failed to fetch user roles: ' + roleError.message);
      }
      
      userIds = roleData?.map(r => r.user_id) || [];
    }
    
    // Build profiles query
    let query = supabase.from('profiles').select('id, full_name, email');
    
    // Apply filters based on audience
    switch (campaign.target_audience) {
      case 'job_seekers':
      case 'employers':
        if (userIds.length === 0) {
          throw new Error('No users found for target audience');
        }
        query = query.in('id', userIds);
        break;
      case 'active_users':
        query = query.gte('last_login_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
        break;
      case 'inactive_users':
        query = query.lt('last_login_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
        break;
      // 'all_users' - no filter
    }

    const { data: users, error: usersError } = await query;

    if (usersError) {
      throw new Error('Failed to fetch users: ' + usersError.message);
    }

    if (!users || users.length === 0) {
      throw new Error('No users found for target audience');
    }

    console.log(`📧 Found ${users.length} recipients`);

    // Update campaign status and recipient count
    await supabase
      .from('email_campaigns')
      .update({
        status: 'running',
        total_recipients: users.length,
        started_at: new Date().toISOString(),
      })
      .eq('id', campaign_id);

    // Queue emails for each user
    let queued = 0;
    let failed = 0;

    for (const user of users) {
      try {
        // Prepare user-specific data
        const userData = {
          username: user.full_name || 'User',
          first_name: user.full_name?.split(' ')[0] || 'User',
          last_name: user.full_name?.split(' ').slice(1).join(' ') || '',
          email: user.email,
          link: 'https://talentxcel.in',
          title: campaign.campaign_name,
          description: campaign.description || 'Check out what we have for you',
          cta_text: 'Explore Now',
          date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        };

        // Render template with user data
        const htmlContent = renderTemplate(template.html_template, userData);
        const textContent = template.text_template 
          ? renderTemplate(template.text_template, userData)
          : '';
        const subject = renderTemplate(template.subject_template, userData);

        // Queue email using automation queue
        const { error: queueError } = await supabase
          .from('email_automation_queue')
          .insert({
            recipient_email: user.email,
            recipient_name: user.full_name || 'User',
            trigger_type: 'campaign.email',
            template_data: {
              ...userData,
              subject,
              html_content: htmlContent,
              campaign_id: campaign_id,
              platform_name: 'TalentXcel',
            },
            scheduled_at: new Date().toISOString(),
            status: 'pending',
          });

        if (queueError) {
          console.error(`❌ Failed to queue email for ${user.email}:`, queueError);
          failed++;
        } else {
          queued++;
        }
      } catch (error) {
        console.error(`❌ Error processing user ${user.email}:`, error);
        failed++;
      }
    }

    console.log(`✅ Queued ${queued} emails, ${failed} failed`);

    // Update campaign with results
    await supabase
      .from('email_campaigns')
      .update({
        emails_sent: queued,
        status: failed === users.length ? 'failed' : 'running',
      })
      .eq('id', campaign_id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Campaign started: ${queued} emails queued`,
        queued,
        failed,
        total: users.length,
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error: any) {
    console.error("❌ Campaign service error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Internal server error',
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
