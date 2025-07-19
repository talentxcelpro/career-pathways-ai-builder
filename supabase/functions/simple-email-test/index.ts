// Simple working email test
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('OK', { headers: corsHeaders });
  }

  try {
    const sendGridApiKey = Deno.env.get('SENDGRID_API_KEY');
    
    if (!sendGridApiKey) {
      return new Response(JSON.stringify({
        success: false,
        error: 'SENDGRID_API_KEY not found'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Send email via SendGrid
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sendGridApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: 'talentxcelpro@gmail.com' }],
          subject: 'TalentXcel Email Test - SUCCESS!'
        }],
        from: { email: 'noreply@talentxcel.in', name: 'TalentXcel' },
        content: [{
          type: 'text/html',
          value: '<h1>🎉 SUCCESS!</h1><p>Your SendGrid integration is working perfectly!</p><p>Time: ' + new Date().toISOString() + '</p>'
        }]
      })
    });

    if (response.ok) {
      return new Response(JSON.stringify({
        success: true,
        message: 'Email sent successfully!'
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } else {
      const errorText = await response.text();
      return new Response(JSON.stringify({
        success: false,
        error: `SendGrid error: ${response.status} - ${errorText}`
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});