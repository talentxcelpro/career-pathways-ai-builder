
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmployerRequestData {
  id: string;
  full_name: string;
  email: string;
  company_name: string;
  role?: string;
  company_description?: string;
  hiring_reason?: string;
  linkedin_profile?: string;
  phone_number?: string;
  company_website?: string;
  gst_number?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log('Notify employer request function called');

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

    console.log('Processing employer request notification:', {
      name: requestData.full_name,
      email: requestData.email,
      company: requestData.company_name,
      role: requestData.role,
    });

    // Send notification email to admin
    const adminEmailResponse = await resend.emails.send({
      from: "TalentXcel <onboarding@resend.dev>",
      to: ["talentxcelpro@gmail.com"],
      subject: "New Employer Access Request",
      html: `
        <h2>New Employer Access Request</h2>
        <p>A new employer access request has been submitted.</p>
        
        <h3>Company Information:</h3>
        <ul>
          <li><strong>Company:</strong> ${requestData.company_name}</li>
          <li><strong>Contact Person:</strong> ${requestData.full_name}</li>
          <li><strong>Email:</strong> ${requestData.email}</li>
          ${requestData.role ? `<li><strong>Role:</strong> ${requestData.role}</li>` : ''}
          ${requestData.phone_number ? `<li><strong>Phone:</strong> ${requestData.phone_number}</li>` : ''}
          ${requestData.company_website ? `<li><strong>Website:</strong> ${requestData.company_website}</li>` : ''}
          ${requestData.linkedin_profile ? `<li><strong>LinkedIn:</strong> ${requestData.linkedin_profile}</li>` : ''}
          ${requestData.gst_number ? `<li><strong>GST:</strong> ${requestData.gst_number}</li>` : ''}
        </ul>
        
        ${requestData.company_description ? `
        <h3>Company Description:</h3>
        <p>${requestData.company_description}</p>
        ` : ''}
        
        ${requestData.hiring_reason ? `
        <h3>Hiring Reason:</h3>
        <p>${requestData.hiring_reason}</p>
        ` : ''}
        
        <p>Please review and approve/reject this request in the admin panel.</p>
        <p><a href="https://dthbgsnakhoftinssoekm.supabase.co/admin/employer-requests" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Review Request</a></p>
      `,
    });

    console.log("Admin notification email sent:", adminEmailResponse);

    // Send confirmation email to applicant
    const applicantEmailResponse = await resend.emails.send({
      from: "TalentXcel <onboarding@resend.dev>",
      to: [requestData.email],
      subject: "Employer Access Request Received",
      html: `
        <h2>Thank you for your employer access request!</h2>
        <p>Dear ${requestData.full_name},</p>
        
        <p>We have received your request for employer access on TalentXcel for <strong>${requestData.company_name}</strong>.</p>
        
        <h3>What happens next?</h3>
        <ol>
          <li>Our team will review your request within 1-2 business days</li>
          <li>We may contact you for additional verification if needed</li>
          <li>Once approved, you'll receive email confirmation and full access to employer features</li>
        </ol>
        
        <h3>While you wait:</h3>
        <ul>
          <li>Prepare your company profile information</li>
          <li>Think about your first job posting</li>
          <li>Review our employer guidelines and best practices</li>
        </ul>
        
        <p>If you have any questions, please contact us at support@talentxcel.com</p>
        
        <p>Best regards,<br>The TalentXcel Team</p>
      `,
    });

    console.log("Applicant confirmation email sent:", applicantEmailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Notification emails sent',
        adminEmailId: adminEmailResponse.data?.id,
        applicantEmailId: applicantEmailResponse.data?.id 
      }),
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
