import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  to?: string;
  from?: string;
  subject?: string;
  html?: string;
  text?: string; // optional plain-text body
  messageId?: string;
  replyTo?: string;
  headers?: Record<string, string>;
  smtp?: {
    host?: string;
    port?: string;
    user?: string;
    pass?: string;
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('📧 SMTP Email Function Starting...');
    console.log('📊 Request method:', req.method);

    const requestBody = await req.text();
    console.log('📄 Raw request body:', requestBody);

    if (!requestBody) {
      throw new Error('Request body is empty');
    }

    const emailData: EmailRequest = JSON.parse(requestBody);
    let to = emailData.to;
    let from = emailData.from || Deno.env.get('SMTP_FROM') || Deno.env.get('SES_FROM_EMAIL') || 'TalentXcel <noreply@talentxcel.in>';
    let subject = emailData.subject || 'TalentXcel Notification';
    let html = emailData.html;
    let text = (emailData as any).text ?? (emailData as any).content;
    const messageId = emailData.messageId;

    console.log(`📧 Sending email via SMTP to: ${to}`);

    // Validate required fields
    if (!to) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required field: to' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    if (!html && !text) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing email body: provide html or text' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const host = emailData.smtp?.host || Deno.env.get('SMTP_HOST');
    const portFromReq = emailData.smtp?.port ? parseInt(emailData.smtp.port) : undefined;
    const portFromEnv = Deno.env.get('SMTP_PORT') ? parseInt(Deno.env.get('SMTP_PORT')!) : undefined;
    const inferredDefaultPort = host && host.includes('email-smtp.') ? 465 : 587;

    // Prefer env SMTP creds when request includes placeholders or missing values
    const isPlaceholder = (v?: string) => !v || /WILL_BE_SET|YOUR_|PLACEHOLDER|xxxxx?|test|example/i.test(v);
    const userProvided = emailData.smtp?.user;
    const passProvided = emailData.smtp?.pass;

    const smtpConfig = {
      host,
      port: portFromReq ?? portFromEnv ?? inferredDefaultPort,
      user: isPlaceholder(userProvided) ? Deno.env.get('SMTP_USER') : userProvided,
      pass: isPlaceholder(passProvided) ? Deno.env.get('SMTP_PASS') : passProvided,
    };

    // Force implicit TLS on port 465 for Amazon SES hosts regardless of incoming port/env
    if (smtpConfig.host && smtpConfig.host.includes('email-smtp.') && smtpConfig.port !== 465) {
      console.log('⚠️ Overriding SES SMTP port to 465 (implicit TLS)');
      smtpConfig.port = 465;
    }
    if (!smtpConfig.host || !smtpConfig.user || !smtpConfig.pass) {
      throw new Error('Missing SMTP configuration in environment variables');
    }

    console.log('🔧 Creating SMTP client...');
    console.log('📡 SMTP Host:', smtpConfig.host);
    console.log('📡 SMTP Port:', smtpConfig.port);
    console.log('🔒 SMTP user configured:', smtpConfig.user ? 'yes' : 'no');
    console.log('🔐 TLS mode:', smtpConfig.port === 465 ? 'implicit TLS (465)' : 'STARTTLS (587)');

    // Create SMTP client with denomailer
    const client = new SMTPClient({
      connection: {
        hostname: smtpConfig.host,
        port: smtpConfig.port,
        tls: smtpConfig.port === 465,
        auth: {
          username: smtpConfig.user,
          password: smtpConfig.pass,
        },
      },
    });

    console.log('✉️ Sending email...');

    // Build text/html bodies robustly
    const htmlToText = (h: string) =>
      (h || '')
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/\s+/g, ' ')
        .trim();

    let textFinal = text || (html ? htmlToText(html) : undefined);
    let htmlFinal = html;

    if (!htmlFinal && textFinal) {
      const escaped = textFinal
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      htmlFinal = `<pre style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; white-space: pre-wrap;">${escaped}</pre>`;
    }

    if (!textFinal && htmlFinal) {
      textFinal = htmlToText(htmlFinal);
    }

    if (!htmlFinal && !textFinal) {
      return new Response(
        JSON.stringify({ success: false, error: 'Email content is empty after normalization' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Send the email with explicit HTML + text parts (multipart/alternative)
    await client.send({
      from: from,
      to: to,
      subject: subject,
      content: textFinal || ' ',
      html: htmlFinal,
      headers: {
        ...(emailData.headers || {}),
        ...(emailData.replyTo ? { 'Reply-To': emailData.replyTo } : {}),
      },
    });

    console.log('📤 Closing SMTP connection...');
    await client.close();

    const responseMessageId = messageId || crypto.randomUUID();
    console.log('✅ Email sent successfully:', responseMessageId);

    return new Response(JSON.stringify({
      success: true,
      messageId: responseMessageId,
      provider: 'smtp-denomailer',
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('❌ SMTP email service error:', error);
    const message = error?.message || 'Unknown error occurred';
    const status = message.includes('535') ? 401 : 500;
    const friendly = message.includes('535')
      ? 'SMTP authentication failed (535). Verify SMTP_USER/PASS and that you are using SES SMTP credentials for the correct region.'
      : message;
    
    return new Response(JSON.stringify({
      success: false,
      error: friendly,
      stack: error.stack,
      timestamp: new Date().toISOString()
    }), {
      status,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});