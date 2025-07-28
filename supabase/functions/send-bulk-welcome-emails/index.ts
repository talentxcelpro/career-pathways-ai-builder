import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailResult {
  email: string;
  status: 'sent' | 'failed';
  message_id?: string;
  error?: string;
}

interface SendWelcomeEmailResponse {
  success: boolean;
  message: string;
  totalUsers: number;
  emailsSent: number;
  emailsFailed: number;
  results: EmailResult[];
  error?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting bulk welcome email campaign...');

    // Get all users with their profiles
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .not('email', 'is', null);

    if (usersError) {
      console.error('Error fetching users:', usersError);
      throw new Error('Failed to fetch users');
    }

    if (!users || users.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No users found to send emails to',
          totalUsers: 0,
          emailsSent: 0,
          emailsFailed: 0,
          results: []
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`Found ${users.length} users to send welcome emails to`);

    const results: EmailResult[] = [];
    let emailsSent = 0;
    let emailsFailed = 0;

    // Process each user
    for (const user of users) {
      try {
        console.log(`Sending welcome email to: ${user.email}`);

        // Call the unified email service
        const emailResponse = await fetch(`${supabaseUrl}/functions/v1/unified-email-service`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({
            to: user.email,
            subject: 'Welcome to TalentXcel! 🎉',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                  <h1 style="color: #2563eb; margin: 0;">Welcome to TalentXcel!</h1>
                </div>
                
                <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                  <h2 style="color: #1e293b; margin-top: 0;">Hello ${user.full_name || 'there'}! 👋</h2>
                  <p style="color: #475569; line-height: 1.6; margin-bottom: 15px;">
                    We're thrilled to have you join our professional community! TalentXcel is your gateway to:
                  </p>
                  <ul style="color: #475569; line-height: 1.8; padding-left: 20px;">
                    <li>🚀 Discover amazing career opportunities</li>
                    <li>🤝 Connect with industry professionals</li>
                    <li>📚 Access career development resources</li>
                    <li>🎯 Get AI-powered career insights</li>
                    <li>💼 Build your professional brand</li>
                  </ul>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://talentxcel.in/profile" 
                     style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 500;">
                    Complete Your Profile
                  </a>
                </div>
                
                <div style="background: #ecfdf5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0;">
                  <p style="color: #047857; margin: 0; font-weight: 500;">
                    💡 Pro Tip: Complete your profile to get better job matches and connect with the right professionals!
                  </p>
                </div>
                
                <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                  <p style="color: #64748b; font-size: 14px; margin: 0;">
                    Questions? We're here to help! Reply to this email anytime.
                  </p>
                  <p style="color: #64748b; font-size: 14px; margin: 10px 0 0 0;">
                    Best regards,<br>
                    <strong>The TalentXcel Team</strong>
                  </p>
                </div>
              </div>
            `,
            template: 'welcome',
            templateData: {
              name: user.full_name || 'there',
              first_name: user.full_name || 'there'
            },
            priority: 'medium'
          })
        });

        const emailData = await emailResponse.json();

        if (emailResponse.ok && emailData.success) {
          results.push({
            email: user.email,
            status: 'sent',
            message_id: emailData.messageId
          });
          emailsSent++;
          console.log(`Welcome email sent successfully to: ${user.email}`);
        } else {
          const errorMsg = emailData.error || 'Unknown error';
          results.push({
            email: user.email,
            status: 'failed',
            error: errorMsg
          });
          emailsFailed++;
          console.error(`Failed to send welcome email to ${user.email}:`, errorMsg);
        }

        // Small delay to avoid overwhelming the email service
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        results.push({
          email: user.email,
          status: 'failed',
          error: errorMsg
        });
        emailsFailed++;
        console.error(`Error sending welcome email to ${user.email}:`, error);
      }
    }

    const response: SendWelcomeEmailResponse = {
      success: true,
      message: `Welcome email campaign completed. ${emailsSent} sent, ${emailsFailed} failed.`,
      totalUsers: users.length,
      emailsSent,
      emailsFailed,
      results
    };

    console.log('Bulk welcome email campaign completed:', {
      totalUsers: users.length,
      emailsSent,
      emailsFailed,
      successRate: users.length > 0 ? ((emailsSent / users.length) * 100).toFixed(1) + '%' : '0%'
    });

    return new Response(
      JSON.stringify(response),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in send-bulk-welcome-emails function:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        message: 'Failed to send bulk welcome emails',
        totalUsers: 0,
        emailsSent: 0,
        emailsFailed: 0,
        results: []
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);