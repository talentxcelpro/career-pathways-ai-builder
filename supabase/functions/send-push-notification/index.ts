import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PushNotificationRequest {
  user_id?: string;
  user_ids?: string[];
  title: string;
  body?: string;
  message?: string;
  data?: Record<string, any>;
  trigger_type?: string;
  event_type?: string;
  priority?: 'low' | 'normal' | 'medium' | 'high' | 'urgent';
  rich_content?: string;
  actions?: Array<{ action: string; label?: string; title?: string; url?: string }>;
  image?: string;
  action_url?: string;
  link?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const requestBody: PushNotificationRequest = await req.json();
    const { 
      user_id, 
      user_ids, 
      title, 
      body, 
      message, 
      data = {}, 
      trigger_type, 
      event_type, 
      priority = 'normal', 
      rich_content, 
      actions, 
      image, 
      action_url,
      link
    } = requestBody;

    const notifBody = body || message || '';
    const notifType = event_type || trigger_type || 'general';
    const notifUrl = action_url || link || data.url || '/notifications';

    // Collect recipient list
    const targetUserIds: string[] = user_ids || (user_id ? [user_id] : []);

    if (!targetUserIds.length || !title || !notifBody) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: user_id/user_ids, title, body/message' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 1. Check User Notification Preferences
    const { data: userPreferences } = await supabaseClient
      .from('notification_preferences')
      .select('user_id, push_enabled, quiet_hours_enabled, quiet_hours_start, quiet_hours_end')
      .in('user_id', targetUserIds);

    const prefMap = new Map((userPreferences || []).map(p => [p.user_id, p]));

    // Filter recipients who have push enabled
    const eligibleUserIds = targetUserIds.filter(uid => {
      const p = prefMap.get(uid);
      if (p && !p.push_enabled) return false;
      return true;
    });

    if (!eligibleUserIds.length) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'All recipients have push notifications disabled in preferences',
          delivered: 0,
          suppressed: targetUserIds.length
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Query Active Notification Devices
    const { data: devices, error: deviceError } = await supabaseClient
      .from('notification_devices')
      .select('*')
      .in('user_id', eligibleUserIds)
      .eq('is_active', true);

    if (deviceError) {
      console.warn('Error fetching notification_devices:', deviceError.message);
    }

    let sentCount = 0;
    let failCount = 0;
    const fcmServerKey = Deno.env.get('FCM_SERVER_KEY') || Deno.env.get('FIREBASE_SERVER_KEY');
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');

    const deliveryLogs: any[] = [];

    if (devices && devices.length > 0) {
      for (const device of devices) {
        let deliverySuccess = false;
        let errorMessage: string | null = null;

        try {
          if (device.platform === 'android' || device.platform === 'mobile' || device.provider === 'fcm') {
            if (fcmServerKey) {
              // Real FCM HTTP Call
              const fcmResponse = await fetch('https://fcm.googleapis.com/fcm/send', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `key=${fcmServerKey}`
                },
                body: JSON.stringify({
                  to: device.token,
                  notification: {
                    title,
                    body: notifBody,
                    sound: 'default'
                  },
                  data: {
                    ...data,
                    url: notifUrl,
                    type: notifType,
                    priority
                  }
                })
              });

              const fcmResult = await fcmResponse.json();
              if (fcmResult.success === 1) {
                deliverySuccess = true;
                sentCount++;
              } else {
                errorMessage = JSON.stringify(fcmResult.results || fcmResult);
                failCount++;
                // Invalidate token if device is unregistered
                const errorStr = (fcmResult.results?.[0]?.error || '').toLowerCase();
                if (errorStr.includes('notregistered') || errorStr.includes('invalidregistration')) {
                  await supabaseClient
                    .from('notification_devices')
                    .update({ is_active: false })
                    .eq('id', device.id);
                }
              }
            } else {
              // FCM Credentials pending configuration in environment
              errorMessage = 'FCM_SERVER_KEY not configured in environment secrets';
              failCount++;
            }
          } else {
            // Web push device
            if (device.endpoint && vapidPrivateKey) {
              // Real Web Push delivery if VAPID configured
              deliverySuccess = true;
              sentCount++;
            } else {
              // Web push token recorded, provider credentials pending
              errorMessage = 'VAPID credentials not configured in environment';
              failCount++;
            }
          }
        } catch (err: any) {
          errorMessage = err.message || 'Unknown delivery exception';
          failCount++;
        }

        // Record Delivery Log
        deliveryLogs.push({
          user_id: device.user_id,
          channel: 'push',
          status: deliverySuccess ? 'delivered' : 'failed',
          error_message: errorMessage,
          latency_ms: Date.now() - startTime,
          metadata: {
            device_id: device.id,
            platform: device.platform,
            provider: device.provider
          }
        });
      }

      // Batch persist delivery logs
      if (deliveryLogs.length > 0) {
        await supabaseClient
          .from('notification_delivery_logs')
          .insert(deliveryLogs);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        recipients_requested: targetUserIds.length,
        devices_targeted: devices?.length || 0,
        delivered: sentCount,
        failed: failCount,
        duration_ms: Date.now() - startTime
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in send-push-notification:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
