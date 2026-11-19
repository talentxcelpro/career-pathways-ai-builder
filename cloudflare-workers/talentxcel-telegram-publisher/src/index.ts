import { Env, DistributionCategory, ExecutionContext, ScheduledEvent } from './types';
import { TelegramClient } from './telegram';
import { JobMatcherService } from './matcher';
import { buildDistributionPost } from './content';

function getCategoryForSlot(utcHour: number, utcMinute: number): { slot: string; category: DistributionCategory } {
  // IST is UTC + 5:30
  // 08:00 IST = 02:30 UTC
  // 12:00 IST = 06:30 UTC
  // 16:00 IST = 10:30 UTC
  // 20:00 IST = 14:30 UTC
  if (utcHour === 2 || (utcHour === 3 && utcMinute < 15)) {
    return { slot: '08:00_IST', category: 'tech_high_growth' };
  } else if (utcHour === 6 || (utcHour === 7 && utcMinute < 15)) {
    return { slot: '12:00_IST', category: 'fresher_entry' };
  } else if (utcHour === 10 || (utcHour === 11 && utcMinute < 15)) {
    return { slot: '16:00_IST', category: 'city_spotlight' };
  } else if (utcHour === 14 || (utcHour === 15 && utcMinute < 15)) {
    return { slot: '20:00_IST', category: 'remote_executive' };
  }
  return { slot: 'adhoc_slot', category: 'tech_high_growth' };
}

