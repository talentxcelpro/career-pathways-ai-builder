import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface BatchRequest {
  action: 'process_queue' | 'scale_opportunities' | 'cleanup_campaigns';
  batch_size?: number;
  filters?: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('⚡ Batch Campaign Processor started');
    
    const { action, batch_size = 100, filters = {} }: BatchRequest = await req.json();
    
    switch (action) {
      case 'process_queue':
        return await processOutreachQueue(batch_size, filters);
        
      case 'scale_opportunities':
        return await scaleOpportunityGeneration(batch_size, filters);
        
      case 'cleanup_campaigns':
        return await cleanupCompletedCampaigns(filters);
        
      default:
        throw new Error(`Unknown action: ${action}`);
    }
    
  } catch (error) {
    console.error('❌ Batch processor error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function processOutreachQueue(batchSize: number, filters: any) {
  console.log(`📨 Processing outreach queue (batch size: ${batchSize})`);
  
  // Get pending outreach opportunities
  let query = supabase
    .from('backlink_opportunities')
    .select('*, backlink_campaigns(campaign_name, campaign_type)')
    .eq('status', 'identified')
    .order('created_at', { ascending: true })
    .limit(batchSize);
    
  // Apply filters
  if (filters.campaign_type) {
    query = query.eq('backlink_campaigns.campaign_type', filters.campaign_type);
  }
  if (filters.min_relevance_score) {
    query = query.gte('relevance_score', filters.min_relevance_score);
  }
  
  const { data: opportunities, error } = await query;
  
  if (error) throw error;
  if (!opportunities?.length) {
    return new Response(JSON.stringify({
      success: true,
      message: 'No opportunities in queue',
      processed: 0
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  console.log(`Found ${opportunities.length} opportunities to process`);
  
  // Process in smaller chunks to avoid timeouts
  const chunkSize = 10;
  const chunks = [];
  for (let i = 0; i < opportunities.length; i += chunkSize) {
    chunks.push(opportunities.slice(i, i + chunkSize));
  }
  
  const results = [];
  let totalProcessed = 0;
  let totalSent = 0;
  
  for (const chunk of chunks) {
    try {
      // Process chunk in parallel
      const chunkPromises = chunk.map(async (opportunity) => {
        try {
          // Intelligent opportunity scoring
          const priorityScore = calculateOpportunityPriority(opportunity);
          
          if (priorityScore < 5) {
            console.log(`Skipping low-priority opportunity: ${opportunity.target_domain}`);
            return { skipped: true, reason: 'low_priority' };
          }
          
          // Execute outreach
          const { data: outreachResult } = await supabase.functions.invoke('backlink-outreach', {
            body: {
              target_ids: [opportunity.id],
              content_type: determineContentType(opportunity),
              priority: priorityScore,
              send_immediately: priorityScore > 8
            }
          });
          
          if (outreachResult?.success) {
            // Update opportunity status
            await supabase
              .from('backlink_opportunities')
              .update({
                status: 'contacted',
                outreach_date: new Date().toISOString(),
                metadata: {
                  ...opportunity.metadata,
                  priority_score: priorityScore,
                  batch_processed: true
                }
              })
              .eq('id', opportunity.id);
              
            return { 
              success: true, 
              opportunity_id: opportunity.id,
              domain: opportunity.target_domain,
              priority_score: priorityScore,
              sent: outreachResult.sent || 0
            };
          }
          
          return { success: false, opportunity_id: opportunity.id };
          
        } catch (error) {
          console.error(`Error processing opportunity ${opportunity.id}:`, error);
          return { success: false, opportunity_id: opportunity.id, error: error.message };
        }
      });
      
      const chunkResults = await Promise.allSettled(chunkPromises);
      const successfulResults = chunkResults
        .filter(result => result.status === 'fulfilled')
        .map(result => (result as PromiseFulfilledResult<any>).value)
        .filter(result => result.success);
        
      results.push(...successfulResults);
      totalProcessed += chunk.length;
      totalSent += successfulResults.reduce((sum, result) => sum + (result.sent || 0), 0);
      
      // Rate limiting between chunks
      if (chunks.indexOf(chunk) < chunks.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 5000)); // 5 second delay
      }
      
    } catch (error) {
      console.error('Error processing chunk:', error);
    }
  }
  
  // Update campaign statistics
  await updateCampaignStats(results);
  
  return new Response(JSON.stringify({
    success: true,
    message: `Processed ${totalProcessed} opportunities, sent ${totalSent} emails`,
    processed_count: totalProcessed,
    successful_outreach: results.length,
    emails_sent: totalSent,
    results: results.slice(0, 10) // Return first 10 for review
  }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}

async function scaleOpportunityGeneration(batchSize: number, filters: any) {
  console.log('🔍 Scaling opportunity generation...');
  
  // Get campaigns that need more opportunities
  const { data: campaigns } = await supabase
    .from('backlink_campaigns')
    .select(`
      *,
      backlink_opportunities(count)
    `)
    .eq('status', 'active')
    .lt('completed_count', 'target_count');
    
  if (!campaigns?.length) {
    return new Response(JSON.stringify({
      success: true,
      message: 'No campaigns need more opportunities',
      generated: 0
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
  
  const generatedOpportunities = [];
  
  for (const campaign of campaigns) {
    try {
      const currentOpportunities = campaign.backlink_opportunities?.[0]?.count || 0;
      const neededOpportunities = campaign.target_count - currentOpportunities;
      
      if (neededOpportunities > 0) {
        const toGenerate = Math.min(neededOpportunities, batchSize);
        
        // Call prospecting service to generate opportunities
        const { data: prospectingResult } = await supabase.functions.invoke('backlink-prospecting', {
          body: {
            campaign_id: campaign.id,
            campaign_type: campaign.campaign_type,
            count: toGenerate,
            keywords: campaign.metadata?.keywords || [],
            target_domains: campaign.metadata?.target_domains || []
          }
        });
        
        if (prospectingResult?.success) {
          generatedOpportunities.push({
            campaign_id: campaign.id,
            campaign_name: campaign.campaign_name,
            generated_count: prospectingResult.generated || 0
          });
        }
      }
    } catch (error) {
      console.error(`Failed to generate opportunities for campaign ${campaign.id}:`, error);
    }
  }
  
  return new Response(JSON.stringify({
    success: true,
    message: `Generated opportunities for ${generatedOpportunities.length} campaigns`,
    results: generatedOpportunities
  }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}

async function cleanupCompletedCampaigns(filters: any) {
  console.log('🧹 Cleaning up completed campaigns...');
  
  const cutoffDate = new Date();
  cutoffDate.setDays(cutoffDate.getDate() - (filters.days_old || 30));
  
  // Archive completed campaigns older than cutoff
  const { data: completedCampaigns } = await supabase
    .from('backlink_campaigns')
    .select('*')
    .eq('status', 'completed')
    .lt('created_at', cutoffDate.toISOString());
    
  if (!completedCampaigns?.length) {
    return new Response(JSON.stringify({
      success: true,
      message: 'No campaigns to cleanup',
      archived: 0
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
  
  const archivedCampaigns = [];
  
  for (const campaign of completedCampaigns) {
    try {
      // Update status to archived
      const { error } = await supabase
        .from('backlink_campaigns')
        .update({
          status: 'archived',
          metadata: {
            ...campaign.metadata,
            archived_at: new Date().toISOString(),
            cleanup_reason: 'automated_cleanup'
          }
        })
        .eq('id', campaign.id);
        
      if (!error) {
        archivedCampaigns.push({
          campaign_id: campaign.id,
          campaign_name: campaign.campaign_name,
          archived_at: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error(`Failed to archive campaign ${campaign.id}:`, error);
    }
  }
  
  return new Response(JSON.stringify({
    success: true,
    message: `Archived ${archivedCampaigns.length} completed campaigns`,
    archived_campaigns: archivedCampaigns
  }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}

function calculateOpportunityPriority(opportunity: any): number {
  let score = 5; // Base score
  
  // Domain Authority scoring
  if (opportunity.domain_authority) {
    if (opportunity.domain_authority >= 70) score += 3;
    else if (opportunity.domain_authority >= 50) score += 2;
    else if (opportunity.domain_authority >= 30) score += 1;
  }
  
  // Relevance score
  if (opportunity.relevance_score) {
    score += opportunity.relevance_score * 0.5;
  }
  
  // Opportunity type priority
  const typeScores = {
    'university_outreach': 3,
    'guest_post': 2,
    'resource_page': 2,
    'broken_link': 1,
    'directory_listing': 1
  };
  score += typeScores[opportunity.opportunity_type] || 0;
  
  // Campaign success rate bonus
  const campaign = opportunity.backlink_campaigns;
  if (campaign?.success_rate > 70) score += 2;
  else if (campaign?.success_rate > 50) score += 1;
  
  return Math.min(Math.max(score, 1), 10); // Clamp between 1-10
}

function determineContentType(opportunity: any): string {
  const typeMapping = {
    'university_outreach': 'university_partnership',
    'guest_post': 'guest_post_pitch',
    'resource_page': 'resource_inclusion',
    'broken_link': 'broken_link_replacement',
    'directory_listing': 'directory_submission'
  };
  
  return typeMapping[opportunity.opportunity_type] || 'general_outreach';
}

async function updateCampaignStats(results: any[]) {
  // Group results by campaign
  const campaignResults = new Map();
  
  for (const result of results) {
    if (result.success && result.campaign_id) {
      const current = campaignResults.get(result.campaign_id) || { contacted: 0, sent: 0 };
      current.contacted += 1;
      current.sent += result.sent || 0;
      campaignResults.set(result.campaign_id, current);
    }
  }
  
  // Update campaign statistics
  for (const [campaignId, stats] of campaignResults) {
    try {
      // Get current campaign data
      const { data: campaign } = await supabase
        .from('backlink_campaigns')
        .select('completed_count, target_count')
        .eq('id', campaignId)
        .single();
        
      if (campaign) {
        const newCompletedCount = campaign.completed_count + stats.contacted;
        const successRate = campaign.target_count > 0 
          ? Math.round((newCompletedCount / campaign.target_count) * 100) 
          : 0;
          
        await supabase
          .from('backlink_campaigns')
          .update({
            completed_count: newCompletedCount,
            success_rate: successRate
          })
          .eq('id', campaignId);
      }
    } catch (error) {
      console.error(`Failed to update stats for campaign ${campaignId}:`, error);
    }
  }
}