console.log('🚀 Enhanced Send-Email Function Starting (SES-enabled)...');

Deno.serve(async (req) => {
  console.log('📧 Email request received:', req.method, req.url);
  
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    console.log('✅ CORS preflight request handled');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔄 Processing email request...');
    const startTime = Date.now();
    
    // Timeout protection
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
    
    try {
      const body = await req.json();
      console.log('📨 Request body received:', JSON.stringify(body, null, 2));
      
      const { to, subject, html, template, data } = body;
      
      if (!to || !subject) {
        console.log('❌ Missing required fields');
        return new Response(JSON.stringify({ error: 'Missing required fields: to, subject' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      // Check for Amazon SES SMTP configuration
      const SES_CONFIG = {
        host: Deno.env.get('SMTP_HOST'),
        port: Deno.env.get('SMTP_PORT'),
        user: Deno.env.get('SMTP_USER'),
        pass: Deno.env.get('SMTP_PASS'),
      };
      console.log('🔑 Amazon SES SMTP configured:', !!SES_CONFIG.host);
      
      if (!SES_CONFIG.host || !SES_CONFIG.user || !SES_CONFIG.pass) {
        console.log('❌ Amazon SES SMTP not fully configured');
        return new Response(JSON.stringify({ error: 'Amazon SES SMTP configuration incomplete' }), { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      console.log('📤 Sending email via Amazon SES SMTP...');
      const messageId = crypto.randomUUID();
      const trackingPixel = `<img src="https://dthlgsnakhoftinssokm.supabase.co/functions/v1/email-webhook?event=opened&id=${messageId}" width="1" height="1" style="display:none;" />`;
      const htmlWithTracking = (html || '<p>Email from TalentXcel</p>') + trackingPixel;

      console.log('📋 Email payload prepared, sending via Amazon SES SMTP...');
      
      // Use our SMTP edge function to send the email
      const response = await fetch('https://dthlgsnakhoftinssokm.supabase.co/functions/v1/send-email-smtp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: to,
          from: 'TalentXcel <admin@talentxcel.in>',
          subject: subject,
          html: htmlWithTracking,
          messageId: messageId,
          headers: {
            'X-Template': template || 'generic',
            'X-Source': 'automation'
          },
          smtp: SES_CONFIG
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const processingTime = Date.now() - startTime;
      console.log(`⚡ Amazon SES response received in ${processingTime}ms, status:`, response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ Amazon SES error:', errorText);
        return new Response(JSON.stringify({ 
          error: `Amazon SES Error: ${errorText}`,
          status: response.status,
          processingTime
        }), { 
          status: response.status >= 500 ? 500 : 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      console.log(`✅ Email sent successfully in ${processingTime}ms`);
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Email sent successfully',
        messageId,
        processingTime
      }), { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        console.log('⏰ Request timeout after 8 seconds');
        return new Response(JSON.stringify({ 
          error: 'Request timeout - email processing took too long',
          timeout: true
        }), {
          status: 408,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      throw error;
    }

  } catch (error) {
    console.error('💥 Function error:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error',
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});