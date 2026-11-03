import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DigestRequest {
  user_id?: string;
  digest_type?: 'daily' | 'weekly';
  healthCheck?: boolean;
  limit?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    let body: DigestRequest = {};
    try {
      const text = await req.text();
      if (text.trim()) {
        body = JSON.parse(text);
      }
    } catch (_) {
      body = {};
    }

    if (body.healthCheck) {
      return new Response(
        JSON.stringify({ status: 'healthy', timestamp: new Date().toISOString() }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const digestType = body.digest_type || 'daily';
    const lookbackInterval = digestType === 'weekly' ? 7 : 1; // days
    const sinceDate = new Date(Date.now() - lookbackInterval * 24 * 60 * 60 * 1000).toISOString();

    // 1. Fetch Users opting for Digests
    let prefQuery = supabase
      .from('notification_preferences')
      .select('user_id, frequency, push_enabled, email_enabled, timezone');

    if (body.user_id) {
      prefQuery = prefQuery.eq('user_id', body.user_id);
    } else {
      const targetFreq = digestType === 'weekly' ? 'digest_weekly' : 'digest_daily';
      prefQuery = prefQuery.eq('frequency', targetFreq);
    }

    const { data: targetUsers, error: prefError } = await prefQuery.limit(body.limit || 50);

    if (prefError) throw prefError;

    if (!targetUsers || targetUsers.length === 0) {
      return new Response(
        JSON.stringify({
          message: 'No users scheduled for intelligent digest',
          processed: 0,
          timestamp: new Date().toISOString()
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let digestsGenerated = 0;
    let notificationsIncluded = 0;

    for (const u of targetUsers) {
      // 2. Fetch User's Top Unread Notifications
      const { data: userNotifs, error: notifError } = await supabase
        .from('notifications')
        .select('id, title, message, link, category, event_type, relevance_score, created_at')
        .eq('user_id', u.user_id)
        .eq('is_read', false)
        .gte('created_at', sinceDate)
        .order('relevance_score', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(10);

      if (notifError || !userNotifs || userNotifs.length === 0) {
        continue;
      }

      // Group into sections: Job Matches, Network Activity, Application Updates
      const jobMatches = userNotifs.filter(n => n.category === 'job_opportunities' || n.event_type === 'JOB_MATCHED');
      const networkActivity = userNotifs.filter(n => n.category === 'social_interactions' || n.category === 'career_growth');
      const applications = userNotifs.filter(n => n.category === 'applications');

      const summaryPayload = {
        digest_type: digestType,
        period_start: sinceDate,
        total_items: userNotifs.length,
        job_matches_count: jobMatches.length,
        network_activity_count: networkActivity.length,
        applications_count: applications.length,
        top_items: userNotifs.slice(0, 5)
      };

      // 3. Persist Digest Record
      const { data: digestRecord, error: digestInsertError } = await supabase
        .from('notification_digests')
        .insert({
          user_id: u.user_id,
          digest_type: digestType,
          scheduled_for: new Date().toISOString(),
          status: 'sent',
          items_count: userNotifs.length,
          items_payload: summaryPayload,
          sent_at: new Date().toISOString()
        })
        .select('id')
        .single();

      if (digestInsertError) {
        console.error('Error recording digest:', digestInsertError);
        continue;
      }

      // 4. Dispatch a Single High-Value Consolidated Digest Alert
      const digestTitle = digestType === 'weekly' 
        ? `Your Weekly Career Digest (${userNotifs.length} updates)`
        : `Daily Career Highlights: ${jobMatches.length ? `${jobMatches.length} Job Matches, ` : ''}${userNotifs.length} updates`;

      const digestMessage = userNotifs[0]?.message || 'Review your top prioritized career opportunities on TalentXcel.';

      // Insert in-app digest header
      await supabase.from('notifications').insert({
        user_id: u.user_id,
        type: 'intelligent_digest',
        event_type: 'DIGEST_PUBLISHED',
        title: digestTitle,
        message: digestMessage,
        link: '/notifications?tab=digest',
        category: 'system_updates',
        priority: 'high',
        relevance_score: 0.990,
        data: { digest_id: digestRecord?.id, summary: summaryPayload },
        delivery_status: 'delivered',
        is_read: false
      });

      // Record engagement telemetry
      await supabase.from('notification_engagement_events').insert({
        user_id: u.user_id,
        event_type: 'delivered',
        category: 'system_updates',
        channel: 'in_app',
        metadata: { digest_type: digestType, items_count: userNotifs.length }
      });

      digestsGenerated++;
      notificationsIncluded += userNotifs.length;
    }

    return new Response(
      JSON.stringify({
        success: true,
        digest_type: digestType,
        users_evaluated: targetUsers.length,
        digests_generated: digestsGenerated,
        notifications_consolidated: notificationsIncluded,
        duration_ms: Date.now() - startTime,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Intelligent digest generation error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal Digest Error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
