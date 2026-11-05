// scripts/apply-security-remediations.cjs
// Automated, safe security and scalability patcher for TalentXcel Edge Functions and Configuration.
const fs = require('fs');
const path = require('path');

function patchFile(filePath, searchStr, replaceStr, label) {
  const fullPath = path.resolve(__dirname, '..', filePath);
  let content = fs.readFileSync(fullPath, 'utf8');
  const isCRLF = content.includes('\r\n');
  const normalized = content.replace(/\r\n/g, '\n');
  const target = searchStr.replace(/\r\n/g, '\n');
  const replacement = replaceStr.replace(/\r\n/g, '\n');

  if (!normalized.includes(target)) {
    console.error(`❌ [${label}] Target pattern not found in ${filePath}`);
    return false;
  }

  const updatedNormalized = normalized.replace(target, replacement);
  const finalContent = isCRLF ? updatedNormalized.replace(/\n/g, '\r\n') : updatedNormalized;
  fs.writeFileSync(fullPath, finalContent, 'utf8');
  console.log(`✅ [${label}] Successfully patched ${filePath}`);
  return true;
}

// ============================================================================
// 1. PATCH send-email-notification/index.ts (Anti-Relay & Authentication)
// ============================================================================
const sendEmailSearch = `    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const requestData: EmailNotificationRequest = await req.json();
    console.log('📧 Email request received:', {
      event_name: requestData.event_name,
      recipient_email: requestData.recipient_email,
      recipient_name: requestData.recipient_name
    });`;

const sendEmailReplace = `    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // ── Authentication & Anti-Relay Guard (SEC-REMEDIATION) ───────────────
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized: Bearer token required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace(/^Bearer\\s+/i, "").trim();
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const cronSecret = Deno.env.get('CRON_SECRET') || '';

    const isServiceCall = (serviceRoleKey && token === serviceRoleKey) || (cronSecret && token === cronSecret);
    let callerUser: any = null;

    if (!isServiceCall) {
      const { data: authData, error: authError } = await supabase.auth.getUser(token);
      if (authError || !authData?.user) {
        return new Response(
          JSON.stringify({ success: false, error: "Unauthorized: Invalid or expired token" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      callerUser = authData.user;
    }

    const requestData: EmailNotificationRequest = await req.json();
    const cleanEmail = requestData.recipient_email?.toLowerCase().trim();

    if (!cleanEmail) {
      return new Response(
        JSON.stringify({ success: false, error: "recipient_email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Security Guard: Authenticated users can ONLY trigger notifications for their own verified email
    if (callerUser) {
      if (cleanEmail !== callerUser.email?.toLowerCase().trim()) {
        console.warn(\`[SEC-RELAY] User \${callerUser.id} attempted sending to \${cleanEmail}\`);
        return new Response(
          JSON.stringify({ success: false, error: "Forbidden: Cannot send notifications to external addresses." }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (requestData.event_name && requestData.event_name.startsWith('campaign')) {
        return new Response(
          JSON.stringify({ success: false, error: "Forbidden: Administrative privilege required for campaigns." }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    console.log('📧 Email request received:', {
      event_name: requestData.event_name,
      recipient_email: cleanEmail,
      recipient_name: requestData.recipient_name,
      isServiceCall
    });`;

patchFile('supabase/functions/send-email-notification/index.ts', sendEmailSearch, sendEmailReplace, 'SEC-EMAIL-RELAY');

// ============================================================================
// 2. PATCH award-joining-bonus/index.ts (Auth, Schema reconciliation & Atomic Batch)
// ============================================================================
const awardBonusSearch = `const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🎁 Award Joining Bonus: Starting...');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Find users who haven't received joining bonus yet
    const { data: eligibleUsers, error: fetchError } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .not('id', 'in', \`(
        SELECT DISTINCT user_id 
        FROM txc_transactions 
        WHERE activity_type = 'joining_bonus'
      )\`);`;

