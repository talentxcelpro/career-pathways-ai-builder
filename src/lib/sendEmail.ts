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

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}

interface QueueEmailOptions {
  to: string;
  subject: string;
  template: string;
  data?: Record<string, any>;
}

export async function sendEmail({ to, subject, html, from, replyTo }: EmailOptions): Promise<boolean> {
  try {
    const transporter = createTransporter();
    
    const fromEmail = from || process.env.SMTP_FROM || 'admin@talentxcel.in';
    
    const mailOptions = {
      from: fromEmail,
      to,
      subject,
      html,
      replyTo: replyTo || fromEmail,
    };

    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully via Amazon SES to:', to);
    return true;
  } catch (error: any) {
    console.error('Amazon SES SMTP error:', error.message);
    throw error;
  }
}

export async function queueEmail({ to, subject, template, data = {} }: QueueEmailOptions): Promise<string> {
  try {
    const { data: queueData, error } = await supabase
      .from('email_queue')
      .insert({
        to_email: to,
        subject,
        template,
        data,
        status: 'pending'
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error queuing email:', error);
      throw error;
    }

    console.log('Email queued successfully:', queueData.id);
    return queueData.id;
  } catch (error) {
    console.error('Error in queueEmail:', error);
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

    console.log(`Processing ${pendingEmails.length} pending emails`);

    for (const email of pendingEmails) {
      try {
        // Mark as processing
        await supabase
          .from('email_queue')
          .update({ status: 'processing' })
          .eq('id', email.id);

        // Import templates dynamically to avoid circular imports
        const templates = (await import('./emailTemplates')).default;
        const html = templates[email.template as keyof typeof templates]?.(email.data as Record<string, any> || {});

        if (!html) {
          throw new Error(`Template '${email.template}' not found`);
        }

        // Send the email
        await sendEmail({
          to: email.to_email,
          subject: email.subject,
          html
        });

        // Mark as sent
        await supabase
          .from('email_queue')
          .update({ 
            status: 'sent',
            sent_at: new Date().toISOString()
          })
          .eq('id', email.id);

        console.log(`Email sent successfully: ${email.id}`);

      } catch (error: any) {
        console.error(`Failed to send email ${email.id}:`, error.message);

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

// Utility function to send immediate emails (bypassing queue)
export async function sendImmediateEmail({ to, subject, template, data = {} }: QueueEmailOptions): Promise<boolean> {
  try {
    const templates = (await import('./emailTemplates')).default;
    const html = templates[template as keyof typeof templates]?.(data);

    if (!html) {
      throw new Error(`Template '${template}' not found`);
    }

    return await sendEmail({ to, subject, html });
  } catch (error) {
    console.error('Error sending immediate email:', error);
    throw error;
  }
}