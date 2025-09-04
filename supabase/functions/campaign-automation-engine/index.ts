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

interface AutomationRequest {
  action: 'scale_campaigns' | 'auto_outreach' | 'bulk_process' | 'schedule_campaigns';
  payload?: any;
}

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Campaign Automation Engine started');
    
    const { action, payload }: AutomationRequest = await req.json();
    
    switch (action) {
      case 'scale_campaigns':
        return await scaleCampaigns(payload);
        
      case 'auto_outreach':
        return await automateOutreach(payload);
        
      case 'bulk_process':
        return await bulkProcessCampaigns(payload);
        
      case 'schedule_campaigns':
        return await scheduleCampaigns(payload);
        
      default:
        throw new Error(`Unknown action: ${action}`);
    }
    
  } catch (error) {
    console.error('❌ Campaign automation error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function scaleCampaigns(payload: any) {
  console.log('📈 Scaling campaigns automatically...');
  
  // Get active campaigns that need scaling
  const { data: campaigns } = await supabase
    .from('backlink_campaigns')
    .select('*')
    .eq('status', 'active')
    .lt('completed_count', 'target_count');

  if (!campaigns?.length) {
    return new Response(JSON.stringify({
      success: true,
      message: 'No campaigns need scaling',
      scaled: 0
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  const scaledCampaigns = [];

  for (const campaign of campaigns) {
    try {
      // Auto-scale target count based on success rate
      const currentSuccessRate = campaign.success_rate || 0;
      let scaleFactor = 1;
      
      if (currentSuccessRate > 80) {
        scaleFactor = 2; // Double targets for high-performing campaigns
      } else if (currentSuccessRate > 60) {
        scaleFactor = 1.5; // 50% increase for good campaigns
      } else if (currentSuccessRate > 40) {
        scaleFactor = 1.2; // 20% increase for decent campaigns
      }

      const newTargetCount = Math.floor(campaign.target_count * scaleFactor);

      // Update campaign with new targets
      const { error: updateError } = await supabase
        .from('backlink_campaigns')
        .update({
          target_count: newTargetCount,
          metadata: {
            ...campaign.metadata,
            scaled_at: new Date().toISOString(),
            scale_factor: scaleFactor,
            previous_target: campaign.target_count
          }
        })
        .eq('id', campaign.id);

      if (!updateError) {
        // Generate additional opportunities for scaled campaigns
        await generateOpportunities(campaign.id, newTargetCount - campaign.target_count);
        
        scaledCampaigns.push({
          campaign_id: campaign.id,
          campaign_name: campaign.campaign_name,
          old_target: campaign.target_count,
          new_target: newTargetCount,
          scale_factor: scaleFactor
        });
      }

    } catch (error) {
      console.error(`Failed to scale campaign ${campaign.id}:`, error);
    }
  }

  return new Response(JSON.stringify({
    success: true,
    message: `Scaled ${scaledCampaigns.length} campaigns`,
    scaled_campaigns: scaledCampaigns
  }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}

async function automateOutreach(payload: any) {
  console.log('📧 Automating outreach process...');
  
  // Get pending opportunities
  const { data: opportunities } = await supabase
    .from('backlink_opportunities')
    .select('*')
    .eq('status', 'identified')
    .limit(50); // Process in batches

  if (!opportunities?.length) {
    return new Response(JSON.stringify({
      success: true,
      message: 'No opportunities to process',
      processed: 0
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  const processedOpportunities = [];

  // Process opportunities in intelligent batches
  for (const opportunity of opportunities) {
    try {
      // AI-powered content generation for each opportunity
      const personalizedContent = await generatePersonalizedOutreach(opportunity);
      
      // Call outreach function
      const { data: outreachResult } = await supabase.functions.invoke('backlink-outreach', {
        body: {
          target_ids: [opportunity.id],
          content_type: 'personalized_email',
          custom_content: personalizedContent,
          send_immediately: true
        }
      });

      if (outreachResult?.success) {
        processedOpportunities.push(opportunity.id);
        
        // Update opportunity status
        await supabase
          .from('backlink_opportunities')
          .update({
            status: 'contacted',
            outreach_date: new Date().toISOString(),
            metadata: {
              ...opportunity.metadata,
              automation_processed: true,
              personalized: true
            }
          })
          .eq('id', opportunity.id);
      }

      // Rate limiting - wait 2 seconds between sends
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.error(`Failed to process opportunity ${opportunity.id}:`, error);
    }
  }

  return new Response(JSON.stringify({
    success: true,
    message: `Processed ${processedOpportunities.length} opportunities`,
    processed_count: processedOpportunities.length,
    total_opportunities: opportunities.length
  }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}

async function bulkProcessCampaigns(payload: any) {
  console.log('🔄 Bulk processing campaigns...');
  
  const batchSize = payload?.batch_size || 100;
  const campaignType = payload?.campaign_type || null;
  
  // Get campaigns to process
  let query = supabase
    .from('backlink_campaigns')
    .select('*')
    .eq('status', 'active');
    
  if (campaignType) {
    query = query.eq('campaign_type', campaignType);
  }
  
  const { data: campaigns } = await query.limit(batchSize);
  
  if (!campaigns?.length) {
    return new Response(JSON.stringify({
      success: true,
      message: 'No campaigns to process',
      processed: 0
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  const results = [];
  
  // Process campaigns in parallel batches
  const batchPromises = campaigns.map(async (campaign) => {
    try {
      // Get campaign opportunities
      const { data: opportunities } = await supabase
        .from('backlink_opportunities')
        .select('*')
        .eq('campaign_id', campaign.id)
        .eq('status', 'identified')
        .limit(10); // Process 10 opportunities per campaign

      if (opportunities?.length) {
        // Trigger outreach for campaign opportunities
        const { data: outreachResult } = await supabase.functions.invoke('backlink-outreach', {
          body: {
            target_ids: opportunities.map(o => o.id),
            content_type: 'bulk_campaign',
            campaign_id: campaign.id
          }
        });

        // Update campaign progress
        const newCompletedCount = campaign.completed_count + (outreachResult?.sent || 0);
        await supabase
          .from('backlink_campaigns')
          .update({
            completed_count: newCompletedCount,
            success_rate: calculateSuccessRate(newCompletedCount, campaign.target_count)
          })
          .eq('id', campaign.id);

        return {
          campaign_id: campaign.id,
          campaign_name: campaign.campaign_name,
          opportunities_processed: opportunities.length,
          emails_sent: outreachResult?.sent || 0
        };
      }
      
      return null;
    } catch (error) {
      console.error(`Error processing campaign ${campaign.id}:`, error);
      return null;
    }
  });

  const batchResults = await Promise.allSettled(batchPromises);
  const successfulResults = batchResults
    .filter(result => result.status === 'fulfilled' && result.value)
    .map(result => (result as PromiseFulfilledResult<any>).value);

  return new Response(JSON.stringify({
    success: true,
    message: `Bulk processed ${successfulResults.length} campaigns`,
    results: successfulResults,
    total_processed: successfulResults.length
  }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}

async function scheduleCampaigns(payload: any) {
  console.log('⏰ Scheduling automated campaigns...');
  
  const scheduleType = payload?.schedule_type || 'daily';
  const campaigns = payload?.campaign_ids || [];
  
  // Create scheduled tasks for campaigns
  const scheduledTasks = [];
  
  for (const campaignId of campaigns) {
    // Schedule different intervals based on type
    let intervalHours = 24; // daily
    if (scheduleType === 'weekly') intervalHours = 168;
    if (scheduleType === 'hourly') intervalHours = 1;
    
    const nextRun = new Date();
    nextRun.setHours(nextRun.getHours() + intervalHours);
    
    // Create agent task for automated execution
    const { data: task } = await supabase
      .from('agent_tasks')
      .insert({
        source: 'campaign_automation',
        action: 'execute_campaign',
        payload: {
          campaign_id: campaignId,
          automation_type: 'scheduled',
          schedule_type: scheduleType
        },
        run_at: nextRun.toISOString(),
        status: 'pending'
      })
      .select()
      .single();
      
    if (task) {
      scheduledTasks.push({
        campaign_id: campaignId,
        task_id: task.id,
        next_run: nextRun.toISOString(),
        schedule_type: scheduleType
      });
    }
  }
  
  return new Response(JSON.stringify({
    success: true,
    message: `Scheduled ${scheduledTasks.length} campaign automations`,
    scheduled_tasks: scheduledTasks
  }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}

async function generatePersonalizedOutreach(opportunity: any): Promise<string> {
  if (!openAIApiKey) {
    return generateBasicTemplate(opportunity);
  }

  try {
    const prompt = `Generate a personalized outreach email for a ${opportunity.opportunity_type} campaign.
    
Target: ${opportunity.target_domain}
Contact: ${opportunity.contact_name || 'Team'}
DA: ${opportunity.domain_authority}

Create a professional, personalized email that:
1. References their specific domain/content
2. Offers genuine value
3. Is concise and respectful
4. Includes a clear but soft call-to-action

Keep it under 150 words and make it sound human, not automated.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an expert at writing personalized outreach emails that get responses.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 300,
        temperature: 0.7
      }),
    });

    const data = await response.json();
    return data.choices[0].message.content;
    
  } catch (error) {
    console.error('Failed to generate AI content:', error);
    return generateBasicTemplate(opportunity);
  }
}

function generateBasicTemplate(opportunity: any): string {
  return `Hi ${opportunity.contact_name || 'there'},

I hope this email finds you well. I've been following ${opportunity.target_domain} and really appreciate the quality content you publish.

I wanted to reach out about a potential collaboration opportunity that could provide value to your audience while supporting our mutual goals in the ${opportunity.opportunity_type.replace('_', ' ')} space.

Would you be open to a brief conversation about this?

Best regards,
TalentXcel Team`;
}

async function generateOpportunities(campaignId: string, count: number) {
  // This would typically integrate with prospecting tools
  // For now, we'll create placeholder opportunities
  const opportunities = [];
  
  for (let i = 0; i < count; i++) {
    opportunities.push({
      campaign_id: campaignId,
      target_domain: `auto-generated-${i}.com`,
      opportunity_type: 'guest_post',
      relevance_score: Math.random() * 10,
      status: 'identified',
      metadata: {
        auto_generated: true,
        needs_verification: true
      }
    });
  }
  
  if (opportunities.length > 0) {
    await supabase
      .from('backlink_opportunities')
      .insert(opportunities);
  }
}

function calculateSuccessRate(completed: number, target: number): number {
  return target > 0 ? Math.round((completed / target) * 100) : 0;
}