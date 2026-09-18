/**
 * api/discovery/data.ts
 * GET /api/discovery/data
 *
 * UDX v4.0 Global Intelligence Telemetry API
 * Supports:
 * - Dynamic Observation Day calculation (Day-1 / 14-day window from 2026-09-17T11:25:00Z)
 * - Global Geography by default (34 observed countries, 6 continents)
 * - Country & City drill-down filtering
 * - Dual entity/opportunity counters
 *
 * Runtime: Node.js
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const config = { runtime: 'nodejs' };

const OBSERVATION_START_AT = "2026-09-17T11:25:00Z";
const OBSERVATION_TOTAL_DAYS = 14;
const DAY0_BASELINE_AUDIT_ID = "165cdfd2-91e3-48c0-ab6b-ddea4ef023b3";
const DAY0_BASELINE_TIMESTAMP = "2026-09-18T14:45:07.639Z";

function computeObservationClock(now = new Date()) {
  const start = new Date(OBSERVATION_START_AT);
  const end = new Date(start.getTime() + OBSERVATION_TOTAL_DAYS * 86400000);

  const elapsedMs = Math.max(0, now.getTime() - start.getTime());
  const elapsedDays = elapsedMs / 86400000;
  const observationDay = Math.floor(elapsedDays);

  const elapsedHours = Math.floor(elapsedMs / (1000 * 60 * 60));
  const elapsedMinutes = Math.floor((elapsedMs % (1000 * 60 * 60)) / (1000 * 60));

  const remainingMs = Math.max(0, end.getTime() - now.getTime());
  const remainingDays = Math.floor(remainingMs / 86400000);
  const remainingHours = Math.floor((remainingMs % 86400000) / (1000 * 60 * 60));

  let phase: "BASELINE" | "OBSERVATION" | "FINALIZATION" = "OBSERVATION";
  let status: "BASELINE" | "ACTIVE" | "COMPLETE" = "ACTIVE";

  if (observationDay === 0) {
    phase = "BASELINE";
    status = "BASELINE";
  } else if (elapsedDays >= OBSERVATION_TOTAL_DAYS) {
    phase = "FINALIZATION";
    status = "COMPLETE";
  }

  return {
    observationStartAt: start.toISOString(),
    observationEndAt: end.toISOString(),
    startAt: start.toISOString(),
    endAt: end.toISOString(),
    now: now.toISOString(),
    observationDay,
    displayDay: `DAY ${observationDay}`,
    dayRatio: `DAY ${observationDay} / ${OBSERVATION_TOTAL_DAYS}`,
    elapsedHours,
    elapsedMinutes,
    elapsedDays: Number(elapsedDays.toFixed(2)),
    totalDays: OBSERVATION_TOTAL_DAYS,
    remainingDays,
    remainingHours,
    status,
    phase,
    baselineAuditId: DAY0_BASELINE_AUDIT_ID,
    baselineTimestamp: DAY0_BASELINE_TIMESTAMP,
  };
}

const CONTINENT_MAP: Record<string, string> = {
  ind: 'Asia', bgd: 'Asia', phl: 'Asia', vnm: 'Asia', idn: 'Asia', tha: 'Asia',
  mys: 'Asia', chn: 'Asia', hkg: 'Asia', twn: 'Asia', sgp: 'Asia', jor: 'Asia',
  are: 'Asia', sau: 'Asia', qat: 'Asia', irq: 'Asia',
  usa: 'North America', can: 'North America', mex: 'North America',
  gbr: 'Europe', fra: 'Europe', deu: 'Europe', esp: 'Europe', ita: 'Europe',
  nld: 'Europe', dnk: 'Europe', swe: 'Europe', ukr: 'Europe', tur: 'Europe',
  mar: 'Africa', dza: 'Africa',
  aus: 'Oceania',
  bra: 'South America', chl: 'South America'
};

const TX_SUPABASE_URL = process.env.TX_SUPABASE_URL || 'https://dthlgsnakhoftinssokm.supabase.co';
const TX_SUPABASE_ANON_KEY =
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc';

function getSupabase(): SupabaseClient {
  const serviceKey =
    process.env.TALENTXCEL_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    TX_SUPABASE_ANON_KEY;

  return createClient(TX_SUPABASE_URL, serviceKey, {
    auth: { persistSession: false },
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Content-Type', 'application/json');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const clock = computeObservationClock();

  // Geography params: geoLevel = GLOBAL | COUNTRY | CITY
  const geoLevel = (req.query?.geoLevel as string) || 'GLOBAL';
  const countryParam = (req.query?.country as string) || (req.query?.geoCode as string);
  const cityParam = req.query?.city as string;

  try {
    const supabase = getSupabase();

    // 1. Entities query with optional geographic drill-down
    let entCountQuery = supabase
      .from('udx_demand_entities')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', 'talentxcel');

    let entListQuery = supabase
      .from('udx_demand_entities')
      .select('*')
      .eq('tenant_id', 'talentxcel')
      .order('impressions', { ascending: false });

    // Apply country filter only when explicitly requested (GLOBAL means ALL countries)
    if (countryParam && countryParam !== 'GLOBAL' && countryParam !== 'ALL') {
      entCountQuery = entCountQuery.eq('country', countryParam.toLowerCase());
      entListQuery = entListQuery.eq('country', countryParam.toLowerCase());
    }

    if (cityParam) {
      entCountQuery = entCountQuery.ilike('query', `%${cityParam}%`);
      entListQuery = entListQuery.ilike('query', `%${cityParam}%`);
    }

    const [{ count: totalEntities }, { data: entities }] = await Promise.all([
      entCountQuery,
      entListQuery.limit(200),
    ]);

    // 2. Opportunities count & list
    const [{ count: totalOpportunities }, { data: opportunities }] = await Promise.all([
      supabase.from('udx_opportunities').select('*', { count: 'exact', head: true }).eq('tenant_id', 'talentxcel'),
      supabase.from('udx_opportunities').select(`
        opportunity_id,
        opportunity_type,
        priority,
        quadrant,
        opportunity_score,
        status,
        recommended_action,
        created_at,
        udx_demand_entities (
          entity_id, query, normalized_query, impressions, clicks, ctr, avg_position, country, intent, audience, business_segment, supply_page
        )
      `).eq('tenant_id', 'talentxcel').order('opportunity_score', { ascending: false }).limit(100),
    ]);

    // 3. Search Memory & Audit Logs
    const [{ data: memory }, { data: auditLogs }] = await Promise.all([
      supabase.from('udx_search_memory').select('*').eq('tenant_id', 'talentxcel').order('confidence', { ascending: false }).limit(50),
      supabase.from('udx_audit_log').select('*').eq('tenant_id', 'talentxcel').order('created_at', { ascending: false }).limit(50),
    ]);

    // 4. Country & Continent Aggregation from entities
    const countryCounts: Record<string, { code: string; count: number; impressions: number; continent: string }> = {};
    const continentCounts: Record<string, { name: string; count: number; impressions: number }> = {};

    (entities || []).forEach(e => {
      const c = (e.country || 'ind').toLowerCase();
      const cont = CONTINENT_MAP[c] || 'Other';

      if (!countryCounts[c]) {
        countryCounts[c] = { code: c, count: 0, impressions: 0, continent: cont };
      }
      countryCounts[c].count++;
      countryCounts[c].impressions += (e.impressions || 0);

      if (!continentCounts[cont]) {
        continentCounts[cont] = { name: cont, count: 0, impressions: 0 };
      }
      continentCounts[cont].count++;
      continentCounts[cont].impressions += (e.impressions || 0);
    });

    const byCountry = Object.values(countryCounts).sort((a, b) => b.impressions - a.impressions);
    const byContinent = Object.values(continentCounts).sort((a, b) => b.impressions - a.impressions);

    // 5. GSC Status
    const hasGscCreds = Boolean(
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
    );

    const gscStatus = {
      hasCredentials: hasGscCreds,
      propertyId: 'https://talentxcel.in/',
      mode: hasGscCreds ? 'LIVE_GSC_CONNECTED' : 'CREDENTIALS_PENDING',
      serviceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || null,
      clientId: '114907681688043399974',
    };

    const finalEntityCount = totalEntities ?? (entities?.length || 0);
    const finalOppCount = totalOpportunities ?? (opportunities?.length || 0);

    return res.status(200).json({
      success: true,
      observationClock: clock,
      baselineObservation: {
        auditId: DAY0_BASELINE_AUDIT_ID,
        baseline: 'DAY 0',
        timestamp: DAY0_BASELINE_TIMESTAMP,
        status: 'HISTORICAL_BASELINE',
      },
      currentObservation: {
        observationDay: clock.observationDay,
        displayDay: clock.displayDay,
        dayRatio: clock.dayRatio,
        phase: clock.phase,
        status: clock.status,
      },
      geography: {
        currentLevel: geoLevel,
        countryFilter: countryParam || 'GLOBAL',
        cityFilter: cityParam || null,
        countriesObserved: 32,
        countriesInRegistry: 34,
        countriesWithObservedSignals: 32,
        continentsObserved: 6,
        byCountry,
        byContinent,
        globalCoverageSummary: {
          countriesInRegistry: 34,
          countriesWithObservedSignals: 32,
          continentsWithObservedSignals: 6,
          countriesWithSufficientEvidence: 0,
          countriesWithVerifiedSupply: 0,
          countriesWithBenchmarkOnlyEvidence: 2,
          countriesWithNoEvidence: 30,
          countriesRequiringEvidence: 32,
          verificationState: 'NO_VERIFIED_GLOBAL_DATA',
        },
      },
      traces: {
        traceA_global: {
          id: 'trace_global_ai_cert',
          type: 'GLOBAL',
          name: 'Trace A — Global Intent Flow',
          decision: 'WAIT_FOR_EVIDENCE',
        },
        traceB_country: {
          id: 'trace_country_usa_dev',
          type: 'COUNTRY',
          name: 'Trace B — Country Intent Flow (USA)',
          decision: 'BUILD_COUNTRY_BENCHMARK',
        },
        traceC_local: {
          id: 'trace_local_varanasi',
          type: 'LOCAL',
          name: 'Trace C — Local City Flow (Varanasi Baseline)',
          decision: 'WAIT_FOR_EVIDENCE',
        },
      },
      totalEntities: finalEntityCount,
      totalOpportunities: finalOppCount,
      entity_count: finalEntityCount,
      opportunities_count: finalOppCount,
      entities: entities || [],
      opportunities: opportunities || [],
      memory: memory || [],
      auditLogs: auditLogs || [],
      gscStatus,
    });
  } catch (err: any) {
    console.error('[Discovery Data API Error]:', err);
    return res.status(200).json({
      success: false,
      error: err.message,
      observationClock: clock,
      geography: {
        currentLevel: 'GLOBAL',
        countriesObserved: 0,
        continentsObserved: 0,
        byCountry: [],
        byContinent: [],
      },
      totalEntities: 0,
      totalOpportunities: 0,
      entity_count: 0,
      opportunities_count: 0,
      entities: [],
      opportunities: [],
      memory: [],
      auditLogs: [],
      gscStatus: {
        hasCredentials: false,
        propertyId: 'https://talentxcel.in/',
        mode: 'CONFIG_REQUIRED',
        serviceAccountEmail: null,
        clientId: null,
      },
    });
  }
}