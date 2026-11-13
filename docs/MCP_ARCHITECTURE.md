# TalentXcel Universal MCP Server — Architecture

## 1. System Architecture Overview

The **TalentXcel Universal MCP Server** exposes the complete TalentXcel career and recruitment intelligence layer to AI assistants (Claude, Antigravity, ChatGPT, Google Gemini, and custom agentic frameworks) via the open **Model Context Protocol (MCP)** standard.

```mermaid
flowchart TD
    subgraph Clients["AI Clients & Agents"]
        C1["Antigravity IDE / Local Agents"]
        C2["Claude Desktop / Claude Web"]
        C3["ChatGPT / Custom AI Assistants"]
        C4["Cursor / Agentic Workflows"]
    end

    subgraph Gateway["TalentXcel Universal MCP Gateway"]
        direction TB
        T1["stdio Transport\n(Local Subprocess via Node.js)"]
        T2["Streamable HTTP Transport\n(Vercel Serverless: /api/mcp)"]
        T3["HTTP Port 3100 Transport\n(Persistent Node.js Server)"]
    end

    subgraph Security["Security & Authentication Layer"]
        S1["Supabase JWT Token Validation"]
        S2["Scope-Based RBAC: Public · User · Employer · Admin"]
        S3["PostgreSQL Row Level Security (RLS) Enforcement"]
        S4["PII Redaction & Input Validation (Zod)"]
    end

    subgraph Registry["TalentXcel Tool & Resource Registry (26 Tools)"]
        R1["Group A: Job Intelligence (4 Tools)"]
        R2["Group B: Candidate Intelligence (4 Tools)"]
        R3["Group C: Resume Intelligence (4 Tools)"]
        R4["Group D: Career Intelligence (4 Tools)"]
        R5["Group E: Employer Intelligence (4 Tools)"]
        R6["Group F: Platform Intelligence (5 Tools)"]
        R7["Unified Search Engine (universal_talent_search)"]
    end

    subgraph Backend["PostgreSQL Core Data Layer (Supabase)"]
        DB1[("jobs · companies · profiles\nresumes · salary_data · courses\njob_applications · content_hub")]
    end

    C1 -->|stdio JSON-RPC| T1
    C2 & C3 & C4 -->|HTTPS POST Streamable HTTP| T2
    C4 -->|HTTP Stream| T3

    T1 & T2 & T3 --> S1
    S1 --> S2 --> S3 --> S4
    S4 --> Registry
    Registry --> DB1
```

---

## 2. Supported Transports & Deployment Models

### A. Local Development & Antigravity (`stdio`)
* **Transport:** `StdioServerTransport` from `@modelcontextprotocol/sdk/server/stdio.js`.
* **Execution:** Spawned as a child process by Antigravity or Claude Desktop.
* **Entry:** `talentxcel-mcp/dist/index.js`
* **Configuration:** Configured in `~/.gemini/config/mcp_config.json`.
* **Latency:** Sub-millisecond IPC; zero network hop to the local agent.

### B. Remote Production Endpoint (`Streamable HTTP`)
* **Transport:** `StreamableHTTPServerTransport` from `@modelcontextprotocol/sdk/server/streamableHttp.js`.
* **Target URL:** `https://talentxcel.in/api/mcp`
* **Implementation:** `api/mcp.ts` Vercel Serverless Function.
* **Stateless Model:** Each HTTP request initiates a compliant, isolated MCP session. This adheres directly to Vercel's serverless scaling constraints without requiring persistent daemon socket connections.
* **Limitations:** Multi-turn session resumption across disjoint serverless invocations is not supported by Vercel edge/serverless nodes. All tool execution, tool discovery (`tools/list`), prompt generation, and resource queries operate independently per request.

### C. Dedicated Node.js Service (Optional Persistent Mode)
* For deployments requiring continuous Server-Sent Events (SSE) or long-lived persistent sessions, `talentxcel-mcp/` can be run continuously on Node.js / Docker via:
  ```bash
  npm run start:http
  ```
  listening on port 3100 with full session affinity.

---

## 3. Data Integrity & Verification

In accordance with production guidelines:
* **Zero Synthetic Data:** All tools query live PostgreSQL tables (`jobs`, `companies`, `profiles`, `resumes`, `salary_data`, `courses`, `content_hub`, `notifications`).
* **Column Alignment:** Tool queries map directly to verified schemas generated in `src/integrations/supabase/types.ts`.
* **No Service-Role Key Leakage:** Client requests execute using the user's authenticated bearer JWT, ensuring Supabase Row Level Security (RLS) is strictly enforced at the database level.
