// api/oauth/_jwt.ts — Lightweight OAuth 2.1 Crypto & Token Helpers
import * as crypto from "crypto";

const OAUTH_SECRET =
  process.env.TALENTXCEL_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.TX_OAUTH_SECRET ||
  "txc-universal-mcp-oauth-key-prod-2026";

export interface TokenPayload {
  sub: string;
  role?: string;
  scope?: string;
  client_id?: string;
  type?: "access" | "refresh" | "auth_code";
  code_challenge?: string;
  redirect_uri?: string;
  exp: number;
  iat: number;
  iss: string;
}

function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  return Buffer.from(base64, "base64").toString("utf8");
}

export function signToken(payload: Omit<TokenPayload, "iat" | "iss" | "exp">, expiresInSeconds: number): string {
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: TokenPayload = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds,
    iss: "https://talentxcel.in",
  };

  const header = { alg: "HS256", typ: "JWT" };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));
  const signature = crypto
    .createHmac("sha256", OAUTH_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest("base64url");

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

export function verifyToken(token: string): TokenPayload | null {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [headerB64, payloadB64, signature] = parts;
  const expectedSig = crypto
    .createHmac("sha256", OAUTH_SECRET)
    .update(`${headerB64}.${payloadB64}`)
    .digest("base64url");

  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }

  try {
    const payload: TokenPayload = JSON.parse(base64UrlDecode(payloadB64));
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export function verifyPkce(verifier: string, challenge: string): boolean {
  if (!verifier || !challenge) return false;
  const calculatedChallenge = crypto
    .createHash("sha256")
    .update(verifier)
    .digest("base64url");
  return calculatedChallenge === challenge;
}
