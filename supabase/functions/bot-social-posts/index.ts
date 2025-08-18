import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.1";

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

// Env
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

// Categories (as requested)
const CATEGORIES = [
  "System & Platform Updates",
  "Career Motivation",
  "Jobs & Networking",
  "Learning & Skills",
  "Resume & Career Tools",
  "Community & Inspiration",
] as const;

// Content library: clean, LinkedIn-style, no emojis/hashtags
const LIBRARY: Record<(typeof CATEGORIES)[number], string[]> = {
  "System & Platform Updates": [
    "Continuous improvement keeps great tools relevant. We’ve completed performance upgrades to keep your experience smooth and reliable.",
    "Behind every seamless interaction is a system designed to work in your favor. We fine-tuned backend processes to make your journey more effortless.",
    "Great careers need dependable tools. We’ve optimized the platform to be faster, sharper, and aligned with real use.",
    "While you focus on growth, we focus on infrastructure. Searches and profile views now load more efficiently.",
    "Progress often happens behind the scenes. Our latest system refresh strengthens stability and consistency across the platform.",
    "Small changes compound into big impact. Today’s update improves speed and responsiveness across core features.",
  ],
  "Career Motivation": [
    "Every career is built step by step. The small actions you take today shape the big opportunities tomorrow.",
    "Growth rarely happens overnight. It is the outcome of persistence, learning, and resilience.",
    "The best way to predict the future is to build it—one skill, one connection, one opportunity at a time.",
    "Success is not about luck, but preparation meeting opportunity. Keep preparing.",
    "Careers are marathons, not sprints. Pace yourself, but never stop moving forward.",
  ],
  "Jobs & Networking": [
    "The right role is about alignment with your goals and values, not just skills. Stay intentional.",
    "Networking is about cultivating meaningful professional relationships, not collecting contacts.",
    "Fresh opportunities are always emerging. The key is to stay prepared and visible.",
    "Referrals open doors. Nurture your network consistently.",
  ],
  "Learning & Skills": [
    "The fastest-growing careers are built on continuous learning and adaptation.",
    "Every skill you add compounds your professional value.",
    "Knowledge is powerful, but applied knowledge is transformative.",
    "A learning mindset keeps you competitive in an unpredictable world.",
  ],
  "Resume & Career Tools": [
    "Your resume is not just a document. It is your story in professional form.",
    "First impressions happen fast. A strong resume ensures you make the right one.",
    "A resume should highlight achievements, not just responsibilities.",
    "Career tools exist to amplify your effort, not replace it. Use them wisely.",
  ],
  "Community & Inspiration": [
    "No career is built alone. Every journey is supported by mentors, peers, and communities.",
    "Collaboration creates opportunities that competition never will.",
    "Success multiplies when shared. Lift others as you rise.",
    "A strong professional community is the backbone of resilient careers.",
  ],
};

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getAuthUserId(req: Request): string | null {
  const auth = req.headers.get("Authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) return null;
  
  try {
    // Handle both base64 and base64url encoding
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    
    let base64 = parts[1];
    // Convert base64url to base64 if needed
    base64 = base64.replace(/-/g, '+').replace(/_/g, '/');
    // Add padding if needed
    while (base64.length % 4) {
      base64 += '=';
    }
    
    const payload = JSON.parse(atob(base64));
    return payload?.sub || null;
  } catch (error) {
    console.error("JWT parsing error:", error);
    return null;
  }
}

// Get fallback admin user for safety
async function getAdminFallbackUserId(supabase: any): Promise<string | null> {
  try {
    const { data: admins } = await supabase
      .from("user_roles")
      .select("user_id")
      .in("role", ["super_admin", "admin"])
      .eq("is_active", true)
      .limit(1);
    
    return admins?.[0]?.user_id || null;
  } catch (error) {
    console.error("Failed to get admin fallback:", error);
    return null;
  }
}

function generatePost(bot: any, category: (typeof CATEGORIES)[number]) {
  const persona = bot?.name || "TalentXcel";
  const line = pick(LIBRARY[category]);
  // Clean, no emojis/hashtags, concise LinkedIn tone
  const content = `${line} ${persona} • ${category}`;
  return { content };
}

serve(async (req) => {
  // Preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Health
  if (req.method === "GET") {
    return new Response(
      JSON.stringify({ ok: true, function: "bot-social-posts", categories: CATEGORIES }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    if (!SUPABASE_URL || !SERVICE_ROLE) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Service role client for admin operations
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);
    
    // User-context client for RLS-aware operations
    const authHeader = req.headers.get("Authorization");
    const userClient = authHeader 
      ? createClient(SUPABASE_URL, SERVICE_ROLE, {
          global: { headers: { Authorization: authHeader } }
        })
      : supabase;
    
    const authUserFromReq = getAuthUserId(req);
    
    // Get admin fallback as safety net
    const adminFallback = await getAdminFallbackUserId(supabase);

    // Parse body safely
    const text = await req.text().catch(() => "");
    let body: any = {};
    if (text) {
      try { body = JSON.parse(text); } catch { body = {}; }
    }

    // Inputs
    const preset = String(body?.preset || "").toLowerCase();
    const limitBots = Math.max(1, Math.min(10, Number(body?.limit_bots ?? 4)));
    const requestedTotal = Number(body?.total_posts ?? (preset === "linkedin_100" ? 100 : 10));
    const categoriesInput = Array.isArray(body?.categories) ? body.categories : CATEGORIES as unknown as string[];

    // Fetch active bots with linked users
    const { data: bots, error: botsError } = await supabase
      .from("ai_bots")
      .select("id, user_id, profile_id, name, content_domains")
      .eq("is_active", true)
      .limit(limitBots);

    if (botsError) throw botsError;
    const botList = bots ?? [];
    if (!botList.length) {
      return new Response(
        JSON.stringify({ success: false, message: "No active bots found" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Distribute total across bots
    const totalPosts = Math.max(1, requestedTotal);
    const perBotBase = Math.floor(totalPosts / botList.length);
    let remainder = totalPosts % botList.length;

    const created: Array<{ id: string | null; bot_id: string; category: string }> = [];
    const errors: Array<{ bot_id: string; stage: string; message: string }> = [];
    let postsCreated = 0;
    let catIndex = 0;

    for (const bot of botList) {
      const quota = perBotBase + (remainder > 0 ? 1 : 0);
      if (remainder > 0) remainder--;

      for (let i = 0; i < quota; i++) {
        const category = (categoriesInput[catIndex % categoriesInput.length] as (typeof CATEGORIES)[number]) || "Learning & Skills";
        catIndex++;

        const { content } = generatePost(bot, (CATEGORIES.includes(category as any) ? category : "Learning & Skills") as any);

        // 1) Insert into bot wall (primary source for admin wall)
        const now = new Date().toISOString();
        const title = `${category} — ${bot.name}`;
        
        console.log(`Attempting bot_wall insert for bot ${bot.id} (${bot.name})`);
        
        const { data: wallInserted, error: wallErr } = await supabase // Use service role for bot_wall (admin access)
          .from("bot_wall")
          .insert({
            bot_id: bot.id,
            title,
            content,
            type: "post",
            source: "ai",
            created_by: authUserFromReq || adminFallback,
            is_draft: false,
            published_at: now,
          })
          .select("id")
          .single();

        if (wallErr) {
          console.error(`❌ Insert bot_wall failed for bot ${bot.id} (${bot.name}):`, wallErr?.message || wallErr);
          errors.push({ bot_id: bot.id, stage: 'bot_wall', message: wallErr?.message || String(wallErr) });
        } else {
          console.log(`✅ Successfully created bot_wall ${wallInserted?.id} for bot ${bot.name}`);
        }

      // 2) Insert into posts table with explicit author_id (trigger will handle null cases)
      try {
        const safeAuthorId = bot.user_id || adminFallback;
        console.log(`Attempting posts insert for bot ${bot.id} with author_id: ${safeAuthorId}`);

        const { data: postData, error: postError } = await supabase
          .from("posts")
          .insert({
            author_id: safeAuthorId, // Trigger will fallback if null
            content,
            headline: title,
            is_public: true,
            post_type: "text", 
            tags: [category],
            status: "published",
            visibility: "public",
            origin: "bot_wall",
            is_bot_post: true,
            is_ai_generated: true,
            metadata: { 
              category, 
              source: "bot-social-posts", 
              bot_id: bot.id, 
              bot_name: bot.name,
              preset: preset || null,
              fallback_used: !bot.user_id
            },
            created_at: now,
          })
          .select('id')
          .single();
          
          if (postError) {
            console.error(`❌ Posts insert failed for bot ${bot.id} (${bot.name}):`, postError.message);
            errors.push({ bot_id: bot.id, stage: 'posts', message: postError.message });
          } else {
            console.log(`✅ Successfully created post ${postData.id} for bot ${bot.name}`);
            postsCreated++;
          }
        } catch (postSyncErr: any) {
          console.error(`❌ Posts insert exception for bot ${bot.id}:`, postSyncErr?.message || postSyncErr);
          errors.push({ bot_id: bot.id, stage: 'posts', message: postSyncErr?.message || String(postSyncErr) });
        }

        created.push({ id: wallInserted?.id ?? null, bot_id: bot.id, category });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        created: created.filter(p => p.id).length,
        wall_created: created.filter(p => p.id).length,
        posts_created: postsCreated,
        attempted: created.length,
        posts: created,
        errors,
        bots_processed: botList.length,
        categories_used: Array.from(new Set(created.map(c => c.category))),
        preset: preset || null,
        debug: {
          service_role_present: Boolean(SERVICE_ROLE),
          auth_user_from_req: authUserFromReq,
          admin_fallback: adminFallback,
          total_errors: errors.length,
          wall_insert_errors: errors.filter(e => e.stage === 'bot_wall').length,
          posts_insert_errors: errors.filter(e => e.stage === 'posts').length,
        },
        timestamp: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("❌ bot-social-posts error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
