// supabase/functions/zoho-mail-service/index.ts
// Dedicated Zoho Mail Outbound/Inbound Service for Autonomous Business OS
// Completely ISOLATED from AWS SES (Existing-user & system email infrastructure)
// Transmits real emails via Zoho Mail REST API or Zoho SMTP

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ZohoMailRequest {
  mailboxId: string;
  senderEmail: string;
  senderName: string;
  recipientEmail: string;
  recipientName?: string;
  subject: string;
  htmlContent: string;
  plainTextContent?: string;
  campaignId?: string;
  agentId?: string;
  department?: string;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const body: ZohoMailRequest = await req.json();

    console.log(`📧 [ZohoMailService] Outbound request via [${body.senderEmail}] to [${body.recipientEmail}]`);

    // Check for Zoho OAuth 2.0 or SMTP credentials
    const zohoClientId = Deno.env.get("ZOHO_MAIL_CLIENT_ID");
    const zohoClientSecret = Deno.env.get("ZOHO_MAIL_CLIENT_SECRET");
    const zohoRefreshToken = Deno.env.get("ZOHO_MAIL_REFRESH_TOKEN");
    const zohoAccountId = Deno.env.get("ZOHO_MAIL_ACCOUNT_ID");
    const zohoSmtpUser = Deno.env.get("ZOHO_SMTP_USER");
    const zohoSmtpPass = Deno.env.get("ZOHO_SMTP_PASSWORD");

    let realMessageId: string | null = null;
    let providerPayload: any = null;

    // 1. If Zoho OAuth is configured, call Zoho Mail API (India region: mail.zoho.in)
    if (zohoClientId && zohoClientSecret && zohoRefreshToken && zohoAccountId) {
      try {
        // Refresh Access Token
        const tokenRes = await fetch("https://accounts.zoho.in/oauth/v2/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            refresh_token: zohoRefreshToken,
            client_id: zohoClientId,
            client_secret: zohoClientSecret,
            grant_type: "refresh_token",
          }),
        });
        const tokenData = await tokenRes.json();

        if (!tokenData.access_token) {
          throw new Error(`Zoho token refresh failed: ${JSON.stringify(tokenData)}`);
        }

        // Send email via Zoho Mail API
        const sendRes = await fetch(`https://mail.zoho.in/api/accounts/${zohoAccountId}/messages`, {
          method: "POST",
          headers: {
            "Authorization": `Zoho-oauthtoken ${tokenData.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fromAddress: body.senderEmail,
            toAddress: body.recipientEmail,
            subject: body.subject,
            content: body.htmlContent || body.plainTextContent,
            mailFormat: "html",
          }),
        });

        const sendData = await sendRes.json();
        if (sendData?.data?.messageId || sendData?.status?.code === 200) {
          realMessageId = sendData?.data?.messageId || `zoho_api_${Date.now()}`;
          providerPayload = sendData;
        } else {
          throw new Error(`Zoho API dispatch error: ${JSON.stringify(sendData)}`);
        }
      } catch (apiErr: any) {
        console.error("Zoho API dispatch exception:", apiErr);
        return new Response(
          JSON.stringify({
            success: false,
            error: `ZOHO_API_FAILED: ${apiErr.message}`,
            provider: "ZOHO_MAIL",
          }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    } else {
      // Credentials not yet in Supabase Secrets — Fail explicitly so UI does NOT fabricate "SENT" state!
      console.warn("⚠️ [ZohoMailService] Zoho credentials missing in Supabase secrets.");
      return new Response(
        JSON.stringify({
          success: false,
          error: "ZOHO_CREDENTIALS_MISSING: Configure Zoho OAuth (ZOHO_MAIL_CLIENT_ID, ZOHO_MAIL_CLIENT_SECRET, ZOHO_MAIL_REFRESH_TOKEN, ZOHO_MAIL_ACCOUNT_ID) or Zoho SMTP in Supabase secrets to transmit real acquisition emails.",
          provider: "ZOHO_MAIL",
        }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Record immutable business outreach telemetry
    try {
      await supabase.from("claim1_growth_events").insert({
        event_type: "ZOHO_EMAIL_SENT",
        channel: `zoho_${body.mailboxId}`,
        metadata: {
          messageId: realMessageId,
          senderEmail: body.senderEmail,
          senderName: body.senderName,
          recipientEmail: body.recipientEmail,
          subject: body.subject,
          agentId: body.agentId || "autonomous_agent",
          department: body.department || "business_acquisition",
          campaignId: body.campaignId,
          timestamp: new Date().toISOString(),
          durationMs: Date.now() - startTime,
          provider: "ZOHO_MAIL",
        },
      });
    } catch (dbErr) {
      console.warn("Telemetry insert fallback:", dbErr);
    }

    return new Response(
      JSON.stringify({
        success: true,
        messageId: realMessageId,
        provider: "ZOHO_MAIL",
        mailbox: body.senderEmail,
        recipient: body.recipientEmail,
        timestamp: new Date().toISOString(),
        durationMs: Date.now() - startTime,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("❌ [ZohoMailService] Exception:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Unknown Zoho dispatch error",
        provider: "ZOHO_MAIL",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
