// Test Amazon SES SMTP Configuration
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
    const SES_CONFIG = {
      host: Deno.env.get('SMTP_HOST'),
      port: Deno.env.get('SMTP_PORT'),
      user: Deno.env.get('SMTP_USER'),
      pass: Deno.env.get('SMTP_PASS'),
    };
    
    console.log('Testing Amazon SES SMTP configuration...');
    console.log('SMTP Host configured:', !!SES_CONFIG.host);
    console.log('SMTP Port configured:', !!SES_CONFIG.port);
    console.log('SMTP User configured:', !!SES_CONFIG.user);
    console.log('SMTP Pass configured:', !!SES_CONFIG.pass);

    const isFullyConfigured = !!(SES_CONFIG.host && SES_CONFIG.port && SES_CONFIG.user && SES_CONFIG.pass);

    const result = {
      timestamp: new Date().toISOString(),
      smtp_host: SES_CONFIG.host || 'Not configured',
      smtp_port: SES_CONFIG.port || 'Not configured',
      smtp_user_configured: !!SES_CONFIG.user,
      smtp_pass_configured: !!SES_CONFIG.pass,
      fully_configured: isFullyConfigured,
      status: isFullyConfigured ? 'configured' : 'incomplete',
      provider: 'Amazon SES SMTP'
    };

    return new Response(JSON.stringify(result, null, 2), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error testing Amazon SES SMTP:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});