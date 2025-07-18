console.log('🚀 Enhanced Send-Email Function Starting...');

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
      
      const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');
      console.log('🔑 SendGrid API key present:', !!SENDGRID_API_KEY);
      
      if (!SENDGRID_API_KEY) {
        console.log('❌ SendGrid API key not configured');
        return new Response(JSON.stringify({ error: 'SendGrid API key not configured' }), { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      console.log('📤 Sending email via SendGrid...');
      const messageId = crypto.randomUUID();
      const trackingPixel = `<img src="https://dthlgsnakhoftinssokm.supabase.co/functions/v1/email-webhook?event=opened&id=${messageId}" width="1" height="1" style="display:none;" />`;
      const htmlWithTracking = (html || '<p>Email from TalentXcel</p>') + trackingPixel;

      const emailPayload = {
        personalizations: [{ 
          to: [{ email: to }],
          custom_args: {
            message_id: messageId,
            template: template || 'generic',
            source: 'automation'
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
          message_id: messageId,
          template: template || 'generic',
          timestamp: new Date().toISOString()
        }
      };

      console.log('📋 Email payload prepared, sending to SendGrid...');
      
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${SENDGRID_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailPayload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const processingTime = Date.now() - startTime;
      console.log(`⚡ SendGrid response received in ${processingTime}ms, status:`, response.status);
      
      if (!response.ok) {
        const error = await response.text();
        console.log('❌ SendGrid error:', error);
        return new Response(JSON.stringify({ 
          error: `SendGrid Error: ${error}`,
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