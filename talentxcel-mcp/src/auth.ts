// src/auth.ts — Token validation and user identity for the MCP server

import { createClient } from "@supabase/supabase-js";
import { config } from "./config.js";

export interface AuthContext {
  userId: string | null;
  role: "public" | "user" | "employer" | "admin";
  token: string | null;
  isAuthenticated: boolean;
}

export async function validateBearerToken(authHeader: string | undefined): Promise<AuthContext> {
  if (!authHeader?.startsWith("Bearer ")) {
    return { userId: null, role: "public", token: null, isAuthenticated: false };
  }
  const token = authHeader.slice(7);
  if (!token || !config.supabase.url || !config.supabase.anonKey) {
    return { userId: null, role: "public", token: null, isAuthenticated: false };
  }
  try {
    const supabase = createClient(config.supabase.url, config.supabase.anonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return { userId: null, role: "public", token: null, isAuthenticated: false };
    const meta = user.app_metadata || {};
    const role: AuthContext["role"] = meta.role === "admin" ? "admin" : meta.role === "employer" ? "employer" : "user";
    return { userId: user.id, role, token, isAuthenticated: true };
  } catch {
    return { userId: null, role: "public", token: null, isAuthenticated: false };
  }
}

export function createUserSupabase(token: string) {
  return createClient(config.supabase.url, config.supabase.anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function createPublicSupabase() {
  return createClient(config.supabase.url, config.supabase.anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
