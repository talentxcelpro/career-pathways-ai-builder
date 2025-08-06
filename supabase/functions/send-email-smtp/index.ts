const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  to: string;
  from: string;
  subject: string;
  html: string;
  messageId?: string;
  headers?: Record<string, string>;
  smtp: {
    host: string;
    port: string;
    user: string;
    pass: string;
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
    const { to, from, subject, html, messageId, headers, smtp } = emailData;

    console.log(`📧 Sending email via SMTP to: ${to}`);

    // Validate required fields
    if (!to || !from || !subject || !html) {
      throw new Error('Missing required email fields: to, from, subject, html');
    }

    if (!smtp || !smtp.host || !smtp.user || !smtp.pass) {
      throw new Error('Missing SMTP configuration: host, user, pass are required');
    }

    // Dynamically import nodemailer
    const nodemailer = await import('npm:nodemailer@6.9.8');

    console.log('🔧 Creating SMTP transporter...');
    const transporter = nodemailer.default.createTransporter({
      host: smtp.host,
      port: parseInt(smtp.port) || 587,
      secure: false, // Use STARTTLS
      auth: {
        user: smtp.user,
        pass: smtp.pass,
      },
      debug: true,
      logger: true,
    });

    console.log('✉️ Sending email...');
    const info = await transporter.sendMail({
      from: from,
      to: to,
      subject: subject,
      html: html,
      messageId: messageId || crypto.randomUUID(),
      headers: headers,
    });

    console.log('✅ Email sent successfully:', info.messageId);

    return new Response(JSON.stringify({
      success: true,
      messageId: info.messageId,
      provider: 'smtp',
      response: info.response
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('❌ SMTP email service error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Unknown error occurred',
      stack: error.stack
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});