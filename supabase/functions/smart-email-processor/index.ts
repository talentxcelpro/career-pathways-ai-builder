import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Smart email processor started...');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get pending emails from both automation queue and simple queue
    const [automationQueue, simpleQueue] = await Promise.all([
      supabase
        .from('email_automation_queue')
        .select('*')
        .eq('status', 'pending')
        .lte('scheduled_at', new Date().toISOString())
        .lt('attempts', 3)
        .order('created_at', { ascending: true })
        .limit(25),
      
      supabase
        .from('email_queue_simple')
        .select('*')
        .eq('status', 'pending')
        .lt('retry_count', 3)
        .order('created_at', { ascending: true })
        .limit(25)
    ]);

    const automationEmails = automationQueue.data || [];
    const simpleEmails = simpleQueue.data || [];
    const totalEmails = automationEmails.length + simpleEmails.length;

    if (totalEmails === 0) {
      console.log('No pending emails to process');
      return new Response(JSON.stringify({ 
        message: 'No pending emails to process',
        processed: 0,
        failed: 0,
        timestamp: new Date().toISOString()
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log(`Found ${totalEmails} emails to process (${automationEmails.length} automation, ${simpleEmails.length} simple)`);

    let processed = 0;
    let failed = 0;
    const results = [];

    // Process automation emails
    for (const email of automationEmails) {
      try {
        console.log(`Processing automation email ${email.id} to ${email.recipient_email}`);

        // Generate HTML from template
        const html = generateEmailHTML(email.trigger_type, email.template_data || {}, email.recipient_name);
        
        // Send via unified email service
        const { data, error } = await supabase.functions.invoke('unified-email-service', {
          body: {
            to: email.recipient_email,
            subject: generateSubject(email.trigger_type, email.template_data || {}),
            html,
            template: email.trigger_type,
            templateData: email.template_data,
            priority: getPriority(email.trigger_type),
            provider: 'auto'
          }
        });

        if (error || !data?.success) {
          throw new Error(data?.error || 'Unknown error from unified email service');
        }

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
        results.push({
          email_id: email.id,
          recipient: email.recipient_email,
          status: 'sent',
          template: email.trigger_type,
          provider: data.provider
        });

      } catch (error: any) {
        console.error(`Failed to send automation email ${email.id}:`, error);
        
        const currentAttempts = (email.attempts || 0) + 1;
        const newStatus = currentAttempts >= 3 ? 'failed' : 'pending';
        
        await supabase
          .from('email_automation_queue')
          .update({
            status: newStatus,
            error_message: error.message,
            attempts: currentAttempts,
            updated_at: new Date().toISOString(),
            ...(newStatus === 'pending' && {
              scheduled_at: new Date(Date.now() + 10 * 60 * 1000).toISOString() // Retry in 10 minutes
            })
          })
          .eq('id', email.id);

        if (newStatus === 'failed') failed++;
      }
    }

    // Process simple emails
    for (const email of simpleEmails) {
      try {
        console.log(`Processing simple email ${email.id} to ${email.to_email}`);

        // Send via unified email service
        const { data, error } = await supabase.functions.invoke('unified-email-service', {
          body: {
            to: email.to_email,
            subject: email.subject,
            html: email.html_content,
            template: email.template_name,
            templateData: email.template_data || {},
            priority: 'medium',
            provider: 'auto'
          }
        });

        if (error || !data?.success) {
          throw new Error(data?.error || 'Unknown error from unified email service');
        }

        // Update status to sent
        await supabase
          .from('email_queue_simple')
          .update({
            status: 'sent',
            sent_at: new Date().toISOString(),
            error_message: null,
            updated_at: new Date().toISOString()
          })
          .eq('id', email.id);

        processed++;
        results.push({
          email_id: email.id,
          recipient: email.to_email,
          status: 'sent',
          template: email.template_name,
          provider: data.provider
        });

      } catch (error: any) {
        console.error(`Failed to send simple email ${email.id}:`, error);
        
        const currentRetries = (email.retry_count || 0) + 1;
        const newStatus = currentRetries >= 3 ? 'failed' : 'pending';
        
        await supabase
          .from('email_queue_simple')
          .update({
            status: newStatus,
            error_message: error.message,
            retry_count: currentRetries,
            updated_at: new Date().toISOString()
          })
          .eq('id', email.id);

        if (newStatus === 'failed') failed++;
      }
    }

    const summary = {
      message: 'Smart email processing complete',
      processed,
      failed,
      retrying: totalEmails - processed - failed,
      total: totalEmails,
      timestamp: new Date().toISOString(),
      results
    };

    console.log('Processing summary:', JSON.stringify(summary, null, 2));

    return new Response(JSON.stringify(summary), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Smart email processor error:", error);
    return new Response(JSON.stringify({ 
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

function generateEmailHTML(triggerType: string, data: any, recipientName?: string): string {
  const name = recipientName || data.name || 'there';
  
  const templates: Record<string, (data: any) => string> = {
    welcome_email: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Welcome to TalentXcel! 🎉</h2>
        <p>Hi ${name}!</p>
        <p>We're excited to have you join our professional community.</p>
        <p><strong>Powering Global Career Growth</strong></p>
        <p>Best regards,<br>The TalentXcel Team</p>
      </div>
    `,
    
    job_recommendation: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">New Job Match for You! 💼</h2>
        <p>Hi ${name}!</p>
        <p>We found a job opportunity that matches your profile:</p>
        <div style="border: 1px solid #e5e7eb; padding: 20px; margin: 20px 0; border-radius: 8px;">
          <h3 style="color: #1f2937; margin: 0 0 10px 0;">${data.job_title || 'Job Title'}</h3>
          <p style="margin: 5px 0;"><strong>${data.company_name || 'Company'}</strong> • ${data.location || 'Location'}</p>
          <p style="margin: 5px 0;">Salary: ${data.salary_range || 'Competitive'}</p>
          ${data.requirements ? `<p style="margin: 5px 0;">Requirements: ${data.requirements.join(', ')}</p>` : ''}
        </div>
        <p>Best regards,<br>The TalentXcel Team</p>
      </div>
    `,
    
    connection_request: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">New Connection Request</h2>
        <p>Hi ${data.recipient_name || name}!</p>
        <p><strong>${data.requester_name}</strong> wants to connect with you.</p>
        ${data.requester_title ? `<p>Title: ${data.requester_title}</p>` : ''}
        ${data.requester_company ? `<p>Company: ${data.requester_company}</p>` : ''}
        <p>Best regards,<br>The TalentXcel Team</p>
      </div>
    `
  };

  return templates[triggerType]?.(data) || `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">TalentXcel Notification</h2>
      <p>Hi ${name}!</p>
      <p>Thank you for using TalentXcel!</p>
      <p>Best regards,<br>The TalentXcel Team</p>
    </div>
  `;
}

function generateSubject(triggerType: string, data: any): string {
  const subjects: Record<string, (data: any) => string> = {
    welcome_email: () => 'Welcome to TalentXcel! 🎉',
    job_recommendation: (data) => `New job match: ${data.job_title || 'Job Opportunity'} at ${data.company_name || 'Great Company'}`,
    connection_request: (data) => `${data.requester_name || 'Someone'} wants to connect with you`,
    application_confirmation: (data) => `Application confirmed: ${data.job_title || 'Job Application'}`,
    team_invitation: (data) => `You've been invited to join ${data.company_name || 'a company'}`,
    interview_scheduled: (data) => `Interview scheduled: ${data.job_title || 'Interview'} at ${data.company_name || 'Company'}`,
    password_reset: () => 'Reset your password - TalentXcel',
    monthly_digest: () => 'Your monthly TalentXcel digest'
  };

  return subjects[triggerType]?.(data) || 'Notification from TalentXcel';
}

function getPriority(triggerType: string): 'low' | 'medium' | 'high' {
  const priorities: Record<string, 'low' | 'medium' | 'high'> = {
    welcome_email: 'high',
    password_reset: 'high',
    interview_scheduled: 'high',
    application_confirmation: 'medium',
    team_invitation: 'medium',
    connection_request: 'medium',
    job_recommendation: 'low',
    monthly_digest: 'low'
  };

  return priorities[triggerType] || 'medium';
}

serve(handler);