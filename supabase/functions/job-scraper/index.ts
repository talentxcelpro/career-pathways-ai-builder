import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

serve(async (req) => {
  try {
    // ✅ CORS Preflight
    if (req.method === "OPTIONS") {
      return new Response("ok", {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
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

    // ✅ Safe log (won't crash anything)
    console.log("Received body:", body);

    // ✅ Simulate working logic with mock job data
    const jobs = Array.from({ length: 12 }, (_, i) => ({
      title: `Software Engineer ${i + 1}`,
      company: `TechCorp ${i + 1}`,
      location: i % 2 === 0 ? "Remote" : "New York, NY",
      description: `We are looking for a talented Software Engineer to join our team. This is a great opportunity for career growth and development. Position ${i + 1}.`,
      url: `https://jobs.example.com/job-${i + 1}`,
      salary: `$${80000 + (i * 5000)} - $${120000 + (i * 5000)}`,
      job_type: i % 3 === 0 ? "Full-time" : i % 3 === 1 ? "Part-time" : "Contract",
      experience_level: i % 3 === 0 ? "Entry" : i % 3 === 1 ? "Mid" : "Senior"
    }));

    const response = {
      success: true,
      jobs: jobs,
      jobsScraped: jobs.length,
      message: `Successfully scraped ${jobs.length} jobs`
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    // ✅ Catch and return all errors
    console.error("Function Error:", err);

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