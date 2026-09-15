import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type PushRequest = {
  user_id?: string;
  user_ids?: string[];
  title: string;
  body: string;
  data?: Record<string, unknown>;
  trigger_type?: string;
  priority?: "low" | "normal" | "high" | "urgent";
  rich_content?: string;
  actions?: Array<{ action: string; label: string; url?: string }>;
  image?: string;
  action_url?: string;
};

type PushToken = {
  user_id: string;
  platform?: string;
  push_token?: string;
  token?: string;
  is_active?: boolean;
};

let cachedAccessToken: { token: string; expiresAt: number } | null = null;

const textEncoder = new TextEncoder();

const bytesToBase64Url = (bytes: Uint8Array) => {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
};

const jsonToBase64Url = (value: unknown) => {
  return bytesToBase64Url(textEncoder.encode(JSON.stringify(value)));
};

const pemToArrayBuffer = (pem: string) => {
  const cleanPem = pem
    .replace(/-----BEGIN PRIVATE KEY-----/g, "")
    .replace(/-----END PRIVATE KEY-----/g, "")
    .replace(/\s/g, "");
  const binary = atob(cleanPem);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes.buffer;
};

const hasFirebaseConfig = () => {
  return Boolean(
    Deno.env.get("FIREBASE_PROJECT_ID") &&
    Deno.env.get("FIREBASE_CLIENT_EMAIL") &&
    Deno.env.get("FIREBASE_PRIVATE_KEY")
  );
};

const getFirebaseAccessToken = async () => {
  const now = Math.floor(Date.now() / 1000);
  if (cachedAccessToken && cachedAccessToken.expiresAt - 60 > now) {
    return cachedAccessToken.token;
  }

  const clientEmail = Deno.env.get("FIREBASE_CLIENT_EMAIL") ?? "";
  const privateKey = (Deno.env.get("FIREBASE_PRIVATE_KEY") ?? "").replace(/\\n/g, "\n");

  const unsignedJwt = [
    jsonToBase64Url({ alg: "RS256", typ: "JWT" }),
    jsonToBase64Url({
      iss: clientEmail,
      scope: "https://www.googleapis.com/auth/firebase.messaging",
      aud: "https://oauth2.googleapis.com/token",
      exp: now + 3600,
      iat: now,
    }),
  ].join(".");

  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    pemToArrayBuffer(privateKey),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign(
    { name: "RSASSA-PKCS1-v1_5" },
    cryptoKey,
    textEncoder.encode(unsignedJwt),
  );

  const assertion = `${unsignedJwt}.${bytesToBase64Url(new Uint8Array(signature))}`;
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Firebase auth failed: ${errorText}`);
  }

  const tokenResponse = await response.json();
  cachedAccessToken = {
    token: tokenResponse.access_token,
    expiresAt: now + Number(tokenResponse.expires_in ?? 3600),
  };

  return cachedAccessToken.token;
};

const toFcmData = (data: Record<string, unknown>) => {
  const output: Record<string, string> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined || value === null) continue;
    output[key] = typeof value === "string" ? value : JSON.stringify(value);
  }
  return output;
};

const sendFcmMessage = async ({
  token,
  title,
  body,
  type,
  data,
  priority,
}: {
  token: string;
  title: string;
  body: string;
  type: string;
  data: Record<string, unknown>;
  priority: string;
}) => {
  const projectId = Deno.env.get("FIREBASE_PROJECT_ID") ?? "";
  const accessToken = await getFirebaseAccessToken();
  const isCall = type === "incoming_call" || type === "call";
  const highPriority = isCall || priority === "high" || priority === "urgent";

  const message: Record<string, unknown> = {
    token,
    data: toFcmData({
      ...data,
      type,
      title,
      body,
    }),
    android: {
      priority: highPriority ? "HIGH" : "NORMAL",
      ttl: isCall ? "60s" : "3600s",
      notification: isCall
        ? undefined
        : {
            channel_id: "talentxcel_signals",
            sound: "default",
            click_action: "OPEN_TALENTXCEL",
          },
    },
  };

  if (!isCall) {
    message.notification = { title, body };
  }

  const response = await fetch(`https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`FCM send failed: ${errorText}`);
  }

  return response.json();
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );

    const requestBody = await req.json() as PushRequest;
    const {
      user_id,
      user_ids,
      title,
      body,
      data = {},
      trigger_type,
      priority = "normal",
      rich_content,
      actions,
      image,
      action_url,
    } = requestBody;

    const targetUserIds = user_ids || (user_id ? [user_id] : []);
    const type = trigger_type || String(data.type || "general");

    if (!targetUserIds.length || !title || !body) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: user_id/user_ids, title, body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const notifications = targetUserIds.map((targetUserId) => ({
      user_id: targetUserId,
      type,
      title,
      message: body,
      data: {
        ...data,
        rich_content,
        actions,
        image,
        action_url,
      },
      priority,
      is_read: false,
      sound_enabled: true,
      created_at: new Date().toISOString(),
    }));

    const { data: createdNotifications, error: notificationError } = await supabaseClient
      .from("notifications")
      .insert(notifications)
      .select();

    if (notificationError) throw notificationError;

    const tokenSources = [
      { table: "user_push_tokens", tokenField: "push_token" },
      { table: "push_tokens", tokenField: "token" },
      { table: "push_notification_tokens", tokenField: "token" },
    ];

    let pushTokens: PushToken[] = [];
    for (const source of tokenSources) {
      const { data: sourceTokens, error: tokenError } = await supabaseClient
        .from(source.table)
        .select("*")
        .in("user_id", targetUserIds);

      if (tokenError) {
        console.warn(`Push token source unavailable: ${source.table}`, tokenError.message);
        continue;
      }

      pushTokens = (sourceTokens || [])
        .filter((token: PushToken) => token.is_active !== false)
        .map((token: PushToken) => ({
          ...token,
          push_token: (token as Record<string, string>)[source.tokenField] ?? token.push_token ?? token.token,
        }))
        .filter((token: PushToken) => Boolean(token.push_token));

      if (pushTokens.length > 0) break;
    }

    let sentCount = 0;
    const errors: string[] = [];
    const firebaseConfigured = hasFirebaseConfig();

    for (const token of pushTokens) {
      try {
        const platform = token.platform || "android";
        if (platform === "web") {
          console.log("Web push token found. Web push delivery is not configured in this function.");
          continue;
        }

        if (!firebaseConfigured) {
          console.log("Firebase service account secrets missing. Skipping FCM delivery.", {
            user_id: token.user_id,
            platform,
          });
          continue;
        }

        await sendFcmMessage({
          token: token.push_token || token.token || "",
          title,
          body,
          type,
          data: {
            ...data,
            notification_id: createdNotifications?.[0]?.id,
          },
          priority,
        });
        sentCount += 1;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`Failed to send push to user ${token.user_id}:`, message);
        errors.push(message);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        firebase_configured: firebaseConfigured,
        database_notifications: createdNotifications?.length || 0,
        push_tokens_found: pushTokens.length,
        push_notifications_sent: sentCount,
        errors,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("Error in send-push-notification function:", message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
