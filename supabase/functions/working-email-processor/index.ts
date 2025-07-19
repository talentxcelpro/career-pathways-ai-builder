import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('OK', { headers: corsHeaders });
  }

  console.log('🚀 Email queue processor started...');

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const sendGridApiKey = Deno.env.get('SENDGRID_API_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase credentials');
    }

    if (!sendGridApiKey) {
      throw new Error('Missing SendGrid API key');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get pending emails from queue
    const { data: pendingEmails, error } = await supabase
      .from('email_automation_queue')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_at', new Date().toISOString())
      .order('created_at', { ascending: true })
      .limit(10);

    if (error) {
      console.error('❌ Error fetching pending emails:', error);
      throw error;
    }

    if (!pendingEmails || pendingEmails.length === 0) {
      console.log('✅ No pending emails to process');
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No pending emails',
        processed: 0 
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`📧 Processing ${pendingEmails.length} pending emails...`);

    let processed = 0;
    let errors = 0;

    for (const email of pendingEmails) {
      try {
        console.log(`Sending email to ${email.recipient_email}...`);

        // Mark as processing
        await supabase
          .from('email_automation_queue')
          .update({ status: 'processing' })
          .eq('id', email.id);

        // Get email template data
        const templateData = email.template_data || {};
        
        // Create email subject based on trigger type
        let subject = 'TalentXcel Notification';
        let htmlContent = '<p>Hello!</p>';

        switch (email.trigger_type) {
          case 'welcome_email':
            subject = `Welcome to TalentXcel, ${templateData.name || email.recipient_name}!`;
            htmlContent = `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #2563eb;">Welcome to TalentXcel! 🎉</h1>
                <p>Hi ${templateData.name || email.recipient_name},</p>
                <p>Welcome to TalentXcel! We're excited to have you join our community.</p>
                <p>Get started by exploring our features and connecting with professionals in your field.</p>
                <p>Best regards,<br>The TalentXcel Team</p>
              </div>
            `;
            break;
          case 'job_recommendation':
            subject = `Perfect job match: ${templateData.job_title || 'New opportunity'}`;
            htmlContent = `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #2563eb;">New Job Recommendation 💼</h1>
                <p>Hi ${templateData.name || email.recipient_name},</p>
                <p>We found a job that matches your profile:</p>
                <h3>${templateData.job_title || 'Exciting Opportunity'}</h3>
                <p>Company: ${templateData.company_name || 'Top Company'}</p>
                <p>Don't miss out on this opportunity!</p>
                <p>Best regards,<br>The TalentXcel Team</p>
              </div>
            `;
            break;
          case 'application_confirmation':
            subject = `Application confirmed: ${templateData.job_title || 'Position'} at ${templateData.company_name || 'Company'}`;
            htmlContent = `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
                <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  <div style="text-align: center; margin-bottom: 30px;">
                    <div style="display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 10px;">
                      <img src="https://talentxcel.in/logo.png" alt="TalentXcel" style="width: 32px; height: 32px; border-radius: 6px;" onerror="this.style.display='none'"/>
                      <h1 style="color: #2563eb; margin: 0; font-size: 28px;">TalentXcel</h1>
                    </div>
                    <p style="color: #64748b; margin: 5px 0 0 0;">Powering Global Career Growth</p>
                  </div>
                  
                  <div style="background: #ecfdf5; border: 1px solid #10b981; border-radius: 8px; padding: 20px; margin-bottom: 25px; text-align: center;">
                    <h2 style="color: #059669; margin: 0; font-size: 20px;">Application Submitted Successfully! ✅</h2>
                  </div>
                  
                  <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">Hi ${templateData.name || templateData.recipient_name || email.recipient_name || 'there'},</p>
                  
                  <p style="color: #374151; margin-bottom: 25px;">Your application for <strong>${templateData.job_title || 'the position'}</strong> at <strong>${templateData.company_name || 'the company'}</strong> has been successfully submitted!</p>
                  
                  <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
                    <h3 style="color: #2563eb; margin: 0 0 15px 0; font-size: 18px;">Application Details</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                      <tr><td style="padding: 8px 0; color: #64748b; width: 120px;"><strong>Position:</strong></td><td style="padding: 8px 0; color: #374151;">${templateData.job_title || 'Position'}</td></tr>
                      <tr><td style="padding: 8px 0; color: #64748b;"><strong>Company:</strong></td><td style="padding: 8px 0; color: #374151;">${templateData.company_name || 'Company'}</td></tr>
                      <tr><td style="padding: 8px 0; color: #64748b;"><strong>Applied on:</strong></td><td style="padding: 8px 0; color: #374151;">${new Date().toLocaleDateString('en-GB')}</td></tr>
                      <tr><td style="padding: 8px 0; color: #64748b;"><strong>Application ID:</strong></td><td style="padding: 8px 0; color: #374151;">${templateData.application_id || 'APP-' + Math.random().toString(36).substr(2, 9).toUpperCase()}</td></tr>
                    </table>
                  </div>
                  
                  <div style="background: #fef3f2; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
                    <h3 style="color: #dc2626; margin: 0 0 15px 0; font-size: 18px;">What's Next?</h3>
                    <ul style="color: #374151; padding-left: 20px; margin: 0;">
                      <li style="margin-bottom: 8px;">The hiring team will review your application</li>
                      <li style="margin-bottom: 8px;">You'll receive updates on your application status</li>
                      <li>If shortlisted, you'll be contacted for next steps</li>
                    </ul>
                  </div>
                  
                  <div style="text-align: center; margin-bottom: 30px;">
                    <a href="https://talentxcel.in/jobs/my-applications" style="background: #2563eb; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 500;">Track Application</a>
                  </div>
                  
                  <p style="text-align: center; color: #374151; margin-bottom: 30px;">Good luck! We're rooting for you. 🚀</p>
                  
                  <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center;">
                    <p style="color: #64748b; font-size: 14px; margin: 0;">© 2025 TalentXcel. All rights reserved.</p>
                    <p style="color: #64748b; font-size: 14px; margin: 5px 0 0 0;">
                      <a href="#" style="color: #2563eb; text-decoration: none;">Unsubscribe</a> | 
                      <a href="#" style="color: #2563eb; text-decoration: none;">Privacy Policy</a>
                    </p>
                  </div>
                </div>
              </div>
            `;
            break;
          default:
            subject = 'TalentXcel Notification';
            htmlContent = `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #2563eb;">TalentXcel Notification</h1>
                <p>Hi ${templateData.name || templateData.recipient_name || email.recipient_name || 'there'},</p>
                <p>You have a new notification from TalentXcel.</p>
                <p>Best regards,<br>The TalentXcel Team</p>
              </div>
            `;
        }

        // Send via SendGrid
        const emailPayload = {
          personalizations: [{
            to: [{ 
              email: email.recipient_email, 
              name: email.recipient_name || 'User' 
            }],
            subject: subject
          }],
          from: { 
            email: 'noreply@talentxcel.in', 
            name: 'TalentXcel' 
          },
          content: [{
            type: 'text/html',
            value: htmlContent
          }]
        };

        const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${sendGridApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(emailPayload)
        });

        if (response.ok) {
          // Mark as sent
          await supabase
            .from('email_automation_queue')
            .update({ 
              status: 'sent',
              sent_at: new Date().toISOString(),
              attempts: (email.attempts || 0) + 1
            })
            .eq('id', email.id);

          console.log(`✅ Email sent to ${email.recipient_email}`);
          processed++;
        } else {
          const errorText = await response.text();
          console.error(`❌ SendGrid error for ${email.recipient_email}:`, response.status, errorText);
          
          // Mark as failed
          await supabase
            .from('email_automation_queue')
            .update({ 
              status: 'failed',
              error_message: `SendGrid error: ${response.status} - ${errorText}`,
              attempts: (email.attempts || 0) + 1
            })
            .eq('id', email.id);
          
          errors++;
        }

      } catch (emailError) {
        console.error(`❌ Error processing email ${email.id}:`, emailError);
        
        // Mark as failed
        await supabase
          .from('email_automation_queue')
          .update({ 
            status: 'failed',
            error_message: emailError.message,
            attempts: (email.attempts || 0) + 1
          })
          .eq('id', email.id);
        
        errors++;
      }
    }

    console.log(`📊 Processing complete: ${processed} sent, ${errors} failed`);

    return new Response(JSON.stringify({
      success: true,
      message: `Processed ${pendingEmails.length} emails`,
      processed: processed,
      errors: errors
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Queue processor error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});