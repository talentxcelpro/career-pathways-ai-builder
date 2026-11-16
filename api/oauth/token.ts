// api/oauth/token.ts — OAuth 2.1 Token Exchange Endpoint (PKCE RFC 7636)
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { verifyToken, signToken, verifyPkce } from "./_jwt.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "invalid_request", error_description: "Method not allowed. Use POST." });
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      // Parse application/x-www-form-urlencoded
      const params = new URLSearchParams(body);
      body = Object.fromEntries(params.entries());
    }
  }

  const grantType = body?.grant_type;

  // 1. Authorization Code Flow with PKCE
  if (grantType === "authorization_code") {
    const code = body?.code;
    const codeVerifier = body?.code_verifier;
    const redirectUri = body?.redirect_uri;

    if (!code || typeof code !== "string") {
      return res.status(400).json({ error: "invalid_request", error_description: "Missing authorization code" });
    }

    const payload = verifyToken(code);
    if (!payload || payload.type !== "auth_code") {
      return res.status(400).json({ error: "invalid_grant", error_description: "Invalid or expired authorization code" });
    }

    // Verify PKCE if code_challenge was stored
    if (payload.code_challenge) {
      if (!codeVerifier || !verifyPkce(String(codeVerifier), payload.code_challenge)) {
        return res.status(400).json({ error: "invalid_grant", error_description: "PKCE verification failed: invalid code_verifier" });
      }
    }

    // Issue Access Token & Refresh Token
    const accessToken = signToken(
      {
        sub: payload.sub || "txc_user_guest",
        role: payload.role || "user",
        scope: payload.scope || "public user",
        client_id: payload.client_id || "gemini",
        type: "access",
      },
      3600 // 1 hour access token
    );

    const refreshToken = signToken(
      {
        sub: payload.sub || "txc_user_guest",
        role: payload.role || "user",
        scope: payload.scope || "public user",
        client_id: payload.client_id || "gemini",
        type: "refresh",
      },
      30 * 86400 // 30 days refresh token
    );

    return res.status(200).json({
      access_token: accessToken,
      token_type: "Bearer",
      expires_in: 3600,
      refresh_token: refreshToken,
      scope: payload.scope || "public user",
    });
  }

  // 2. Refresh Token Flow
  if (grantType === "refresh_token") {
    const refreshToken = body?.refresh_token;
    if (!refreshToken || typeof refreshToken !== "string") {
      return res.status(400).json({ error: "invalid_request", error_description: "Missing refresh_token" });
    }

    const payload = verifyToken(refreshToken);
    if (!payload || payload.type !== "refresh") {
      return res.status(400).json({ error: "invalid_grant", error_description: "Invalid or expired refresh token" });
    }

    const newAccessToken = signToken(
      {
        sub: payload.sub,
        role: payload.role || "user",
        scope: payload.scope || "public user",
        client_id: payload.client_id || "gemini",
        type: "access",
      },
      3600
    );

    return res.status(200).json({
      access_token: newAccessToken,
      token_type: "Bearer",
      expires_in: 3600,
      scope: payload.scope || "public user",
    });
  }

  return res.status(400).json({
    error: "unsupported_grant_type",
    error_description: "Supported grant types: authorization_code, refresh_token",
  });
}
