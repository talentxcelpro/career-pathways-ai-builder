// Unified Email Service - simplified version without npm dependencies
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  subject: string;
  template: string;
  data?: Record<string, any>;
  priority?: "high" | "normal" | "low";
}

// Simple template engine
function renderTemplate(template: string, data: Record<string, any> = {}): string {
  let rendered = template;
  for (const [key, value] of Object.entries(data)) {
    const placeholder = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    rendered = rendered.replace(placeholder, String(value));
  }
  return rendered;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const emailRequest: EmailRequest = await req.json();
    
    console.log("Email service request:", {
      to: emailRequest.to,
      subject: emailRequest.subject,
      template: emailRequest.template
    });

    // Render email content
    const emailContent = renderTemplate(emailRequest.template, emailRequest.data || {});
    
    // Queue email for processing
    const { data, error } = await supabase
      .from('email_queue')
      .insert({
        to_email: emailRequest.to,
        subject: emailRequest.subject,
        html_content: emailContent,
        priority: emailRequest.priority || 'normal',
        status: 'pending',
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error("Failed to queue email:", error);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to queue email" }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    console.log("Email queued successfully");
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Email queued successfully" 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error) {
    console.error("Email service error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: "Internal server error" 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});