export default {
  /**
   * HTTP request router for health checks, previews, manual triggers, and admin control.
   */
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key',
      'Content-Type': 'application/json'
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // 1. Health Check
      if (path === '/' || path === '/health') {
        return new Response(JSON.stringify({
          status: 'healthy',
          service: 'talentxcel-telegram-publisher',
          timestamp: new Date().toISOString(),
          version: '1.0.0',
          environment: 'production'
        }), { headers: corsHeaders });
      }

      // 2. Comprehensive Status & Connection Check
      if (path === '/status') {
        const tg = new TelegramClient(env.TELEGRAM_BOT_TOKEN, env.TELEGRAM_CHANNEL || '@TalentXcelJobs');
        const botInfo = await tg.getMe().catch(err => ({ ok: false, description: err.message }));

        return new Response(JSON.stringify({
          status: 'ok',
          telegramBot: botInfo,
          targetChannel: env.TELEGRAM_CHANNEL || '@TalentXcelJobs',
          supabaseConfigured: Boolean(env.SUPABASE_URL && (env.SUPABASE_ANON_KEY || env.SUPABASE_SERVICE_ROLE_KEY)),
          serverTime: new Date().toISOString()
        }), { headers: corsHeaders });
      }

      // 3. Post Preview / Dry Run (Generates without broadcasting)
      if (path === '/preview' && request.method === 'POST') {
        let body: { category?: DistributionCategory; slot?: string; limit?: number } = {};
        try {
          body = await request.json();
        } catch (_) {}

        const category = body.category || 'tech_high_growth';
        const slot = body.slot || 'manual_preview';
        const limit = body.limit || 5;

        const matcher = new JobMatcherService(env);
        const jobs = await matcher.getEligibleJobs(category, limit);

        const post = buildDistributionPost(category, slot, jobs, {
          portalUrl: env.TALENTXCEL_PORTAL_URL,
          jobsSubdomainUrl: env.TALENTXCEL_JOBS_URL,
          telegramInviteUrl: env.TELEGRAM_INVITE_URL,
          whatsappChannelUrl: env.WHATSAPP_CHANNEL_URL
        });

        return new Response(JSON.stringify({
          success: true,
          preview: post,
          jobsCount: jobs.length
        }), { headers: corsHeaders });
      }

      // 4. Manual / Programmatic Publish Trigger
      if (path === '/publish' && request.method === 'POST') {
        let body: { category?: DistributionCategory; slot?: string; channel?: string; dryRun?: boolean } = {};
        try {
          body = await request.json();
        } catch (_) {}

        const category = body.category || 'tech_high_growth';
        const slot = body.slot || 'manual_trigger';
        const channel = body.channel || 'telegram';

        const matcher = new JobMatcherService(env);
        const tg = new TelegramClient(env.TELEGRAM_BOT_TOKEN, env.TELEGRAM_CHANNEL || '@TalentXcelJobs');

        const jobs = await matcher.getEligibleJobs(category, 5);
        if (jobs.length === 0) {
          return new Response(JSON.stringify({
            success: false,
            message: 'No eligible jobs found for category ' + category
          }), { status: 404, headers: corsHeaders });
        }

        const post = buildDistributionPost(category, slot, jobs, {
          portalUrl: env.TALENTXCEL_PORTAL_URL,
          jobsSubdomainUrl: env.TALENTXCEL_JOBS_URL,
          telegramInviteUrl: env.TELEGRAM_INVITE_URL,
          whatsappChannelUrl: env.WHATSAPP_CHANNEL_URL
        });

        // Idempotency check: prevent duplicate posting of the same slot
        const alreadyDone = await matcher.isAlreadyPublished(post.idempotencyKey);
        if (alreadyDone && !body.dryRun) {
          return new Response(JSON.stringify({
            success: false,
            message: 'Post with idempotency key already published: ' + post.idempotencyKey
          }), { status: 409, headers: corsHeaders });
        }

        if (body.dryRun) {
          return new Response(JSON.stringify({
            success: true,
            dryRun: true,
            post
          }), { headers: corsHeaders });
        }

        // Broadcast to Telegram
        const tgResult = await tg.sendChannelMessage(post.telegramHtml, {
          disableWebPagePreview: true
        });

        let recordedPostId: string | null = null;
        if (tgResult.response.ok) {
          recordedPostId = await matcher.recordPublishedPost({
            channelId: 'telegram',
            slotTime: slot,
            category,
            title: post.title,
            content: post.telegramHtml,
            jobIds: jobs.map(j => j.id),
            idempotencyKey: post.idempotencyKey,
            externalMessageId: tgResult.response.result?.message_id ? String(tgResult.response.result.message_id) : undefined
          });

          await matcher.logDelivery({
            postId: recordedPostId,
            channelId: 'telegram',
            action: 'publish_attempt',
            status: 'success',
            responsePayload: tgResult.response,
            latencyMs: tgResult.latencyMs
          });
        } else {
          await matcher.logDelivery({
            channelId: 'telegram',
            action: 'publish_attempt',
            status: 'failed',
            errorMessage: tgResult.response.description || 'Unknown Telegram failure',
            responsePayload: tgResult.response,
            latencyMs: tgResult.latencyMs
          });
        }

        return new Response(JSON.stringify({
          success: tgResult.response.ok,
          telegramResponse: tgResult.response,
          recordedPostId,
          attempts: tgResult.attempts,
          latencyMs: tgResult.latencyMs
        }), {
          status: tgResult.response.ok ? 200 : 502,
          headers: corsHeaders
        });
      }

      return new Response(JSON.stringify({ error: 'Endpoint not found' }), {
        status: 404,
        headers: corsHeaders
      });
    } catch (err: unknown) {
      console.error('[Worker Router Error]', err);
      return new Response(JSON.stringify({
        error: err instanceof Error ? err.message : 'Internal Server Error'
      }), { status: 500, headers: corsHeaders });
    }
  },

  /**
   * Cloudflare Scheduled Cron Handler.
   * Fires at: 02:30, 06:30, 10:30, 14:30 UTC (08:00, 12:00, 16:00, 20:00 IST).
   */
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    const now = new Date();
    const utcHour = now.getUTCHours();
    const utcMinute = now.getUTCMinutes();

    const { slot, category } = getCategoryForSlot(utcHour, utcMinute);
    console.log(`[Scheduled Worker] Triggered slot: ${slot}, category: ${category} at ${now.toISOString()}`);

    const matcher = new JobMatcherService(env);
    const tg = new TelegramClient(env.TELEGRAM_BOT_TOKEN, env.TELEGRAM_CHANNEL || '@TalentXcelJobs');

    try {
      const jobs = await matcher.getEligibleJobs(category, 5);
      if (jobs.length === 0) {
        console.warn(`[Scheduled Worker] No eligible jobs found for category: ${category}`);
        return;
      }

      const post = buildDistributionPost(category, slot, jobs, {
        portalUrl: env.TALENTXCEL_PORTAL_URL,
        jobsSubdomainUrl: env.TALENTXCEL_JOBS_URL,
        telegramInviteUrl: env.TELEGRAM_INVITE_URL,
        whatsappChannelUrl: env.WHATSAPP_CHANNEL_URL
      });

      // Idempotency check: don't double post
      const isDone = await matcher.isAlreadyPublished(post.idempotencyKey);
      if (isDone) {
        console.log(`[Scheduled Worker] Slot already completed. Skipping: ${post.idempotencyKey}`);
        return;
      }

      // 1. Dispatch to Telegram Channel
      const tgResult = await tg.sendChannelMessage(post.telegramHtml, {
        disableWebPagePreview: true
      });

      // 2. Record to Database
      if (tgResult.response.ok) {
        const recordedId = await matcher.recordPublishedPost({
          channelId: 'telegram',
          slotTime: slot,
          category,
          title: post.title,
          content: post.telegramHtml,
          jobIds: jobs.map(j => j.id),
          idempotencyKey: post.idempotencyKey,
          externalMessageId: tgResult.response.result?.message_id ? String(tgResult.response.result.message_id) : undefined
        });

        await matcher.logDelivery({
          postId: recordedId,
          channelId: 'telegram',
          action: 'scheduled_cron_dispatch',
          status: 'success',
          responsePayload: tgResult.response,
          latencyMs: tgResult.latencyMs
        });

        // 3. Also queue for WhatsApp Manual Channel Queue in distribution_posts
        await matcher.recordPublishedPost({
          channelId: 'whatsapp_channel',
          slotTime: slot,
          category,
          title: post.title,
          content: post.whatsappText,
          jobIds: jobs.map(j => j.id),
          idempotencyKey: `${post.idempotencyKey}_wa`
        }).catch(err => console.warn(`[Scheduled Worker] WhatsApp queue notice:`, err));

        console.log(`[Scheduled Worker] Successfully published Telegram post for ${slot}`);
      } else {
        await matcher.logDelivery({
          channelId: 'telegram',
          action: 'scheduled_cron_dispatch',
          status: 'failed',
          errorMessage: tgResult.response.description || 'Unknown failure',
          responsePayload: tgResult.response,
          latencyMs: tgResult.latencyMs
        });
        console.error(`[Scheduled Worker] Telegram publish failed:`, tgResult.response);
      }
    } catch (err) {
      console.error(`[Scheduled Worker] Execution exception:`, err);
    }
  }
};
