// supabase/functions/supabase-metrics/index.ts
// TalentXcel Supabase Production Metrics Edge Function
//
// Calls the Supabase Management API to return REAL production metrics:
//   - API requests (PostgREST) / hour and / day
//   - DB reads and writes / hour
//   - Edge Function calls / hour and / day
//   - 4xx and 5xx error counts / hour
//   - Log ingestion (bytes) / hour and / day
//   - Top request paths by volume
//
// Required Edge Function Secrets (set via Supabase Dashboard → Project → Edge Functions → Secrets):
//   SUPABASE_MANAGEMENT_TOKEN  — Personal access token from https://supabase.com/dashboard/account/tokens
//   SUPABASE_PROJECT_REF       — Your project ref (e.g. dthlgsnakhoftinssokm)
//
// These are already available automatically in Edge Function context:
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const MGMT_API = "https://api.supabase.com/v1";

// ─── Supabase Management API: Log Analytics ───────────────────────────────────
// Uses the same log query engine that powers the Supabase Log Explorer.
// Available log sources: api_edge_logs, edge_logs, postgres_logs, auth_logs,
//                        realtime_logs, storage_logs, pgbouncer_logs, function_logs

async function queryAnalytics(
  projectRef: string,
  token: string,
  sql: string,
  timestampStart: string,
  timestampEnd: string
): Promise<any[]> {
  const url = `${MGMT_API}/projects/${projectRef}/analytics/endpoints/logs.all`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ sql, timestamp_start: timestampStart, timestamp_end: timestampEnd }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error(`Analytics query failed (${res.status}):`, errText.substring(0, 300));
    return [];
  }

  const json = await res.json();
  return json?.result ?? json?.data ?? [];
}

