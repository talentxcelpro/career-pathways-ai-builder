// api/oauth/register.ts — Dynamic Client Registration (RFC 7591)
import type { VercelRequest, VercelResponse } from "@vercel/node";
import * as crypto from "crypto";

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
      return res.status(400).json({ error: "invalid_request", error_description: "Invalid JSON body" });
    }
  }

  const clientName = body?.client_name || "Google Gemini";
  const redirectUris = Array.isArray(body?.redirect_uris) && body.redirect_uris.length > 0
    ? body.redirect_uris
    : ["https://gemini.google.com/customize/connectors", "https://developers.google.com/connected-apps"];

  const clientId = `txc_client_${crypto.randomBytes(16).toString("hex")}`;
  const clientSecret = `txc_sec_${crypto.randomBytes(32).toString("hex")}`;

  return res.status(201).json({
    client_id: clientId,
    client_secret: clientSecret,
    client_name: clientName,
    redirect_uris: redirectUris,
    grant_types: ["authorization_code", "refresh_token"],
    response_types: ["code"],
    token_endpoint_auth_method: body?.token_endpoint_auth_method || "none",
    registration_client_uri: `https://talentxcel.in/oauth/register/${clientId}`,
  });
}
