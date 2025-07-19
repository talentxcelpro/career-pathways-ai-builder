import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Email test function called');
    
    // Check environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const sendGridApiKey = Deno.env.get('SENDGRID_API_KEY');
    
    console.log('Environment check:', {
      supabase_url: !!supabaseUrl,
      service_key: !!supabaseServiceKey,
      sendgrid_key: !!sendGridApiKey,
      sendgrid_length: sendGridApiKey?.length || 0
    });

    // Test SendGrid API directly
    if (sendGridApiKey) {
      console.log('🔑 Testing SendGrid API...');
      
      const testEmail = {
        personalizations: [{
          to: [{ email: 'talentxcelpro@gmail.com', name: 'Test User' }],
          subject: 'SendGrid Test - Working!'
        }],
        from: { email: 'noreply@talentxcel.in', name: 'TalentXcel' },
        content: [{
          type: 'text/html',
          value: '<h1>SendGrid is working!</h1><p>This test email confirms your SendGrid integration is functional.</p>'
        }]
      };

      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sendGridApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testEmail)
      });

      const responseText = await response.text();
      console.log('SendGrid response:', response.status, responseText);

      if (response.ok) {
        console.log('✅ SendGrid test email sent successfully!');
        
        // Also test Supabase connection
        if (supabaseUrl && supabaseServiceKey) {
          const supabase = createClient(supabaseUrl, supabaseServiceKey);
          
          // Insert test record
          const { error } = await supabase
            .from('email_automation_queue')
            .insert({
              trigger_type: 'test_email',
              recipient_email: 'talentxcelpro@gmail.com',
              recipient_name: 'Test User',
              template_data: { message: 'SendGrid test successful' },
              status: 'sent',
              sent_at: new Date().toISOString()
            });
            
          if (error) {
            console.error('Database insert error:', error);
          } else {
            console.log('✅ Database insert successful');
          }
        }

        return new Response(JSON.stringify({
          success: true,
          message: 'SendGrid is working! Test email sent.',
          sendgrid_configured: true,
          api_key_length: sendGridApiKey.length,
          email_sent: true,
          timestamp: new Date().toISOString()
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } else {
        console.error('❌ SendGrid API error:', response.status, responseText);
        return new Response(JSON.stringify({
          success: false,
          error: `SendGrid API error: ${response.status}`,
          response: responseText
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    } else {
      console.error('❌ SendGrid API key not found');
      return new Response(JSON.stringify({
        success: false,
        error: 'SendGrid API key not configured',
        sendgrid_configured: false
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    console.error('❌ Function error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});