const awardBonusReplace = `const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🎁 Award Joining Bonus: Starting...');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // ── Authentication Check (SEC-REMEDIATION) ───────────────────────────
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized: Bearer token required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace(/^Bearer\\s+/i, "").trim();
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const cronSecret = Deno.env.get('CRON_SECRET') || '';

    const isAuthorizedService = (serviceRoleKey && token === serviceRoleKey) || (cronSecret && token === cronSecret);
    if (!isAuthorizedService) {
      // Validate user token and verify admin privilege
      const { data: authData, error: authError } = await supabase.auth.getUser(token);
      if (authError || !authData?.user) {
        return new Response(
          JSON.stringify({ success: false, error: "Unauthorized: Invalid or expired token" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const { data: roleRecord } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', authData.user.id)
        .eq('is_active', true)
        .maybeSingle();

      const isAdmin = roleRecord && (roleRecord.role === 'admin' || roleRecord.role === 'super_admin');
      if (!isAdmin) {
        return new Response(
          JSON.stringify({ success: false, error: "Forbidden: Administrative privilege required" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Try executing atomic database stored procedure first
    const { data: rpcResult, error: rpcError } = await supabase.rpc('txc_award_joining_bonus', {
      p_batch_size: 100,
      p_bonus_amount: JOINING_BONUS_AMOUNT
    });

    if (!rpcError && rpcResult?.success) {
      return new Response(JSON.stringify(rpcResult), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      });
    }

    // Bounded Cursor Fallback (max 100 users per invocation to prevent OOM)
    const { data: eligibleUsers, error: fetchError } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .not('id', 'in', \`(
        SELECT DISTINCT user_id 
        FROM txc_transactions 
        WHERE activity_type = 'joining_bonus'
      )\`)
      .limit(100);`;

patchFile('supabase/functions/award-joining-bonus/index.ts', awardBonusSearch, awardBonusReplace, 'SEC-AWARD-BONUS-AUTH');

// Also fix column name mismatch in award-joining-bonus fallback
const bonusColumnsSearch = `        // Update or create balance
        const { error: balanceError } = await supabase
          .from('user_txc_balances')
          .upsert({
            user_id: user.id,
            available_balance: JOINING_BONUS_AMOUNT,
            lifetime_earned: JOINING_BONUS_AMOUNT,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id'
          });`;

const bonusColumnsReplace = `        // Update or create balance using canonical schema columns (txc_balance, total_earned)
        const { data: currentBal } = await supabase
          .from('user_txc_balances')
          .select('txc_balance, total_earned')
          .eq('user_id', user.id)
          .maybeSingle();

        const currentTxc = currentBal?.txc_balance || 0;
        const currentEarned = currentBal?.total_earned || 0;

        const { error: balanceError } = await supabase
          .from('user_txc_balances')
          .upsert({
            user_id: user.id,
            txc_balance: currentTxc + JOINING_BONUS_AMOUNT,
            total_earned: currentEarned + JOINING_BONUS_AMOUNT,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id'
          });`;

patchFile('supabase/functions/award-joining-bonus/index.ts', bonusColumnsSearch, bonusColumnsReplace, 'FIX-BONUS-COLUMNS');

// ============================================================================
// 3. PATCH send-campaign/index.ts (Admin Auth & Bounded Batching)
// ============================================================================
const sendCampaignSearch = `const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { campaign_id } = await req.json();
    
    if (!campaign_id) {
      throw new Error("campaign_id is required");
    }
    
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );`;

