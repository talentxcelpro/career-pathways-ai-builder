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
    console.log("📧 Fetching users for audience:", campaign.target_audience);
    
    let users: any[] = [];
    
    try {
      // Handle different audience types
      if (campaign.target_audience === 'all_users') {
        // Get all users with email
        console.log("📧 Fetching all users...");
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .not('email', 'is', null);
        
        if (error) {
          console.error("❌ Error fetching all users:", error);
          throw error;
        }
        users = data || [];
        console.log(`📧 Found ${users.length} users with emails`);
        
      } else if (campaign.target_audience === 'job_seekers') {
        // Get job seekers (users with 'user' role)
        console.log("📧 Fetching job seekers...");
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('user_id')
          .eq('role', 'user')
          .eq('is_active', true);
        
        if (roleError) {
          console.error("❌ Error fetching user roles:", roleError);
          throw roleError;
        }
        
        if (roleData && roleData.length > 0) {
          const userIds = roleData.map(r => r.user_id);
          const { data, error } = await supabase
            .from('profiles')
            .select('id, full_name, email')
            .in('id', userIds)
            .not('email', 'is', null);
          
          if (error) {
            console.error("❌ Error fetching profiles:", error);
            throw error;
          }
          users = data || [];
        }
        console.log(`📧 Found ${users.length} job seekers`);
        
      } else if (campaign.target_audience === 'employers') {
        // Get employers
        console.log("📧 Fetching employers...");
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('user_id')
          .eq('role', 'employer')
          .eq('is_active', true);
        
        if (roleError) {
          console.error("❌ Error fetching employer roles:", roleError);
          throw roleError;
        }
        
        if (roleData && roleData.length > 0) {
          const userIds = roleData.map(r => r.user_id);
          const { data, error } = await supabase
            .from('profiles')
            .select('id, full_name, email')
            .in('id', userIds)
            .not('email', 'is', null);
          
          if (error) {
            console.error("❌ Error fetching employer profiles:", error);
            throw error;
          }
          users = data || [];
        }
        console.log(`📧 Found ${users.length} employers`);
        
      } else if (campaign.target_audience === 'active_users') {
        // Get active users (logged in within 30 days)
        console.log("📧 Fetching active users...");
        const dateThreshold = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .gte('last_login_at', dateThreshold)
          .not('email', 'is', null);
        
        if (error) {
          console.error("❌ Error fetching active users:", error);
          throw error;
        }
        users = data || [];
        console.log(`📧 Found ${users.length} active users`);
        
      } else if (campaign.target_audience === 'inactive_users') {
        // Get inactive users (not logged in for 30+ days)
        console.log("📧 Fetching inactive users...");
        const dateThreshold = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .lt('last_login_at', dateThreshold)
          .not('email', 'is', null);
        
        if (error) {
          console.error("❌ Error fetching inactive users:", error);
          throw error;
        }
        users = data || [];
        console.log(`📧 Found ${users.length} inactive users`);
      }
      
    } catch (fetchError: any) {
      console.error("❌ Critical error fetching users:", fetchError);
      throw new Error('Failed to fetch users: ' + (fetchError.message || 'Unknown error'));
    }

    if (!users || users.length === 0) {
      const errorMsg = `No users found for audience: ${campaign.target_audience}`;
      console.error("❌", errorMsg);
      throw new Error(errorMsg);
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
