import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, html } = await req.json();

    const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');
    const SENDGRID_SENDER = Deno.env.get('SENDGRID_SENDER') || 'noreply@talentxcel.in';

    if (!SENDGRID_API_KEY) {
      return new Response('SendGrid API key not configured', { 
        status: 500,
        headers: corsHeaders 
      });
    }

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: SENDGRID_SENDER, name: "TalentXcel" },
        subject,
        content: [{ type: 'text/html', value: html }],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return new Response(`SendGrid Error: ${error}`, { 
        status: 500,
        headers: corsHeaders 
      });
    }

    return new Response('Email sent successfully', { 
      status: 200,
      headers: corsHeaders 
    });
  } catch (error) {
    console.error('Error in send-email function:', error);
    return new Response(`Error: ${error.message}`, { 
      status: 500,
      headers: corsHeaders 
    });
  }
});