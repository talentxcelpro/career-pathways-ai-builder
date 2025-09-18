import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ApplicationNotificationRequest {
  recipient_email: string;
  user_name: string;
  job_title: string;
  company?: string;
  application_link?: string;
  applicant_name?: string;
  job_id?: string;
  template_name?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Application notification email started...');
    
    // Get the full request body for placeholder replacement
    const requestBody = await req.json();
    const {
      recipient_email,
      user_name,
      job_title,
    } = requestBody;
    
    // Validate required fields
    if (!recipient_email || !user_name || !job_title) {
      throw new Error('Missing required fields: recipient_email, user_name, job_title');
    }

    console.log(`Redirecting application notification for ${job_title} to ${recipient_email} through unified service`);

    // Create Supabase client to call unified email service
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Call unified email service instead of direct SMTP
    const { data, error } = await supabase.functions.invoke('send-email-notification', {
      body: {
        event_name: 'application_notification',
        recipient_email,
        recipient_name: user_name,
        user_name,
        job_title,
        applicant_name: requestBody.applicant_name || user_name,
        company: requestBody.company,
        application_link: requestBody.application_link,
        job_id: requestBody.job_id,
        platform_name: "TalentXcel",
        support_email: "support@talentxcel.in",
        current_year: new Date().getFullYear().toString(),
        current_date: new Date().toLocaleDateString()
      }
    });

    if (error) {
      console.error('Error calling unified email service:', error);
      throw new Error(`Unified email service error: ${error.message}`);
    }

    console.log('Email sent successfully through unified service:', data);

    return new Response(JSON.stringify({
      success: true,
      message: 'Application notification email sent successfully via unified service',
      data,
      recipient: recipient_email,
      job_title
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error in send-application-notification function:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);