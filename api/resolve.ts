// api/resolve.ts
// External Agent Resolution API Endpoint (POST /api/udx/resolve or /api/resolve)

import { UDXAgentAPI, AgentResolutionRequest } from '../src/lib/udx/agents/UDXAgentAPI';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed. Use POST.' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await req.json() as AgentResolutionRequest;
    if (!body || !body.signal) {
      return new Response(JSON.stringify({ error: 'Missing required field: signal' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const resolution = await UDXAgentAPI.resolveIntent(body);

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