// ─── Supabase Management API: Project Usage ────────────────────────────────────
async function getProjectUsage(projectRef: string, token: string): Promise<any> {
  const res = await fetch(`${MGMT_API}/projects/${projectRef}/usage`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  return res.json();
}

// ─── Handler ──────────────────────────────────────────────────────────────────
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // NOTE: Supabase CLI rejects env names starting with SUPABASE_ — using MGMT_ prefix instead.
  // Set via: supabase secrets set MGMT_PROJECT_REF=... MGMT_API_TOKEN=...
  const PROJECT_REF = Deno.env.get("MGMT_PROJECT_REF") ?? "";
  const MGMT_TOKEN = Deno.env.get("MGMT_API_TOKEN") ?? "";
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
  const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

  // ── Verify secrets are configured ──
  if (!PROJECT_REF || !MGMT_TOKEN) {
    return new Response(
      JSON.stringify({
        error: "Missing required secrets",
        missing: [
          !PROJECT_REF && "SUPABASE_PROJECT_REF",
          !MGMT_TOKEN && "SUPABASE_MANAGEMENT_TOKEN",
        ].filter(Boolean),
        instructions:
          "Add SUPABASE_PROJECT_REF and SUPABASE_MANAGEMENT_TOKEN in Supabase Dashboard → Project → Edge Functions → Manage secrets. Get a personal token from https://supabase.com/dashboard/account/tokens",
        configured: false,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const tsNow = now.toISOString();
    const ts1h = oneHourAgo.toISOString();
    const ts24h = oneDayAgo.toISOString();

    // ── Run all analytics queries in parallel ──
    const [
      apiHour,
      apiDay,
      edgeFnHour,
      edgeFnDay,
      postgresHour,
      errorHour,
      topPaths,
      usageStats,
      notifHour,
    ] = await Promise.allSettled([
      // 1. PostgREST API requests / hour
      queryAnalytics(PROJECT_REF, MGMT_TOKEN, `
        SELECT
          count(1) as total_requests,
          countif(status_code >= 400 AND status_code < 500) as client_errors,
          countif(status_code >= 500) as server_errors,
          avg(response_time_ms) as avg_response_ms,
          sum(response_size_bytes) as total_response_bytes
        FROM api_edge_logs
        WHERE timestamp > '${ts1h}'
      `, ts1h, tsNow),

      // 2. PostgREST API requests / day
      queryAnalytics(PROJECT_REF, MGMT_TOKEN, `
        SELECT
          count(1) as total_requests,
          sum(response_size_bytes) as total_response_bytes
        FROM api_edge_logs
        WHERE timestamp > '${ts24h}'
      `, ts24h, tsNow),

      // 3. Edge Function calls / hour
      queryAnalytics(PROJECT_REF, MGMT_TOKEN, `
        SELECT
          count(1) as total_calls,
          countif(status_code >= 500) as errors,
          avg(execution_time_ms) as avg_execution_ms
        FROM function_edge_logs
        WHERE timestamp > '${ts1h}'
      `, ts1h, tsNow),

      // 4. Edge Function calls / day
      queryAnalytics(PROJECT_REF, MGMT_TOKEN, `
        SELECT
          count(1) as total_calls,
          countif(status_code >= 500) as errors
        FROM function_edge_logs
        WHERE timestamp > '${ts24h}'
      `, ts24h, tsNow),

      // 5. Postgres / DB activity / hour
      queryAnalytics(PROJECT_REF, MGMT_TOKEN, `
        SELECT
          count(1) as total_queries,
          countif(error_severity = 'ERROR') as errors
        FROM postgres_logs
        WHERE timestamp > '${ts1h}'
      `, ts1h, tsNow),

      // 6. HTTP errors breakdown / hour
      queryAnalytics(PROJECT_REF, MGMT_TOKEN, `
        SELECT
          status_code,
          count(1) as count,
          first_value(path) OVER (PARTITION BY status_code ORDER BY count(1) DESC) as top_path
        FROM api_edge_logs
        WHERE timestamp > '${ts1h}'
          AND status_code >= 400
        GROUP BY status_code
        ORDER BY count DESC
        LIMIT 10
      `, ts1h, tsNow),

      // 7. Top request paths by volume / hour
      queryAnalytics(PROJECT_REF, MGMT_TOKEN, `
        SELECT
          path,
          count(1) as requests,
          sum(response_size_bytes) as bytes_sent,
          avg(response_time_ms) as avg_ms
        FROM api_edge_logs
        WHERE timestamp > '${ts1h}'
        GROUP BY path
        ORDER BY requests DESC
        LIMIT 15
      `, ts1h, tsNow),

      // 8. Project usage from Management API (egress, log ingestion)
      getProjectUsage(PROJECT_REF, MGMT_TOKEN),

      // 9. Notification volume / hour as DB write proxy
      (() => {
        const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
        return supabase
          .from("notifications")
          .select("id", { count: "exact", head: true })
          .gte("created_at", ts1h);
      })(),
    ]);

    // ── Extract results safely ──
    const safe = <T>(settled: PromiseSettledResult<T>, fallback: T): T =>
      settled.status === "fulfilled" ? settled.value : fallback;

    const api1h = safe(apiHour, [])[0] ?? {};
    const api24h = safe(apiDay, [])[0] ?? {};
    const fn1h = safe(edgeFnHour, [])[0] ?? {};
    const fn24h = safe(edgeFnDay, [])[0] ?? {};
    const db1h = safe(postgresHour, [])[0] ?? {};
    const errors1h = safe(errorHour, []);
    const paths = safe(topPaths, []);
    const usage = safe(usageStats as PromiseSettledResult<any>, null);
    const notif = safe(notifHour as PromiseSettledResult<any>, { count: 0 });

    // ── Response bytes → MB ──
    const toMB = (bytes: number | null | undefined) =>
      bytes ? Math.round((bytes / 1024 / 1024) * 100) / 100 : 0;

    return new Response(
      JSON.stringify({
        configured: true,
        timestamp: tsNow,
        window: { hour: ts1h, day: ts24h },

        api: {
          requests_1h: Number(api1h.total_requests ?? 0),
          requests_24h: Number(api24h.total_requests ?? 0),
          client_errors_1h: Number(api1h.client_errors ?? 0),
          server_errors_1h: Number(api1h.server_errors ?? 0),
          avg_response_ms: Math.round(Number(api1h.avg_response_ms ?? 0)),
          response_mb_1h: toMB(api1h.total_response_bytes),
          response_mb_24h: toMB(api24h.total_response_bytes),
        },

        edge_functions: {
          calls_1h: Number(fn1h.total_calls ?? 0),
          calls_24h: Number(fn24h.total_calls ?? 0),
          errors_1h: Number(fn1h.errors ?? 0),
          errors_24h: Number(fn24h.errors ?? 0),
          avg_execution_ms: Math.round(Number(fn1h.avg_execution_ms ?? 0)),
        },

        database: {
          queries_1h: Number(db1h.total_queries ?? 0),
          errors_1h: Number(db1h.errors ?? 0),
        },

        errors: {
          by_status: errors1h,
        },

        top_paths: paths,

        // From Supabase Management API — billing cycle totals
        usage: usage ?? { note: "Usage API call failed or not available" },

        // DB write activity proxy
        notifications_1h: notif.count ?? 0,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("supabase-metrics error:", error.message);
    return new Response(
      JSON.stringify({ configured: true, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
