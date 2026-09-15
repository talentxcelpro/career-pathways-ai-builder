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
  name: "get_passport",
  title: "Get Career Passport",
  description:
    "Return the signed-in user's Career Passport summary: profile, education, work experience, and certificates.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const sb = supabaseForUser(ctx);
    const userId = ctx.getUserId();

    const [profile, education, experience, courseCerts, skillCerts] = await Promise.all([
      sb.from("profiles").select("*").eq("id", userId).maybeSingle(),
      sb.from("education").select("*").eq("user_id", userId),
      sb.from("work_experience").select("*").eq("user_id", userId),
      sb.from("course_certificates").select("*").eq("user_id", userId),
      sb.from("skill_certifications").select("*").eq("user_id", userId),
    ]);

    const payload = {
      profile: profile.data ?? null,
      education: education.data ?? [],
      experience: experience.data ?? [],
      certificates: [...(courseCerts.data ?? []), ...(skillCerts.data ?? [])],
    };

    return {
      content: [{ type: "text", text: JSON.stringify(payload) }],
      structuredContent: payload,
    };
  },
});
