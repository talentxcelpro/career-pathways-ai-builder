
import { SESClient, SendEmailCommand } from "npm:@aws-sdk/client-ses@3.490.0";
import Handlebars from "npm:handlebars@4.7.8";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type AnyJson = Record<string, any>;

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// SES client singletons
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
  console.log("✅ SES Client initialized (smart-email-processor) with region:", region);
  return sesClient;
}

// Master template
const MASTER_TEMPLATE_SOURCE = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>{{email_title}}</title>
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <style>
    body{margin:0;padding:0;background:#f3f4f6;font-family:'Segoe UI','Helvetica Neue',sans-serif;color:#1a1a1a;}
    .container{max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 10px rgba(0,0,0,.05);}
    .header{background:linear-gradient(to right,#1e3a8a,#2563eb);padding:24px;text-align:center;color:#fff;}
    .logo{font-size:24px;font-weight:700;text-decoration:none;display:block;color:#fff;}
    .logo span{color:#facc15;}
    .subheader{font-size:14px;margin-top:6px;color:#e0e7ff;}
    .body{padding:32px 24px;}
    .body p{font-size:15px;line-height:1.6;margin-bottom:16px;}
    .body ul{padding-left:20px;margin-bottom:24px;}
    .body ul li{margin-bottom:10px;}
    .cta{text-align:center;margin-top:20px;}
    .cta a{background:#1e40af;color:#fff;text-decoration:none;padding:14px 28px;font-weight:700;border-radius:6px;display:inline-block;}
    .footer{padding:20px;background:#f1f5f9;font-size:12px;text-align:center;color:#6b7280;}
    .footer a{color:#2563eb;margin:0 6px;text-decoration:none;}
    @media (prefers-color-scheme:dark){
      body{background:#111827;color:#f3f4f6;}
      .container{background:#1f2937;}
      .header{background:#1e3a8a;}
      .footer{background:#111827;color:#9ca3af;}
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <a href="https://talentxcel.in" class="logo">Talent<span>Xcel</span></a>
      <h2 style="margin:10px 0">{{email_title}}</h2>
      <div class="subheader">{{email_subheader}}</div>
    </div>
    <div class="body">
      {{{email_body_html}}}
      <div class="cta">
        <a href="{{cta_link}}">{{cta_text}}</a>
      </div>
      <p style="font-size:13px;color:#6b7280;text-align:center;margin-top:40px">
        This email was sent automatically by TalentXcel. Please do not reply.
      </p>
    </div>
    <div class="footer">
      © 2025 TalentXcel Services | <a href="https://talentxcel.in">talentxcel.in</a><br />
      <div style="margin-top:10px">
        <a href="https://talentxcel.in/network">Network</a>
        <a href="https://talentxcel.in/jobs">Jobs</a>
        <a href="https://talentxcel.in/employer">Employer</a>
        <a href="https://talentxcel.in/companies">Companies</a>
        <a href="https://talentxcel.in/resume">Resume Builder</a>
        <a href="https://talentxcel.in/tools">Tools</a>
        <a href="https://talentxcel.in/services">Services</a>
        <a href="https://talentxcel.in/learning">Learning</a>
        <a href="https://talentxcel.in/colleges">Colleges</a>
        <a href="https://talentxcel.in/career-map">Career Map</a>
      </div>
    </div>
  </div>
</body>
</html>`;
const MASTER_TEMPLATE = Handlebars.compile(MASTER_TEMPLATE_SOURCE);

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

async function fetchEventDefinition(eventKey: string) {
  const { data, error } = await supabase
    .from("email_event_definitions")
    .select("*")
    .eq("event_key", eventKey)
    .single();
  if (error || !data) {
    throw new Error(`Unknown or disabled email event: ${eventKey}`);
  }
  return data;
}

function renderFromDefinition(def: any, variables: AnyJson) {
  const title = Handlebars.compile(def.email_title_template)(variables);
  const subheader = Handlebars.compile(def.email_subheader_template || "")(variables);
  const bodyHtml = Handlebars.compile(def.email_body_html_template)(variables);
  const ctaText = Handlebars.compile(def.cta_text_template || "Visit TalentXcel")(variables);
  const rawCtaLink = Handlebars.compile(def.cta_link_template || "https://talentxcel.in")(variables);
  return { title, subheader, bodyHtml, ctaText, rawCtaLink };
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

async function processBatch(limit = 20) {
  // Fetch pending and scheduled
  const { data: queue, error } = await supabase
    .from("email_automation_queue")
    .select("*")
    .eq("status", "pending")
    .lte("scheduled_at", new Date().toISOString())
    .order("created_at", { ascending: true })
    .limit(limit);

  if (error) throw error;
  if (!queue || queue.length === 0) return { processed: 0, sent: 0, failed: 0 };

  let sent = 0;
  let failed = 0;

  for (const item of queue) {
    const id = item.id;
    const recipient = item.recipient_email;
    const eventKey = toSnakeKey(item.trigger_type);
    const vars = item.template_data || {};
    const priority = "medium";

    // Mark processing (best-effort)
    await supabase.from("email_automation_queue").update({ status: "processing" }).eq("id", id);

    try {
      const def = await fetchEventDefinition(eventKey);
      const rendered = renderFromDefinition(def, vars);

      const html = MASTER_TEMPLATE({
        email_title: rendered.title,
        email_subheader: rendered.subheader || "",
        email_body_html: rendered.bodyHtml,
        cta_text: rendered.ctaText || "Visit TalentXcel",
        cta_link: appendUtm(rendered.rawCtaLink || "https://talentxcel.in", eventKey),
      });

      const trackingId = crypto.randomUUID();
      const finalHtml = html + `<img src="https://dthlgsnakhoftinssokm.supabase.co/functions/v1/track-email-open?id=${trackingId}" width="1" height="1" style="display:none;" alt="" />`;

      const { result, responseTime } = await sendViaSES(recipient, rendered.title, finalHtml, [
        { Name: "source", Value: "talentxcel" },
        { Name: "provider", Value: "aws_ses" },
        { Name: "priority", Value: priority },
        { Name: "event_key", Value: eventKey },
      ]);

      // Log delivery
      await supabase.from("email_delivery_events").insert({
        message_id: (result as any).MessageId,
        email_address: recipient,
        subject: rendered.title,
        template_name: eventKey,
        template_data: vars,
        status: "sent",
        provider: "aws_ses",
        response_time_ms: responseTime,
        tracking_id: trackingId,
        event_key: eventKey,
        created_at: new Date().toISOString(),
      });

      // Mark sent
      await supabase.from("email_automation_queue").update({
        status: "sent",
        sent_at: new Date().toISOString(),
      }).eq("id", id);

      sent++;
    } catch (err: any) {
      console.error("Email processing failed for item", id, err?.message || err);
      await supabase.from("email_automation_queue").update({
        status: "failed",
        error_message: err?.message || "Unknown error",
      }).eq("id", id);

      // Log failure
      await supabase.from("email_delivery_events").insert({
        email_address: recipient || "unknown",
        subject: "Automated email failed",
        status: "failed",
        provider: "aws_ses",
        error_message: err?.message || "Unknown error",
        event_key: eventKey,
        created_at: new Date().toISOString(),
      });

      failed++;
    }
  }

  return { processed: queue.length, sent, failed };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const result = await processBatch(20);
    return new Response(JSON.stringify({ success: true, ...result, timestamp: new Date().toISOString() }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("❌ smart-email-processor error:", error?.message || error);
    return new Response(JSON.stringify({ success: false, error: error?.message || "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
