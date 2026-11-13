# MCP Local Setup — Antigravity Integration

## Prerequisites

- Node.js v18+ (confirmed: v25.6.1)
- Project cloned at `c:\Users\Arshid.Wani\talentxcel-local`
- Supabase anon key (get from Supabase dashboard > Project Settings > API)

## Step 1: Build the MCP server

```powershell
cd c:\Users\Arshid.Wani\talentxcel-local\talentxcel-mcp
npm install
npm run build
```

The compiled server will be at `talentxcel-mcp/dist/index.js`.

## Step 2: Set environment variables

Create `talentxcel-mcp/.env.local`:
```
SUPABASE_URL=https://dthlgsnakhoftinssokm.supabase.co
SUPABASE_ANON_KEY=<your-anon-key-from-supabase-dashboard>
TALENTXCEL_MCP_TRANSPORT=stdio
```

> [!CAUTION]
> Never put the Supabase service-role key here. Only the anon key is needed for the MCP server.

## Step 3: Configure Antigravity

The Antigravity MCP config is at: `C:\Users\Arshid.Wani\.gemini\config\mcp_config.json`

It is already configured:
```json
{
  "mcpServers": {
    "talentxcel": {
      "command": "node",
      "args": ["c:/Users/Arshid.Wani/talentxcel-local/talentxcel-mcp/dist/index.js"],
      "env": {
        "TALENTXCEL_MCP_TRANSPORT": "stdio",
        "SUPABASE_URL": "https://dthlgsnakhoftinssokm.supabase.co",
        "SUPABASE_ANON_KEY": "<add-your-anon-key-here>"
      }
    }
  }
}
```

**Add your SUPABASE_ANON_KEY** to the `env` block above.

## Step 4: Restart Antigravity

After saving the config, restart Antigravity to pick up the new MCP server. The TalentXcel tools will appear in the tool list.

## Step 5: Verify

In Antigravity, run:
> Use the platform_statistics tool

This should return live counts from the TalentXcel database.

## Manual test (stdio)

```powershell
cd c:\Users\Arshid.Wani\talentxcel-local\talentxcel-mcp
node --test tests/mcp.test.js
```

Expected output: **7 pass, 0 fail**

## Rebuild after changes

```powershell
cd c:\Users\Arshid.Wani\talentxcel-local\talentxcel-mcp
npm run build
```

Restart Antigravity to reload.

## Troubleshooting

| Issue | Fix |
|---|---|
| `SUPABASE_URL is required` warning | Add anon key to `mcp_config.json` env block |
| Tools not appearing | Restart Antigravity; check MCP Servers panel |
| Auth tools return "Authentication required" | Public tools work without auth; auth tools need a user Bearer token |
| Build errors | Run `npm run build` and check TypeScript errors |
