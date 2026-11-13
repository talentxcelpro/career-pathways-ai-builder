# MCP Security — TalentXcel

## Authentication Model

The MCP server uses **Supabase JWT Bearer token** authentication.

Clients pass their Supabase access token in the `Authorization: Bearer <token>` header. The server validates it by calling `supabase.auth.getUser()` with that token — this uses Supabase's own verification, respecting token expiry and revocation.

## Permission Levels

| Level | Access | How |
|---|---|---|
| **PUBLIC** | Public jobs, employers, platform stats, resources, skill recommendations | No auth required |
| **USER** | Own profile, resume, dashboard, notifications, job matching | Valid Supabase JWT |
| **EMPLOYER** | (Future) Candidate search, pipeline | `app_metadata.role = employer` |
| **ADMIN** | (Future) Analytics | `app_metadata.role = admin` |

## Security Controls Implemented

1. **Token validation** — Every authenticated request validates the JWT via Supabase `getUser()`
2. **Row Level Security** — All data access uses the user's own token (not service role), so Supabase RLS policies apply automatically
3. **Tenant isolation** — Users can only access their own data (`eq("user_id", auth.userId)`)
4. **Input validation** — All tool inputs validated via Zod schemas before execution
5. **Request size limits** — Vercel handler rejects requests >64KB
6. **CORS headers** — Properly configured; does not expose credentials
7. **Error sanitization** — Error messages do not expose internal stack traces or env vars

## What is Never Exposed

- Supabase service-role key (never used in MCP responses or tool outputs)
- Another user's private profile or contact details
- Raw environment variables
- Internal infrastructure details
- Arbitrary SQL execution

## RLS Enforcement

Because all authenticated tool calls use `createClient(url, anonKey, { headers: { Authorization: Bearer ${userToken} } })`, Supabase's RLS policies are enforced server-side. The MCP layer does **not** bypass RLS.

## Known Limitations

- Rate limiting is currently header-based only (request size). A Redis-backed per-user rate limiter should be added for production hardening.
- OAuth 2.1 metadata endpoint (`/.well-known/oauth-authorization-server`) is not yet implemented — required for some MCP client auto-discovery flows.
- Audit logging is not yet persisted to a database table.
