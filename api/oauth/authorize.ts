// api/oauth/authorize.ts — OAuth 2.1 / PKCE Authorization Endpoint
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { signToken } from "./_jwt.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; style-src 'self' 'unsafe-inline'; form-action 'self' https:; frame-ancestors 'self' https://*.google.com https://gemini.google.com https://*.googleusercontent.com;"
  );

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

  // If user approves (via POST form submit or GET approve action or auto-authorized):
  const isApproved =
    (req.method === "POST" && (params.action === "approve" || params.decision === "approve")) ||
    (req.method === "GET" && (req.query.action === "approve" || req.query.auto === "true"));

  if (isApproved) {
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

  // Generate direct GET approve URL as seamless fallback
  const approveUrl = new URL("/oauth/authorize", "https://talentxcel.in");
  approveUrl.searchParams.set("response_type", String(responseType || "code"));
  approveUrl.searchParams.set("client_id", String(clientId || ""));
  approveUrl.searchParams.set("redirect_uri", String(redirectUri));
  if (codeChallenge) approveUrl.searchParams.set("code_challenge", String(codeChallenge));
  if (codeChallengeMethod) approveUrl.searchParams.set("code_challenge_method", String(codeChallengeMethod));
  if (state) approveUrl.searchParams.set("state", String(state));
  if (scope) approveUrl.searchParams.set("scope", String(scope));
  approveUrl.searchParams.set("action", "approve");

  // Render clean, self-contained TalentXcel Authorization Screen (ZERO external scripts)
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Connect with TalentXcel</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: #030712;
      color: #f3f4f6;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }
    .card {
      max-width: 28rem;
      width: 100%;
      background: rgba(15, 23, 42, 0.95);
      border: 1px solid #1e293b;
      border-radius: 1.5rem;
      padding: 2rem;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 1rem;
      border-bottom: 1px solid #1e293b;
      margin-bottom: 1.25rem;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .logo {
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 0.75rem;
      background: #2563eb;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1.125rem;
      box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4);
    }
    .badge {
      font-size: 0.7rem;
      font-weight: 600;
      background: rgba(16, 185, 129, 0.1);
      color: #34d399;
      border: 1px solid rgba(16, 185, 129, 0.2);
      border-radius: 9999px;
      padding: 0.25rem 0.65rem;
    }
    h1 {
      font-size: 1.25rem;
      font-weight: 700;
      color: #fff;
      margin-bottom: 0.35rem;
      letter-spacing: -0.01em;
    }
    p {
      font-size: 0.8125rem;
      color: #94a3b8;
      line-height: 1.5;
    }
    .permissions {
      background: rgba(2, 6, 23, 0.7);
      border: 1px solid rgba(30, 41, 59, 0.8);
      border-radius: 1rem;
      padding: 1rem;
      margin: 1.25rem 0;
    }
    .perm-title {
      font-size: 0.7rem;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.75rem;
    }
    ul { list-style: none; }
    li {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
      font-size: 0.8125rem;
      color: #cbd5e1;
      margin-bottom: 0.625rem;
    }
    li:last-child { margin-bottom: 0; }
    .check { color: #60a5fa; font-weight: bold; }
    .btn-approve {
      display: block;
      width: 100%;
      padding: 0.875rem 1rem;
      background: linear-gradient(135deg, #2563eb, #4f46e5);
      color: #fff;
      font-size: 0.875rem;
      font-weight: 600;
      border: none;
      border-radius: 1rem;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35);
      text-align: center;
      text-decoration: none;
      transition: opacity 0.2s;
    }
    .btn-approve:hover { opacity: 0.92; }
    .btn-cancel {
      display: block;
      width: 100%;
      text-align: center;
      padding: 0.75rem;
      font-size: 0.75rem;
      color: #64748b;
      text-decoration: none;
      margin-top: 0.5rem;
    }
    .btn-cancel:hover { color: #cbd5e1; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="brand">
        <div class="logo">TX</div>
        <div>
          <h2 style="font-size: 0.95rem; font-weight: 700; color: #fff;">TalentXcel</h2>
          <p style="font-size: 0.75rem; color: #94a3b8;">Universal MCP Server</p>
        </div>
      </div>
      <span class="badge">OAuth 2.1</span>
    </div>

    <div>
      <h1>Connect with Google Gemini</h1>
      <p>Google Gemini is requesting authorized access to TalentXcel's intelligent ecosystem.</p>
    </div>

    <div class="permissions">
      <div class="perm-title">Requested Permissions</div>
      <ul>
        <li><span class="check">✓</span><span>Search live job vacancies, market salary percentiles, and employer data</span></li>
        <li><span class="check">✓</span><span>Run automated skill gap calculations and resume ATS audits</span></li>
        <li><span class="check">✓</span><span>Access verified career coaching intelligence and learning resources</span></li>
      </ul>
    </div>

    <form method="POST" action="/oauth/authorize" style="margin-top: 0.75rem;">
      <input type="hidden" name="response_type" value="${escapeHtml(String(responseType || 'code'))}">
      <input type="hidden" name="client_id" value="${escapeHtml(String(clientId || ''))}">
      <input type="hidden" name="redirect_uri" value="${escapeHtml(String(redirectUri || ''))}">
      <input type="hidden" name="code_challenge" value="${escapeHtml(String(codeChallenge || ''))}">
      <input type="hidden" name="code_challenge_method" value="${escapeHtml(String(codeChallengeMethod || 'S256'))}">
      <input type="hidden" name="state" value="${escapeHtml(String(state || ''))}">
      <input type="hidden" name="scope" value="${escapeHtml(String(scope || ''))}">
      <input type="hidden" name="action" value="approve">

      <button type="submit" class="btn-approve">
        Authorize Google Gemini
      </button>

      <a href="${escapeHtml(redirectUri)}?error=access_denied&state=${escapeHtml(String(state))}" class="btn-cancel">
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
