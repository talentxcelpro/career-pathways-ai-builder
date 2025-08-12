import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.1";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface User {
  id: string;
  full_name: string | null;
  email: string;
  created_at: string;
  profile_completed: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting profile reminder email process...");

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get users with incomplete profiles
    // Query both profiles table and auth.users to get email addresses
    const { data: incompleteProfiles, error: profileError } = await supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        profile_completed,
        created_at
      `)
      .or('profile_completed.is.null,profile_completed.eq.false');

    if (profileError) {
      console.error("Error fetching incomplete profiles:", profileError);
      throw new Error(`Failed to fetch profiles: ${profileError.message}`);
    }

    if (!incompleteProfiles || incompleteProfiles.length === 0) {
      console.log("No users with incomplete profiles found");
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "No users with incomplete profiles found",
          emailsSent: 0 
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`Found ${incompleteProfiles.length} users with incomplete profiles`);

    // Get user emails from auth.users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error("Error fetching auth users:", authError);
      throw new Error(`Failed to fetch user emails: ${authError.message}`);
    }

    // Combine profile and auth data
    const usersToEmail: User[] = incompleteProfiles
      .map(profile => {
        const authUser = authUsers.users.find(user => user.id === profile.id);
        if (!authUser?.email) return null;
        
        return {
          id: profile.id,
          full_name: profile.full_name,
          email: authUser.email,
          created_at: profile.created_at,
          profile_completed: profile.profile_completed || false
        };
      })
      .filter(Boolean) as User[];

    console.log(`Preparing to send emails to ${usersToEmail.length} users`);

    let emailsSent = 0;
    let emailsFailed = 0;
    const results = [];

    // Send emails to each user
    for (const user of usersToEmail) {
      try {
        const daysSinceCreated = Math.floor(
          (new Date().getTime() - new Date(user.created_at).getTime()) / (1000 * 3600 * 24)
        );

        // Use React Email template for consistent, fully-styled HTML
        const reactEmail = await supabase.functions.invoke('send-email-react', {
          body: {
            to: user.email,
            subject: 'Complete Your Profile | Unlock better job opportunities',
            template: 'profile_completion_reminder',
            data: { candidate_name: user.full_name || 'there' }
          }
        });

        if (reactEmail.error || !reactEmail.data?.success) {
          throw new Error(reactEmail.error?.message || reactEmail.data?.error || 'Failed to send via React Email');
        }


        console.log(`Email sent successfully to ${user.email}:`, reactEmail.data);
        
        // Log email activity to database
        await supabase
          .from('email_queue')
          .insert({
            recipient_email: user.email,
            recipient_name: user.full_name || 'User',
            email_type: 'profile_completion_reminder',
            status: 'sent',
            template_data: {
              user_id: user.id,
              days_since_created: daysSinceCreated
            },
            sent_at: new Date().toISOString()
          });

        emailsSent++;
        results.push({
          email: user.email,
          status: 'sent',
          message_id: reactEmail.data?.messageId
        });

      } catch (emailError) {
        console.error(`Failed to send email to ${user.email}:`, emailError);
        emailsFailed++;
        results.push({
          email: user.email,
          status: 'failed',
          error: emailError.message
        });

        // Log failed email to database
        await supabase
          .from('email_queue')
          .insert({
            recipient_email: user.email,
            recipient_name: user.full_name || 'User',
            email_type: 'profile_completion_reminder',
            status: 'failed',
            error_message: emailError.message,
            template_data: {
              user_id: user.id
            }
          });
      }
    }

    console.log(`Email sending completed. Sent: ${emailsSent}, Failed: ${emailsFailed}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Profile reminder emails processed`,
        totalUsers: usersToEmail.length,
        emailsSent,
        emailsFailed,
        results
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in send-profile-reminder-emails function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        stack: error.stack 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

function generateEmailContent(fullName: string | null, daysSinceCreated: number): string {
  const name = fullName || "there";
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Complete Your TalentXcel Profile</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; }
            .cta-button { display: inline-block; background: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
            .benefits { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .benefit-item { margin: 10px 0; padding-left: 20px; position: relative; }
            .benefit-item:before { content: "✓"; color: #28a745; font-weight: bold; position: absolute; left: 0; }
            .footer { background: #343a40; color: white; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }
            .stats { background: linear-gradient(45deg, #f093fb 0%, #f5576c 100%); color: white; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🚀 Your Career Journey Awaits!</h1>
                <p>Complete your TalentXcel profile to unlock endless opportunities</p>
            </div>
            
            <div class="content">
                <h2>Hi ${name}! 👋</h2>
                
                <p>It's been ${daysSinceCreated} days since you joined TalentXcel, and we're excited to help you take the next step in your career journey!</p>
                
                <div class="stats">
                    <h3>📊 Quick Stats</h3>
                    <p><strong>Incomplete profiles get 70% fewer opportunities</strong><br>
                    Complete profiles are 5x more likely to be contacted by employers</p>
                </div>

                <p>Your profile is the key to unlocking amazing opportunities on our platform. Here's what you're missing out on:</p>
                
                <div class="benefits">
                    <h3>🎯 What You'll Get With a Complete Profile:</h3>
                    <div class="benefit-item">Higher visibility to top employers and recruiters</div>
                    <div class="benefit-item">Access to exclusive job opportunities and services</div>
                    <div class="benefit-item">AI-powered career recommendations tailored for you</div>
                    <div class="benefit-item">Professional networking opportunities</div>
                    <div class="benefit-item">Resume building and career development tools</div>
                    <div class="benefit-item">Direct messages from potential employers</div>
                </div>

                <p><strong>It only takes 5 minutes to complete your profile!</strong></p>
                
                <div style="text-align: center;">
                    <a href="https://talentxcel.in/profile/edit" class="cta-button">
                        Complete My Profile Now →
                    </a>
                </div>
                
                <p>Need help? Our support team is here to assist you every step of the way. Simply reply to this email or visit our help center.</p>
                
                <p>Don't let opportunities pass you by. Complete your profile today and let your career soar!</p>
                
                <p>Best regards,<br>
                The TalentXcel Team</p>
            </div>
            
            <div class="footer">
                <p>TalentXcel - Where Talent Meets Opportunity</p>
                <p>If you no longer wish to receive these emails, <a href="#" style="color: #6c757d;">unsubscribe here</a></p>
            </div>
        </div>
    </body>
    </html>
  `;
}

serve(handler);