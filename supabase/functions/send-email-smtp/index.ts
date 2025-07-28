import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, from, subject, html, messageId, headers, smtp }: EmailRequest = await req.json();

    console.log(`Sending email via Amazon SES SMTP to: ${to}`);

    if (!to || !from || !subject || !html) {
      throw new Error('Missing required email fields');
    }

    if (!smtp.host || !smtp.user || !smtp.pass) {
      throw new Error('Missing SMTP configuration');
    }

    // Create email message in RFC2822 format
    const boundary = `----boundary_${Date.now()}`;
    const emailMessage = [
      `From: ${from}`,
      `To: ${to}`,
      `Subject: ${subject}`,
      `Message-ID: <${messageId || crypto.randomUUID()}@talentxcel.in>`,
      `Content-Type: text/html; charset=UTF-8`,
      `Content-Transfer-Encoding: 7bit`,
      ...(headers ? Object.entries(headers).map(([key, value]) => `${key}: ${value}`) : []),
      ``,
      html
    ].join('\r\n');

    // Send via SMTP using Deno's built-in capabilities
    try {
      // For now, we'll use a simple approach that works with Amazon SES
      // In a production environment, you might want to use a more robust SMTP client
      
      const conn = await Deno.connect({
        hostname: smtp.host,
        port: parseInt(smtp.port),
      });

      const decoder = new TextDecoder();
      const encoder = new TextEncoder();

      // Read SMTP greeting
      const buffer = new Uint8Array(1024);
      await conn.read(buffer);
      console.log('SMTP Greeting:', decoder.decode(buffer));

      // SMTP conversation
      const commands = [
        `EHLO talentxcel.in\r\n`,
        `STARTTLS\r\n`,
        `AUTH LOGIN\r\n`,
        `${btoa(smtp.user)}\r\n`,
        `${btoa(smtp.pass)}\r\n`,
        `MAIL FROM:<${from}>\r\n`,
        `RCPT TO:<${to}>\r\n`,
        `DATA\r\n`,
        `${emailMessage}\r\n.\r\n`,
        `QUIT\r\n`
      ];

      for (const command of commands) {
        await conn.write(encoder.encode(command));
        const response = new Uint8Array(1024);
        await conn.read(response);
        console.log('SMTP Response:', decoder.decode(response));
      }

      conn.close();

      return new Response(JSON.stringify({ 
        success: true,
        messageId: messageId || crypto.randomUUID(),
        provider: 'ses'
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });

    } catch (smtpError) {
      console.error('SMTP Error:', smtpError);
      throw new Error(`SMTP connection failed: ${smtpError.message}`);
    }

  } catch (error: any) {
    console.error("SMTP email service error:", error);
    
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);