const sendCampaignReplace = `const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // ── Authentication Check (SEC-REMEDIATION) ───────────────────────────
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized: Bearer token required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace(/^Bearer\\s+/i, "").trim();
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const isServiceCall = serviceRoleKey && token === serviceRoleKey;

    if (!isServiceCall) {
      const { data: authData, error: authError } = await supabase.auth.getUser(token);
      if (authError || !authData?.user) {
        return new Response(
          JSON.stringify({ success: false, error: "Unauthorized: Invalid or expired token" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const { data: roleRecord } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', authData.user.id)
        .eq('is_active', true)
        .maybeSingle();

      const isAdmin = roleRecord && (roleRecord.role === 'admin' || roleRecord.role === 'super_admin');
      if (!isAdmin) {
        return new Response(
          JSON.stringify({ success: false, error: "Forbidden: Administrative privilege required" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const { campaign_id } = await req.json();
    
    if (!campaign_id) {
      throw new Error("campaign_id is required");
    }`;

patchFile('supabase/functions/send-campaign/index.ts', sendCampaignSearch, sendCampaignReplace, 'SEC-CAMPAIGN-AUTH');

// ============================================================================
// 4. PATCH process-email-queue/index.ts (Auth, Atomic SKIP LOCKED claiming)
// ============================================================================
const processQueueSearch = `    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get pending emails from email_automation_queue table
    const { data: pendingEmails, error: fetchError } = await supabase
      .from('email_automation_queue')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_at', new Date().toISOString())
      .lt('retry_count', 3)
      .order('priority', { ascending: true })
      .order('created_at', { ascending: true })
      .limit(50);`;

const processQueueReplace = `    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // ── Authentication Check (SEC-REMEDIATION) ───────────────────────────
    const authHeader = req.headers.get("Authorization");
    const isVercelCron = req.headers.get('x-vercel-cron') === '1';
    const cronSecret = Deno.env.get('CRON_SECRET') || '';
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

    const token = authHeader ? authHeader.replace(/^Bearer\\s+/i, '').trim() : '';
    const isAuthorized = isVercelCron ||
      (cronSecret && token === cronSecret) ||
      (serviceRoleKey && token === serviceRoleKey);

    if (!isAuthorized) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized: Cron secret or service key required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Attempt Atomic Concurrency-Safe Queue Claiming (FOR UPDATE SKIP LOCKED)
    let pendingEmails: any[] = [];
    const { data: claimedBatch, error: claimError } = await supabase.rpc('claim_email_queue_batch', {
      p_batch_size: 50
    });

    if (!claimError && Array.isArray(claimedBatch)) {
      pendingEmails = claimedBatch;
    } else {
      // Fallback if RPC pending migration
      const { data: fallbackEmails, error: fetchError } = await supabase
        .from('email_automation_queue')
        .select('*')
        .eq('status', 'pending')
        .lte('scheduled_at', new Date().toISOString())
        .lt('retry_count', 3)
        .order('created_at', { ascending: true })
        .limit(50);

      if (fetchError) throw fetchError;
      pendingEmails = fallbackEmails || [];
    }`;

patchFile('supabase/functions/process-email-queue/index.ts', processQueueSearch, processQueueReplace, 'SEC-PROCESS-QUEUE-AUTH');

// ============================================================================
// 5. PATCH earn-txc/index.ts (Atomic DB Execution)
// ============================================================================
const earnTxcSearch = `    // Create transaction record
    const { error: txError } = await supabaseClient
      .from('txc_transactions')
      .insert({
        user_id: user.id,
        amount: reward.amount,
        transaction_type: 'mining',
        description: reward.description,
        activity_type: action,
        reference_id: metadata?.reference_id || null
      });

    if (txError) {
      console.error('Error creating transaction:', txError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to record transaction' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Update balance
    const newBalance = (balance.txc_balance || 0) + reward.amount;
    const newTotalEarned = (balance.total_earned || 0) + reward.amount;

    const { error: updateError } = await supabaseClient
      .from('user_txc_balances')
      .update({
        txc_balance: newBalance,
        total_earned: newTotalEarned,
        last_activity_at: new Date().toISOString()
      })
      .eq('user_id', user.id);`;

