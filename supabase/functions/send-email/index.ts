import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('send-email function called with method:', req.method);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Processing email request...');
    
    const requestBody = await req.text();
    console.log('Raw request body:', requestBody);
    
    let parsedBody;
    try {
      parsedBody = JSON.parse(requestBody);
      console.log('Parsed request body:', parsedBody);
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return new Response(JSON.stringify({ error: 'Invalid JSON in request body' }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { to, subject, html } = parsedBody;
    console.log('Extracted email data:', { to, subject, htmlLength: html?.length });

    if (!to || !subject || !html) {
      console.error('Missing required fields:', { to: !!to, subject: !!subject, html: !!html });
      return new Response(JSON.stringify({ error: 'Missing required fields: to, subject, html' }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');
    const SENDGRID_SENDER = Deno.env.get('SENDGRID_SENDER') || 'noreply@talentxcel.in';

    console.log('Environment check:', {
      hasApiKey: !!SENDGRID_API_KEY,
      apiKeyPrefix: SENDGRID_API_KEY?.substring(0, 7),
      sender: SENDGRID_SENDER
    });

    if (!SENDGRID_API_KEY) {
      console.error('SENDGRID_API_KEY environment variable not set');
      return new Response(JSON.stringify({ error: 'SendGrid API key not configured' }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const emailPayload = {
      personalizations: [{ 
        to: [{ email: to }],
        subject: subject
      }],
      from: { email: SENDGRID_SENDER, name: "TalentXcel" },
      content: [{ type: 'text/html', value: html }],
    };

    console.log('Sending email to SendGrid...');
    console.log('Email payload:', JSON.stringify(emailPayload, null, 2));

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload),
    });

    console.log('SendGrid response status:', response.status);
    console.log('SendGrid response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('SendGrid API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      return new Response(JSON.stringify({ 
        error: `SendGrid Error (${response.status}): ${errorText}` 
      }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('Email sent successfully!');
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Email sent successfully' 
    }), { 
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Unexpected error in send-email function:', error);
    console.error('Error stack:', error.stack);
    return new Response(JSON.stringify({ 
      error: `Unexpected error: ${error.message}` 
    }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});