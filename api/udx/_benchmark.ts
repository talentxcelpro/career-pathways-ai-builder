// api/benchmark.ts
// Public UDX Benchmark Results API Endpoint (GET /api/udx/benchmark or /api/benchmark)

import { createClient } from '@supabase/supabase-js';

export const config = {
  runtime: 'edge',
};

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://dthlgsnakhoftinssokm.supabase.co';
const SUPABASE_KEY = process.env.TALENTXCEL_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc';

export default async function handler(req: Request) {
  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed. Use GET.' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    // Fetch latest benchmark records from udx_benchmark_results
    const { data: rows, error } = await supabase
      .from('udx_benchmark_results')
      .select('*')
      .order('observed_at', { ascending: false })
      .limit(100);

    if (error || !rows || rows.length === 0) {
      return new Response(JSON.stringify({
        status: 'BENCHMARK_OBSERVATION_PENDING',
        epistemicStatus: 'PENDING',
        note: 'Live benchmark execution data not yet committed to database. Run scripts/run-udx-world-benchmark.cjs to populate.',
        totalObjectives: 100,
        completedObjectives: 0,
        udxVsGenericAi: {
          udxWins: 0,
          udxLosses: 0,
          ties: 0,
          insufficientData: 0,
          udxWinRate: '0.0%',
          udxLossRate: '0.0%',
          tieRate: '0.0%'
        },
        traditionalBaseline: {
          epistemicStatus: 'TRADITIONAL_PROXY',
          note: 'Traditional search results are academic proxy measurements, excluded from primary comparison.'
        },
        udxFailures: [],
        timestamp: new Date().toISOString()
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Cache-Control': 'public, max-age=60, s-maxage=300'
        },
      });
    }

    const total = rows.length;
    const wins = rows.filter((r: any) => r.verdict === 'UDX_WINS').length;
    const losses = rows.filter((r: any) => r.verdict === 'UDX_LOSES').length;
    const ties = rows.filter((r: any) => r.verdict === 'TIE').length;
    const insufficient = rows.filter((r: any) => r.verdict === 'INSUFFICIENT_DATA').length;

    const winRate = ((wins / total) * 100).toFixed(1) + '%';
    const lossRate = ((losses / total) * 100).toFixed(1) + '%';
    const tieRate = ((ties / total) * 100).toFixed(1) + '%';

    const domainMap: Record<string, { total: number; wins: number; losses: number; ties: number }> = {};
    rows.forEach((r: any) => {
      const d = r.domain || 'UNKNOWN';
      if (!domainMap[d]) domainMap[d] = { total: 0, wins: 0, losses: 0, ties: 0 };
      domainMap[d].total++;
      if (r.verdict === 'UDX_WINS') domainMap[d].wins++;
      else if (r.verdict === 'UDX_LOSES') domainMap[d].losses++;
      else domainMap[d].ties++;
    });

    const failures = rows
      .filter((r: any) => r.verdict === 'UDX_LOSES')
      .map((r: any) => ({
        objectiveId: r.objective_id,
        domain: r.domain,
        rawIntent: r.raw_intent,
        whyUdxLost: r.why_udx_lost || 'QUALITY_GAP or NO_RELIABLE_PATH'
      }));

    return new Response(JSON.stringify({
      status: 'SUCCESS',
      runId: rows[0]?.run_id || 'latest',
      epistemicStatus: 'OBSERVED',
      totalObjectives: total,
      udxVsGenericAi: {
        udxWins: wins,
        udxLosses: losses,
        ties: ties,
        insufficientData: insufficient,
        udxWinRate: winRate,
        udxLossRate: lossRate,
        tieRate: tieRate
      },
      domainBreakdown: domainMap,
      udxFailures: failures,
      failureCount: failures.length,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Cache-Control': 'public, max-age=60, s-maxage=300'
      },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || 'Benchmark retrieval failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
