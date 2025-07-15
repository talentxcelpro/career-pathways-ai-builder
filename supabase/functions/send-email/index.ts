console.log('Send-email function starting...');

Deno.serve(async (req) => {
  console.log('Send-email request received:', req.method, req.url);
  
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Processing email request...');
    
    // For now, just test basic functionality
    const body = await req.json();
    console.log('Request body received:', JSON.stringify(body, null, 2));
    
    const { to, subject, html } = body;
    
    if (!to || !subject) {
      console.log('Missing required fields');
      return new Response(JSON.stringify({ error: 'Missing required fields: to, subject' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');
    console.log('SendGrid API key present:', !!SENDGRID_API_KEY);
    
    if (!SENDGRID_API_KEY) {
      console.log('SendGrid API key not configured');
      return new Response(JSON.stringify({ error: 'SendGrid API key not configured' }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('Sending email via SendGrid...');
    const messageId = crypto.randomUUID();
    const trackingPixel = `<img src="https://dthlgsnakhoftinssokm.supabase.co/functions/v1/email-webhook?event=opened&id=${messageId}" width="1" height="1" style="display:none;" />`;
    const htmlWithTracking = (html || '<p>Test email from TalentXcel</p>') + trackingPixel;

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ 
          to: [{ email: to }],
          custom_args: {
            message_id: messageId
          }
        }],
        from: { email: 'noreply@talentxcel.in', name: "TalentXcel" },
        subject,
        content: [{ type: 'text/html', value: htmlWithTracking }],
        tracking_settings: {
          click_tracking: { enable: true },
          open_tracking: { enable: true },
          subscription_tracking: { enable: false }
        },
        custom_args: {
          message_id: messageId
        }
      }),
    });

    console.log('SendGrid response status:', response.status);
    
    if (!response.ok) {
      const error = await response.text();
      console.log('SendGrid error:', error);
      return new Response(JSON.stringify({ error: `SendGrid Error: ${error}` }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('Email sent successfully');
    return new Response(JSON.stringify({ success: true, message: 'Email sent successfully' }), { 
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Function error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});