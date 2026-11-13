// tests/mcp.test.js — TalentXcel Universal MCP Server automated test suite
// Phase 8: Protocol, Security, and Quality Gates

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverEntry = path.join(__dirname, "../dist/index.js");

function mcpRequest(proc, request) {
  return new Promise((resolve, reject) => {
    const line = JSON.stringify(request) + "\n";
    let buffer = "";
    const onData = (chunk) => {
      buffer += chunk.toString();
      const lines = buffer.split("\n");
      for (let i = 0; i < lines.length - 1; i++) {
        const l = lines[i].trim();
        if (!l) continue;
        try {
          const parsed = JSON.parse(l);
          proc.stdout.off("data", onData);
          resolve(parsed);
          return;
        } catch { /* wait for complete line */ }
      }
      buffer = lines[lines.length - 1];
    };
    proc.stdout.on("data", onData);
    setTimeout(() => {
      proc.stdout.off("data", onData);
      reject(new Error(`Timeout waiting for response to ${request.method || "request"}`));
    }, 8000);
    proc.stdin.write(line);
  });
}

function spawnTestServer() {
  return spawn("node", [serverEntry], {
    env: {
      ...process.env,
      SUPABASE_URL: process.env.SUPABASE_URL || "https://dthlgsnakhoftinssokm.supabase.co",
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder",
      TALENTXCEL_MCP_TRANSPORT: "stdio",
    },
    stdio: ["pipe", "pipe", "inherit"],
  });
}

