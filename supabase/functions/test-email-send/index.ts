import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Testing email sending via unified service...');

    // Test email payload
    const testEmail = {
      to: 'test@talentxcel.in', // Replace with a valid test email
      subject: 'Test Email from TalentXcel (Amazon SES)',
      html: `
        <h2>🎉 Email Service Test</h2>
        <p>This is a test email sent via Amazon SES SMTP.</p>
        <p>Timestamp: ${new Date().toISOString()}</p>
        <p>If you received this, the email migration was successful!</p>
        <hr>
        <p><small>TalentXcel Email Service</small></p>
      `,
      template: 'test',
      priority: 'high',
      provider: 'auto'
    };

    // Call the unified email service
    const response = await fetch('https://dthlgsnakhoftinssokm.supabase.co/functions/v1/unified-email-service', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testEmail),
    });

    const result = await response.json();

    if (response.ok && result.success) {
      return new Response(JSON.stringify({
        success: true,
        message: 'Test email sent successfully!',
        provider: result.provider,
        messageId: result.messageId,
        timestamp: new Date().toISOString()
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    } else {
      throw new Error(`Email service error: ${JSON.stringify(result)}`);
    }

  } catch (error: any) {
    console.error("Error sending test email:", error);
    
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