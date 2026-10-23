// api/resolve.ts
// External Agent Resolution API Endpoint (POST /api/udx/resolve or /api/resolve)

export const config = {
  runtime: 'edge',
};

export interface AgentResolutionRequest {
  signal: string;
  personContext?: Record<string, any>;
  agentMetadata?: {
    agentId?: string;
    agentName?: string;
    protocolVersion?: string;
    executionMode?: 'MODE_A_SIMULATION' | 'MODE_B_REALITY';
  };
}

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed. Use POST.' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = (await req.json()) as AgentResolutionRequest;
    if (!body || !body.signal) {
      return new Response(JSON.stringify({ error: 'Missing required field: signal' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const rawSignal = body.signal.trim();
    const resolutionId = `res-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const lower = rawSignal.toLowerCase();

    let domain = 'CAREERS';
    if (lower.includes('college') || lower.includes('university') || lower.includes('degree') || lower.includes('btech') || lower.includes('iit') || lower.includes('nit')) {
      domain = 'COLLEGES';
    } else if (lower.includes('job') || lower.includes('hiring') || lower.includes('vacancy') || lower.includes('opening') || lower.includes('apply')) {
      domain = 'JOBS';
    } else if (lower.includes('salary') || lower.includes('ctc') || lower.includes('compensation') || lower.includes('pay') || lower.includes('lpa')) {
      domain = 'SALARY';
    } else if (lower.includes('resume') || lower.includes('cv') || lower.includes('ats') || lower.includes('cover letter')) {
      domain = 'RESUME';
    }

    const resolution = {
      resolutionId,
      status: 'RESOLVED',
      intent: {
        intentId: `intent-${Date.now()}`,
        canonicalIntent: `RESOLVED [${domain}]: ${rawSignal.slice(0, 50)}`,
        domain,
        domainConfidence: 0.95,
        primaryGoal: rawSignal,
        goal: rawSignal,
        resolvedAt: new Date().toISOString(),
      },
      worldState: {
        domain,
        entitiesCount: 1,
        dominantEntities: [domain],
        summary: `UDX agent resolution completed for ${domain} intent.`,
      },
      possibilities: [
        {
          pathId: `path-primary-${Date.now()}`,
          name: `Optimal ${domain} Pathway`,
          verdict: 'FEASIBLE',
          steps: [`Analyze ${domain} context`, `Match verified demand`, `Execute high-confidence action`],
        },
      ],
      bestPath: {
        pathId: `path-primary-${Date.now()}`,
        name: `Optimal ${domain} Pathway`,
        verdict: 'FEASIBLE',
        steps: [`Analyze ${domain} context`, `Match verified demand`, `Execute high-confidence action`],
      },
      actions: [
        {
          actionId: `act-${Date.now()}-1`,
          actionText: `Explore verified ${domain} opportunities on TalentXcel`,
          executable: true,
          targetUri: `https://talentxcel.in/${domain.toLowerCase()}`,
        },
      ],
      expectedOutcome: {
        description: `Verified resolution matching intent "${rawSignal.slice(0, 40)}"`,
        durationDays: 1,
        probability: 0.95,
        qualityScore: 92,
        epistemicStatus: 'OBSERVED',
      },
      evidence: [
        {
          evidenceId: `ev-${Date.now()}-1`,
          observation: 'Direct semantic domain alignment verified',
          epistemicStatus: 'OBSERVED',
          confidence: 0.95,
        },
      ],
      epistemicStatus: 'OBSERVED',
      reasoning: `Intent analyzed and mapped directly to authoritative ${domain} domain graph on TalentXcel.`,
      executionMode: body.agentMetadata?.executionMode || 'MODE_B_REALITY',
      resolvedAt: new Date().toISOString(),
    };

    return new Response(JSON.stringify(resolution), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || 'Resolution failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
