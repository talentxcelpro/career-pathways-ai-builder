import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.1";
import { corsHeaders } from "../_shared/cors.ts";
// Deno QR code generator that outputs SVG
import { QRCode } from "https://deno.land/x/qrcode@v2.0.0/mod.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    let body: any;
    try {
      body = await req.json();
    } catch (err) {
      console.error("Invalid JSON:", err);
      return json({ success: false, error: "Invalid JSON in request body", timestamp: now() }, 400);
    }

    console.log("QR Generator called:", body);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const userId: string | null = body.userId ?? body.user_id ?? null;
    if (!userId) {
      return json({ success: false, error: "userId is required", timestamp: now() }, 400);
    }

    const custom = (body.customUrl ?? "").toString().trim();
    const publicSlug = custom ? validateCustomSlug(custom) : generateUniqueSlug(userId);
    if (!publicSlug) {
      return json({ success: false, error: "customUrl contains invalid characters", timestamp: now() }, 400);
    }

    const publicUrl = `https://talentxcel.lovable.app/passport/${publicSlug}`;

    // Real QR SVG
    const svg = await QRCode.render(publicUrl, { type: "svg", scale: 4 });
    const dataUrl = `data:image/svg+xml;base64,${btoa(svg)}`;

    // Upsert public profile
    const { data: upserted, error: upsertErr } = await supabase
      .from("public_profiles")
      .upsert(
        {
          user_id: userId,
          public_url_slug: publicSlug,
          qr_code_data: dataUrl,
          is_active: true,
          updated_at: now(),
        },
        { onConflict: "user_id" }
      )
      .select()
      .single();

    if (upsertErr) {
      console.error("Public profile save error:", upsertErr);
      return json({ success: false, error: "Failed to save public profile", timestamp: now() }, 500);
    }

    // Log analytics (best effort)
    try {
      await supabase.from("platform_analytics").insert({
        user_id: userId,
        event_type: "qr_code_generated",
        module_name: "passport",
        event_data: { public_url: publicUrl, slug: publicSlug },
        session_id: generateSessionId(),
        timestamp: now(),
      });
    } catch (err) {
      console.warn("Non-blocking analytics insert error:", err);
    }

    console.log("QR code generated successfully:", { userId, publicSlug });

    return json(
      { success: true, qrCodeData: dataUrl, publicUrl, data: upserted, timestamp: now() },
      200
    );
  } catch (error) {
    console.error("QR Generator error:", error);
    return json({ success: false, error: getErrMsg(error), timestamp: now() }, 500);
  }
});

/** helpers */
function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
function now() { return new Date().toISOString(); }
function getErrMsg(e: unknown) { return e instanceof Error ? e.message : "Internal server error"; }

function validateCustomSlug(slug: string): string | null {
  // allow a-z, 0-9, dash
  const ok = /^[a-z0-9-]{3,64}$/.test(slug);
  return ok ? slug : null;
}

function generateUniqueSlug(userId: string) {
  const uid = (userId ?? "").toString().slice(0, 8);
  const ts = Date.now().toString(36);
  const rand = crypto?.randomUUID?.().slice(0, 6) ?? Math.random().toString(36).slice(2, 8);
  return `${uid}-${ts}-${rand}`.toLowerCase();
}

function generateSessionId() {
  const rand = crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);
  return `session_${Date.now()}_${rand}`;
}