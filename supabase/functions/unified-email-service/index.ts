
import { SESClient, SendEmailCommand } from "npm:@aws-sdk/client-ses@3.490.0";
import Handlebars from "npm:handlebars@4.7.8";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type AnyJson = Record<string, any>;

interface UnifiedEmailRequest {
  to: string;
  event_key?: string;             // e.g., "profile_completion_reminder"
  template?: string;              // alias for event_key for compatibility
  data?: AnyJson;                 // template variables
  subject?: string;               // DEPRECATED: use templates instead
  html?: string;                  // DEPRECATED: use templates instead
  from?: string;                  // optional from
  trackingPixel?: boolean;        // default true
  priority?: "high" | "medium" | "low";
}

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Initialize AWS SES Client safely
let sesClient: SESClient | null = null;
function initSes() {
  if (sesClient) return sesClient;
  let region = Deno.env.get("SES_REGION") || Deno.env.get("AWS_REGION") || "eu-north-1";
  if (region.includes("http") || region.includes("amazonaws.com")) {
    console.log("⚠️ Detected malformed region, cleaning up:", region);
    region = "eu-north-1";
  }
  sesClient = new SESClient({
    region,
    credentials: {
      accessKeyId: Deno.env.get("SES_ACCESS_KEY_ID") || Deno.env.get("AWS_ACCESS_KEY_ID") || "",
      secretAccessKey: Deno.env.get("SES_SECRET_ACCESS_KEY") || Deno.env.get("AWS_SECRET_ACCESS_KEY") || "",
    },
  });
  console.log("✅ SES Client initialized (unified-email-service) with region:", region);
  return sesClient;
}

function toSnakeKey(s?: string) {
  if (!s) return "";
  return s.trim().toLowerCase().replace(/[\s\-]+/g, "_");
}

function appendUtm(link: string, eventKey: string) {
  if (!link) return "https://talentxcel.in";
  const url = new URL(link, "https://talentxcel.in");
  url.searchParams.set("utm_source", "email");
  url.searchParams.set("utm_medium", "transactional");
  url.searchParams.set("utm_campaign", eventKey || "generic");
  return url.toString();
}

// Get template from either email_event_definitions or email_automation_settings
async function fetchTemplate(eventKey: string) {
  // First, try email_event_definitions (new system)
  const { data: eventDef, error: eventError } = await supabase
    .from("email_event_definitions")
    .select("*")
    .eq("event_key", eventKey)
    .eq("is_enabled", true)
    .single();

  if (eventDef && !eventError) {
    console.log(`✅ Found template in email_event_definitions: ${eventKey}`);
    return {
      subject: eventDef.email_title_template,
      html: eventDef.email_body_html_template,
      type: 'event_definition'
    };
  }

  // Fallback to email_automation_settings (legacy system)
  const { data: autoSettings, error: autoError } = await supabase
    .from("email_automation_settings")
    .select("subject_template, html_template")
    .eq("trigger_type", eventKey)
    .eq("is_enabled", true)
    .single();

  if (autoSettings && !autoError) {
    console.log(`✅ Found template in email_automation_settings: ${eventKey}`);
    return {
      subject: autoSettings.subject_template,
      html: autoSettings.html_template,
      type: 'automation_settings'
    };
  }

  // Last resort: check email_templates table
  const { data: template, error: templateError } = await supabase
    .from("email_templates")
    .select("subject, html_template")
    .eq("name", eventKey)
    .eq("is_active", true)
    .single();

  if (template && !templateError) {
    console.log(`✅ Found template in email_templates: ${eventKey}`);
    return {
      subject: template.subject,
      html: template.html_template,
      type: 'email_templates'
    };
  }

  throw new Error(`Template not found for event: ${eventKey}. Available tables checked: email_event_definitions, email_automation_settings, email_templates`);
}

function renderTemplate(templateText: string, variables: AnyJson) {
  try {
    // Use Handlebars for more robust template rendering
    const template = Handlebars.compile(templateText);
    return template(variables);
  } catch (error) {
    console.warn(`⚠️ Handlebars failed, falling back to simple replacement:`, error);
    // Fallback to simple variable replacement
    return templateText.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      const value = variables[key];
      return value !== undefined ? String(value) : match;
    });
  }
}

