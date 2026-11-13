// supabase/functions/mcp/index.ts
// TalentXcel MCP — Supabase Edge Function
// MIGRATED: The full MCP server is now at talentxcel-mcp/ (standalone Node.js)
// and api/mcp.ts (Vercel serverless remote endpoint).
// This edge function provides a redirect/health response.

Deno.serve((_req: Request) => {
  return new Response(
    JSON.stringify({
      message: "TalentXcel MCP has been migrated to an independent server.",
      remote_endpoint: "https://talentxcel.in/api/mcp",
      local_setup: "See talentxcel-mcp/README.md for local stdio setup",
      status: "migrated",
      docs: "https://talentxcel.in/docs/mcp",
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
});
