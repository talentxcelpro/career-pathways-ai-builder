import nodemailer from 'nodemailer';
import { supabase } from '@/integrations/supabase/client';

// Initialize SMTP transporter for Amazon SES
const createTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  
  if (!host || !port || !user || !pass) {
    throw new Error('SMTP configuration environment variables are required: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS');
  }
  
  return nodemailer.createTransport({
    host,
    port: parseInt(port),
    secure: false, // Use TLS
    auth: {
      user,
      pass,
    },
  });
};

interface TemplateEmailOptions {
  to: string;
  template_name: string;
  template_data?: Record<string, any>;
  from?: string;
  replyTo?: string;
}

interface QueueEmailOptions {
  to: string;
  subject: string;
  template: string;
  data?: Record<string, any>;
}

// REMOVED: sendEmail function that accepts raw HTML
// Now ONLY template-based emails are allowed

export async function sendTemplateEmail({ to, template_name, template_data = {}, from, replyTo }: TemplateEmailOptions): Promise<boolean> {
  try {
    // ENFORCE: Must use template - no raw HTML allowed
    if (!template_name) {
      throw new Error('Template name is required. Direct HTML content is not allowed.');
    }

    // Get template from database
    const { data: templateData, error: templateError } = await supabase
      .from('email_templates')
      .select('subject, html_template, is_active')
      .eq('template_name', template_name)
      .eq('is_active', true)
      .maybeSingle();

    if (templateError) {
      console.error('Error fetching template:', templateError);
      throw new Error(`Failed to fetch template: ${templateError.message}`);
    }

    if (!templateData) {
      throw new Error(`Template '${template_name}' not found or disabled. Only predefined templates are allowed.`);
    }

    // Validate template has HTML content
    if (!templateData.html_template || templateData.html_template.trim() === '') {
      throw new Error(`Template '${template_name}' has no HTML content. Template must contain valid HTML.`);
    }

    const transporter = createTransporter();
    const fromEmail = from || process.env.SMTP_FROM || 'noreply@talentxcel.in';
    
    // Prepare template data with required platform variables
    const emailData = {
      ...template_data,
      platform_name: 'TalentXcel',
      support_email: 'support@talentxcel.in',
      current_year: new Date().getFullYear().toString(),
      current_date: new Date().toLocaleDateString(),
      website_url: 'https://talentxcel.in'
    };

    // Replace template variables
    const subject = templateData.subject.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      const value = emailData[key];
      if (value === undefined || value === null) {
        console.warn(`Missing template variable: ${key}`);
        return match; // Keep original placeholder if no value found
      }
      return String(value);
    });

    const htmlContent = templateData.html_template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      const value = emailData[key];
      if (value === undefined || value === null) {
        console.warn(`Missing template variable: ${key}`);
        return match; // Keep original placeholder if no value found
      }
      return String(value);
    });

    // Final validation: Ensure we have valid HTML content
    if (!htmlContent || htmlContent.trim() === '') {
      throw new Error('Generated email content is empty. Template processing failed.');
    }

    const mailOptions = {
      from: fromEmail,
      to,
      subject,
      html: htmlContent,
      replyTo: replyTo || fromEmail,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Template email '${template_name}' sent successfully to:`, to);
    
    // Log the email delivery event
    try {
      await supabase
        .from('email_delivery_events')
        .insert({
          template_name,
          recipient_email: to,
          status: 'sent',
          sent_at: new Date().toISOString()
        });
    } catch (logError) {
      console.warn('Failed to log email delivery event:', logError);
    }

    return true;
  } catch (error: any) {
    console.error(`❌ Template email send error for '${template_name}':`, error.message);
    
    // Log failed delivery
    try {
      await supabase
        .from('email_delivery_events')
        .insert({
          template_name,
          recipient_email: to,
          status: 'failed',
          error_message: error.message,
          sent_at: new Date().toISOString()
        });
    } catch (logError) {
      console.warn('Failed to log email delivery failure:', logError);
    }
    
    throw error;
  }
}

export async function queueTemplateEmail({ to, template, data = {} }: QueueEmailOptions): Promise<string> {
  try {
    // ENFORCE: Must use template
    if (!template) {
      throw new Error('Template name is required. Direct content is not allowed.');
    }

    // Validate template exists before queuing
    const { data: templateExists, error: templateError } = await supabase
      .from('email_templates')
      .select('id, template_name, is_active')
      .eq('template_name', template)
      .eq('is_active', true)
      .maybeSingle();

    if (templateError) {
      console.error('Error validating template:', templateError);
      throw new Error(`Failed to validate template: ${templateError.message}`);
    }

    if (!templateExists) {
      throw new Error(`Template '${template}' not found or disabled. Only predefined templates can be queued.`);
    }

    const { data: queueData, error } = await supabase
      .from('email_queue')
      .insert({
        to_email: to,
        template,
        data,
        status: 'pending'
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error queuing template email:', error);
      throw error;
    }

    console.log(`✅ Template email '${template}' queued successfully:`, queueData.id);
    return queueData.id;
  } catch (error) {
    console.error('Error in queueTemplateEmail:', error);
    throw error;
  }
}

export async function processEmailQueue(): Promise<void> {
  try {
    // Get pending emails from queue
    const { data: pendingEmails, error } = await supabase
      .from('email_queue')
      .select('*')
      .eq('status', 'pending')
      .lt('retry_count', 'max_retries')
      .order('created_at', { ascending: true })
      .limit(10); // Process 10 at a time

    if (error) {
      console.error('Error fetching pending emails:', error);
      return;
    }

    if (!pendingEmails || pendingEmails.length === 0) {
      console.log('No pending emails to process');
      return;
    }

    console.log(`Processing ${pendingEmails.length} pending template emails`);

    for (const email of pendingEmails) {
      try {
        // Mark as processing
        await supabase
          .from('email_queue')
          .update({ status: 'processing' })
          .eq('id', email.id);

        // ENFORCE: Only process emails with templates
        if (!email.template) {
          throw new Error('Email in queue missing template name. Skipping.');
        }

        // Send using template-only function
        await sendTemplateEmail({
          to: email.to_email,
          template_name: email.template,
          template_data: email.data || {}
        });

        // Mark as sent
        await supabase
          .from('email_queue')
          .update({ 
            status: 'sent',
            sent_at: new Date().toISOString()
          })
          .eq('id', email.id);

        console.log(`✅ Template email sent successfully: ${email.id}`);

      } catch (error: any) {
        console.error(`❌ Failed to send template email ${email.id}:`, error.message);

        // Update with error and increment retry count
        await supabase
          .from('email_queue')
          .update({ 
            status: email.retry_count + 1 >= email.max_retries ? 'failed' : 'pending',
            error_message: error.message,
            retry_count: email.retry_count + 1
          })
          .eq('id', email.id);
      }
    }
  } catch (error) {
    console.error('Error in processEmailQueue:', error);
  }
}

// Utility function to send immediate template emails (bypassing queue)
export async function sendImmediateTemplateEmail({ to, template, data = {} }: QueueEmailOptions): Promise<boolean> {
  try {
    // ENFORCE: Must use template
    if (!template) {
      throw new Error('Template name is required. Direct content is not allowed.');
    }

    return await sendTemplateEmail({ 
      to, 
      template_name: template, 
      template_data: data 
    });
  } catch (error) {
    console.error('Error sending immediate template email:', error);
    throw error;
  }
}

// DEPRECATED: Legacy function names - redirect to template functions
export const sendEmail = () => {
  throw new Error('DEPRECATED: sendEmail() is no longer allowed. Use sendTemplateEmail() instead.');
};

export const sendImmediateEmail = () => {
  throw new Error('DEPRECATED: sendImmediateEmail() is no longer allowed. Use sendImmediateTemplateEmail() instead.');
};