import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.1";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let body: any;
    try {
      body = await req.json();
    } catch (err) {
      console.error("Invalid JSON:", err);
      return json({ success: false, error: "Invalid JSON in request body", timestamp: now() }, 400);
    }

    console.log("Platform Analytics called:", body);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const action = body.action;

    // Normalize fields (accept camelCase and snake_case and legacy names)
    const userId = body.userId ?? body.user_id ?? body.userID ?? null;
    // Prefer new "eventType", fallback to "event_name"
    const eventType = body.eventType ?? body.event_name ?? null;
    const moduleName = body.moduleName ?? body.module ?? null;
    // Prefer "eventData", fallback to "metadata"
    const eventData = body.eventData ?? body.metadata ?? {};

    switch (action) {
      case "track": {
        if (!eventType) {
          return json({ success: false, error: "eventType is required for tracking", timestamp: now() }, 400);
        }
        if (!userId) {
          return json({ success: false, error: "userId is required for tracking", timestamp: now() }, 400);
        }

        const sessionId = generateSessionId();

        const { error: insertErr } = await supabase.from("platform_analytics").insert({
          user_id: userId,
          event_type: eventType,
          module_name: moduleName,
          event_data: isPlainObject(eventData) ? eventData : {},
          session_id: sessionId,
          timestamp: new Date().toISOString(),
        });

        if (insertErr) {
          console.error("Analytics tracking error:", insertErr);
          return json({ success: false, error: "Failed to track event", timestamp: now() }, 400);
        }

        // best-effort progress update
        try {
          if (moduleName) {
            await updateModuleProgress(supabase, userId, moduleName, eventType);
          }
        } catch (err) {
          console.warn("Non-blocking progress update error:", err);
        }

        return json({ success: true, data: { sessionId }, timestamp: now() });
      }

      case "get": {
        if (!userId) {
          return json({ success: false, error: "userId is required for get", timestamp: now() }, 400);
        }

        const { data: events, error: eventsError } = await supabase
          .from("platform_analytics")
          .select("*")
          .eq("user_id", userId)
          .order("timestamp", { ascending: false })
          .limit(100);

        if (eventsError) {
          console.error("Analytics fetch error:", eventsError);
          return json({ success: false, error: "Failed to fetch analytics", timestamp: now() }, 400);
        }

        const { data: moduleProgress, error: progressError } = await supabase
          .from("module_progress")
          .select("*")
          .eq("user_id", userId);

        if (progressError) {
          console.error("Module progress fetch error:", progressError);
        }

        return json(
          {
            success: true,
            data: {
              events: events ?? [],
              module_progress: moduleProgress ?? [],
            },
            timestamp: now(),
          },
          200
        );
      }

      default:
        return json(
          { success: false, error: "Invalid action. Use: track or get", timestamp: now() },
          400
        );
    }
  } catch (error) {
    console.error("Platform Analytics error:", error);
    return json({ success: false, error: getErrMsg(error), timestamp: now() }, 500);
  }
});

/** helpers */
function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
function now() {
  return new Date().toISOString();
}
function getErrMsg(e: unknown) {
  return e instanceof Error ? e.message : "Internal server error";
}
function isPlainObject(v: unknown) {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}
function generateSessionId() {
  // fully safe, no substr; prefer crypto if available
  const rand = crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);
  return `session_${Date.now()}_${rand}`;
}

async function updateModuleProgress(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  moduleName: string,
  eventType: string
) {
  const timeMap: Record<string, number> = {
    page_view: 1,
    feature_used: 2,
    profile_updated: 5,
    resume_created: 15,
    job_applied: 10,
    qr_code_generated: 2,
    module_completed: 30,
  };
  const completionMap: Record<string, number> = {
    profile_updated: 5,
    resume_created: 20,
    job_applied: 10,
    certification_earned: 15,
    test_completed: 10,
    qr_code_generated: 5,
    module_completed: 25,
  };

  const incTime = timeMap[eventType] ?? 1;
  const incCompletion = completionMap[eventType] ?? 1;

  const { data: current, error: selErr } = await supabase
    .from("module_progress")
    .select("*")
    .eq("user_id", userId)
    .eq("module_name", moduleName)
    .maybeSingle();

  if (selErr) {
    // we don't fail tracking, just log
    console.warn("Progress select err:", selErr);
  }

  if (current) {
    await supabase
      .from("module_progress")
      .update({
        last_accessed: now(),
        time_spent_minutes: (current.time_spent_minutes ?? 0) + incTime,
        completion_percentage: Math.min(100, (current.completion_percentage ?? 0) + incCompletion),
        updated_at: now(),
      })
      .eq("user_id", userId)
      .eq("module_name", moduleName);
  } else {
    await supabase.from("module_progress").insert({
      user_id: userId,
      module_name: moduleName,
      completion_percentage: Math.min(100, incCompletion),
      time_spent_minutes: incTime,
      last_accessed: now(),
      updated_at: now(),
    });
  }
}