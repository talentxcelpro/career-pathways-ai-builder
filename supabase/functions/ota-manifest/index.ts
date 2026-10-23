import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

interface ManifestPayload {
  version: string;
  url: string;
  checksum: string;
  notes?: string;
  minNativeVersion?: string;
  updatedAt?: string;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const url = new URL(req.url);
  const clientNativeVersion = url.searchParams.get("nativeVersion");

  try {
    // GET: Serve current manifest with cache headers and optional native compatibility check
    if (req.method === "GET") {
      const { data, error } = await supabase.storage
        .from("ota-bundles")
        .download("manifest.json");

      if (error || !data) {
        return new Response(
          JSON.stringify({
            updateAvailable: false,
            message: "No active bundle manifest found",
          }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const text = await data.text();
      const manifest: ManifestPayload = JSON.parse(text);

      // Check minimum native binary compatibility if passed
      if (clientNativeVersion && manifest.minNativeVersion) {
        const isClientTooOld = clientNativeVersion < manifest.minNativeVersion;
        if (isClientTooOld) {
          return new Response(
            JSON.stringify({
              updateAvailable: false,
              requireStoreUpdate: true,
              message: `Native shell v${clientNativeVersion} requires store update to >= v${manifest.minNativeVersion}`,
            }),
            {
              status: 200,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
      }

      return new Response(JSON.stringify(manifest), {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=30, s-maxage=30",
        },
      });
    }

    // POST: Update manifest (called by CI pipeline or admin)
    if (req.method === "POST") {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader || !authHeader.includes(supabaseServiceKey)) {
        return new Response(
          JSON.stringify({ error: "Unauthorized: Service key required" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const body: ManifestPayload = await req.json();
      if (!body.version || !body.url) {
        return new Response(
          JSON.stringify({ error: "Missing required fields: version, url" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      body.updatedAt = new Date().toISOString();
      const manifestBytes = new TextEncoder().encode(JSON.stringify(body, null, 2));

      const { error: uploadError } = await supabase.storage
        .from("ota-bundles")
        .upload("manifest.json", manifestBytes, {
          contentType: "application/json",
          upsert: true,
        });

      if (uploadError) {
        return new Response(
          JSON.stringify({ error: uploadError.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, manifest: body }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: errorMsg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
