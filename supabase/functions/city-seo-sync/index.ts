import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json',
};

/**
 * Edge Function: city-seo-sync
 *
 * Actions:
 * - refresh_inventory (default): Refreshes city_inventory_cache and evaluates
 *   evaluate_city_index_readiness(slug) in bounded batches.
 * - detect_opportunities: Reads city_registry + live inventory and records
 *   GSC opportunity signals in city_gsc_telemetry.
 */
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let body: { action?: string; wave?: number; limit?: number } = {};
    if (req.method === 'POST') {
      try {
        body = await req.json();
      } catch {
        body = {};
      }
    }

    const action = body.action || 'refresh_inventory';
    const wave = body.wave ?? 1;
    const batchLimit = Math.min(body.limit ?? 100, 200); // Bounded: max 200 per invocation

    const { data: cities, error: citiesErr } = await supabase
      .from('city_registry')
      .select('slug, canonical_name, gsc_impressions, gsc_clicks, gsc_avg_position, gsc_query_count')
      .eq('active', true)
      .lte('expansion_wave', wave)
      .order('gsc_impressions', { ascending: false })
      .limit(batchLimit);

    if (citiesErr) {
      throw new Error(`Failed to fetch city_registry: ${citiesErr.message}`);
    }

    const results: Array<{ slug: string; index_ready: boolean; quality_score: number; active_jobs: number }> = [];

    if (action === 'refresh_inventory') {
      for (const city of cities || []) {
        const { data: evalRows, error: evalErr } = await supabase.rpc(
          'evaluate_city_index_readiness',
          { p_city_slug: city.slug }
        );

        if (evalErr) {
          console.warn(`[city-seo-sync] Eval failed for ${city.slug}:`, evalErr.message);
          continue;
        }

        const row = Array.isArray(evalRows) ? evalRows[0] : evalRows;
        if (row) {
          results.push({
            slug: city.slug,
            index_ready: Boolean(row.index_ready),
            quality_score: Number(row.quality_score || 0),
            active_jobs: Number(row.active_job_count || 0),
          });

          // Upsert city_inventory_cache with bounded job sample
          const cityPattern = `%${city.slug.replace(/-/g, ' ')}%`;
          const { data: sampleJobs } = await supabase
            .from('jobs')
            .select('title, company_name, experience_level, is_remote, posted_at')
            .or(`location.ilike.${cityPattern},location_city.ilike.${cityPattern}`)
            .eq('is_active', true)
            .limit(100);

          const roles = [...new Set((sampleJobs || []).map((j: any) => j.title).filter(Boolean))].slice(0, 5);
          const employers = [...new Set((sampleJobs || []).map((j: any) => j.company_name).filter(Boolean))].slice(0, 5);
          const freshersCount = (sampleJobs || []).filter((j: any) =>
            (j.experience_level || '').toLowerCase().includes('fresher')
          ).length;
          const remoteCount = (sampleJobs || []).filter((j: any) => j.is_remote).length;

          await supabase.from('city_inventory_cache').upsert({
            city_slug: city.slug,
            active_job_count: Number(row.active_job_count || 0),
            unique_job_count: new Set((sampleJobs || []).map((j: any) => `${j.title}||${j.company_name}`)).size,
            unique_employer_count: Number(row.unique_employer_count || 0),
            freshers_job_count: freshersCount,
            experienced_job_count: Math.max(0, (sampleJobs || []).length - freshersCount),
            remote_job_count: remoteCount,
            recent_job_count: Number(row.recent_job_count || 0),
            top_roles: roles,
            top_employers: employers,
            refreshed_at: new Date().toISOString(),
          });
        }
      }

      return new Response(
        JSON.stringify({
          ok: true,
          action,
          evaluated: results.length,
          index_ready_count: results.filter((r) => r.index_ready).length,
          results,
        }),
        { headers: corsHeaders, status: 200 }
      );
    }

    if (action === 'detect_opportunities') {
      const today = new Date().toISOString().slice(0, 10);
      const startDate = new Date(Date.now() - 90 * 86400000).toISOString().slice(0, 10);
      let inserted = 0;

      for (const city of cities || []) {
        const ctr = city.gsc_impressions > 0 ? city.gsc_clicks / city.gsc_impressions : 0;
        const opportunities: string[] = [];

        if (city.gsc_impressions >= 100 && ctr < 0.02) opportunities.push('HIGH_IMPRESSION_LOW_CTR');
        if (city.gsc_avg_position >= 5 && city.gsc_avg_position <= 20) opportunities.push('POSITION_5_TO_20');
        if (city.gsc_avg_position > 0 && city.gsc_avg_position <= 5 && city.gsc_impressions >= 200) {
          opportunities.push('FEATURED_SNIPPET_CANDIDATE');
        }
        if (city.gsc_impressions === 0) opportunities.push('ZERO_IMPRESSIONS');

        if (opportunities.length > 0) {
          await supabase.from('city_gsc_telemetry').insert({
            city_slug: city.slug,
            canonical_url: `https://talentxcel.in/locations/${city.slug}`,
            period_start: startDate,
            period_end: today,
            impressions: city.gsc_impressions,
            clicks: city.gsc_clicks,
            ctr,
            avg_position: city.gsc_avg_position,
            driving_query_count: city.gsc_query_count,
            opportunities,
          });
          inserted++;
        }
      }

      return new Response(
        JSON.stringify({ ok: true, action, snapshots_inserted: inserted }),
        { headers: corsHeaders, status: 200 }
      );
    }

    return new Response(
      JSON.stringify({ error: `Unknown action: ${action}` }),
      { headers: corsHeaders, status: 400 }
    );
  } catch (err: any) {
    console.error('[city-seo-sync] Error:', err);
    return new Response(
      JSON.stringify({ error: err.message || 'Internal error' }),
      { headers: corsHeaders, status: 500 }
    );
  }
});
