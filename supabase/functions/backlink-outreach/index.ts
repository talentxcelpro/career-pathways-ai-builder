import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface OutreachRequest {
  target_ids: string[];
  content_type: 'guest_post' | 'press_release' | 'email_pitch' | 'resource_page' | 'directory_listing';
  variables?: Record<string, any>;
  send_immediately?: boolean;
}

const sendEmail = async (to: string, subject: string, body: string): Promise<boolean> => {
  try {
    // Use the existing send-email-smtp function
    const { data, error } = await supabase.functions.invoke('send-email-smtp', {
      body: {
        to: to,
        subject: subject,
        html: body,
        from: 'TalentXcel Partnerships <outreach@talentxcel.in>',
        replyTo: 'talentxcelpro@gmail.com'
      }
    });

    if (error) {
      console.error('Email sending error:', error);
      return false;
    }

    console.log('Email sent successfully to:', to);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { target_ids, content_type, variables = {}, send_immediately = false }: OutreachRequest = await req.json();
    
    console.log('Starting outreach for targets:', target_ids.length, 'type:', content_type);

    // Get system config
    const { data: config } = await supabase
      .from('backlink_system_config')
      .select('*')
      .eq('is_active', true)
      .single();

    const dailyLimit = config?.daily_outreach_limit || 30;

    // Check today's outreach count
    const today = new Date().toISOString().split('T')[0];
    const { data: todayOutreach } = await supabase
      .from('backlink_outreach_logs')
      .select('id')
      .gte('sent_at', `${today}T00:00:00Z`)
      .lt('sent_at', `${today}T23:59:59Z`);

    const todayCount = todayOutreach?.length || 0;

    if (todayCount >= dailyLimit) {
      throw new Error(`Daily outreach limit reached (${dailyLimit}). Try again tomorrow.`);
    }

    const remainingToday = dailyLimit - todayCount;
    const targetsToProcess = target_ids.slice(0, Math.min(target_ids.length, remainingToday));

    const results = [];

    for (const target_id of targetsToProcess) {
      try {
        // Get target information
        const { data: target } = await supabase
          .from('backlink_targets')
          .select('*')
          .eq('id', target_id)
          .single();

        if (!target || !target.contact_email) {
          console.log(`Skipping target ${target_id}: no contact email`);
          continue;
        }

        // Check if we've contacted this target recently (within 30 days)
        const { data: recentOutreach } = await supabase
          .from('backlink_outreach_logs')
          .select('id')
          .eq('target_id', target_id)
          .gte('sent_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
          .limit(1);

        if (recentOutreach && recentOutreach.length > 0) {
          console.log(`Skipping target ${target_id}: contacted recently`);
          results.push({
            target_id,
            status: 'skipped',
            reason: 'contacted_recently'
          });
          continue;
        }

        // Generate content
        const { data: contentData } = await supabase.functions.invoke('backlink-content-generator', {
          body: {
            target_id,
            content_type,
            variables
          }
        });

        if (!contentData?.success) {
          console.error(`Failed to generate content for ${target_id}`);
          continue;
        }

        const { subject, body } = contentData.content;

        // Create outreach log
        const { data: outreachLog, error: logError } = await supabase
          .from('backlink_outreach_logs')
          .insert({
            target_id,
            content_type,
            subject,
            message_body: body,
            status: send_immediately ? 'sent' : 'pending',
            sent_at: send_immediately ? new Date().toISOString() : null,
            email_provider: 'smtp'
          })
          .select()
          .single();

        if (logError) {
          console.error('Error creating outreach log:', logError);
          continue;
        }

        let emailSent = false;
        if (send_immediately) {
          emailSent = await sendEmail(target.contact_email, subject, body);
          
          // Update log status
          await supabase
            .from('backlink_outreach_logs')
            .update({
              status: emailSent ? 'sent' : 'bounced',
              sent_at: emailSent ? new Date().toISOString() : null
            })
            .eq('id', outreachLog.id);

          // Update target last contacted
          if (emailSent) {
            await supabase
              .from('backlink_targets')
              .update({ last_contacted_at: new Date().toISOString() })
              .eq('id', target_id);
          }
        }

        results.push({
          target_id,
          domain: target.domain,
          status: send_immediately ? (emailSent ? 'sent' : 'failed') : 'queued',
          outreach_log_id: outreachLog.id
        });

      } catch (error) {
        console.error(`Error processing target ${target_id}:`, error);
        results.push({
          target_id,
          status: 'error',
          error: error.message
        });
      }
    }

    // Update metrics
    const sentCount = results.filter(r => r.status === 'sent').length;
    if (sentCount > 0) {
      await supabase
        .from('backlink_metrics')
        .upsert({
          metric_date: today,
          outreach_sent: sentCount
        }, {
          onConflict: 'metric_date'
        });
    }

    console.log(`Outreach completed: ${results.length} targets processed, ${sentCount} emails sent`);

    return new Response(JSON.stringify({
      success: true,
      processed: results.length,
      sent: sentCount,
      queued: results.filter(r => r.status === 'queued').length,
      skipped: results.filter(r => r.status === 'skipped').length,
      failed: results.filter(r => r.status === 'failed' || r.status === 'error').length,
      results: results,
      daily_limit_reached: todayCount >= dailyLimit,
      remaining_today: Math.max(0, dailyLimit - todayCount - sentCount)
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in backlink outreach:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});