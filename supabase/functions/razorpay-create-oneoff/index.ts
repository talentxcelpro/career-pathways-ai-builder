// supabase/functions/razorpay-create-oneoff/index.ts
// One-Off Razorpay Order Creation (Delegates to unified order creation, SEC-004/SEC-005)

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

    // Call unified razorpay-create-order internally
    const createOrderUrl = `${supabaseUrl}/functions/v1/razorpay-create-order`;
    const authHeader = req.headers.get("Authorization") || "";

    const response = await fetch(createOrderUrl, {
      method: "POST",
      headers: {
        "Authorization": authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: rawBody.amount,
        currency: rawBody.currency || "INR",
        packageType: "ResumeDownload",
        serviceId: rawBody.resumeId || "resume_download",
      }),
    });

    const resData = await response.json();
    return new Response(JSON.stringify(resData), {
      status: response.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Error in razorpay-create-oneoff:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Failed to create oneoff order" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
