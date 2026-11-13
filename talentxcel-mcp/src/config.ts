// src/config.ts — TalentXcel MCP Server configuration

export const config = {
  server: {
    name: "talentxcel-mcp",
    version: "1.0.0",
    title: "TalentXcel Career Intelligence MCP Server",
  },
  supabase: {
    url: process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "",
    anonKey: process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "",
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "", // NEVER expose to clients
  },
  http: {
    port: parseInt(process.env.MCP_PORT || "3100"),
    host: process.env.MCP_HOST || "0.0.0.0",
    path: "/api/mcp",
  },
  auth: {
    issuer: `https://${process.env.SUPABASE_PROJECT_REF || "dthlgsnakhoftinssokm"}.supabase.co/auth/v1`,
  },
};

export function validateConfig(): void {
  const errors: string[] = [];
  if (!config.supabase.url) errors.push("SUPABASE_URL or VITE_SUPABASE_URL is required");
  if (!config.supabase.anonKey) errors.push("SUPABASE_ANON_KEY or VITE_SUPABASE_ANON_KEY is required");
  if (errors.length > 0) {
    console.error("[MCP Config] Missing environment variables:", errors.join(", "));
    console.error("[MCP Config] Set these in .env.local — see .env.example");
  }
}
