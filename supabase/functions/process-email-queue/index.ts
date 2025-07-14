import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.1";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get pending emails from queue
    const { data: pendingEmails, error: fetchError } = await supabase
      .from('email_queue')
      .select('*')
      .eq('status', 'pending')
      .lt('retry_count', 'max_retries')
      .order('created_at', { ascending: true })
      .limit(50); // Process in batches

    if (fetchError) {
      console.error('Error fetching emails:', fetchError);
      throw fetchError;
    }

    if (!pendingEmails || pendingEmails.length === 0) {
      console.log('No pending emails to process');
      return new Response(JSON.stringify({ 
        message: 'No pending emails to process',
        processed: 0 
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    let processed = 0;
    let failed = 0;

    for (const email of pendingEmails) {
      try {
        console.log(`Processing email ${email.id} to ${email.to_email}`);

        // Send email via Resend
        const emailResponse = await resend.emails.send({
          from: "TalentXcel <onboarding@resend.dev>",
          to: [email.to_email],
          subject: email.subject,
          html: generateEmailContent(email.template, email.data),
        });

        console.log('Email sent successfully:', emailResponse);

        // Update email status to sent
        await supabase
          .from('email_queue')
          .update({
            status: 'sent',
            sent_at: new Date().toISOString(),
            error_message: null
          })
          .eq('id', email.id);

        processed++;

      } catch (emailError: any) {
        console.error(`Failed to send email ${email.id}:`, emailError);
        
        const newRetryCount = (email.retry_count || 0) + 1;
        const maxRetries = email.max_retries || 3;
        
        // Update email with error and increment retry count
        await supabase
          .from('email_queue')
          .update({
            status: newRetryCount >= maxRetries ? 'failed' : 'pending',
            retry_count: newRetryCount,
            error_message: emailError.message || 'Unknown error'
          })
          .eq('id', email.id);

        failed++;
      }
    }

    console.log(`Email processing complete: ${processed} sent, ${failed} failed`);

    return new Response(JSON.stringify({
      message: 'Email processing complete',
      processed,
      failed,
      total: pendingEmails.length
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error in process-email-queue function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

function generateEmailContent(template: string, data: any): string {
  switch (template) {
    case 'welcome':
      return generateWelcomeEmail(data);
    case 'activation':
      return generateActivationEmail(data);
    case 'password-reset':
      return generatePasswordResetEmail(data);
    default:
      return `<p>Hello,</p><p>This is a message from TalentXcel.</p>`;
  }
}

function generateWelcomeEmail(data: any): string {
  const { userName, userEmail, temporaryPassword, siteUrl } = data;
  
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2563eb; margin: 0; font-size: 28px; font-weight: bold;">Welcome to TalentXcel!</h1>
        <p style="color: #64748b; font-size: 16px; margin: 10px 0 0 0;">Your professional journey starts here</p>
      </div>
      
      <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 25px; border-radius: 12px; margin: 20px 0; color: white; text-align: center;">
        <h2 style="margin: 0 0 15px 0; font-size: 20px;">Hello ${userName}!</h2>
        <p style="margin: 0; font-size: 16px; opacity: 0.95;">Your account has been successfully created and activated. You can now access all platform features!</p>
      </div>
      
      ${temporaryPassword ? `
        <div style="background-color: #fef3c7; border: 1px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #92400e; display: flex; align-items: center;">
            <span style="margin-right: 8px;">🔐</span> Your Login Credentials
          </h3>
          <div style="background-color: #ffffff; padding: 15px; border-radius: 6px; border: 1px solid #f3f4f6;">
            <p style="margin: 5px 0;"><strong>Email:</strong> <code style="background: #f8fafc; padding: 2px 6px; border-radius: 3px;">${userEmail}</code></p>
            <p style="margin: 5px 0;"><strong>Temporary Password:</strong> <code style="background: #f8fafc; padding: 2px 6px; border-radius: 3px;">${temporaryPassword}</code></p>
          </div>
          <div style="margin-top: 15px; padding: 10px; background-color: #fef2f2; border-radius: 6px; border-left: 4px solid #ef4444;">
            <p style="margin: 0; color: #dc2626; font-size: 14px;">
              <strong>🚨 Security Notice:</strong> Please change your password immediately after your first login for security.
            </p>
          </div>
        </div>
      ` : ''}
      
      <div style="text-align: center; margin: 35px 0;">
        <a href="${siteUrl || 'https://talentxcel.in'}/auth" 
           style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.3);">
          🚀 Access Your Account
        </a>
      </div>
      
      <div style="text-align: center;">
        <p style="color: #6b7280; font-size: 13px; margin: 0;">
          This email was sent automatically by TalentXcel. Please do not reply to this email.
        </p>
      </div>
    </div>
  `;
}

function generateActivationEmail(data: any): string {
  const { userName, activationLink } = data;
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #2563eb;">Account Activation Required</h1>
      <p>Hello ${userName},</p>
      <p>Please click the link below to activate your TalentXcel account:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${activationLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
          Activate Account
        </a>
      </div>
    </div>
  `;
}

function generatePasswordResetEmail(data: any): string {
  const { userName, resetLink } = data;
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #2563eb;">Password Reset Request</h1>
      <p>Hello ${userName},</p>
      <p>Click the link below to reset your password:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
          Reset Password
        </a>
      </div>
    </div>
  `;
}

serve(handler);