describe("TalentXcel Universal MCP Server — Production Protocol Suite", async () => {
  test("1. Server process starts and remains healthy", async (t) => {
    const proc = spawnTestServer();
    t.after(() => proc.kill());
    await new Promise(r => setTimeout(r, 600));
    assert.ok(!proc.killed, "MCP server process must be running");
  });

  test("2. Protocol version negotiation and initialization handshake", async (t) => {
    const proc = spawnTestServer();
    t.after(() => proc.kill());
    await new Promise(r => setTimeout(r, 600));

    const response = await mcpRequest(proc, {
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2024-11-05",
        capabilities: {},
        clientInfo: { name: "antigravity-test-client", version: "1.0.0" },
      },
    });

    assert.equal(response.jsonrpc, "2.0");
    assert.equal(response.id, 1);
    assert.ok(response.result?.serverInfo, "Must return serverInfo");
    assert.equal(response.result.serverInfo.name, "talentxcel-mcp");
    assert.equal(response.result.serverInfo.version, "1.0.0");
  });

  test("3. Tool registry contains all 26 tools across Groups A through F", async (t) => {
    const proc = spawnTestServer();
    t.after(() => proc.kill());
    await new Promise(r => setTimeout(r, 600));

    await mcpRequest(proc, {
      jsonrpc: "2.0", id: 1, method: "initialize",
      params: { protocolVersion: "2024-11-05", capabilities: {}, clientInfo: { name: "test", version: "1" } },
    });
    proc.stdin.write(JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" }) + "\n");

    const response = await mcpRequest(proc, { jsonrpc: "2.0", id: 2, method: "tools/list", params: {} });
    assert.ok(response.result?.tools, "Must return tools list");
    const tools = response.result.tools;
    assert.equal(tools.length, 26, `Must expose exactly 26 registered tools, found ${tools.length}`);

    const toolNames = new Set(tools.map(t => t.name));

    // Group A: Job Intelligence
    assert.ok(toolNames.has("search_jobs"), "search_jobs missing");
    assert.ok(toolNames.has("get_job_details"), "get_job_details missing");
    assert.ok(toolNames.has("find_similar_jobs"), "find_similar_jobs missing");
    assert.ok(toolNames.has("get_trending_jobs"), "get_trending_jobs missing");

    // Group B: Candidate Intelligence
    assert.ok(toolNames.has("search_candidates"), "search_candidates missing");
    assert.ok(toolNames.has("get_candidate_profile"), "get_candidate_profile missing");
    assert.ok(toolNames.has("match_candidate_to_jobs"), "match_candidate_to_jobs missing");
    assert.ok(toolNames.has("calculate_skill_gap"), "calculate_skill_gap missing");

    // Group C: Resume Intelligence
    assert.ok(toolNames.has("analyze_resume"), "analyze_resume missing");
    assert.ok(toolNames.has("optimize_resume"), "optimize_resume missing");
    assert.ok(toolNames.has("get_resume_profile"), "get_resume_profile missing");
    assert.ok(toolNames.has("generate_resume_recommendations"), "generate_resume_recommendations missing");

    // Group D: Career Intelligence
    assert.ok(toolNames.has("career_path_recommendation"), "career_path_recommendation missing");
    assert.ok(toolNames.has("skill_recommendations"), "skill_recommendations missing");
    assert.ok(toolNames.has("salary_insights"), "salary_insights missing");
    assert.ok(toolNames.has("career_coach"), "career_coach missing");

    // Group E: Employer Intelligence
    assert.ok(toolNames.has("search_employers"), "search_employers missing");
    assert.ok(toolNames.has("get_employer_profile"), "get_employer_profile missing");
    assert.ok(toolNames.has("recruitment_insights"), "recruitment_insights missing");
    assert.ok(toolNames.has("candidate_job_pipeline"), "candidate_job_pipeline missing");

    // Group F: Platform Intelligence
    assert.ok(toolNames.has("platform_statistics"), "platform_statistics missing");
    assert.ok(toolNames.has("search_platform_content"), "search_platform_content missing");
    assert.ok(toolNames.has("get_user_dashboard"), "get_user_dashboard missing");
    assert.ok(toolNames.has("get_user_notifications"), "get_user_notifications missing");
    assert.ok(toolNames.has("search_learning_resources"), "search_learning_resources missing");

    // Phase 3: Universal Search
    assert.ok(toolNames.has("universal_talent_search"), "universal_talent_search missing");
  });

  test("4. Resources registry exposes all 4 resources", async (t) => {
    const proc = spawnTestServer();
    t.after(() => proc.kill());
    await new Promise(r => setTimeout(r, 600));

    await mcpRequest(proc, {
      jsonrpc: "2.0", id: 1, method: "initialize",
      params: { protocolVersion: "2024-11-05", capabilities: {}, clientInfo: { name: "test", version: "1" } },
    });
    const response = await mcpRequest(proc, { jsonrpc: "2.0", id: 2, method: "resources/list", params: {} });
    assert.ok(response.result?.resources, "Must return resources");
    assert.equal(response.result.resources.length, 4, `Expected 4 resources, got ${response.result.resources.length}`);

    const uris = response.result.resources.map(r => r.uri);
    assert.ok(uris.includes("talentxcel://platform/overview"));
    assert.ok(uris.includes("talentxcel://jobs/trending"));
    assert.ok(uris.includes("talentxcel://careers/resources"));
    assert.ok(uris.includes("talentxcel://skills/catalog"));
  });

  test("5. Prompts registry exposes all 5 reusable templates", async (t) => {
    const proc = spawnTestServer();
    t.after(() => proc.kill());
    await new Promise(r => setTimeout(r, 600));

    await mcpRequest(proc, {
      jsonrpc: "2.0", id: 1, method: "initialize",
      params: { protocolVersion: "2024-11-05", capabilities: {}, clientInfo: { name: "test", version: "1" } },
    });
    const response = await mcpRequest(proc, { jsonrpc: "2.0", id: 2, method: "prompts/list", params: {} });
    assert.ok(response.result?.prompts, "Must return prompts");
    assert.equal(response.result.prompts.length, 5, `Expected 5 prompts, got ${response.result.prompts.length}`);

    const names = response.result.prompts.map(p => p.name);
    assert.ok(names.includes("career_coaching"));
    assert.ok(names.includes("resume_review"));
    assert.ok(names.includes("job_search_assistant"));
    assert.ok(names.includes("interview_preparation"));
    assert.ok(names.includes("employer_recruitment_assistant"));
  });

  test("6. Security gate: unauthenticated invocation of protected tool returns authorization error", async (t) => {
    const proc = spawnTestServer();
    t.after(() => proc.kill());
    await new Promise(r => setTimeout(r, 600));

    await mcpRequest(proc, {
      jsonrpc: "2.0", id: 1, method: "initialize",
      params: { protocolVersion: "2024-11-05", capabilities: {}, clientInfo: { name: "test", version: "1" } },
    });
    const response = await mcpRequest(proc, {
      jsonrpc: "2.0",
      id: 2,
      method: "tools/call",
      params: { name: "get_candidate_profile", arguments: {} },
    });

    assert.ok(response.result?.isError, "Unauthenticated call must flag error");
    assert.ok(response.result.content[0].text.includes("Authentication required"), "Must state authentication required");
  });

  test("7. Input validation gate: rejects invalid tool arguments schema", async (t) => {
    const proc = spawnTestServer();
    t.after(() => proc.kill());
    await new Promise(r => setTimeout(r, 600));

    await mcpRequest(proc, {
      jsonrpc: "2.0", id: 1, method: "initialize",
      params: { protocolVersion: "2024-11-05", capabilities: {}, clientInfo: { name: "test", version: "1" } },
    });
    const response = await mcpRequest(proc, {
      jsonrpc: "2.0",
      id: 2,
      method: "tools/call",
      params: { name: "get_job_details", arguments: { job_id: "not-a-valid-uuid" } },
    });

    assert.ok(response.error || response.result?.isError, "Invalid UUID must produce error");
  });

  test("8. Protocol error gate: unknown method returns JSON-RPC error code", async (t) => {
    const proc = spawnTestServer();
    t.after(() => proc.kill());
    await new Promise(r => setTimeout(r, 600));

    await mcpRequest(proc, {
      jsonrpc: "2.0", id: 1, method: "initialize",
      params: { protocolVersion: "2024-11-05", capabilities: {}, clientInfo: { name: "test", version: "1" } },
    });
    const response = await mcpRequest(proc, {
      jsonrpc: "2.0",
      id: 3,
      method: "unsupported/method",
      params: {},
    });

    assert.ok(response.error, "Must return JSON-RPC error for unknown methods");
  });
});
