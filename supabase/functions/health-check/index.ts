// supabase/functions/health-check/index.ts
// TalentXcel — Production Metrics & Health Check
//
// Dual-purpose: responds to simple ?mode=health pings AND
// returns full Supabase production efficiency metrics via the Management API.
//
// Required secrets (set via: supabase secrets set KEY=VALUE):
//   MGMT_PROJECT_REF  — your project ref (dthlgsnakhoftinssokm)
//   MGMT_API_TOKEN    — personal access token from supabase.com/dashboard/account/tokens

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const MGMT_API = "https://api.supabase.com/v1";

// ─── Analytics Query ──────────────────────────────────────────────────────────
async function queryAnalytics(
  projectRef: string,
  token: string,
  sql: string,
  tsStart: string,
  tsEnd: string
): Promise<any[]> {
  try {
    const res = await fetch(`${MGMT_API}/projects/${projectRef}/analytics/endpoints/logs.all`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sql, timestamp_start: tsStart, timestamp_end: tsEnd }),
    });
    if (!res.ok) {
      const txt = await res.text();
      console.error(`Analytics query HTTP ${res.status}:`, txt.substring(0, 200));
      return [];
    }
    const json = await res.json();
    return json?.result ?? json?.data ?? [];
  } catch (e: any) {
    console.error("Analytics query error:", e.message);
    return [];
  }
}

