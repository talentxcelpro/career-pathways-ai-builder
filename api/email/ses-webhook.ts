/**
 * api/email/ses-webhook.ts
 * POST /api/email/ses-webhook
 *
 * Amazon SES / SNS Webhook Handler for Bounces, Complaints, and Delivery Events.
 * Automatically manages recipient suppressions to safeguard TalentXcel's domain reputation.
 *
 * Security:
 * - Amazon SNS message signature verification with official X.509 cert validation
 * - SSRF protection on SubscriptionConfirmation SubscribeURL
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { verifySnsSignature, isValidSubscribeUrl } from '../../src/services/email/snsVerifier';


const SUPABASE_URL = process.env.TX_SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://dthlgsnakhoftinssokm.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.TALENTXCEL_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (_) {}
    }

    if (!body || typeof body !== 'object') {
      return res.status(400).json({ error: 'Invalid JSON payload' });
    }

    // 1. Amazon SNS Cryptographic Signature Verification
    const verification = await verifySnsSignature(body);
    if (!verification.valid) {
      console.error(`🚨 Unauthorized SES Webhook request: ${verification.reason}`);
      return res.status(403).json({ error: 'Forbidden: Invalid SNS signature', details: verification.reason });
    }

    const messageType = req.headers['x-amz-sns-message-type'] || body?.Type;

    // 2. Handle Amazon SNS Subscription Confirmation (with strict URL validation)
    if (messageType === 'SubscriptionConfirmation' && body?.SubscribeURL) {
      if (!isValidSubscribeUrl(body.SubscribeURL)) {
        console.error(`🚨 Untrusted SNS SubscribeURL blocked: ${body.SubscribeURL}`);
        return res.status(400).json({ error: 'Invalid SubscribeURL domain' });
      }

      console.log(`🔗 Confirming SNS Subscription: ${body.SubscribeURL}`);
      const confirmRes = await fetch(body.SubscribeURL);
      if (confirmRes.ok) {
        console.log('✅ SNS Subscription confirmed successfully');
        return res.status(200).json({ status: 'confirmed' });
      }
      return res.status(500).json({ error: 'Failed to confirm SNS subscription' });
    }

    // 3. Parse SNS Notification Message
    let sesMessage: any = body;
    if (body?.Message) {
      try {
        sesMessage = JSON.parse(body.Message);
      } catch (_) {
        sesMessage = body.Message;
      }
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false }
    });

    const eventType = sesMessage?.eventType || sesMessage?.notificationType;
    const mail = sesMessage?.mail;
    const messageId = mail?.messageId || 'unknown';

    console.log(`📩 Received SES Event [Type: ${eventType}] MessageId: ${messageId}`);

    // 4. Handle Bounces
    if (eventType === 'Bounce' || sesMessage?.bounce) {
      const bounce = sesMessage.bounce;
      const bounceType = bounce?.bounceType; // 'Permanent' or 'Transient'
      const bounceSubtype = bounce?.bounceSubType;
      const bouncedRecipients = bounce?.bouncedRecipients || [];

      for (const recipient of bouncedRecipients) {
        const email = recipient.emailAddress?.toLowerCase().trim();
        const diagnosticCode = recipient.diagnosticCode || '';

        console.warn(`🛑 SES BOUNCE [Type: ${bounceType}/${bounceSubtype}]: ${email}`);

        // If it's a Permanent hard bounce, immediately suppress
        if (bounceType === 'Permanent' && email) {
          try {
            await supabase.from('email_suppression_list').upsert(
              {
                email_address: email,
                suppression_type: 'bounce',
                reason: `SES Hard Bounce: ${bounceSubtype || 'Permanent failure'}`,
                bounce_type: bounceType,
                bounce_subtype: bounceSubtype,
                diagnostic_code: diagnosticCode,
                is_active: true,
                updated_at: new Date().toISOString()
              },
              { onConflict: 'email_address' }
            );

            // Update any pending queue jobs for this recipient to suppressed
            await supabase
              .from('email_automation_queue')
              .update({ status: 'suppressed', error_message: 'Hard bounce suppressed' })
              .eq('recipient_email', email)
              .eq('status', 'pending');
          } catch (suppErr) {
            console.warn('⚠️ Could not update suppression list in DB:', suppErr);
          }
        }

        // Log into ses_delivery_logs if table exists
        try {
          await supabase.from('ses_delivery_logs').insert({
            message_id: messageId,
            recipient_email: email || 'unknown',
            event_type: 'bounce',
            status: 'bounced',
            bounce_type: bounceType,
            bounce_reason: `${bounceSubtype}: ${diagnosticCode}`.substring(0, 500),
            bounced_at: new Date().toISOString()
          });
        } catch (_) {}
      }

      return res.status(200).json({ status: 'bounce_processed', count: bouncedRecipients.length });
    }

    // 5. Handle Spam Complaints
    if (eventType === 'Complaint' || sesMessage?.complaint) {
      const complaint = sesMessage.complaint;
      const complaintFeedbackType = complaint?.complaintFeedbackType || 'abuse';
      const complaintSubtype = complaint?.complaintSubType;
      const complainedRecipients = complaint?.complainedRecipients || [];

      for (const recipient of complainedRecipients) {
        const email = recipient.emailAddress?.toLowerCase().trim();
        console.error(`🚨 SES SPAM COMPLAINT from: ${email}`);

        if (email) {
          try {
            // Immediately suppress to protect sender reputation
            await supabase.from('email_suppression_list').upsert(
              {
                email_address: email,
                suppression_type: 'complaint',
                reason: `Spam Complaint: ${complaintFeedbackType}`,
                complaint_type: complaintFeedbackType,
                complaint_subtype: complaintSubtype,
                is_active: true,
                updated_at: new Date().toISOString()
              },
              { onConflict: 'email_address' }
            );

            // Opt out of all non-essential communications in preferences
            await supabase.from('email_user_preferences').upsert(
              {
                email,
                unsubscribed_all_non_essential: true,
                email_job_alerts: false,
                email_job_matches: false,
                email_career_recommendations: false,
                email_marketing: false,
                email_weekly_digest: false,
                unsubscribed_at: new Date().toISOString()
              },
              { onConflict: 'email' }
            );
          } catch (compErr) {
            console.warn('⚠️ Could not record complaint in DB:', compErr);
          }
        }

        // Log into ses_delivery_logs if table exists
        try {
          await supabase.from('ses_delivery_logs').insert({
            message_id: messageId,
            recipient_email: email || 'unknown',
            event_type: 'complaint',
            status: 'complained',
            complaint_type: complaintFeedbackType,
            complained_at: new Date().toISOString()
          });
        } catch (_) {}
      }

      return res.status(200).json({ status: 'complaint_processed', count: complainedRecipients.length });
    }

    // 6. Handle Successful Delivery
    if (eventType === 'Delivery' || sesMessage?.delivery) {
      const delivery = sesMessage.delivery;
      const recipients = delivery?.recipients || [];
      const processingTime = delivery?.processingTimeMillis;

      for (const email of recipients) {
        try {
          await supabase.from('ses_delivery_logs').insert({
            message_id: messageId,
            recipient_email: email.toLowerCase().trim(),
            event_type: 'delivery',
            status: 'delivered',
            processing_time_ms: processingTime,
            delivered_at: new Date().toISOString()
          });
        } catch (_) {}
      }

      return res.status(200).json({ status: 'delivery_processed', count: recipients.length });
    }

    return res.status(200).json({ status: 'ignored', eventType });
  } catch (err: any) {
    console.error('❌ SES Webhook Processing Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
