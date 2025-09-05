import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailQueueItem {
  id: string;
  trigger_type: string;
  recipient_email: string;
  recipient_name: string;
  template_data: any;
  status: string;
  attempts: number;
  scheduled_at: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Starting email automation fix...');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Step 1: Reset all failed emails to pending for retry
    console.log('📧 Resetting failed emails to pending...');
    
    const { data: failedEmails, error: resetError } = await supabase
      .from('email_automation_queue')
      .update({
        status: 'pending',
        attempts: 0,
        error_message: null,
        scheduled_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('status', 'failed')
      .select('*');

    if (resetError) {
      console.error('❌ Error resetting failed emails:', resetError);
      throw resetError;
    }

    console.log(`✅ Reset ${failedEmails?.length || 0} failed emails to pending`);

    // Step 2: Process pending emails using working SMTP
    const { data: pendingEmails, error: fetchError } = await supabase
      .from('email_automation_queue')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_at', new Date().toISOString())
      .order('created_at', { ascending: true })
      .limit(10); // Process in small batches to avoid timeouts

    if (fetchError) {
      console.error('❌ Error fetching pending emails:', fetchError);
      throw fetchError;
    }

    if (!pendingEmails || pendingEmails.length === 0) {
      console.log('✅ No pending emails to process');
      return new Response(JSON.stringify({
        success: true,
        message: 'Email automation fixed - no pending emails',
        reset_count: failedEmails?.length || 0,
        processed: 0
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log(`📧 Processing ${pendingEmails.length} pending emails...`);

    let processed = 0;
    let failed = 0;

    for (const email of pendingEmails) {
      try {
        console.log(`📤 Processing email ${email.id} to ${email.recipient_email}`);

        // Mark as processing
        await supabase
          .from('email_automation_queue')
          .update({
            status: 'processing',
            attempts: (email.attempts || 0) + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', email.id);

        // Prepare email content with proper template
        const templateData = {
          recipient_name: email.recipient_name || 'User',
          platform_name: 'TalentXcel',
          support_email: 'support@talentxcel.in',
          current_year: new Date().getFullYear().toString(),
          current_date: new Date().toLocaleDateString(),
          ...email.template_data
        };

        let emailSubject = `TalentXcel - ${email.trigger_type.replace(/_/g, ' ')}`;
        let emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(135deg, #1e40af, #3b82f6); padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">
                Talent<span style="color: #fbbf24;">Xcel</span>
              </h1>
              <p style="color: #e0e7ff; margin: 10px 0 0 0; font-size: 16px;">Your Career Growth Platform</p>
            </div>
            <div style="padding: 40px 30px;">
              <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Hello ${templateData.recipient_name}!</h2>
              <div style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                <p>This is a notification from TalentXcel regarding: <strong>${email.trigger_type.replace(/_/g, ' ')}</strong></p>
                <p>We're here to help you succeed in your career journey.</p>
              </div>
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://talentxcel.in?utm_source=email&utm_medium=automation&utm_campaign=${email.trigger_type}" 
                   style="background: #1e40af; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: bold; display: inline-block;">
                  Visit TalentXcel
                </a>
              </div>
            </div>
            <div style="background: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                © ${templateData.current_year} TalentXcel. All rights reserved.<br>
                <a href="https://talentxcel.in" style="color: #1e40af;">Visit our website</a>
              </p>
            </div>
          </div>
        `;

        // Try to get custom template if available
        try {
          const { data: template } = await supabase
            .from('email_templates')
            .select('subject, html_template')
            .eq('template_type', email.trigger_type)
            .eq('is_active', true)
            .single();

          if (template) {
            emailSubject = template.subject.replace(/\{\{(\w+)\}\}/g, (match, key) => {
              return templateData[key] || match;
            });
            
            emailHtml = template.html_template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
              return templateData[key] || match;
            });
            
            console.log(`✅ Using custom template for ${email.trigger_type}`);
          }
        } catch (templateError) {
          console.log(`ℹ️ No custom template found for ${email.trigger_type}, using default`);
        }

        // Send email using working SMTP configuration
        const { default: nodemailer } = await import("npm:nodemailer@6.9.1");

        const transporter = nodemailer.createTransport({
          host: Deno.env.get('SMTP_HOST') || 'email-smtp.eu-north-1.amazonaws.com',
          port: parseInt(Deno.env.get('SMTP_PORT') || '465'),
          secure: true, // true for 465, false for other ports
          auth: {
            user: Deno.env.get('SMTP_USER'),
            pass: Deno.env.get('SMTP_PASS'),
          },
        });

        const mailResult = await transporter.sendMail({
          from: `TalentXcel <${Deno.env.get('SMTP_FROM_EMAIL') || 'noreply@talentxcel.in'}>`,
          to: email.recipient_email,
          subject: emailSubject,
          html: emailHtml,
          text: emailHtml.replace(/<[^>]+>/g, ''), // Plain text fallback
        });

        console.log(`✅ Email sent successfully to ${email.recipient_email}`, mailResult.messageId);

        // Update status to sent
        await supabase
          .from('email_automation_queue')
          .update({
            status: 'sent',
            sent_at: new Date().toISOString(),
            error_message: null,
            updated_at: new Date().toISOString()
          })
          .eq('id', email.id);

        processed++;

        // Add a small delay to avoid overwhelming the SMTP server
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (emailError: any) {
        console.error(`❌ Failed to send email ${email.id}:`, emailError.message);
        
        const currentAttempts = (email.attempts || 0) + 1;
        const newStatus = currentAttempts >= 3 ? 'failed' : 'pending';
        
        await supabase
          .from('email_automation_queue')
          .update({
            status: newStatus,
            error_message: emailError.message || 'Unknown error',
            updated_at: new Date().toISOString(),
            // Schedule retry in 5 minutes if not at max attempts
            ...(newStatus === 'pending' && {
              scheduled_at: new Date(Date.now() + 5 * 60 * 1000).toISOString()
            })
          })
          .eq('id', email.id);

        if (newStatus === 'failed') {
          failed++;
        }
      }
    }

    const summary = {
      success: true,
      message: 'Email automation fix completed',
      reset_count: failedEmails?.length || 0,
      processed,
      failed,
      total_pending: pendingEmails.length,
      timestamp: new Date().toISOString()
    };

    console.log('✅ Email automation fix summary:', summary);

    return new Response(JSON.stringify(summary), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("❌ Error in fix-email-automation:", error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);