// ─── Project Usage ─────────────────────────────────────────────────────────────
async function getUsage(projectRef: string, token: string): Promise<any> {
  try {
    const res = await fetch(`${MGMT_API}/projects/${projectRef}/usage`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// ─── Handler ──────────────────────────────────────────────────────────────────
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const url = new URL(req.url);
  const mode = url.searchParams.get("mode");

  // ── Simple health ping (backward compat) ──
  if (mode === "health" || (req.method === "GET" && !url.searchParams.has("metrics")) || (req.method === "POST" && !url.searchParams.has("metrics"))) {
    return new Response(
      JSON.stringify({ success: true, healthCheck: true, timestamp: new Date().toISOString() }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  }

  // ── Full metrics mode ──
  const PROJECT_REF = Deno.env.get("MGMT_PROJECT_REF") ?? "";
  const MGMT_TOKEN  = Deno.env.get("MGMT_API_TOKEN")   ?? "";
  const SUPA_URL    = Deno.env.get("SUPABASE_URL")      ?? "";
  const SUPA_KEY    = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

  if (!PROJECT_REF || !MGMT_TOKEN) {
    return new Response(
      JSON.stringify({
        configured: false,
        missing: [!PROJECT_REF && "MGMT_PROJECT_REF", !MGMT_TOKEN && "MGMT_API_TOKEN"].filter(Boolean),
        instructions: "Run: supabase secrets set MGMT_PROJECT_REF=dthlgsnakhoftinssokm MGMT_API_TOKEN=<your_token>",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const now     = new Date();
    const ts1h    = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
    const ts24h   = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    const tsNow   = now.toISOString();

    const [apiH, apiD, fnH, fnD, dbH, errH, paths, usage, notif] = await Promise.allSettled([
      // 1. PostgREST /hour
      queryAnalytics(PROJECT_REF, MGMT_TOKEN, `
        SELECT count(1) AS total_requests,
               countif(status_code >= 400 AND status_code < 500) AS client_errors,
               countif(status_code >= 500) AS server_errors,
               avg(response_time_ms) AS avg_response_ms,
               sum(response_size_bytes) AS total_response_bytes
        FROM api_edge_logs WHERE timestamp > '${ts1h}'`, ts1h, tsNow),

      // 2. PostgREST /day
      queryAnalytics(PROJECT_REF, MGMT_TOKEN, `
        SELECT count(1) AS total_requests,
               sum(response_size_bytes) AS total_response_bytes
        FROM api_edge_logs WHERE timestamp > '${ts24h}'`, ts24h, tsNow),

      // 3. Edge Fn /hour
      queryAnalytics(PROJECT_REF, MGMT_TOKEN, `
        SELECT count(1) AS total_calls,
               countif(status_code >= 500) AS errors,
               avg(execution_time_ms) AS avg_execution_ms
        FROM function_edge_logs WHERE timestamp > '${ts1h}'`, ts1h, tsNow),

      // 4. Edge Fn /day
      queryAnalytics(PROJECT_REF, MGMT_TOKEN, `
        SELECT count(1) AS total_calls,
               countif(status_code >= 500) AS errors
        FROM function_edge_logs WHERE timestamp > '${ts24h}'`, ts24h, tsNow),

      // 5. Postgres queries /hour
      queryAnalytics(PROJECT_REF, MGMT_TOKEN, `
        SELECT count(1) AS total_queries,
               countif(error_severity = 'ERROR') AS errors
        FROM postgres_logs WHERE timestamp > '${ts1h}'`, ts1h, tsNow),

      // 6. HTTP errors breakdown /hour
      queryAnalytics(PROJECT_REF, MGMT_TOKEN, `
        SELECT status_code, count(1) AS count, path AS top_path
        FROM api_edge_logs
        WHERE timestamp > '${ts1h}' AND status_code >= 400
        GROUP BY status_code, path
        ORDER BY count DESC LIMIT 10`, ts1h, tsNow),

      // 7. Top paths by volume /hour
      queryAnalytics(PROJECT_REF, MGMT_TOKEN, `
        SELECT path, count(1) AS requests,
               sum(response_size_bytes) AS bytes_sent,
               avg(response_time_ms) AS avg_ms
        FROM api_edge_logs WHERE timestamp > '${ts1h}'
        GROUP BY path ORDER BY requests DESC LIMIT 15`, ts1h, tsNow),

      // 8. Project billing usage
      getUsage(PROJECT_REF, MGMT_TOKEN),

      // 9. DB write proxy — notifications written in last hour
      (() => {
        const sb = createClient(SUPA_URL, SUPA_KEY);
        return sb.from("notifications").select("id", { count: "exact", head: true }).gte("created_at", ts1h);
      })(),
    ]);

    const s = <T>(r: PromiseSettledResult<T>, fb: T): T => r.status === "fulfilled" ? r.value : fb;
    const toMB = (b: number | null | undefined) => b ? Math.round((b / 1024 / 1024) * 100) / 100 : 0;

    const a1 = s(apiH, [])[0] ?? {};
    const a24 = s(apiD, [])[0] ?? {};
    const f1 = s(fnH, [])[0] ?? {};
    const f24 = s(fnD, [])[0] ?? {};
    const d1 = s(dbH, [])[0] ?? {};
    const notifData = s(notif as PromiseSettledResult<any>, { count: 0 });

    return new Response(JSON.stringify({
      configured: true,
      timestamp: tsNow,
      api: {
        requests_1h:        Number(a1.total_requests ?? 0),
        requests_24h:       Number(a24.total_requests ?? 0),
        client_errors_1h:   Number(a1.client_errors ?? 0),
        server_errors_1h:   Number(a1.server_errors ?? 0),
        avg_response_ms:    Math.round(Number(a1.avg_response_ms ?? 0)),
        response_mb_1h:     toMB(a1.total_response_bytes),
        response_mb_24h:    toMB(a24.total_response_bytes),
      },
      edge_functions: {
        calls_1h:           Number(f1.total_calls ?? 0),
        calls_24h:          Number(f24.total_calls ?? 0),
        errors_1h:          Number(f1.errors ?? 0),
        errors_24h:         Number(f24.errors ?? 0),
        avg_execution_ms:   Math.round(Number(f1.avg_execution_ms ?? 0)),
      },
      database: {
        queries_1h:         Number(d1.total_queries ?? 0),
        errors_1h:          Number(d1.errors ?? 0),
      },
      errors:     { by_status: s(errH, []) },
      top_paths:  s(paths, []),
      usage:      s(usage as PromiseSettledResult<any>, null),
      notifications_1h: notifData.count ?? 0,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("health-check metrics error:", error.message);
    return new Response(
      JSON.stringify({ configured: true, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
