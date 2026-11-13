# MCP Deployment — TalentXcel

## Remote Endpoint

**URL:** `https://talentxcel.in/api/mcp`  
**Transport:** Streamable HTTP (stateless, Vercel serverless)  
**File:** `api/mcp.ts`

## Deployment Model: Vercel Stateless

Each POST request is an independent MCP session. The server builds a fresh `McpServer` per request, executes the tool, and returns. This matches Vercel's serverless execution model.

**What works:** tool calls, `tools/list`, `resources/list`, `prompts/list`, initialization  
**What does NOT work:** session resumption across requests, SSE streaming

## Required Vercel Environment Variables

Add these in Vercel Dashboard > Project Settings > Environment Variables:

| Variable | Value |
|---|---|
| `SUPABASE_URL` | `https://dthlgsnakhoftinssokm.supabase.co` |
| `SUPABASE_ANON_KEY` | *(from Supabase Dashboard > API)* |

> [!CAUTION]
> Do NOT add `SUPABASE_SERVICE_ROLE_KEY` to the Vercel MCP function env unless you explicitly need admin operations. The anon key + user JWT is sufficient and safer.

## vercel.json Route

Add this to `vercel.json` rewrites/routes to ensure `/api/mcp` is handled:
```json
{
  "source": "/api/mcp",
  "destination": "/api/mcp"
}
```
(Vercel auto-routes `api/*.ts` files, so no explicit config is needed.)

## Health Check

```bash
curl https://talentxcel.in/api/mcp
```

Expected:
```json
{
  "server": "talentxcel-mcp",
  "version": "1.0.0",
  "transport": "streamable-http",
  "status": "ready",
  "tools": 15
}
```

## Standalone Server (for persistent sessions)

If you need session persistence or SSE streaming, run the standalone server:

```bash
cd talentxcel-mcp
TALENTXCEL_MCP_TRANSPORT=http SUPABASE_URL=... SUPABASE_ANON_KEY=... node dist/index.js
```

Listens on port 3100 by default. Use a reverse proxy (nginx, Caddy) to expose at `https://talentxcel.in/api/mcp`.

## Deployment Status

| Component | Status |
|---|---|
| `@lovable.dev/mcp-js` removed | ✅ IMPLEMENTED |
| `talentxcel-mcp/` standalone server | ✅ IMPLEMENTED |
| TypeScript build (zero errors) | ✅ TESTED LOCALLY |
| Protocol tests (7/7 pass) | ✅ TESTED LOCALLY |
| `api/mcp.ts` Vercel handler | ✅ IMPLEMENTED |
| Antigravity local config | ✅ IMPLEMENTED |
| Remote endpoint live | NOT STARTED (requires deploy) |
| External MCP Inspector verification | NOT STARTED (requires deploy) |
