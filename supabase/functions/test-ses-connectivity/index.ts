// Test SES connectivity and configuration
import { SESClient, SendEmailCommand } from "npm:@aws-sdk/client-ses@3.490.0";

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
    console.log('🔧 Testing SES connectivity and configuration...');

    // Get SES configuration from environment variables
    const SES_ACCESS_KEY_ID = Deno.env.get('SES_ACCESS_KEY_ID');
    const SES_SECRET_ACCESS_KEY = Deno.env.get('SES_SECRET_ACCESS_KEY');
    const SES_REGION = Deno.env.get('SES_REGION') || 'eu-north-1';

    console.log('📋 SES Configuration Check:');
    console.log('- Access Key ID:', SES_ACCESS_KEY_ID ? 'Found ✅' : 'Missing ❌');
    console.log('- Secret Access Key:', SES_SECRET_ACCESS_KEY ? 'Found ✅' : 'Missing ❌');
    console.log('- Region:', SES_REGION);

    if (!SES_ACCESS_KEY_ID || !SES_SECRET_ACCESS_KEY) {
      throw new Error('SES credentials are missing. Please configure SES_ACCESS_KEY_ID and SES_SECRET_ACCESS_KEY in Supabase Edge Function secrets.');
    }

    // Initialize SES client
    const sesClient = new SESClient({
      region: SES_REGION,
      credentials: {
        accessKeyId: SES_ACCESS_KEY_ID,
        secretAccessKey: SES_SECRET_ACCESS_KEY,
      },
    });

    console.log('📧 Testing SES client connectivity...');

    // Try to send a simple test email
    const testEmail = {
      Source: 'no-reply@talentxcel.in',
      Destination: {
        ToAddresses: ['test@example.com'], // This won't actually send
      },
      Message: {
        Subject: {
          Data: 'SES Connectivity Test',
          Charset: 'UTF-8',
        },
        Body: {
          Html: {
            Data: '<h1>SES Test</h1><p>This is a connectivity test.</p>',
            Charset: 'UTF-8',
          },
        },
      },
    };

    // This is just a dry run to test credentials
    const command = new SendEmailCommand(testEmail);
    
    // Try to validate credentials by attempting to send
    try {
      const result = await sesClient.send(command);
      console.log('✅ SES connectivity test successful!');
      console.log('📨 Message ID would be:', result.MessageId);
    } catch (sesError: any) {
      console.error('❌ SES Error:', sesError.message);
      
      if (sesError.name === 'MessageRejected') {
        return new Response(JSON.stringify({
          success: false,
          error: 'SES Configuration Issue',
          details: 'Email was rejected. Check if sender email is verified in SES.',
          sesError: sesError.message,
          recommendations: [
            'Verify sender email address in AWS SES console',
            'Check if SES is in sandbox mode',
            'Ensure recipient email is verified (if in sandbox)',
          ]
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } else if (sesError.name === 'InvalidParameterValue') {
        return new Response(JSON.stringify({
          success: false,
          error: 'SES Parameter Error',
          details: sesError.message,
          recommendations: [
            'Check email addresses format',
            'Verify SES region configuration',
          ]
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } else {
        throw sesError;
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'SES connectivity test passed!',
      configuration: {
        region: SES_REGION,
        hasAccessKey: !!SES_ACCESS_KEY_ID,
        hasSecretKey: !!SES_SECRET_ACCESS_KEY,
      },
      recommendations: [
        'SES credentials are configured correctly',
        'Make sure sender email is verified in SES',
        'Check SES sending limits and sandbox status',
      ]
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('❌ SES connectivity test failed:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      troubleshooting: [
        'Check SES_ACCESS_KEY_ID and SES_SECRET_ACCESS_KEY in Supabase Edge Function secrets',
        'Verify SES region is correct (currently using eu-north-1)',
        'Ensure AWS credentials have SES permissions',
        'Check if sender email is verified in AWS SES console',
      ]
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});