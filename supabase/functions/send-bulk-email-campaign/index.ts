import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BulkEmailRequest {
  recipients: Array<{ email: string; name: string }>;
  subject: string;
  message: string;
  emailType: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { recipients, subject, message, emailType }: BulkEmailRequest = await req.json();

    console.log(`Bulk email campaign initiated: ${emailType}`, {
      recipientCount: recipients.length,
      subject
    });

    // Simulate email sending (replace with actual email service in production)
    let successCount = 0;
    let errorCount = 0;

    for (const recipient of recipients) {
      try {
        // Simulate email sending delay
        await new Promise(resolve => setTimeout(resolve, 100));
        
        console.log(`Email sent to: ${recipient.email}`);
        successCount++;
      } catch (error) {
        console.error(`Failed to send email to ${recipient.email}:`, error);
        errorCount++;
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Bulk email campaign completed',
        stats: {
          total: recipients.length,
          successful: successCount,
          failed: errorCount
        }
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-bulk-email-campaign function:", error);
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