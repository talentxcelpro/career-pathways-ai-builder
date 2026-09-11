import type { Plugin } from 'vite';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { IntentCollapseEngine } from './world/IntentCollapseEngine';

export function discoveryVitePlugin(): Plugin {
  const TX_URL = 'https://dthlgsnakhoftinssokm.supabase.co';
  const TX_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc';
  const getServiceKey = () => {
    const k = process.env.TALENTXCEL_SERVICE_ROLE_KEY;
    if (k && k.startsWith('eyJ')) return k;
    return TX_ANON_KEY;
  };

  return {
    name: 'discovery-vite-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/discovery')) {
          return next();
        }

        const supabase = createClient(TX_URL, getServiceKey(), { auth: { persistSession: false } });

        // Route: GET /api/discovery/data
        if (req.url?.startsWith('/api/discovery/data') && req.method === 'GET') {
          console.log('[discoveryPlugin] Fetching UDX telemetry data...');
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          try {
            const [oppRes, entRes, entCountRes, oppCountRes, memRes, auditRes] = await Promise.all([
              supabase
                .from('udx_opportunities')
                .select(`
                  opportunity_id,
                  opportunity_type,
                  priority,
                  quadrant,
                  opportunity_score,
                  status,
                  recommended_action,
                  created_at,
                  udx_demand_entities (
                    entity_id, query, normalized_query, impressions, clicks, ctr, avg_position, country, intent, audience, business_segment
                  )
                `)
                .eq('tenant_id', 'talentxcel')
                .order('opportunity_score', { ascending: false })
                .limit(100),
              supabase
                .from('udx_demand_entities')
                .select('entity_id, query, normalized_query, impressions, clicks, ctr, avg_position, country, intent, supply_page')
                .eq('tenant_id', 'talentxcel')
                .order('impressions', { ascending: false })
                .limit(200),
              supabase
                .from('udx_demand_entities')
                .select('*', { count: 'exact', head: true })
                .eq('tenant_id', 'talentxcel'),
              supabase
                .from('udx_opportunities')
                .select('*', { count: 'exact', head: true })
                .eq('tenant_id', 'talentxcel'),
              supabase
                .from('udx_search_memory')
                .select('*')
                .eq('tenant_id', 'talentxcel')
                .limit(20),
              supabase
                .from('udx_audit_log')
                .select('*')
                .eq('tenant_id', 'talentxcel')
                .order('created_at', { ascending: false })
                .limit(20),
            ]);

            let saEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || null;
            let saExists = !!(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY);
            const saJsonPath = path.resolve(process.cwd(), 'gsc-service-account.json');
            if (fs.existsSync(saJsonPath)) {
              try {
                const sa = JSON.parse(fs.readFileSync(saJsonPath, 'utf8'));
                if (sa.client_email && sa.private_key) {
                  saExists = true;
                  saEmail = sa.client_email;
                }
              } catch (e) {}
            }

            const hasGscCredentials = saExists || !!(
              process.env.GOOGLE_OAUTH_CLIENT_ID && process.env.GOOGLE_OAUTH_CLIENT_SECRET && process.env.GOOGLE_OAUTH_REFRESH_TOKEN
            );

            const result = {
              success: true,
              totalEntities: entCountRes.count || 0,
              totalOpportunities: oppCountRes.count || 0,
              opportunities: oppRes.data || [],
              entities: entRes.data || [],
              memory: memRes.data || [],
              auditLogs: auditRes.data || [],
              gscStatus: {
                hasCredentials: hasGscCredentials,
                propertyId: 'https://talentxcel.in/',
                mode: hasGscCredentials ? 'LIVE_GSC_API' : 'STATIC_SEED_DUMP',
                serviceAccountEmail: saEmail,
                clientId: process.env.GOOGLE_OAUTH_CLIENT_ID ? 'configured' : null
              }
            };

            console.log(`[discoveryPlugin] Live data ready: ${result.totalEntities} entities, ${result.totalOpportunities} opportunities, GSC mode: ${result.gscStatus.mode}`);
            res.end(JSON.stringify(result));
          } catch (err: any) {
            console.error('[discoveryPlugin] Error:', err);
            res.statusCode = 500;
            res.end(JSON.stringify({ success: false, error: err.message }));
          }
          return;
        }

        // Route: GET /api/discovery/world-data
        if (req.url?.startsWith('/api/discovery/world-data') && req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          try {
            const { data: entities, error: entErr } = await supabase
              .from('udx_demand_entities')
              .select('entity_id, query, normalized_query, impressions, clicks, ctr, avg_position, country, intent, audience, business_segment, supply_page')
              .eq('tenant_id', 'talentxcel')
              .order('impressions', { ascending: false })
              .limit(250);

            if (entErr) throw entErr;

            const payload = IntentCollapseEngine.collapse(entities || []);
            console.log(`[discoveryPlugin] World Intent Graph ready: ${payload.canonicalIntents.length} canonical intents collapsed from ${entities?.length || 0} entities.`);
            res.end(JSON.stringify(payload));
          } catch (err: any) {
            console.error('[discoveryPlugin] World Data Error:', err);
            res.statusCode = 500;
            res.end(JSON.stringify({ success: false, error: err.message }));
          }
          return;
        }

        // Route: POST /api/discovery/save-gsc
        if (req.url === '/api/discovery/save-gsc' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', async () => {
            res.setHeader('Content-Type', 'application/json');
            try {
              const payload = JSON.parse(body);
              const envPath = path.resolve(process.cwd(), '.env');
              let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';

              let serviceEmail = '';
              let serviceKey = '';
              let clientId = '';
              let clientSecret = '';
              let refreshToken = '';

              if (payload.serviceAccountJson) {
                try {
                  const sa = typeof payload.serviceAccountJson === 'string' ? JSON.parse(payload.serviceAccountJson) : payload.serviceAccountJson;
                  serviceEmail = sa.client_email || '';
                  serviceKey = sa.private_key || '';
                } catch (e: any) {
                  throw new Error('Invalid Service Account JSON format: ' + e.message);
                }
              } else {
                serviceEmail = payload.serviceAccountEmail || '';
                serviceKey = payload.serviceAccountPrivateKey || '';
                clientId = payload.clientId || '';
                clientSecret = payload.clientSecret || '';
                refreshToken = payload.refreshToken || '';
              }

              if (serviceEmail) process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL = serviceEmail;
              if (serviceKey) process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY = serviceKey;
              if (clientId) process.env.GOOGLE_OAUTH_CLIENT_ID = clientId;
              if (clientSecret) process.env.GOOGLE_OAUTH_CLIENT_SECRET = clientSecret;
              if (refreshToken) process.env.GOOGLE_OAUTH_REFRESH_TOKEN = refreshToken;

              const updateEnvVar = (content: string, key: string, val: string) => {
                const regex = new RegExp(`^${key}=.*$`, 'm');
                const line = `${key}="${val.replace(/\n/g, '\\n')}"`;
                return regex.test(content) ? content.replace(regex, line) : content + `\n${line}`;
              };

              if (serviceEmail) envContent = updateEnvVar(envContent, 'GOOGLE_SERVICE_ACCOUNT_EMAIL', serviceEmail);
              if (serviceKey) envContent = updateEnvVar(envContent, 'GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY', serviceKey);
              if (clientId) envContent = updateEnvVar(envContent, 'GOOGLE_OAUTH_CLIENT_ID', clientId);
              if (clientSecret) envContent = updateEnvVar(envContent, 'GOOGLE_OAUTH_CLIENT_SECRET', clientSecret);
              if (refreshToken) envContent = updateEnvVar(envContent, 'GOOGLE_OAUTH_REFRESH_TOKEN', refreshToken);

              fs.writeFileSync(envPath, envContent, 'utf8');

              const chatrEnvPath = 'C:\\Users\\Arshid.Wani\\chatrchat\\.env';
              if (fs.existsSync(chatrEnvPath)) {
                let chatrContent = fs.readFileSync(chatrEnvPath, 'utf8');
                if (serviceEmail) chatrContent = updateEnvVar(chatrContent, 'GOOGLE_SERVICE_ACCOUNT_EMAIL', serviceEmail);
                if (serviceKey) chatrContent = updateEnvVar(chatrContent, 'GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY', serviceKey);
                if (clientId) chatrContent = updateEnvVar(chatrContent, 'GOOGLE_OAUTH_CLIENT_ID', clientId);
                if (clientSecret) chatrContent = updateEnvVar(chatrContent, 'GOOGLE_OAUTH_CLIENT_SECRET', clientSecret);
                if (refreshToken) chatrContent = updateEnvVar(chatrContent, 'GOOGLE_OAUTH_REFRESH_TOKEN', refreshToken);
                fs.writeFileSync(chatrEnvPath, chatrContent, 'utf8');
              }

              res.end(JSON.stringify({
                success: true,
                message: 'GSC Credentials successfully stored in environment.',
                serviceAccountEmail: serviceEmail || null,
                hasOAuth: !!(clientId && refreshToken)
              }));
            } catch (err: any) {
              res.statusCode = 400;
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
          });
          return;
        }

        // Route: POST /api/discovery/trigger-sync
        if (req.url === '/api/discovery/trigger-sync' && req.method === 'POST') {
          res.setHeader('Content-Type', 'application/json');
          try {
            const { GSCConnector } = await import('./connectors/GSCConnector');
            const connector = new GSCConnector();
            const health = await connector.checkHealth();

            if (health.status === 'failed') {
              res.end(JSON.stringify({
                success: false,
                health,
                message: 'GSC API health probe failed: ' + health.error,
              }));
              return;
            }

            const result = await connector.sync('talentxcel');
            res.end(JSON.stringify({
              success: true,
              result,
              message: `Sync completed: ${result.rowsInserted} inserted, ${result.rowsUpdated} updated.`
            }));
          } catch (err: any) {
            res.statusCode = 500;
            res.end(JSON.stringify({ success: false, error: err.message }));
          }
          return;
        }

        next();
      });
    }
  };
}