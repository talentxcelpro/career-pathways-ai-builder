// Test SendGrid Configuration
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const sendGridApiKey = Deno.env.get('SENDGRID_API_KEY');
    
    console.log('Testing SendGrid configuration...');
    console.log('SendGrid API Key exists:', !!sendGridApiKey);
    console.log('SendGrid API Key length:', sendGridApiKey ? sendGridApiKey.length : 0);
    console.log('SendGrid API Key prefix:', sendGridApiKey ? sendGridApiKey.substring(0, 10) + '...' : 'Not found');

    const result = {
      timestamp: new Date().toISOString(),
      sendgrid_configured: !!sendGridApiKey,
      api_key_length: sendGridApiKey ? sendGridApiKey.length : 0,
      api_key_prefix: sendGridApiKey ? sendGridApiKey.substring(0, 10) + '...' : null,
      status: sendGridApiKey ? 'configured' : 'missing'
    };

    return new Response(JSON.stringify(result, null, 2), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error testing SendGrid:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});