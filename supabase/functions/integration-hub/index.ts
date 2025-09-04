import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, userId, integrationType, config, syncData } = await req.json();

    switch (action) {
      case 'setup_integration': {
        const { data: integration, error } = await supabase
          .from('user_integrations')
          .insert({
            user_id: userId,
            integration_type: integrationType,
            config: config,
            status: 'active',
            last_sync: new Date().toISOString()
          })
          .select()
          .single();

        if (error) throw error;

        // Test the integration
        const testResult = await testIntegration(integrationType, config);
        
        if (!testResult.success) {
          await supabase
            .from('user_integrations')
            .update({ status: 'error', error_message: testResult.error })
            .eq('id', integration.id);
        }

        return new Response(JSON.stringify({ 
          success: true, 
          integration,
          testResult 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'sync_integration': {
        const { integrationId } = await req.json();
        
        const { data: integration, error: integrationError } = await supabase
          .from('user_integrations')
          .select('*')
          .eq('id', integrationId)
          .eq('user_id', userId)
          .single();

        if (integrationError) throw integrationError;

        // Log sync start
        const { data: syncLog, error: logError } = await supabase
          .from('integration_sync_logs')
          .insert({
            integration_id: integrationId,
            user_id: userId,
            sync_type: 'manual',
            status: 'running',
            started_at: new Date().toISOString()
          })
          .select()
          .single();

        if (logError) throw logError;

        try {
          const syncResult = await performSync(integration);
          
          // Update sync log with success
          await supabase
            .from('integration_sync_logs')
            .update({
              status: 'completed',
              records_processed: syncResult.recordsProcessed,
              completed_at: new Date().toISOString()
            })
            .eq('id', syncLog.id);

          // Update integration last sync
          await supabase
            .from('user_integrations')
            .update({
              last_sync: new Date().toISOString(),
              status: 'active'
            })
            .eq('id', integrationId);

          return new Response(JSON.stringify({ 
            success: true, 
            syncResult 
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });

        } catch (syncError) {
          // Update sync log with error
          await supabase
            .from('integration_sync_logs')
            .update({
              status: 'failed',
              error_message: syncError.message,
              completed_at: new Date().toISOString()
            })
            .eq('id', syncLog.id);

          throw syncError;
        }
      }

      case 'get_integrations': {
        const { data: integrations, error } = await supabase
          .from('user_integrations')
          .select(`
            *,
            integration_sync_logs(
              status,
              started_at,
              completed_at,
              records_processed
            )
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) throw error;

        return new Response(JSON.stringify({ success: true, integrations }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'disconnect_integration': {
        const { integrationId } = await req.json();
        
        const { error } = await supabase
          .from('user_integrations')
          .update({
            status: 'disconnected',
            disconnected_at: new Date().toISOString()
          })
          .eq('id', integrationId)
          .eq('user_id', userId);

        if (error) throw error;

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        throw new Error('Invalid action');
    }

  } catch (error) {
    console.error('Integration hub error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function testIntegration(type: string, config: any) {
  try {
    switch (type) {
      case 'linkedin':
        return await testLinkedInIntegration(config);
      case 'github':
        return await testGitHubIntegration(config);
      case 'google_calendar':
        return await testGoogleCalendarIntegration(config);
      case 'slack':
        return await testSlackIntegration(config);
      default:
        return { success: false, error: 'Unknown integration type' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function performSync(integration: any) {
  const { integration_type, config } = integration;
  
  switch (integration_type) {
    case 'linkedin':
      return await syncLinkedInData(config);
    case 'github':
      return await syncGitHubData(config);
    case 'google_calendar':
      return await syncGoogleCalendarData(config);
    case 'slack':
      return await syncSlackData(config);
    default:
      throw new Error('Unknown integration type for sync');
  }
}

async function testLinkedInIntegration(config: any) {
  // Mock LinkedIn test
  return { success: true, message: 'LinkedIn connection successful' };
}

async function testGitHubIntegration(config: any) {
  // Mock GitHub test
  return { success: true, message: 'GitHub connection successful' };
}

async function testGoogleCalendarIntegration(config: any) {
  // Mock Google Calendar test
  return { success: true, message: 'Google Calendar connection successful' };
}

async function testSlackIntegration(config: any) {
  // Mock Slack test
  return { success: true, message: 'Slack connection successful' };
}

async function syncLinkedInData(config: any) {
  // Mock LinkedIn sync
  return { recordsProcessed: 15, message: 'LinkedIn data synced' };
}

async function syncGitHubData(config: any) {
  // Mock GitHub sync
  return { recordsProcessed: 8, message: 'GitHub data synced' };
}

async function syncGoogleCalendarData(config: any) {
  // Mock Google Calendar sync
  return { recordsProcessed: 23, message: 'Google Calendar data synced' };
}

async function syncSlackData(config: any) {
  // Mock Slack sync
  return { recordsProcessed: 12, message: 'Slack data synced' };
}