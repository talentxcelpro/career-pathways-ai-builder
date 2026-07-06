import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

function supabaseForUser(ctx: ToolContext) {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_ANON_KEY!,
    {
      global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );
}

export default defineTool({
  name: "search_jobs",
  title: "Search jobs",
  description:
    "Search TalentXcel job postings by keyword and optional location. Returns up to `limit` matching jobs.",
  inputSchema: {
    query: z.string().trim().min(1).describe("Keyword to search job titles and descriptions."),
    location: z.string().trim().optional().describe("Optional location filter."),
    limit: z.number().int().min(1).max(50).default(10).describe("Max results to return."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  handler: async ({ query, location, limit }, ctx) => {
    const sb = supabaseForUser(ctx);
    let q = sb
      .from("jobs")
      .select("id,title,company,location,description,created_at")
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .limit(limit);
    if (location) q = q.ilike("location", `%${location}%`);

    const { data, error } = await q;
    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { jobs: data ?? [] },
    };
  },
});
