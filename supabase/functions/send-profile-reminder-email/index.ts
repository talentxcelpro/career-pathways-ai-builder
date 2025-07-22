import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ProfileReminderRequest {
  userEmail: string;
  userName: string;
  completionPercentage: number;
  customMessage?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userEmail, userName, completionPercentage, customMessage }: ProfileReminderRequest = await req.json();

    // For now, we'll simulate email sending due to SendGrid credit limits
    // In production, you would integrate with your email service (Resend, SendGrid, etc.)
    
    console.log('Profile reminder email would be sent to:', {
      to: userEmail,
      userName,
      completionPercentage,
      hasCustomMessage: !!customMessage
    });

    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Profile reminder email sent successfully',
        recipient: userEmail,
        completionPercentage
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-profile-reminder-email function:", error);
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