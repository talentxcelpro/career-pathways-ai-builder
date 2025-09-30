import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.1";
import { 
  SESClient, 
  GetSendQuotaCommand, 
  GetSendStatisticsCommand,
  GetAccountSendingEnabledCommand,
  ListConfigurationSetsCommand,
  DescribeConfigurationSetCommand
} from "https://esm.sh/@aws-sdk/client-ses@3.490.0";

import {
  SESv2Client,
  ListSuppressedDestinationsCommand,
  DeleteSuppressedDestinationCommand
} from "https://esm.sh/@aws-sdk/client-sesv2@3.490.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// AWS SES Client with multi-region support
const createSESClient = (region = 'eu-north-1') => {
  const accessKeyId = Deno.env.get("AWS_ACCESS_KEY_ID");
  const secretAccessKey = Deno.env.get("AWS_SECRET_ACCESS_KEY");

  if (!accessKeyId || !secretAccessKey) {
    throw new Error('Missing AWS credentials for SES client');
  }

  return new SESClient({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
};

// AWS SESv2 Client for suppression list operations
const createSESv2Client = (region = 'eu-north-1') => {
  const accessKeyId = Deno.env.get("AWS_ACCESS_KEY_ID");
  const secretAccessKey = Deno.env.get("AWS_SECRET_ACCESS_KEY");

  if (!accessKeyId || !secretAccessKey) {
    throw new Error('Missing AWS credentials for SESv2 client');
  }

  return new SESv2Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
};

// Get comprehensive SES account status
const getSESAccountStatus = async (region = 'eu-north-1') => {
  const sesClient = createSESClient(region);

  try {
    // Get basic account info
    const [enabledResponse, quotaResponse] = await Promise.all([
      sesClient.send(new GetAccountSendingEnabledCommand({})),
      sesClient.send(new GetSendQuotaCommand({}))
    ]);

    // Get sending statistics (last 2 weeks)
    const statsResponse = await sesClient.send(new GetSendStatisticsCommand({}));

    // Calculate reputation metrics
    const stats = statsResponse.SendDataPoints || [];
    const recentStats = stats.slice(-7); // Last 7 data points
    
    let totalSent = 0;
    let totalBounces = 0;
    let totalComplaints = 0;
    let totalRejects = 0;

    recentStats.forEach(point => {
      totalSent += point.DeliveryAttempts || 0;
      totalBounces += point.Bounces || 0;
      totalComplaints += point.Complaints || 0;
      totalRejects += point.Rejects || 0;
    });

    const bounceRate = totalSent > 0 ? (totalBounces / totalSent) * 100 : 0;
    const complaintRate = totalSent > 0 ? (totalComplaints / totalSent) * 100 : 0;
    const rejectRate = totalSent > 0 ? (totalRejects / totalSent) * 100 : 0;

    // Determine health status
    let healthStatus = 'healthy';
    let healthIssues = [];

    if (!enabledResponse.Enabled) {
      healthStatus = 'disabled';
      healthIssues.push('Account sending is disabled');
    } else {
      if (bounceRate > 5) {
        healthStatus = 'warning';
        healthIssues.push(`High bounce rate: ${bounceRate.toFixed(2)}%`);
      }
      if (complaintRate > 0.1) {
        healthStatus = 'warning';
        healthIssues.push(`High complaint rate: ${complaintRate.toFixed(2)}%`);
      }
      if (rejectRate > 1) {
        healthStatus = 'warning';
        healthIssues.push(`High reject rate: ${rejectRate.toFixed(2)}%`);
      }
      
      if (bounceRate > 10 || complaintRate > 0.5) {
        healthStatus = 'critical';
      }
    }

    const quotaUtilization = quotaResponse.Max24HourSend && quotaResponse.Max24HourSend > 0 
      ? ((quotaResponse.SentLast24Hours || 0) / quotaResponse.Max24HourSend) * 100 
      : 0;

    return {
      region,
      isEnabled: enabledResponse.Enabled,
      quota: {
        maxSendRate: quotaResponse.MaxSendRate || 0,
        max24HourSend: quotaResponse.Max24HourSend || 0,
        sentLast24Hours: quotaResponse.SentLast24Hours || 0,
        remainingQuota: (quotaResponse.Max24HourSend || 0) - (quotaResponse.SentLast24Hours || 0),
        utilizationPercentage: quotaUtilization
      },
      statistics: {
        totalSent,
        totalBounces,
        totalComplaints,
        totalRejects,
        bounceRate,
        complaintRate,
        rejectRate
      },
      health: {
        status: healthStatus,
        issues: healthIssues
      },
      lastChecked: new Date().toISOString()
    };

  } catch (error) {
    console.error(`Error getting SES status for region ${region}:`, error);
    throw error;
  }
};

// Get suppression list status
const getSuppressionListStatus = async (region = 'eu-north-1') => {
  const sesClient = createSESv2Client(region);

  try {
    const suppressedDestinations = await sesClient.send(new ListSuppressedDestinationsCommand({
      PageSize: 1000 // Get up to 1000 suppressed addresses
    }));

    const suppressionStats = {
      totalSuppressed: suppressedDestinations.SuppressedDestinationSummaries?.length || 0,
      bounceSuppressions: 0,
      complaintSuppressions: 0,
      addresses: suppressedDestinations.SuppressedDestinationSummaries || []
    };

    // Count suppression reasons
    suppressionStats.addresses.forEach(addr => {
      if (addr.Reason === 'BOUNCE') {
        suppressionStats.bounceSuppressions++;
      } else if (addr.Reason === 'COMPLAINT') {
        suppressionStats.complaintSuppressions++;
      }
    });

    return suppressionStats;

  } catch (error) {
    console.error(`Error getting suppression list for region ${region}:`, error);
    return {
      totalSuppressed: 0,
      bounceSuppressions: 0,
      complaintSuppressions: 0,
      addresses: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Get configuration sets status
const getConfigurationSetsStatus = async (region = 'eu-north-1') => {
  const sesClient = createSESClient(region);

  try {
    const configSets = await sesClient.send(new ListConfigurationSetsCommand({}));
    
    const configSetDetails = [];
    for (const configSet of configSets.ConfigurationSets || []) {
      try {
        const details = await sesClient.send(new DescribeConfigurationSetCommand({
          ConfigurationSetName: configSet.Name
        }));
        configSetDetails.push({
          name: configSet.Name,
          details: details.ConfigurationSet
        });
      } catch (detailError) {
        console.warn(`Could not get details for config set ${configSet.Name}:`, detailError);
        configSetDetails.push({
          name: configSet.Name,
          details: null,
          error: detailError instanceof Error ? detailError.message : 'Unknown error'
        });
      }
    }

    return {
      totalConfigSets: configSets.ConfigurationSets?.length || 0,
      configSets: configSetDetails
    };

  } catch (error) {
    console.error(`Error getting configuration sets for region ${region}:`, error);
    return {
      totalConfigSets: 0,
      configSets: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Remove email from suppression list
const removeFromSuppressionList = async (email: string, region = 'eu-north-1') => {
  const sesClient = createSESv2Client(region);

  try {
    await sesClient.send(new DeleteSuppressedDestinationCommand({
      EmailAddress: email
    }));

    // Also remove from local suppression list
    await supabase
      .from('email_suppression_list')
      .update({
        is_active: false,
        removed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('email_address', email);

    console.log(`Successfully removed ${email} from suppression list`);
    return { success: true, message: `${email} removed from suppression list` };

  } catch (error) {
    console.error(`Error removing ${email} from suppression list:`, error);
    throw error;
  }
};

// Store SES metrics in database for monitoring
const storeSESMetrics = async (accountStatus: any, suppressionStatus: any, configSetStatus: any) => {
  try {
    await supabase
      .from('ses_account_metrics')
      .insert({
        region: accountStatus.region,
        is_enabled: accountStatus.isEnabled,
        max_send_rate: accountStatus.quota.maxSendRate,
        max_24hour_send: accountStatus.quota.max24HourSend,
        sent_last_24hours: accountStatus.quota.sentLast24Hours,
        remaining_quota: accountStatus.quota.remainingQuota,
        quota_utilization_percent: accountStatus.quota.utilizationPercentage,
        bounce_rate: accountStatus.statistics.bounceRate,
        complaint_rate: accountStatus.statistics.complaintRate,
        reject_rate: accountStatus.statistics.rejectRate,
        health_status: accountStatus.health.status,
        health_issues: accountStatus.health.issues,
        total_suppressed: suppressionStatus.totalSuppressed,
        bounce_suppressions: suppressionStatus.bounceSuppressions,
        complaint_suppressions: suppressionStatus.complaintSuppressions,
        total_config_sets: configSetStatus.totalConfigSets,
        collected_at: new Date().toISOString()
      });

    console.log('SES metrics stored successfully');
  } catch (error) {
    console.error('Error storing SES metrics:', error);
  }
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('SES configuration manager started...');
    
    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'status';
    const region = url.searchParams.get('region') || 'eu-north-1';

    switch (action) {
      case 'status':
        console.log(`Getting SES status for region: ${region}`);
        
        const [accountStatus, suppressionStatus, configSetStatus] = await Promise.all([
          getSESAccountStatus(region),
          getSuppressionListStatus(region),
          getConfigurationSetsStatus(region)
        ]);

        // Store metrics for monitoring
        await storeSESMetrics(accountStatus, suppressionStatus, configSetStatus);

        return new Response(JSON.stringify({
          success: true,
          data: {
            account: accountStatus,
            suppression: suppressionStatus,
            configurationSets: configSetStatus,
            summary: {
              overallHealth: accountStatus.health.status,
              quotaUtilization: accountStatus.quota.utilizationPercentage,
              totalSuppressed: suppressionStatus.totalSuppressed,
              activeConfigSets: configSetStatus.totalConfigSets
            }
          }
        }), {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });

      case 'remove-suppression':
        const email = url.searchParams.get('email');
        if (!email) {
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'Email parameter required' 
          }), {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          });
        }

        const removeResult = await removeFromSuppressionList(email, region);
        
        return new Response(JSON.stringify({
          success: true,
          data: removeResult
        }), {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });

      case 'health-check':
        // Quick health check without storing metrics
        const quickStatus = await getSESAccountStatus(region);
        
        return new Response(JSON.stringify({
          success: true,
          data: {
            region,
            isHealthy: quickStatus.health.status === 'healthy',
            healthStatus: quickStatus.health.status,
            isEnabled: quickStatus.isEnabled,
            quotaRemaining: quickStatus.quota.remainingQuota,
            lastChecked: quickStatus.lastChecked
          }
        }), {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });

      default:
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Invalid action. Supported actions: status, remove-suppression, health-check' 
        }), {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
    }

  } catch (error: any) {
    console.error("Error in SES configuration manager:", error);
    
    // Log SES configuration errors
    try {
      await supabase
        .from('ses_config_errors')
        .insert({
          error_message: error instanceof Error ? error.message : 'Unknown error',
          error_details: JSON.stringify(error),
          action: new URL(req.url).searchParams.get('action') || 'unknown',
          region: new URL(req.url).searchParams.get('region') || 'eu-north-1',
          created_at: new Date().toISOString()
        });
    } catch (logError) {
      console.warn('Failed to log SES config error:', logError);
    }
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.name : 'UnknownError'
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);