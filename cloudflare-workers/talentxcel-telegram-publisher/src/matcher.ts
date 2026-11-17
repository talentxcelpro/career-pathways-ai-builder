import { Env, EligibleJob, DistributionCategory } from './types';

export class JobMatcherService {
  private supabaseUrl: string;
  private apiKey: string;

  constructor(env: Env) {
    this.supabaseUrl = env.SUPABASE_URL.replace(/\/+$/, '');
    // Prefer service role key if configured, else anon key; strip any surrounding quotes
    const rawKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY || '';
    this.apiKey = rawKey.replace(/['"]/g, '').trim();
  }

  private get headers(): Record<string, string> {
    return {
      'apikey': this.apiKey,
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  /**
   * Fetches eligible jobs using the PostgreSQL RPC function get_distribution_eligible_jobs.
   */
  async getEligibleJobs(
    category: DistributionCategory,
    limit: number = 5,
    excludeIds: string[] = []
  ): Promise<EligibleJob[]> {
    const url = `${this.supabaseUrl}/rest/v1/rpc/get_distribution_eligible_jobs`;

    const res = await fetch(url, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
        p_category: category,
        p_limit: limit,
        p_exclude_ids: excludeIds
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Supabase RPC get_distribution_eligible_jobs failed (${res.status}): ${errText}`);
    }

    const data = (await res.json()) as EligibleJob[];
    return data || [];
  }

  /**
   * Checks if an idempotency key has already been published.
   */
  async isAlreadyPublished(idempotencyKey: string): Promise<boolean> {
    const url = `${this.supabaseUrl}/rest/v1/distribution_posts?idempotency_key=eq.${encodeURIComponent(idempotencyKey)}&status=eq.published&select=id`;
    const res = await fetch(url, {
      method: 'GET',
      headers: this.headers
    });

    if (!res.ok) {
      return false;
    }

    const rows = (await res.json()) as Array<{ id: string }>;
    return rows && rows.length > 0;
  }

  /**
   * Records a published post in distribution_posts and records deduplication records.
   * Uses atomic SECURITY DEFINER RPC record_distribution_post with direct table insert fallback.
   */
  async recordPublishedPost(params: {
    channelId: string;
    slotTime: string;
    category: string;
    title: string;
    content: string;
    jobIds: string[];
    idempotencyKey: string;
    externalMessageId?: string;
  }): Promise<string | null> {
    const rpcPayload = {
      p_channel_id: params.channelId,
      p_slot_time: params.slotTime,
      p_category: params.category,
      p_title: params.title,
      p_content_formatted: params.content,
      p_job_ids: params.jobIds || [],
      p_idempotency_key: params.idempotencyKey,
      p_external_message_id: params.externalMessageId || null
    };

    // Strategy 1: Secure server-side RPC function record_distribution_post (runs with postgres owner privileges)
    try {
      const rpcRes = await fetch(`${this.supabaseUrl}/rest/v1/rpc/record_distribution_post`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(rpcPayload)
      });

      if (rpcRes.ok) {
        const postId = (await rpcRes.json()) as string;
        return postId || null;
      }

      const errText = await rpcRes.text();
      console.warn(`[JobMatcherService] RPC record_distribution_post returned (${rpcRes.status}): ${errText}`);
    } catch (rpcErr) {
      console.warn(`[JobMatcherService] RPC record_distribution_post exception:`, rpcErr);
    }

    // Strategy 2: Direct REST table insert fallback (requires service_role key to bypass table RLS)
    try {
      const postPayload = {
        channel_id: params.channelId,
        slot_time: params.slotTime,
        category: params.category,
        title: params.title,
        content_formatted: params.content,
        job_ids: params.jobIds,
        status: 'published',
        idempotency_key: params.idempotencyKey,
        external_message_id: params.externalMessageId || null,
        published_at: new Date().toISOString()
      };

      const res = await fetch(`${this.supabaseUrl}/rest/v1/distribution_posts`, {
        method: 'POST',
        headers: {
          ...this.headers,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(postPayload)
      });

      if (res.ok) {
        const inserted = (await res.json()) as Array<{ id: string }>;
        const postId = inserted[0]?.id;

        // Record deduplication for each job
        if (postId && params.jobIds.length > 0) {
          const dedupRows = params.jobIds.map(jobId => ({
            job_id: jobId,
            channel_id: params.channelId,
            post_id: postId,
            published_at: new Date().toISOString(),
            cooldown_until: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString()
          }));

          await fetch(`${this.supabaseUrl}/rest/v1/distribution_deduplication`, {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify(dedupRows)
          }).catch(err => console.warn(`[JobMatcherService] Dedup insert notice:`, err));
        }

        return postId || null;
      }

      const errText = await res.text();
      console.warn(`[JobMatcherService] Table insert fallback failed (${res.status}): ${errText}`);
    } catch (tableErr) {
      console.warn(`[JobMatcherService] Table insert exception:`, tableErr);
    }

    return null;
  }

  /**
   * Records delivery log event via secure RPC log_distribution_delivery with table insert fallback.
   */
  async logDelivery(params: {
    postId?: string | null;
    channelId: string;
    action: string;
    status: 'success' | 'failed' | 'rate_limited';
    statusCode?: number;
    responsePayload?: unknown;
    errorMessage?: string;
    latencyMs?: number;
  }): Promise<void> {
    const rpcPayload = {
      p_post_id: params.postId || null,
      p_channel_id: params.channelId,
      p_action: params.action,
      p_status: params.status,
      p_status_code: params.statusCode || 200,
      p_response_payload: params.responsePayload ? params.responsePayload : null,
      p_error_message: params.errorMessage || null,
      p_latency_ms: params.latencyMs || 0
    };

    // Strategy 1: Secure RPC function log_distribution_delivery
    try {
      const res = await fetch(`${this.supabaseUrl}/rest/v1/rpc/log_distribution_delivery`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(rpcPayload)
      });
      if (res.ok) return;
    } catch (_) {}

    // Strategy 2: Direct table insert fallback
    try {
      await fetch(`${this.supabaseUrl}/rest/v1/distribution_delivery_logs`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          post_id: params.postId || null,
          channel_id: params.channelId,
          action: params.action,
          status: params.status,
          status_code: params.statusCode || 200,
          response_payload: params.responsePayload ? params.responsePayload : null,
          error_message: params.errorMessage || null,
          latency_ms: params.latencyMs || 0
        })
      });
    } catch (err) {
      console.error(`[JobMatcherService] Delivery log exception:`, err);
    }
  }
}
