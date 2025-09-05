import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.1";

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
    console.log('Email queue processing started...');
    
    // Handle health check requests more robustly
    let body: any = {};
    try {
      const requestText = await req.text();
      if (requestText.trim()) {
        body = JSON.parse(requestText);
      }
    } catch (parseError) {
      console.log('Could not parse request body, treating as empty object');
      body = {};
    }
    
    if (body.healthCheck) {
      console.log('Health check request received');
      return new Response(JSON.stringify({ 
        status: 'healthy',
        message: 'Edge function is operational',
        timestamp: new Date().toISOString()
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get pending emails from queue, including retry logic
    // Also get failed emails that can be retried (reset their status to pending)
    const { data: pendingEmails, error: fetchError } = await supabase
      .from('email_automation_queue')
      .select('*')
      .or('status.eq.pending,and(status.eq.failed,attempts.lt.3)')
      .lte('scheduled_at', new Date().toISOString())
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
        processed: 0,
        failed: 0,
        timestamp: new Date().toISOString()
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log(`Found ${pendingEmails.length} emails to process`);

    let processed = 0;
    let failed = 0;
    const results = [];

    for (const email of pendingEmails) {
      try {
        console.log(`Processing email ${email.id} to ${email.recipient_email} (attempt ${(email.attempts || 0) + 1})`);

        // Reset failed emails to pending status for retry
        if (email.status === 'failed') {
          console.log(`Retrying failed email ${email.id}`);
          await supabase
            .from('email_automation_queue')
            .update({
              status: 'pending',
              updated_at: new Date().toISOString()
            })
            .eq('id', email.id);
        }

        // Increment attempts before processing
        await supabase
          .from('email_automation_queue')
          .update({
            attempts: (email.attempts || 0) + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', email.id);

    // Get email template and render it (robust multi-source lookup)
    let emailSubject = `TalentXcel - ${email.trigger_type.replace('_', ' ').toUpperCase()}`;
    let emailHtml = `<h1>Hello ${email.recipient_name || 'User'}!</h1><p>This is a ${email.trigger_type} notification from TalentXcel.</p>`;

    try {
      console.log(`Looking for template for trigger: "${email.trigger_type}"`);

      // 1) Try email_event_definitions (new system)
      let subjectTemplate: string | null = null;
      let htmlTemplate: string | null = null;

      const { data: eventDef, error: eventErr } = await supabase
        .from('email_event_definitions')
        .select('email_title_template, email_body_html_template, is_enabled')
        .eq('event_key', email.trigger_type)
        .eq('is_enabled', true)
        .maybeSingle();

      if (eventDef && !eventErr) {
        console.log(`✅ Using email_event_definitions for ${email.trigger_type}`);
        subjectTemplate = eventDef.email_title_template;
        htmlTemplate = eventDef.email_body_html_template;
      }

      // 2) Fallback to email_automation_settings (legacy)
      if (!htmlTemplate || !subjectTemplate) {
        const { data: autoSettings, error: autoErr } = await supabase
          .from('email_automation_settings')
          .select('subject_template, html_template, is_enabled')
          .eq('trigger_type', email.trigger_type)
          .eq('is_enabled', true)
          .maybeSingle();
        if (autoSettings && !autoErr) {
          console.log(`✅ Using email_automation_settings for ${email.trigger_type}`);
          subjectTemplate = subjectTemplate || autoSettings.subject_template;
          htmlTemplate = htmlTemplate || autoSettings.html_template;
        }
      }

      // 3) Fallback to email_templates (support multiple columns)
      if (!htmlTemplate || !subjectTemplate) {
        const { data: tmpl, error: tmplErr } = await supabase
          .from('email_templates')
          .select('subject, html_template, is_active')
          .or(`template_type.eq.${email.trigger_type},name.eq.${email.trigger_type}`)
          .eq('is_active', true)
          .limit(1)
          .maybeSingle();
        console.log('email_templates lookup:', { found: !!tmpl, err: tmplErr });
        if (tmpl && !tmplErr) {
          console.log(`✅ Using email_templates for ${email.trigger_type}`);
          subjectTemplate = subjectTemplate || tmpl.subject;
          htmlTemplate = htmlTemplate || tmpl.html_template;
        }
      }

      if (htmlTemplate && subjectTemplate) {
        // Build variables
        const templateData = email.template_data || {};
        const defaultData = {
          candidate_name: email.recipient_name || 'User',
          user_name: email.recipient_name || 'User',
          title: emailSubject,
          subtitle: 'TalentXcel Notification',
          message: `This is a ${email.trigger_type} notification from TalentXcel.`,
          footer_note: 'This email was sent automatically by TalentXcel. Please do not reply.',
          support_email: 'support@talentxcel.in',
          platform_name: 'TalentXcel',
          current_year: new Date().getFullYear().toString(),
          ...templateData,
        } as Record<string, any>;

        // Render subject with simple placeholder replacement
        emailSubject = subjectTemplate.replace(/\{\{(\w+)\}\}/g, (match, key) => {
          return defaultData[key] !== undefined ? String(defaultData[key]) : match;
        });

        // Render HTML with simple helpers, loops, and conditionals
        let rendered = htmlTemplate.replace(/\{\{(\w+)\}\}/g, (match, key) => {
          return defaultData[key] !== undefined ? String(defaultData[key]) : match;
        });

        // Sections {{#key}}...{{/key}}
        rendered = rendered.replace(/\{\{#(\w+)\}\}([\s\S]*?)\{\{\/(\w+)\}\}/g, (m, openKey, content, closeKey) => {
          if (openKey !== closeKey) return '';
          const val = defaultData[openKey];
          if (Array.isArray(val) && val.length > 0) {
            return content.replace(/\{\{#each (\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g, (_m2, eachKey, eachContent) => {
              const arr = defaultData[eachKey];
              if (!Array.isArray(arr)) return '';
              return arr.map(item => eachContent.replace(/\{\{this\}\}/g, String(item))).join('');
            });
          }
          if (val) return content;
          return '';
        });

        // Conditionals {{#if key}}...{{/if}}
        rendered = rendered.replace(/\{\{#if (\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (_m, key, content) => {
          return defaultData[key] ? content : '';
        });

        emailHtml = rendered;
      } else {
        console.warn(`⚠️ No active template found for ${email.trigger_type}. Using default plain content.`);
      }

    } catch (templateError: any) {
      console.log('Template not found or error, using default:', templateError?.message || templateError);
    }

    // Send email using direct SMTP with nodemailer
    console.log('Sending email via direct SMTP...');
    
    // Import nodemailer dynamically
    const { default: nodemailer } = await import("npm:nodemailer@6.9.1");

    // Configure SMTP transporter
    const transporter = nodemailer.createTransport({
      host: Deno.env.get('SMTP_HOST') || 'email-smtp.eu-north-1.amazonaws.com',
      port: parseInt(Deno.env.get('SMTP_PORT') || '465'),
      secure: true, // true for 465, false for other ports
      auth: {
        user: Deno.env.get('SMTP_USER'),
        pass: Deno.env.get('SMTP_PASS'),
      },
    });

    // Send email using nodemailer
    const mailResult = await transporter.sendMail({
      from: `TalentXcel <${Deno.env.get('SMTP_FROM_EMAIL') || 'noreply@talentxcel.in'}>`,
      to: email.recipient_email,
      subject: emailSubject,
      html: emailHtml,
      text: emailHtml.replace(/<[^>]+>/g, ''), // Plain text fallback
    });

    console.log('Email sent successfully:', mailResult.messageId);

        console.log(`Email sent successfully to ${email.recipient_email}`);

        // Update email status to sent
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
          template: email.trigger_type
        });

      } catch (emailError: any) {
        console.error(`Failed to send email ${email.id} to ${email.recipient_email}:`, emailError);
        
        const currentAttempts = (email.attempts || 0) + 1;
        const newStatus = currentAttempts >= 3 ? 'failed' : 'pending';
        
        // Update email with error status or mark for retry
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

        results.push({
          email_id: email.id,
          recipient: email.recipient_email,
          status: newStatus,
          template: email.trigger_type,
          error: emailError.message,
          attempts: currentAttempts
        });
      }
    }

    const summary = {
      message: 'Email processing complete',
      processed,
      failed,
      retrying: pendingEmails.length - processed - failed,
      total: pendingEmails.length,
      timestamp: new Date().toISOString(),
      results
    };

    console.log('Processing summary:', JSON.stringify(summary, null, 2));

    return new Response(JSON.stringify(summary), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error in process-email-queue function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);