async function sendViaSES(to: string, subject: string, html: string, tags: { Name: string; Value: string }[], textFallback?: string) {
  const ses = initSes();
  if (!ses) throw new Error("SES client not initialized");

  const Source = Deno.env.get("SES_FROM_EMAIL") || "no-reply@talentxcel.in";
  const plainText = textFallback || html.replace(/<\/?[^>]+(>|$)/g, "").replace(/\s+/g, " ").trim();

  const cmd = new SendEmailCommand({
    Source,
    Destination: { ToAddresses: [to] },
    Message: {
      Subject: { Data: subject, Charset: "UTF-8" },
      Body: {
        Html: { Data: html, Charset: "UTF-8" },
        Text: { Data: plainText, Charset: "UTF-8" },
      },
    },
    Tags: tags,
  });

  const start = Date.now();
  const result = await ses.send(cmd);
  const responseTime = Date.now() - start;
  return { result, responseTime };
}

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const raw = await req.text();
    if (!raw) {
      return new Response(JSON.stringify({ success: false, error: "Empty body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload: UnifiedEmailRequest = JSON.parse(raw);
    const to = payload.to;
    const trackingPixel = payload.trackingPixel !== false;
    const priority = payload.priority || "medium";
    const eventKeyInput = toSnakeKey(payload.event_key || payload.template);
    const variables = {
      // Default variables
      candidate_name: "User",
      name: "User",
      company_name: "TalentXcel",
      website_url: "https://talentxcel.in",
      support_email: "support@talentxcel.in",
      current_year: new Date().getFullYear().toString(),
      platform_name: "TalentXcel",
      ...payload.data || {}
    };

    if (!to) {
      return new Response(JSON.stringify({ success: false, error: "Missing 'to' address" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ENFORCE: Templates must be used - no raw HTML
    if (!eventKeyInput && payload.subject && payload.html) {
      console.warn("⚠️ DEPRECATED: Raw HTML email detected. Please use templates instead.");
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Raw HTML emails are deprecated. Please use event_key or template parameter to specify a template.",
        available_templates: ["welcome", "profile_completion_reminder", "job_recommendation", "application_confirmation", "connection_request"]
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!eventKeyInput) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "event_key or template parameter is required",
        available_templates: ["welcome", "profile_completion_reminder", "job_recommendation", "application_confirmation", "connection_request"]
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch and render template
    const templateData = await fetchTemplate(eventKeyInput);
    const subject = renderTemplate(templateData.subject, variables);
    const finalHtml = renderTemplate(templateData.html, variables);

    console.log(`📧 Sending templated email: ${eventKeyInput} to ${to}`);
    console.log(`📋 Template source: ${templateData.type}`);

    // Tracking pixel
    const trackingId = crypto.randomUUID();
    let emailWithTracking = finalHtml;
    if (trackingPixel) {
      const pixel = `<img src="https://dthlgsnakhoftinssokm.supabase.co/functions/v1/track-email-open?id=${trackingId}" width="1" height="1" style="display:none;" alt="" />`;
      emailWithTracking = finalHtml + pixel;
    }

    // Send via SES
    const { result, responseTime } = await sendViaSES(to, subject, emailWithTracking, [
      { Name: "source", Value: "talentxcel" },
      { Name: "provider", Value: "aws_ses" },
      { Name: "priority", Value: priority },
      { Name: "event_key", Value: eventKeyInput },
      { Name: "template_source", Value: templateData.type },
    ]);

    // Log delivery
    try {
      await supabase.from("email_delivery_events").insert({
        message_id: (result as any).MessageId,
        email_address: to,
        subject,
        template_name: eventKeyInput,
        template_data: variables,
        status: "sent",
        provider: "aws_ses",
        response_time_ms: responseTime,
        tracking_id: trackingPixel ? trackingId : null,
        event_key: eventKeyInput,
        created_at: new Date().toISOString(),
      });
    } catch (logErr) {
      console.log("⚠️ Log insert failed:", logErr);
    }

    return new Response(JSON.stringify({
      success: true,
      message: "Templated email sent successfully",
      messageId: (result as any).MessageId,
      provider: "aws_ses",
      event_key: eventKeyInput,
      template_source: templateData.type,
      responseTime,
      trackingId: trackingPixel ? trackingId : null,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("❌ unified-email-service error:", error?.message || error);
    
    // Attempt failure log
    try {
      await supabase.from("email_delivery_events").insert({
        email_address: "unknown",
        subject: "Unified email failed",
        status: "failed",
        provider: "aws_ses",
        error_message: error?.message || "Unknown error",
        event_key: "unknown",
        created_at: new Date().toISOString(),
      });
    } catch (_) {}

    return new Response(JSON.stringify({
      success: false,
      error: error?.message || "Unknown error",
      help: "Ensure you're using event_key or template parameter with a valid template name",
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
