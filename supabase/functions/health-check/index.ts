// Health check edge function

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Health check function called successfully");
    
    return new Response(
      JSON.stringify({ 
        success: true,
        healthCheck: true,
        message: "Edge Function health check passed!",
        timestamp: new Date().toISOString(),
        method: req.method
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Health check error:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        healthCheck: false,
        error: (error as Error).message || "Health check failed" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});