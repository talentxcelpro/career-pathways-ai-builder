#!/usr/bin/env node
// src/index.ts — TalentXcel Universal MCP Server
// Supports stdio (Antigravity/local) and HTTP (remote) transports

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import http from "http";
import { config, validateConfig } from "./config.js";
import { validateBearerToken, type AuthContext } from "./auth.js";
import { registerAllTools, registerResources, registerPrompts } from "./registry.js";

validateConfig();

const transportMode =
  process.argv.includes("--transport")
    ? process.argv[process.argv.indexOf("--transport") + 1]
    : (process.env.TALENTXCEL_MCP_TRANSPORT || "stdio");

function createMcpServer(auth: AuthContext): McpServer {
  const server = new McpServer({ name: config.server.name, version: config.server.version });
  registerAllTools(server, () => auth);
  registerResources(server);
  registerPrompts(server);
  return server;
}

async function startStdio(): Promise<void> {
  console.error("[TalentXcel MCP] Starting in stdio mode (Antigravity/local)");
  const auth: AuthContext = { userId: null, role: "public", token: null, isAuthenticated: false };
  const server = createMcpServer(auth);
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[TalentXcel MCP] Ready — listening on stdio");
}

async function startHttp(): Promise<void> {
  console.error(`[TalentXcel MCP] Starting HTTP server on port ${config.http.port}`);
  const httpServer = http.createServer(async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Mcp-Session-Id");

    if (req.method === "OPTIONS") { res.writeHead(204); res.end(); return; }

    if (req.method === "GET") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ server: config.server.name, version: config.server.version, status: "ready", transport: "streamable-http", tools: 15 }));
      return;
    }

    if (req.method !== "POST") { res.writeHead(405); res.end(); return; }

    const auth = await validateBearerToken(req.headers.authorization);
    let body = "";
    for await (const chunk of req) body += chunk;
    let parsed: unknown;
    try { parsed = JSON.parse(body); } catch {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ jsonrpc: "2.0", error: { code: -32700, message: "Parse error" }, id: null }));
      return;
    }

    const mcpServer = createMcpServer(auth);
    const mcpTransport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => `txc-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    });
    res.on("close", () => { mcpServer.close().catch(() => {}); });
    try {
      await mcpServer.connect(mcpTransport);
      await mcpTransport.handleRequest(req as never, res as never, parsed);
    } catch (err) {
      console.error("[TalentXcel MCP] Request error:", err);
      if (!res.headersSent) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ jsonrpc: "2.0", error: { code: -32603, message: "Internal error" }, id: null }));
      }
    }
  });

  httpServer.listen(config.http.port, config.http.host, () => {
    console.error(`[TalentXcel MCP] HTTP ready at http://${config.http.host}:${config.http.port}${config.http.path}`);
  });
}

if (transportMode === "http") {
  startHttp();
} else {
  startStdio();
}
