import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { corsHeaders } from "../_shared/cors.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

interface EmailRequest {
  to: string;
  subject: string;
  body: string;
  from?: string;
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, body, from }: EmailRequest = await req.json();

    if (!to || !subject || !body) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Missing required fields: to, subject, body" 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Sending email to ${to} with subject: ${subject}`);

    const emailResponse = await resend.emails.send({
      from: from || "TalentXcel <noreply@talentxcel.com>",
      to: [to],
      subject: subject,
      html: body,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Email sent successfully",
        id: emailResponse.data?.id
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in send-email-smtp function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});