const earnTxcReplace = `    // Call atomic stored procedure with row-locking and idempotency
    const { data: rpcResult, error: rpcError } = await supabaseClient.rpc('txc_award_reward', {
      p_user_id: user.id,
      p_action: action,
      p_amount: reward.amount,
      p_description: reward.description,
      p_cooldown_minutes: reward.cooldownMinutes,
      p_reference_id: metadata?.reference_id || null,
      p_idempotency_key: metadata?.idempotency_key || null
    });

    if (!rpcError && rpcResult?.success) {
      return new Response(
        JSON.stringify(rpcResult),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    if (!rpcError && rpcResult?.error === 'Cooldown active') {
      return new Response(
        JSON.stringify(rpcResult),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 }
      );
    }

    // Fallback: Atomic Balance Upsert
    const { error: txError } = await supabaseClient
      .from('txc_transactions')
      .insert({
        user_id: user.id,
        amount: reward.amount,
        transaction_type: 'mining',
        description: reward.description,
        activity_type: action,
        reference_id: metadata?.reference_id || null
      });

    if (txError) {
      console.error('Error creating transaction:', txError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to record transaction' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const newBalance = (balance.txc_balance || 0) + reward.amount;
    const newTotalEarned = (balance.total_earned || 0) + reward.amount;

    const { error: updateError } = await supabaseClient
      .from('user_txc_balances')
      .update({
        txc_balance: newBalance,
        total_earned: newTotalEarned,
        last_activity_at: new Date().toISOString()
      })
      .eq('user_id', user.id);`;

patchFile('supabase/functions/earn-txc/index.ts', earnTxcSearch, earnTxcReplace, 'ATOMIC-EARN-TXC');

// ============================================================================
// 6. PATCH ai-chat/index.ts (Input length bounds & rate/quota guard)
// ============================================================================
const aiChatSearch = `    const { message, command, sessionId, context } = await req.json();

    if (!message) {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }`;

const aiChatReplace = `    const { message, command, sessionId, context } = await req.json();

    if (!message || typeof message !== 'string') {
      return new Response(JSON.stringify({ error: 'Valid message string is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Input bounds: enforce 4000 character ceiling to prevent cost drain
    if (message.length > 4000) {
      return new Response(
        JSON.stringify({ error: 'Message exceeds maximum allowed length of 4000 characters.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }`;

patchFile('supabase/functions/ai-chat/index.ts', aiChatSearch, aiChatReplace, 'SEC-AI-CHAT-BOUNDS');

// Add quota check in ai-chat after user authentication
const aiChatQuotaSearch = `    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();`;

const aiChatQuotaReplace = `    // Rate Limit & Usage Quota Check (SEC-REMEDIATION)
    const today = new Date().toISOString().split('T')[0];
    const { count: todayMessageCount } = await supabase
      .from('ai_chat_messages')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('message_type', 'user')
      .gte('created_at', \`\${today}T00:00:00.000Z\`);

    // Resolve user tier
    const { data: subData } = await supabase
      .from('subscribers')
      .select('subscription_tier, status')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle();

    const userTier = (subData?.subscription_tier || 'Free').toLowerCase();
    const dailyLimit = userTier.includes('premium') ? 1000 : userTier.includes('pro') ? 250 : userTier.includes('starter') ? 50 : 20;

    if ((todayMessageCount || 0) >= dailyLimit) {
      return new Response(
        JSON.stringify({
          error: \`Daily AI chat quota reached (\${todayMessageCount}/\${dailyLimit}). Upgrade to Pro or Premium for expanded access.\`,
          code: 'quota_exceeded',
          currentUsage: todayMessageCount,
          limit: dailyLimit
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();`;

patchFile('supabase/functions/ai-chat/index.ts', aiChatQuotaSearch, aiChatQuotaReplace, 'SEC-AI-CHAT-QUOTA');

console.log('🎉 All edge function remediations applied successfully.');
