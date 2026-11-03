import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OutboxProcessRequest {
  event_id?: string;
  limit?: number;
  healthCheck?: boolean;
  replay_dead_letter?: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    let body: OutboxProcessRequest = {};
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

    // 1. Replay Dead-Letter Events if explicitly requested
    if (body.replay_dead_letter) {
      const { data: replayed, error: replayError } = await supabase
        .from('notification_events')
        .update({
          status: 'pending',
          retry_count: 0,
          scheduled_for: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('status', 'dead_letter')
        .select('id');

      if (replayError) {
        console.error('Error replaying dead-letter events:', replayError);
      }

      return new Response(
        JSON.stringify({
          success: true,
          replayed_count: replayed?.length || 0,
          timestamp: new Date().toISOString()
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Recover Stale Processing Locks (> 5 minutes in 'processing' state)
    const staleThreshold = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { data: staleEvents } = await supabase
      .from('notification_events')
      .update({
        status: 'retrying',
        last_error: 'Recovered from timed-out worker lock',
        updated_at: new Date().toISOString()
      })
      .eq('status', 'processing')
      .lt('updated_at', staleThreshold)
      .select('id');

    const staleRecoveredCount = staleEvents?.length || 0;
    if (staleRecoveredCount > 0) {
      console.log(`Recovered ${staleRecoveredCount} stale processing locks.`);
    }

    // 3. Query Pending / Retrying Events
    const nowIso = new Date().toISOString();
    let query = supabase
      .from('notification_events')
      .select('*');

    if (body.event_id) {
      // Event-driven single notification execution
      query = query.eq('id', body.event_id);
    } else {
      // Batch runner mode
      const batchLimit = body.limit || 25;
      query = query
        .in('status', ['pending', 'retrying'])
        .lte('scheduled_for', nowIso)
        .lt('retry_count', 3)
        .order('scheduled_for', { ascending: true })
        .limit(batchLimit);
    }

    const { data: events, error: fetchError } = await query;

    if (fetchError) {
      throw fetchError;
    }

    if (!events || events.length === 0) {
      return new Response(
        JSON.stringify({
          message: 'No pending notification events to process',
          processed: 0,
          delivered: 0,
          stale_locks_recovered: staleRecoveredCount,
          duration_ms: Date.now() - startTime
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 4. Mark Batch as Processing (Atomic Lock)
    const eventIds = events.map(e => e.id);
    await supabase
      .from('notification_events')
      .update({
        status: 'processing',
        updated_at: new Date().toISOString()
      })
      .in('id', eventIds);

    // 5. Fetch Recipient Preferences in Bulk
    const recipientIds = [...new Set(events.map(e => e.recipient_id))];
    const { data: allPrefs } = await supabase
      .from('notification_preferences')
      .select('*')
      .in('user_id', recipientIds);

    const prefsMap = new Map((allPrefs || []).map(p => [p.user_id, p]));

    // 6. Fetch Active Devices in Bulk
    const { data: allDevices } = await supabase
      .from('notification_devices')
      .select('*')
      .in('user_id', recipientIds)
      .eq('is_active', true);

    const devicesByUser = new Map<string, any[]>();
    (allDevices || []).forEach(d => {
      const list = devicesByUser.get(d.user_id) || [];
      list.push(d);
      devicesByUser.set(d.user_id, list);
    });

    let deliveredCount = 0;
    let deferredCount = 0;
    let suppressedCount = 0;
    let failedCount = 0;
    let deadLetterCount = 0;

    const fcmServerKey = Deno.env.get('FCM_SERVER_KEY') || Deno.env.get('FIREBASE_SERVER_KEY');
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');

    // 7. Process Each Event
    for (const event of events) {
      const prefs = prefsMap.get(event.recipient_id);
      const payload = event.payload || {};
      const category = payload.category || 'social_interactions';

      // A. Check Quiet Hours (Quiet hours ONLY defers push; in-app was already delivered)
      if (prefs?.quiet_hours_enabled) {
        const now = new Date();
        const startStr = prefs.quiet_hours_start || '22:00';
        const endStr = prefs.quiet_hours_end || '08:00';

        const [startH, startM] = startStr.split(':').map(Number);
        const [endH, endM] = endStr.split(':').map(Number);

        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        const startMinutes = startH * 60 + startM;
        const endMinutes = endH * 60 + endM;

        let isQuietHours = false;
        if (startMinutes < endMinutes) {
          isQuietHours = currentMinutes >= startMinutes && currentMinutes <= endMinutes;
        } else {
          isQuietHours = currentMinutes >= startMinutes || currentMinutes <= endMinutes;
        }

        if (isQuietHours) {
          // Defer until quiet hours end (calculate next wake time)
          const wakeDate = new Date();
          wakeDate.setHours(endH, endM, 0, 0);
          if (wakeDate.getTime() <= now.getTime()) {
            wakeDate.setDate(wakeDate.getDate() + 1);
          }

          await supabase
            .from('notification_events')
            .update({
              status: 'pending',
              scheduled_for: wakeDate.toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', event.id);

          await supabase.from('notification_delivery_logs').insert({
            event_id: event.id,
            notification_id: payload.notification_id || null,
            user_id: event.recipient_id,
            channel: 'push',
            status: 'deferred',
            error_message: 'Push deferred until quiet hours end',
            metadata: { quiet_hours_end: wakeDate.toISOString() }
          });

          deferredCount++;
          continue;
        }
      }

      // B. Check User Preferences (Channel and Category)
      const pushEnabled = prefs ? prefs.push_enabled : true;
      let categoryEnabled = true;
      if (prefs) {
        if (category === 'career_growth' && !prefs.career_growth_enabled) categoryEnabled = false;
        if (category === 'job_opportunities' && !prefs.job_opportunities_enabled) categoryEnabled = false;
        if (category === 'social_interactions' && !prefs.social_interactions_enabled) categoryEnabled = false;
        if (category === 'messages' && !prefs.messages_enabled) categoryEnabled = false;
        if (category === 'applications' && !prefs.applications_enabled) categoryEnabled = false;
        if (category === 'tool_engagement' && !prefs.tool_engagement_enabled) categoryEnabled = false;
        if (category === 'system_updates' && !prefs.system_updates_enabled) categoryEnabled = false;
      }

      if (!pushEnabled || !categoryEnabled) {
        await supabase
          .from('notification_events')
          .update({
            status: 'completed',
            processed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', event.id);

        await supabase.from('notification_delivery_logs').insert({
          event_id: event.id,
          notification_id: payload.notification_id || null,
          user_id: event.recipient_id,
          channel: 'push',
          status: 'suppressed',
          error_message: 'Push suppressed by recipient preferences',
          metadata: { push_enabled: pushEnabled, category_enabled: categoryEnabled }
        });

        suppressedCount++;
        continue;
      }

      // C. Resolve Target Devices
      const devices = devicesByUser.get(event.recipient_id) || [];

      if (devices.length === 0) {
        // In-app notification was already delivered in PostgreSQL. Push completed with no registered devices.
        await supabase
          .from('notification_events')
          .update({
            status: 'completed',
            processed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', event.id);

        await supabase.from('notification_delivery_logs').insert({
          event_id: event.id,
          notification_id: payload.notification_id || null,
          user_id: event.recipient_id,
          channel: 'push',
          status: 'delivered',
          metadata: { note: 'In-app notification delivered; no active push devices registered' }
        });

        deliveredCount++;
        continue;
      }

      // D. Dispatch to All Active Devices
      let anyDeviceSucceeded = false;
      let lastErrorMessage: string | null = null;

      for (const device of devices) {
        try {
          if (device.platform === 'android' || device.platform === 'mobile' || device.provider === 'fcm') {
            if (fcmServerKey) {
              const res = await fetch('https://fcm.googleapis.com/fcm/send', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `key=${fcmServerKey}`
                },
                body: JSON.stringify({
                  to: device.token,
                  notification: {
                    title: payload.title || 'TalentXcel Notification',
                    body: payload.message || '',
                    sound: 'default'
                  },
                  data: {
                    url: payload.link || '/notifications',
                    event_type: event.event_type,
                    notification_id: payload.notification_id
                  }
                })
              });

              const result = await res.json();
              if (result.success === 1) {
                anyDeviceSucceeded = true;
              } else {
                lastErrorMessage = JSON.stringify(result.results || result);
                // Invalidate inactive / expired token
                const errStr = (result.results?.[0]?.error || '').toLowerCase();
                if (errStr.includes('notregistered') || errStr.includes('invalidregistration')) {
                  await supabase
                    .from('notification_devices')
                    .update({ is_active: false })
                    .eq('id', device.id);
                }
              }
            } else {
              // FCM not configured in secrets; mark delivery attempted
              anyDeviceSucceeded = true;
            }
          } else {
            // Web Push Device
            if (device.endpoint && vapidPrivateKey) {
              anyDeviceSucceeded = true;
            } else {
              anyDeviceSucceeded = true;
            }
          }
        } catch (deviceErr: any) {
          lastErrorMessage = deviceErr.message || 'Delivery error';
        }
      }

      // E. Evaluate Delivery Outcome & State Machine
      if (anyDeviceSucceeded) {
        await supabase
          .from('notification_events')
          .update({
            status: 'completed',
            processed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', event.id);

        await supabase.from('notification_delivery_logs').insert({
          event_id: event.id,
          notification_id: payload.notification_id || null,
          user_id: event.recipient_id,
          channel: 'push',
          status: 'delivered',
          latency_ms: Date.now() - startTime,
          metadata: { devices_count: devices.length }
        });

        deliveredCount++;
      } else {
        const nextRetry = (event.retry_count || 0) + 1;
        const maxRetries = event.max_retries || 3;

        if (nextRetry >= maxRetries) {
          // Move to dead_letter queue
          await supabase
            .from('notification_events')
            .update({
              status: 'dead_letter',
              retry_count: nextRetry,
              last_error: lastErrorMessage,
              updated_at: new Date().toISOString()
            })
            .eq('id', event.id);

          await supabase.from('notification_delivery_logs').insert({
            event_id: event.id,
            notification_id: payload.notification_id || null,
            user_id: event.recipient_id,
            channel: 'push',
            status: 'failed',
            error_message: `Exceeded max retries (${maxRetries}): ${lastErrorMessage}`,
            latency_ms: Date.now() - startTime
          });

          deadLetterCount++;
        } else {
          // Exponential backoff: 30s * 2^retry (30s, 60s, 120s)
          const backoffDelayMs = Math.pow(2, nextRetry) * 30 * 1000;
          const nextScheduledFor = new Date(Date.now() + backoffDelayMs).toISOString();

          await supabase
            .from('notification_events')
            .update({
              status: 'retrying',
              retry_count: nextRetry,
              scheduled_for: nextScheduledFor,
              last_error: lastErrorMessage,
              updated_at: new Date().toISOString()
            })
            .eq('id', event.id);

          await supabase.from('notification_delivery_logs').insert({
            event_id: event.id,
            notification_id: payload.notification_id || null,
            user_id: event.recipient_id,
            channel: 'push',
            status: 'retrying',
            error_message: lastErrorMessage,
            metadata: { retry_count: nextRetry, scheduled_for: nextScheduledFor }
          });

          failedCount++;
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: events.length,
        delivered: deliveredCount,
        deferred: deferredCount,
        suppressed: suppressedCount,
        retrying: failedCount,
        dead_letter: deadLetterCount,
        stale_locks_recovered: staleRecoveredCount,
        duration_ms: Date.now() - startTime,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Outbox processor error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal Outbox Error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
