import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VercelDeployment {
  uid: string;
  name: string;
  url: string;
  state: 'BUILDING' | 'READY' | 'ERROR' | 'CANCELED' | 'QUEUED';
  type: string;
  created: number;
  ready?: number;
  buildingAt?: number;
  target?: string;
  source?: string;
  meta?: {
    githubCommitMessage?: string;
    githubCommitRef?: string;
    githubCommitSha?: string;
  };
}

interface VercelBuildEvent {
  timestamp: number;
  type: string;
  payload: {
    text: string;
    level?: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, deploymentId } = await req.json();
    
    const vercelToken = Deno.env.get('VERCEL_TOKEN');
    const deployHookUrl = Deno.env.get('VERCEL_DEPLOY_HOOK_URL');

    if (!vercelToken) {
      return new Response(JSON.stringify({
        success: false,
        error: 'VERCEL_TOKEN not configured'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // List recent deployments
    if (action === 'list-deployments') {
      console.log('Fetching deployments from Vercel API...');
      
      const response = await fetch('https://api.vercel.com/v6/deployments?limit=5', {
        headers: {
          'Authorization': `Bearer ${vercelToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('Vercel API error:', response.status, await response.text());
        throw new Error(`Vercel API error: ${response.status}`);
      }

      const data = await response.json();
      console.log(`Retrieved ${data.deployments?.length || 0} deployments`);

      const deployments: VercelDeployment[] = data.deployments?.map((dep: any) => ({
        uid: dep.uid,
        name: dep.name,
        url: dep.url,
        state: dep.state,
        type: dep.type,
        created: dep.created,
        ready: dep.ready,
        buildingAt: dep.buildingAt,
        target: dep.target,
        source: dep.source,
        meta: dep.meta
      })) || [];

      return new Response(JSON.stringify({
        success: true,
        deployments
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get deployment errors
    if (action === 'get-deployment-errors' && deploymentId) {
      console.log(`Fetching build events for deployment: ${deploymentId}`);
      
      const response = await fetch(`https://api.vercel.com/v3/deployments/${deploymentId}/events`, {
        headers: {
          'Authorization': `Bearer ${vercelToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('Vercel events API error:', response.status, await response.text());
        return new Response(JSON.stringify({
          success: true,
          errors: []
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const data = await response.json();
      const errors = data
        .filter((event: VercelBuildEvent) => 
          event.type === 'stderr' || 
          (event.payload?.level === 'error') ||
          (event.payload?.text?.toLowerCase().includes('error'))
        )
        .map((event: VercelBuildEvent) => ({
          message: event.payload.text,
          timestamp: event.timestamp,
          source: event.type
        }))
        .slice(0, 10); // Limit to first 10 errors

      console.log(`Found ${errors.length} error events`);

      return new Response(JSON.stringify({
        success: true,
        errors
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Trigger redeploy
    if (action === 'trigger-redeploy') {
      if (!deployHookUrl) {
        return new Response(JSON.stringify({
          success: false,
          error: 'VERCEL_DEPLOY_HOOK_URL not configured'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log('Triggering redeploy via webhook...');
      
      const response = await fetch(deployHookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('Deploy hook error:', response.status, await response.text());
        throw new Error(`Deploy hook failed: ${response.status}`);
      }

      const result = await response.json();
      console.log('Redeploy triggered successfully:', result);

      return new Response(JSON.stringify({
        success: true,
        deployment: result
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      success: false,
      error: 'Unknown action'
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Vercel diagnostics error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});