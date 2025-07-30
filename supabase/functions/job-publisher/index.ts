import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

console.log("🚀 Job Publisher function starting up...");

serve(async (req) => {
  try {
    // ✅ CORS Preflight
    if (req.method === "OPTIONS") {
      return new Response("ok", {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
        },
      });
    }

    // ✅ Reject other methods
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
        status: 405,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    // ✅ Try parsing the JSON body
    const body = await req.json();

    // ✅ Deep logging for debugging
    console.log("📦 Job Publisher received body:", JSON.stringify(body, null, 2));
    console.log("📦 Body type:", typeof body);
    console.log("📦 Body keys:", Object.keys(body));
    console.log("📦 Function is working and deployed!");

    // ✅ Simulate working logic - just echo back safely
    const response = {
      success: true,
      received: body,
      message: "Job publisher function is working and deployed!",
      timestamp: new Date().toISOString()
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    // ✅ Catch and return all errors with detailed logging
    console.error("❌ job-publisher error:", err.message);
    console.error("❌ job-publisher full error:", err);

    return new Response(JSON.stringify({
      success: false,
      error: err.message || "Unexpected error",
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
});