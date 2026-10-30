// supabase/functions/razorpay-verify-oneoff/index.ts
// One-Off Razorpay Verification (Delegates to unified razorpay-verify-payment with cryptographic verification, SEC-002/SEC-004)

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { getCorsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const rawBody = await req.json();

    const verifyUrl = `${supabaseUrl}/functions/v1/razorpay-verify-payment`;
    const authHeader = req.headers.get("Authorization") || "";

    const response = await fetch(verifyUrl, {
      method: "POST",
      headers: {
        "Authorization": authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mode: "resume_download",
        packageType: "ResumeDownload",
        razorpay_order_id: rawBody.razorpay_order_id,
        razorpay_payment_id: rawBody.razorpay_payment_id,
        razorpay_signature: rawBody.razorpay_signature,
        resumeId: rawBody.resumeId,
      }),
    });

    const resData = await response.json();
    return new Response(JSON.stringify(resData), {
      status: response.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Error in razorpay-verify-oneoff:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Failed to verify oneoff payment" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
