import { Env, EligibleJob, DistributionCategory } from './types';

export class JobMatcherService {
  private supabaseUrl: string;
  private apiKey: string;

  constructor(env: Env) {
    this.supabaseUrl = env.SUPABASE_URL.replace(/\/+$/, '');
    // Prefer service role key if configured, else anon key
    this.apiKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY;
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

    if (!res.ok) {
      console.warn(`[JobMatcherService] Failed to insert distribution_posts: ${res.statusText}`);
      return null;
    }

    const inserted = (await res.json()) as Array<{ id: string }>;
    const postId = inserted[0]?.id;

    // Record deduplication for each job to prevent repeats for 72 hours
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

  /**
   * Records delivery log event.
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
