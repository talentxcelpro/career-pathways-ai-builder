
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmployerRequestData {
  id: string;
  full_name: string;
  email: string;
  company_name: string;
  company_description: string;
  hiring_reason: string;
  linkedin_profile: string;
  phone_number: string;
  company_website: string;
  gst_number: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { requestId } = await req.json();

    // Fetch the employer request details
    const { data: request, error } = await supabaseClient
      .from('employer_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (error) {
      throw new Error(`Failed to fetch request: ${error.message}`);
    }

    const requestData: EmployerRequestData = request;

    // Here you would typically send an email to the admin
    // For now, we'll just log the notification
    console.log('New Employer Access Request:', {
      name: requestData.full_name,
      email: requestData.email,
      company: requestData.company_name,
      reason: requestData.hiring_reason,
      linkedin: requestData.linkedin_profile,
    });

    // You can integrate with your email service here
    // Example with a hypothetical email service:
    /*
    await sendEmail({
      to: 'talentxcelpro@gmail.com',
      subject: '🔔 New Employer Access Request on TalentXcel',
      html: `
        <h2>New Employer Access Request</h2>
        <p><strong>Name:</strong> ${requestData.full_name}</p>
        <p><strong>Email:</strong> ${requestData.email}</p>
        <p><strong>Company:</strong> ${requestData.company_name}</p>
        <p><strong>Website:</strong> ${requestData.company_website || 'Not provided'}</p>
        <p><strong>Phone:</strong> ${requestData.phone_number || 'Not provided'}</p>
        <p><strong>LinkedIn:</strong> ${requestData.linkedin_profile || 'Not provided'}</p>
        <p><strong>GST Number:</strong> ${requestData.gst_number || 'Not provided'}</p>
        <p><strong>Why they want to hire:</strong> ${requestData.hiring_reason || 'Not provided'}</p>
        <p><strong>Company Description:</strong></p>
        <p>${requestData.company_description}</p>
        
        <p>Please review this request and take appropriate action.</p>
      `
    });
    */

    return new Response(
      JSON.stringify({ success: true, message: 'Notification sent' }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in notify-employer-request function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
