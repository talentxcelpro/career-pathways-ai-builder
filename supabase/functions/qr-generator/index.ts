import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.1";
import { corsHeaders } from "../_shared/cors.ts";
import QRCode from "npm:qrcode@1.5.3";

const FALLBACK_TEXT = "https://talentxcel.in/error";
const DEFAULT_SIZE = 384;
const DEFAULT_MARGIN = 2;
const DEFAULT_ECL = "H" as const;

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error("Timeout")), ms)) as Promise<T>,
  ]);
}

// Generate QR as data URL - safe for Deno runtime
async function generateQRDataUrl(
  text: string,
  opts?: { width?: number; margin?: number; errorCorrectionLevel?: "L" | "M" | "Q" | "H" }
): Promise<string> {
  return await QRCode.toDataURL(text, {
    errorCorrectionLevel: opts?.errorCorrectionLevel ?? DEFAULT_ECL,
    width: opts?.width ?? DEFAULT_SIZE,
    margin: opts?.margin ?? DEFAULT_MARGIN,
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    let body: any;
    try {
      body = await req.json();
    } catch (err) {
      console.error("Invalid JSON:", err);
      const fallback = await generateQRDataUrl(FALLBACK_TEXT, {
        errorCorrectionLevel: DEFAULT_ECL,
        width: DEFAULT_SIZE,
        margin: DEFAULT_MARGIN,
      });
      return json({ success: false, error: "Invalid JSON in request body", qrCodeData: fallback, timestamp: now() }, 200);
    }

    console.log("QR Generator called:", body);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const userId: string | null = body.userId ?? body.user_id ?? null;
    const textInput = (body.text ?? body.data ?? body.url ?? "").toString().trim();

    // Generic QR mode (no userId provided) - return QR directly
    if (!userId) {
      if (textInput.length > 0) {
        try {
          const dataUrl = await withTimeout(
            generateQRDataUrl(textInput, {
              errorCorrectionLevel: DEFAULT_ECL,
              width: DEFAULT_SIZE,
              margin: DEFAULT_MARGIN,
            }),
            5000
          );
          return json({ success: true, mode: "generic", qrCodeData: dataUrl, timestamp: now() });
        } catch (genErr) {
          console.error("QR generation error (generic):", genErr);
          // Log error to platform_analytics
          try {
            await supabase.from("platform_analytics").insert({
              user_id: "system",
              event_type: "qr_generation_error",
              module_name: "qr-generator",
              event_data: { error: getErrMsg(genErr), text: textInput },
              session_id: generateSessionId(),
              timestamp: now(),
            });
          } catch (logErr) {
            console.warn("Failed to log error:", logErr);
          }
          
          const fallback = await generateQRDataUrl(FALLBACK_TEXT, {
            errorCorrectionLevel: DEFAULT_ECL,
            width: DEFAULT_SIZE,
            margin: DEFAULT_MARGIN,
          });
          return json({ success: false, mode: "generic", error: "QR generation failed", qrCodeData: fallback, timestamp: now() });
        }
      } else {
        const fallback = await generateQRDataUrl(FALLBACK_TEXT, {
          errorCorrectionLevel: DEFAULT_ECL,
          width: DEFAULT_SIZE,
          margin: DEFAULT_MARGIN,
        });
        return json({ success: false, mode: "generic", error: "userId or text is required", qrCodeData: fallback, timestamp: now() });
      }
    }

    const custom = (body.customUrl ?? "").toString().trim();
    let publicSlug: string;
    if (custom) {
      const sanitized = validateCustomSlug(custom);
      publicSlug = sanitized ?? generateUniqueSlug(userId);
    } else {
      publicSlug = generateUniqueSlug(userId);
    }

    const publicUrl = `https://talentxcel.lovable.app/passport/${publicSlug}`;

    // Generate QR code (with timeout + resilient options)
    let dataUrl: string;
    try {
      dataUrl = await withTimeout(
        generateQRDataUrl(publicUrl, {
          errorCorrectionLevel: DEFAULT_ECL,
          width: DEFAULT_SIZE,
          margin: DEFAULT_MARGIN,
        }),
        5000
      );
    } catch (genErr) {
      console.error("QR generation error (profile):", genErr);
      // Log error to platform_analytics
      try {
        await supabase.from("platform_analytics").insert({
          user_id: userId,
          event_type: "qr_generation_error",
          module_name: "qr-generator",
          event_data: { error: getErrMsg(genErr), url: publicUrl },
          session_id: generateSessionId(),
          timestamp: now(),
        });
      } catch (logErr) {
        console.warn("Failed to log error:", logErr);
      }
      
      dataUrl = await generateQRDataUrl(FALLBACK_TEXT, {
        errorCorrectionLevel: DEFAULT_ECL,
        width: DEFAULT_SIZE,
        margin: DEFAULT_MARGIN,
      });
    }

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
      // Do not fail QR generation if DB save fails; return QR and URL with a warning
      return json({ success: true, warning: "Public profile not saved", publicUrl, qrCodeData: dataUrl, timestamp: now() });
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
    
    // Always return a fallback QR code, never fail completely
    try {
      const fallback = await generateQRDataUrl(FALLBACK_TEXT, {
        errorCorrectionLevel: DEFAULT_ECL,
        width: DEFAULT_SIZE,
        margin: DEFAULT_MARGIN,
      });
      return json({ success: false, error: getErrMsg(error), qrCodeData: fallback, timestamp: now() });
    } catch (fallbackErr) {
      console.error("Even fallback QR failed:", fallbackErr);
      return json({ success: false, error: "Complete QR generation failure", timestamp: now() }, 500);
    }
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