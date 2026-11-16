// api/oauth/authorize.ts — OAuth 2.1 / PKCE Authorization Endpoint
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { signToken } from "./_jwt.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  // Parse parameters from query (GET) or body (POST)
  const params = req.method === "POST" ? (typeof req.body === "string" ? JSON.parse(req.body) : req.body) : req.query;

  const responseType = params.response_type || req.query.response_type;
  const clientId = params.client_id || req.query.client_id;
  const redirectUri = params.redirect_uri || req.query.redirect_uri;
  const codeChallenge = params.code_challenge || req.query.code_challenge;
  const codeChallengeMethod = params.code_challenge_method || req.query.code_challenge_method;
  const state = params.state || req.query.state || "";
  const scope = params.scope || req.query.scope || "public user";

  if (!redirectUri || typeof redirectUri !== "string") {
    return res.status(400).send("Missing redirect_uri parameter");
  }

  if (responseType !== "code") {
    const errorUrl = new URL(redirectUri);
    errorUrl.searchParams.set("error", "unsupported_response_type");
    if (state) errorUrl.searchParams.set("state", String(state));
    return res.redirect(302, errorUrl.toString());
  }

  if (codeChallengeMethod && codeChallengeMethod !== "S256") {
    const errorUrl = new URL(redirectUri);
    errorUrl.searchParams.set("error", "invalid_request");
    errorUrl.searchParams.set("error_description", "Only S256 code_challenge_method is supported");
    if (state) errorUrl.searchParams.set("state", String(state));
    return res.redirect(302, errorUrl.toString());
  }

  // If user submits approval form or auto-authorized:
  const isApproved = req.method === "POST" && (params.action === "approve" || params.decision === "approve");

  if (isApproved || req.query.auto === "true") {
    const authCode = signToken(
      {
        sub: params.user_id || "txc_user_guest",
        role: "user",
        scope: String(scope),
        client_id: String(clientId || "gemini"),
        code_challenge: String(codeChallenge || ""),
        redirect_uri: String(redirectUri),
        type: "auth_code",
      },
      600 // 10 minutes code validity
    );

    const targetUrl = new URL(redirectUri);
    targetUrl.searchParams.set("code", authCode);
    if (state) targetUrl.searchParams.set("state", String(state));

    return res.redirect(302, targetUrl.toString());
  }

  // Otherwise render clean, high-grade TalentXcel Authorization Screen
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Connect with TalentXcel</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { background-color: #030712; color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
  </style>
</head>
<body class="min-h-screen flex items-center justify-center p-4">
  <div class="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl space-y-6">
    <div class="flex items-center justify-between pb-4 border-b border-slate-800">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-lg text-white shadow-lg shadow-blue-500/30">
          TX
        </div>
        <div>
          <h2 class="text-base font-bold text-white tracking-tight">TalentXcel</h2>
          <p class="text-xs text-slate-400">Universal MCP Server</p>
        </div>
      </div>
      <span class="px-2.5 py-1 text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
        OAuth 2.1
      </span>
    </div>

    <div class="space-y-2">
      <h1 class="text-xl font-bold text-white tracking-tight">Connect with Google Gemini</h1>
      <p class="text-xs text-slate-300 leading-relaxed">
        Google Gemini is requesting authorized access to TalentXcel's intelligent ecosystem.
      </p>
    </div>

    <div class="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 space-y-3">
      <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Requested Permissions</p>
      <ul class="text-xs text-slate-300 space-y-2">
        <li class="flex items-start gap-2">
          <span class="text-blue-400 mt-0.5">✓</span>
          <span>Search live job vacancies, market salary percentiles, and employer data</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-blue-400 mt-0.5">✓</span>
          <span>Run automated skill gap calculations and resume ATS audits</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-blue-400 mt-0.5">✓</span>
          <span>Access verified career coaching intelligence and learning resources</span>
        </li>
      </ul>
    </div>

    <form method="POST" action="/oauth/authorize" class="space-y-3 pt-2">
      <input type="hidden" name="response_type" value="${escapeHtml(String(responseType || 'code'))}">
      <input type="hidden" name="client_id" value="${escapeHtml(String(clientId || ''))}">
      <input type="hidden" name="redirect_uri" value="${escapeHtml(String(redirectUri || ''))}">
      <input type="hidden" name="code_challenge" value="${escapeHtml(String(codeChallenge || ''))}">
      <input type="hidden" name="code_challenge_method" value="${escapeHtml(String(codeChallengeMethod || 'S256'))}">
      <input type="hidden" name="state" value="${escapeHtml(String(state || ''))}">
      <input type="hidden" name="scope" value="${escapeHtml(String(scope || ''))}">
      <input type="hidden" name="action" value="approve">

      <button type="submit" class="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold rounded-2xl shadow-lg shadow-blue-600/25 transition-all">
        Authorize Google Gemini
      </button>

      <a href="${escapeHtml(redirectUri)}?error=access_denied&state=${escapeHtml(String(state))}" class="block text-center w-full py-2.5 text-xs text-slate-400 hover:text-slate-200 transition-colors">
        Cancel and Return
      </a>
    </form>
  </div>
</body>
</html>`;

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  return res.status(200).send(html);
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
